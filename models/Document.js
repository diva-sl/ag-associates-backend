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

    public_id: String,
  },
  { timestamps: true },
);

export default mongoose.model("Document", documentSchema);
