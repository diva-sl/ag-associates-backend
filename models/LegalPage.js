import mongoose from "mongoose";

const legalPageSchema = new mongoose.Schema(
  {
    page: {
      type: String,
      unique: true,
      enum: ["privacy", "terms", "disclaimer", "refund", "cancellation"],
    },

    title: String,

    content: String,
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("LegalPage", legalPageSchema);
