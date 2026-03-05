import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    planName: String,

    amount: Number,

    razorpay_order_id: String,

    razorpay_payment_id: String,

    razorpay_signature: String,

    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Transaction", transactionSchema);
