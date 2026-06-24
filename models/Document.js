import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: [
        "PAN_CARD",
        "AADHAAR_CARD",
        "GST_CERTIFICATE",
        "ITR",
        "BANK_STATEMENT",
        "FORM-16",
        "OTHER",
      ],

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

    public_id: {
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

    remarks: String,
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Document", documentSchema);
