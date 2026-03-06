import razorpay from "../config/razorpay.js";
import crypto from "crypto";
import Transaction from "../models/Transaction.js";
import PDFDocument from "pdfkit";

import User from "../models/User.js";
/* CREATE ORDER */

export const createOrder = async (req, res) => {
  try {
    const { amount, planName } = req.body;

    const options = {
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    const transaction = await Transaction.create({
      user: req.user._id,
      planName,
      amount,
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
        message: "Invalid payment signature",
      });
    }

    const transaction = await Transaction.findOne({
      razorpay_order_id,
    });

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found",
      });
    }

    /* ================= UPDATE TRANSACTION ================= */

    transaction.status = "paid";
    transaction.razorpay_payment_id = razorpay_payment_id;
    transaction.razorpay_signature = razorpay_signature;

    await transaction.save();

    /* ================= UPDATE USER SUBSCRIPTION ================= */

    const user = await User.findById(transaction.user);

    const plan = transaction.planName;

    let expiry = new Date();

    if (plan === "basic") expiry.setMonth(expiry.getMonth() + 1);
    if (plan === "premium") expiry.setMonth(expiry.getMonth() + 6);
    if (plan === "corporate") expiry.setFullYear(expiry.getFullYear() + 1);

    user.subscription = plan;
    user.subscriptionExpiry = expiry;

    await user.save();

    res.json({
      success: true,
      message: "Payment verified",
      subscription: user.subscription,
      expiry: user.subscriptionExpiry,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Payment verification failed",
    });
  }
};

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
    doc.text(`Date: ${transaction.createdAt}`);

    doc.end();
  } catch (error) {
    res.status(500).json({
      message: "Invoice generation failed",
    });
  }
};
