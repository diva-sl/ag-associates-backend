import razorpay from "../config/razorpay.js";
import crypto from "crypto";
import Transaction from "../models/Transaction.js";

import User from "../models/User.js";
import SubscriptionPlan from "../models/SubscriptionPlan.js";

import { sendEmail } from "../utils/sendEmail.js";
import { subscriptionEmailTemplate } from "../utils/subscriptionEmailTemplate.js";

import { generateInvoicePdf } from "../utils/generateInvoicePdf.js";

import { uploadBufferToS3, getDownloadSignedUrl } from "../utils/uploadToS3.js";

/* CREATE ORDER */

// export const createOrder = async (req, res) => {
//   try {
//     // const { amount, planName } = req.body;
//     const { amount, planId } = req.body;
//     // const { planId } = req.body;

//     const plan = await SubscriptionPlan.findById(planId);

//     const options = {
//       amount: amount * 100,
//       currency: "INR",
//       receipt: "receipt_" + Date.now(),
//     };

//     if (!plan) {
//       return res.status(404).json({
//         message: "Plan not found",
//       });
//     }

//     const order = await razorpay.orders.create(options);
//     const transaction = await Transaction.create({
//       user: req.user._id,
//       planId: plan._id,
//       planName: plan.name,
//       amount: plan.price,
//       razorpay_order_id: order.id,
//     });

//     res.json({
//       order,
//       transaction,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Order creation failed" });
//   }
// };

export const createOrder = async (req, res) => {
  try {
    const { planId } = req.body;

    const plan = await SubscriptionPlan.findById(planId);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
      });
    }

    const subtotal = Number(plan.price);

    const gstRate = 18;

    const cgstAmount = Number((subtotal * 9) / 100);

    const sgstAmount = Number((subtotal * 9) / 100);

    const gstAmount = cgstAmount + sgstAmount;

    const totalAmount = subtotal + gstAmount;

    const options = {
      amount: totalAmount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);

    const transaction = await Transaction.create({
      user: req.user._id,

      planId: plan._id,

      planName: plan.name,

      amount: subtotal,

      subtotal,

      gstRate,

      cgstAmount,

      sgstAmount,

      gstAmount,

      totalAmount,

      razorpay_order_id: order.id,

      status: "created",
    });

    return res.status(200).json({
      success: true,
      order,
      transaction,
    });
  } catch (error) {
    console.error("Create Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Order creation failed",
    });
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
    // if (transaction.status === "paid") {
    //   return res.status(200).json({
    //     success: true,
    //     message: "Payment already verified",
    //   });
    // }
    if (transaction.status === "paid") {
      return res.status(200).json({
        success: true,
        message: "Payment already verified",

        invoiceAvailable: !!transaction.invoiceKey,
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
    const year = new Date().getFullYear();

    /* ================= TRANSACTION ================= */

    transaction.status = "paid";

    transaction.razorpay_payment_id = razorpay_payment_id;

    transaction.razorpay_signature = razorpay_signature;

    transaction.paymentMethod = "Razorpay";

    transaction.paidAt = new Date();

    transaction.invoiceNumber = `AGA-${year}-${Math.floor(
      1000 + Math.random() * 9000,
    )}`;
    // transaction.invoiceNumber = `AGA-${Date.now()}`;

    const pdfBuffer = await generateInvoicePdf(transaction, user);

    const invoiceUpload = await uploadBufferToS3(
      pdfBuffer,
      `${transaction.invoiceNumber}.pdf`,
      "application/pdf",
      "private/invoices",
    );

    transaction.invoiceKey = invoiceUpload.key;

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
      await sendEmail({
        to: user.email,
        subject: `Subscription Activated - ${plan.name}`,
        html: subscriptionEmailTemplate({
          name: user.name,
          planName: plan.name,
          subtotal: transaction.subtotal,
          gstAmount: transaction.gstAmount,
          totalAmount: transaction.totalAmount,
          invoiceNumber: transaction.invoiceNumber,
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
          subject: `💰 New Subscription Purchase - ${plan.name}`,
          html: `
  <div style="font-family:Arial,sans-serif;max-width:700px;margin:auto;background:#fff;border-radius:16px;border:1px solid #eee;overflow:hidden;">

    <div style="background:linear-gradient(135deg,#511D43,#901E3E);padding:25px;text-align:center;color:white;">
      <h2 style="margin:0;">AG & ASSOCIATES</h2>
      <p style="margin-top:10px;">New Subscription Purchase</p>
    </div>

    <div style="padding:30px;">

      <h3>Customer Details</h3>

      <p><strong>Name:</strong> ${user.name}</p>
      <p><strong>Email:</strong> ${user.email}</p>

      <hr>

      <h3>Subscription Details</h3>

      <p><strong>Plan:</strong> ${plan.name}</p>
      <p><strong>Invoice No:</strong> ${transaction.invoiceNumber}</p>

      <p><strong>Plan Amount:</strong> ₹${transaction.subtotal}</p>
      <p><strong>GST (18%):</strong> ₹${transaction.gstAmount}</p>

      <p style="
      font-size:18px;
      color:#511D43;
      font-weight:bold;
      ">
      Total Paid: ₹${transaction.totalAmount}
      </p>

      <p><strong>Expiry:</strong> ${expiry.toLocaleDateString()}</p>

      <p><strong>Payment ID:</strong> ${transaction.razorpay_payment_id}</p>

    </div>

  </div>
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

export const getBillingHistory = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      user: req.user._id,
      status: "paid",
    })
      .populate("planId", "name")
      .sort({ createdAt: -1 });

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
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Invoice not found",
      });
    }

    if (!transaction.invoiceKey) {
      return res.status(404).json({
        success: false,
        message: "Invoice file missing",
      });
    }

    const url = await getDownloadSignedUrl(
      transaction.invoiceKey,
      `${transaction.invoiceNumber}.pdf`,
    );
    res.json({
      success: true,
      url,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
