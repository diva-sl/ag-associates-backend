import User from "../models/User.js";
import Transaction from "../models/Transaction.js";
import SubscriptionPlan from "../models/SubscriptionPlan.js";
import Document from "../models/Document.js";
import SuccessStory from "../models/SuccessStory.js";
import asyncHandler from "express-async-handler";
import { sendEmail } from "../utils/sendEmail.js";
import { subscriptionEmailTemplate } from "../utils/subscriptionEmailTemplate.js";
import { getSignedFileUrl, deleteFromS3 } from "../utils/uploadToS3.js";

export const getDashboardStats = async (req, res) => {
  try {
    const [users, transactions, documents] = await Promise.all([
      User.countDocuments(),
      // Transaction.countDocuments(),
      Transaction.countDocuments({
        status: "paid",
      }),
      Document.countDocuments(),
    ]);

    const revenue = await Transaction.aggregate([
      {
        $match: {
          status: "paid",
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$amount",
          },
        },
      },
    ]);

    res.json({
      success: true,

      stats: {
        users,
        transactions,
        documents,
        revenue: revenue[0]?.total || 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({
      createdAt: -1,
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const blockUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  user.isBlocked = !user.isBlocked;

  await user.save();

  res.json({
    success: true,
    user,
  });
};

// export const deleteUser = async (req, res) => {
//   await User.findByIdAndDelete(req.params.id);

//   res.json({
//     success: true,
//   });
// };
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.avatarKey) {
      await deleteFromS3(user.avatarKey);
    }

    const documents = await Document.find({
      user: user._id,
    });

    for (const doc of documents) {
      if (doc.public_id) {
        await deleteFromS3(doc.public_id);
      }
    }

    await Document.deleteMany({
      user: user._id,
    });

    await Transaction.deleteMany({
      user: user._id,
    });

    await user.deleteOne();

    res.json({
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const oldSubscription = user.subscription;
    const oldExpiry = user.subscriptionExpiry;

    /* ================= BASIC INFO ================= */

    user.name = req.body.name ?? user.name;
    user.email = req.body.email ?? user.email;
    user.phone = req.body.phone ?? user.phone;
    user.address = req.body.address ?? user.address;

    user.pan = req.body.pan ?? user.pan;
    user.aadhaar = req.body.aadhaar ?? user.aadhaar;
    user.gstin = req.body.gstin ?? user.gstin;

    user.role = req.body.role ?? user.role;

    /* ================= SUBSCRIPTION ================= */

    if (req.body.subscription !== undefined) {
      if (req.body.subscription === "none") {
        user.subscription = "none";
        user.subscriptionPlan = null;
        user.subscriptionAmount = 0;
        user.subscriptionStatus = "cancelled";
        user.subscriptionPurchasedAt = null;
      } else {
        // const plan = await SubscriptionPlan.findOne({
        //   name: req.body.subscription,
        // });
        const plan = await SubscriptionPlan.findById(req.body.subscriptionPlan);

        if (plan) {
          user.subscription = plan.name;
          user.subscriptionPlan = plan._id;
          user.subscriptionAmount = plan.price;

          user.subscriptionPurchasedAt =
            req.body.subscriptionPurchasedAt ||
            user.subscriptionPurchasedAt ||
            new Date();

          user.subscriptionStatus = req.body.subscriptionStatus || "active";
        }
      }
    }

    if (req.body.subscriptionExpiry) {
      user.subscriptionExpiry = req.body.subscriptionExpiry;
    }

    if (req.body.subscriptionStatus) {
      user.subscriptionStatus = req.body.subscriptionStatus;
    }
    /* ================= DOCUMENT DETAILS ================= */
    user.panStatus = req.body.panStatus ?? user.panStatus;

    user.panRejectReason = req.body.panRejectReason ?? user.panRejectReason;

    user.aadhaarStatus = req.body.aadhaarStatus ?? user.aadhaarStatus;

    user.aadhaarRejectReason =
      req.body.aadhaarRejectReason ?? user.aadhaarRejectReason;

    user.gstinStatus = req.body.gstinStatus ?? user.gstinStatus;

    user.gstinRejectReason =
      req.body.gstinRejectReason ?? user.gstinRejectReason;

    if (user.panStatus === "approved") {
      user.panRejectReason = "";
    }

    if (user.aadhaarStatus === "approved") {
      user.aadhaarRejectReason = "";
    }

    if (user.gstinStatus === "approved") {
      user.gstinRejectReason = "";
    }

    /* ================= AUTO EXPIRE ================= */

    if (
      user.subscriptionExpiry &&
      new Date(user.subscriptionExpiry) < new Date()
    ) {
      user.subscriptionStatus = "expired";
    }

    /* ================= BLOCK USER ================= */

    if (req.body.isBlocked !== undefined) {
      user.isBlocked = req.body.isBlocked;
    }

    const updatedUser = await user.save();

    /* ================= SEND EMAIL ================= */

    const subscriptionChanged =
      oldSubscription !== updatedUser.subscription ||
      String(oldExpiry) !== String(updatedUser.subscriptionExpiry);

    if (
      subscriptionChanged &&
      updatedUser.subscription &&
      updatedUser.subscription !== "none"
    ) {
      try {
        await sendEmail({
          to: updatedUser.email,
          subject: `Subscription Updated - ${updatedUser.subscription}`,
          html: subscriptionEmailTemplate({
            name: updatedUser.name,
            planName: updatedUser.subscription,
            amount: updatedUser.subscriptionAmount,
            expiryDate: updatedUser.subscriptionExpiry,
          }),
        });
      } catch (emailError) {
        console.log("Email Error:", emailError.message);
      }
    }

    const populatedUser = await User.findById(updatedUser._id).populate(
      "subscriptionPlan",
      "name price originalPrice category duration",
    );

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: populatedUser,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const approveDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    doc.status = "approved";
    doc.reviewedBy = req.user._id;
    doc.reviewedAt = new Date();

    await doc.save();

    const user = await User.findById(doc.user);

    if (user) {
      switch (doc.type) {
        case "PAN_CARD":
          user.panStatus = "approved";
          user.panRejectReason = "";
          break;

        case "AADHAAR_CARD":
          user.aadhaarStatus = "approved";
          user.aadhaarRejectReason = "";
          break;

        case "GST_CERTIFICATE":
          user.gstinStatus = "approved";
          user.gstinRejectReason = "";
          break;

        default:
          break;
      }

      user.kycVerifiedBy = req.user._id;
      user.kycVerifiedAt = new Date();

      await user.save();
    }
    res.json({
      success: true,
      message: "Document approved",
      document: doc,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ================= REVENUE ANALYTICS ================= */

export const getRevenueAnalytics = async (req, res) => {
  try {
    const revenue = await Transaction.aggregate([
      {
        $match: {
          status: "paid",
        },
      },

      {
        $group: {
          _id: {
            month: {
              $month: "$createdAt",
            },
          },

          revenue: {
            $sum: "$amount",
          },

          count: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          "_id.month": 1,
        },
      },
    ]);

    const months = [
      "",
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const formatted = revenue.map((item) => ({
      month: months[item._id.month],

      revenue: item.revenue,

      count: item.count,
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/* ================= USER DETAILS ================= */

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    const documents = await Document.find({
      user: user._id,
    }).sort({
      createdAt: -1,
    });

    res.json({
      ...user.toObject(),
      documents,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/* ================= ALL TRANSACTIONS ================= */

export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("user", "name email avatar")
      .sort({
        createdAt: -1,
      });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/* ================= TRANSACTION DETAILS ================= */

export const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate(
      "user",
      "name email avatar",
    );

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

/* ================= DOCUMENTS ================= */

// export const getDocuments = async (req, res) => {
//   try {
//     const docs = await Document.find().populate("user", "name email").sort({
//       createdAt: -1,
//     });

//     res.json(docs);
//   } catch (error) {
//     res.status(500).json({
//       message: error.message,
//     });
//   }
// };
export const getDocuments = async (req, res) => {
  try {
    const docs = await Document.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    const documents = await Promise.all(
      docs.map(async (doc) => ({
        ...doc.toObject(),

        fileUrl: doc.public_id ? await getSignedFileUrl(doc.public_id) : "",
      })),
    );

    res.json(documents);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
/* ================= REJECT DOCUMENT ================= */

export const rejectDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    const rejectReason = req.body.reason || req.body.remarks || "";

    doc.status = "rejected";
    doc.reviewedBy = req.user._id;
    doc.reviewedAt = new Date();
    doc.remarks = rejectReason;

    await doc.save();

    const user = await User.findById(doc.user);

    if (user) {
      switch (doc.type) {
        case "PAN_CARD":
          user.panStatus = "rejected";
          user.panRejectReason = rejectReason;
          break;

        case "AADHAAR_CARD":
          user.aadhaarStatus = "rejected";
          user.aadhaarRejectReason = rejectReason;
          break;

        case "GST_CERTIFICATE":
          user.gstinStatus = "rejected";
          user.gstinRejectReason = rejectReason;
          break;

        default:
          break;
      }

      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: "Document rejected successfully",
      document: doc,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

export const getRecentUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getRecentTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("user", "name email")
      .sort({
        createdAt: -1,
      })
      .limit(5);

    res.json(transactions);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getSubscriptionStats = async (req, res) => {
  try {
    const data = await User.aggregate([
      {
        $group: {
          _id: "$subscription",
          total: {
            $sum: 1,
          },
        },
      },
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getSubscriptions = async (req, res) => {
  try {
    const users = await User.find({
      subscription: {
        $ne: "none",
      },
    }).sort({
      subscriptionExpiry: 1,
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find().sort({
      category: 1,
      sortOrder: 1,
    });

    res.json(plans);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getPlanById = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({
        message: "Plan not found",
      });
    }

    res.json(plan);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const createPlan = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.create(req.body);

    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updatePlan = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      },
    );

    if (!plan) {
      return res.status(404).json({
        message: "Plan not found",
      });
    }

    res.json(plan);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const deletePlan = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findByIdAndDelete(req.params.id);

    if (!plan) {
      return res.status(404).json({
        message: "Plan not found",
      });
    }

    res.json({
      success: true,
      message: "Plan deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const togglePlanStatus = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({
        message: "Plan not found",
      });
    }

    plan.isActive = !plan.isActive;

    await plan.save();

    res.json(plan);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getSubscriptionAnalytics = async (req, res) => {
  try {
    const totalPlans = await SubscriptionPlan.countDocuments();

    const activePlans = await SubscriptionPlan.countDocuments({
      isActive: true,
    });

    const highlightedPlans = await SubscriptionPlan.countDocuments({
      highlight: true,
    });

    const planRevenue = await Transaction.aggregate([
      {
        $match: {
          status: "paid",
        },
      },

      {
        $group: {
          _id: "$planName",

          count: {
            $sum: 1,
          },

          revenue: {
            $sum: "$amount",
          },
        },
      },

      {
        $sort: {
          revenue: -1,
        },
      },
    ]);

    res.json({
      totalPlans,
      activePlans,
      highlightedPlans,
      planRevenue,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const toggleHighlightPlan = async (req, res) => {
  try {
    const plan = await SubscriptionPlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({
        message: "Plan not found",
      });
    }

    plan.highlight = !plan.highlight;

    await plan.save();

    res.json(plan);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getRevenueByPlan = async (req, res) => {
  try {
    const data = await Transaction.aggregate([
      {
        $match: {
          status: "paid",
        },
      },

      {
        $group: {
          _id: "$planName",

          revenue: {
            $sum: "$amount",
          },

          purchases: {
            $sum: 1,
          },
        },
      },

      {
        $project: {
          _id: 0,
          planName: "$_id",
          revenue: 1,
          purchases: 1,
        },
      },

      {
        $sort: {
          revenue: -1,
        },
      },
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getUserGrowthAnalytics = async (req, res) => {
  try {
    const data = await User.aggregate([
      {
        $group: {
          _id: {
            month: {
              $month: "$createdAt",
            },
          },

          users: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          "_id.month": 1,
        },
      },
    ]);

    const months = [
      "",
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const formatted = data.map((item) => ({
      month: months[item._id.month],
      users: item.users,
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getStoryDownloadsAnalytics = async (req, res) => {
  try {
    const data = await SuccessStory.find(
      {},
      {
        title: 1,
        downloads: 1,
      },
    ).sort({
      downloads: -1,
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
export const getTopPlans = async (req, res) => {
  try {
    const data = await Transaction.aggregate([
      {
        $match: {
          status: "paid",
        },
      },

      {
        $group: {
          _id: "$planName",

          purchases: {
            $sum: 1,
          },

          revenue: {
            $sum: "$amount",
          },
        },
      },

      {
        $project: {
          _id: 0,
          planName: "$_id",
          purchases: 1,
          revenue: 1,
        },
      },

      {
        $sort: {
          purchases: -1,
        },
      },
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getDocumentAnalytics = async (req, res) => {
  try {
    const data = await Document.aggregate([
      {
        $group: {
          _id: "$status",

          total: {
            $sum: 1,
          },
        },
      },

      {
        $project: {
          _id: 0,
          status: "$_id",
          total: 1,
        },
      },
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
