import razorpay from "../config/razorpay.js";
import crypto from "crypto";
import Transaction from "../models/Transaction.js";
import PDFDocument from "pdfkit";

import User from "../models/User.js";
import SubscriptionPlan from "../models/SubscriptionPlan.js";

import { sendEmail } from "../utils/sendEmail.js";
import { subscriptionEmailTemplate } from "../utils/subscriptionEmailTemplate.js";

/* CREATE ORDER */

export const createOrder = async (req, res) => {
  try {
    // const { amount, planName } = req.body;
    // const { amount, planId } = req.body;
    const { planId } = req.body;

    const plan = await SubscriptionPlan.findById(planId);

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const plan = await SubscriptionPlan.findById(planId);

    if (!plan) {
      return res.status(404).json({
        message: "Plan not found",
      });
    }

    const order = await razorpay.orders.create(options);
    const transaction = await Transaction.create({
      user: req.user._id,
      planId: plan._id,
      planName: plan.name,
      amount: plan.price,
      razorpay_order_id: order.id,
    });

    res.json({
      order,
      transaction,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Order creation failed" });
  }
};

/* VERIFY PAYMENT */

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment signature",
      });
    }

    const transaction = await Transaction.findOne({
      razorpay_order_id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Prevent duplicate verification
    if (transaction.status === "paid") {
      return res.status(200).json({
        success: true,
        message: "Payment already verified",
      });
    }

    const user = await User.findById(transaction.user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const plan = await SubscriptionPlan.findById(transaction.planId);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    /* ================= TRANSACTION ================= */

    transaction.status = "paid";
    transaction.razorpay_payment_id = razorpay_payment_id;
    transaction.razorpay_signature = razorpay_signature;

    transaction.paidAt = new Date();

    transaction.invoiceNumber = `AGA-${Date.now()}`;

    await transaction.save();

    /* ================= USER SUBSCRIPTION ================= */

    const now = new Date();

    let expiry =
      user.subscriptionExpiry && user.subscriptionExpiry > now
        ? new Date(user.subscriptionExpiry)
        : new Date(now);

    expiry.setMonth(expiry.getMonth() + (plan.duration || 12));

    user.subscription = plan.name;

    user.subscriptionPlan = plan._id;

    user.subscriptionAmount = plan.price;

    user.subscriptionPurchasedAt = new Date();

    user.subscriptionStatus = "active";

    user.subscriptionExpiry = expiry;

    await user.save();

    /* ================= USER EMAIL ================= */

    try {
      console.log({
        SMTP_HOST: process.env.SMTP_HOST,
        SMTP_PORT: process.env.SMTP_PORT,
        SMTP_EMAIL: process.env.SMTP_EMAIL,
        SMTP_PASSWORD: process.env.SMTP_PASSWORD ? "FOUND" : "MISSING",
      });
      await sendEmail({
        to: user.email,
        subject: `Subscription Activated - ${plan.name}`,
        html: subscriptionEmailTemplate({
          name: user.name,
          planName: plan.name,
          amount: plan.price,
          expiryDate: expiry,
        }),
      });
    } catch (emailError) {
      console.log("Subscription Email Error:", emailError.message);
    }

    /* ================= ADMIN EMAIL ================= */

    try {
      if (process.env.ADMIN_EMAIL) {
        await sendEmail({
          to: process.env.ADMIN_EMAIL,
          subject: "New Subscription Purchase",
          html: `
            <h2>New Subscription Purchased</h2>

            <p><strong>Name:</strong> ${user.name}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Plan:</strong> ${plan.name}</p>
            <p><strong>Amount:</strong> ₹${plan.price}</p>
            <p><strong>Expiry:</strong> ${expiry.toLocaleDateString()}</p>
          `,
        });
      }
    } catch (error) {
      console.log("Admin Email Error:", error.message);
    }

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",

      subscription: {
        name: user.subscription,
        amount: user.subscriptionAmount,
        status: user.subscriptionStatus,
        expiry: user.subscriptionExpiry,
        purchasedAt: user.subscriptionPurchasedAt,
      },
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Payment verification failed",
    });
  }
};

// export const verifyPayment = async (req, res) => {
//   try {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
//       req.body;

//     const generatedSignature = crypto
//       .createHmac("sha256", process.env.RAZORPAY_SECRET)
//       .update(`${razorpay_order_id}|${razorpay_payment_id}`)
//       .digest("hex");

//     if (generatedSignature !== razorpay_signature) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid payment signature",
//       });
//     }

//     const transaction = await Transaction.findOne({
//       razorpay_order_id,
//     });

//     if (!transaction) {
//       return res.status(404).json({
//         success: false,
//         message: "Transaction not found",
//       });
//     }

//     if (transaction.status === "paid") {
//       return res.status(200).json({
//         success: true,
//         message: "Payment already verified",
//       });
//     }

//     const user = await User.findById(transaction.user);

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     const plan = await SubscriptionPlan.findById(transaction.planId);

//     if (!plan) {
//       return res.status(404).json({
//         success: false,
//         message: "Plan not found",
//       });
//     }

//     /* ================= TRANSACTION ================= */

//     transaction.status = "paid";
//     transaction.razorpay_payment_id = razorpay_payment_id;
//     transaction.razorpay_signature = razorpay_signature;
//     transaction.paidAt = new Date();
//     transaction.invoiceNumber = `AGA-${Date.now()}`;

//     await transaction.save();

//     /* ================= SUBSCRIPTION ================= */

//     const now = new Date();

//     let expiry =
//       user.subscriptionExpiry && user.subscriptionExpiry > now
//         ? new Date(user.subscriptionExpiry)
//         : new Date(now);

//     expiry.setMonth(expiry.getMonth() + (plan.duration || 12));

//     user.subscription = plan.name;
//     user.subscriptionPlan = plan._id;
//     user.subscriptionAmount = plan.price;
//     user.subscriptionPurchasedAt = new Date();
//     user.subscriptionStatus = "active";
//     user.subscriptionExpiry = expiry;

//     await user.save();

//     /* ================= RESPONSE FIRST ================= */

//     res.status(200).json({
//       success: true,
//       message: "Payment verified successfully",
//       subscription: {
//         name: user.subscription,
//         amount: user.subscriptionAmount,
//         status: user.subscriptionStatus,
//         expiry: user.subscriptionExpiry,
//         purchasedAt: user.subscriptionPurchasedAt,
//       },
//     });

//     /* ================= EMAILS IN BACKGROUND ================= */

//     setImmediate(async () => {
//       try {
//         await sendEmail({
//           to: user.email,
//           subject: `Subscription Activated - ${plan.name}`,
//           html: subscriptionEmailTemplate({
//             name: user.name,
//             planName: plan.name,
//             amount: plan.price,
//             expiryDate: expiry,
//           }),
//         });

//         console.log(`Subscription email sent to ${user.email}`);
//       } catch (error) {
//         console.error("Subscription Email Error:", error);
//       }

//       try {
//         if (process.env.ADMIN_EMAIL) {
//           await sendEmail({
//             to: process.env.ADMIN_EMAIL,
//             subject: "New Subscription Purchase",
//             html: `
//               <h2>New Subscription Purchased</h2>

//               <p><strong>Name:</strong> ${user.name}</p>
//               <p><strong>Email:</strong> ${user.email}</p>
//               <p><strong>Plan:</strong> ${plan.name}</p>
//               <p><strong>Amount:</strong> ₹${plan.price}</p>
//               <p><strong>Expiry:</strong> ${expiry.toLocaleDateString()}</p>
//             `,
//           });

//           console.log("Admin email sent");
//         }
//       } catch (error) {
//         console.error("Admin Email Error:", error);
//       }
//     });
//   } catch (error) {
//     console.error("Verify Payment Error:", error);

//     res.status(500).json({
//       success: false,
//       message: "Payment verification failed",
//     });
//   }
// };

export const getBillingHistory = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.user._id,
      status: "paid",
    }).sort({ createdAt: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch billing history",
    });
  }
};

/* ================= INVOICE ================= */

export const downloadInvoice = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate(
      "user",
    );

    if (!transaction) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=invoice-${transaction._id}.pdf`,
    );

    doc.pipe(res);

    doc.fontSize(20).text("AG & Associates Invoice", { align: "center" });

    doc.moveDown();

    doc.text(`Customer: ${transaction.user.name}`);
    doc.text(`Email: ${transaction.user.email}`);
    doc.text(`Plan: ${transaction.planName}`);
    doc.text(`Amount: ₹${transaction.amount}`);
    doc.text(`Payment Status: ${transaction.status}`);
    doc.text(
      `Invoice Date: ${new Date(transaction.createdAt).toLocaleDateString()}`,
    );
    doc.text(`Amount: ₹${transaction.amount}`);
    doc.text(`Date: ${transaction.createdAt}`);

    doc.end();
  } catch (error) {
    res.status(500).json({
      message: "Invoice generation failed",
    });
  }
};
