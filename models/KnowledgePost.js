import mongoose from "mongoose";

const knowledgePostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      required: true,
    },

    excerpt: {
      type: String,
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    featuredImage: {
      type: String,
      default: "",
    },

    featuredImagePublicId: {
      type: String,
      default: "",
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "KnowledgeCategory",
      required: true,
    },

    tags: [String],

    author: {
      type: String,
      default: "AG & Associates",
    },

    featured: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },

    readingTime: {
      type: Number,
      default: 1,
    },

    views: {
      type: Number,
      default: 0,
    },

    /* Rating System */

    averageRating: {
      type: Number,
      default: 0,
    },

    totalRatings: {
      type: Number,
      default: 0,
    },

    /* Helpful System */

    helpfulCount: {
      type: Number,
      default: 0,
    },

    notHelpfulCount: {
      type: Number,
      default: 0,
    },

    /* SEO */

    seoTitle: String,

    seoDescription: String,

    seoKeywords: [String],

    publishedAt: Date,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("KnowledgePost", knowledgePostSchema);
