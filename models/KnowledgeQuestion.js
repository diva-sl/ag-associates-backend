import mongoose from "mongoose";

const knowledgeQuestionSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "KnowledgePost",
    },

    name: String,

    email: String,

    question: String,

    answer: String,

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("KnowledgeQuestion", knowledgeQuestionSchema);
