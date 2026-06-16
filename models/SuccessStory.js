import mongoose from "mongoose";
// import slugify from "slugify";

const successStorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    // slug: {
    //   type: String,
    //   unique: true,
    // },

    category: {
      type: String,
      required: true,
    },

    coverImage: String,

    industry: String,

    location: String,

    services: String,

    companySize: String,

    challenge: String,

    solution: String,

    implementation: String,

    outcome: String,

    metrics: [
      {
        label: String,
        value: String,
      },
    ],

    testimonial: {
      name: String,
      designation: String,
      company: String,
      quote: String,
    },

    downloadablePdf: String,

    featured: {
      type: Boolean,
      default: false,
    },

    allowPdfDownload: {
      type: Boolean,
      default: true,
    },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },

    views: {
      type: Number,
      default: 0,
    },

    downloads: {
      type: Number,
      default: 0,
    },
    coverImagePublicId: {
      type: String,
    },
    pdfUrl: {
      type: String,
    },

    pdfPublicId: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("SuccessStory", successStorySchema);
