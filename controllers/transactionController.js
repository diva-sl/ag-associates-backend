import razorpay from "../config/razorpay.js";
import crypto from "crypto";
import Transaction from "../models/Transaction.js";

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
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        message: "Invalid payment signature",
      });
    }

    const transaction = await Transaction.findOne({
      razorpay_order_id,
    });

    transaction.status = "paid";
    transaction.razorpay_payment_id = razorpay_payment_id;
    transaction.razorpay_signature = razorpay_signature;

    await transaction.save();

    res.json({
      success: true,
      message: "Payment verified",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Payment verification failed",
    });
  }
};
