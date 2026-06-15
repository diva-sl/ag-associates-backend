import mongoose from "mongoose";

const subscriptionPlanSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    originalPrice: Number,

    ideal: String,

    features: [String],

    highlight: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("SubscriptionPlan", subscriptionPlanSchema);
