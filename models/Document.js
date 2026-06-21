import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    type: {
      type: String,
      enum: ["ITR", "GST", "Other"],
    },

    fileUrl: String,

    public_id: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },

    mimeType: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    reviewedAt: Date,
  },

  { timestamps: true },
);

export default mongoose.model("Document", documentSchema);
