import mongoose from "mongoose";

const knowledgeRatingSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "KnowledgePost",
    },

    ipAddress: String,

    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("KnowledgeRating", knowledgeRatingSchema);
