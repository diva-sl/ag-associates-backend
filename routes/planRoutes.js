import express from "express";
import SubscriptionPlan from "../models/SubscriptionPlan.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const plans = await SubscriptionPlan.find({
    isActive: true,
  }).sort({
    sortOrder: 1,
  });

  res.json(plans);
});

export default router;
