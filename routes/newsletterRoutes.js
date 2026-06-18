import express from "express";

import {
  subscribeNewsletter,
  getSubscribers,
  deleteSubscriber,
  getNewsletterStats,
} from "../controllers/newsletterController.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

/* Public */
router.post("/subscribe", subscribeNewsletter);

/* Admin */
router.get("/admin/subscribers", protect, adminOnly, getSubscribers);

router.get("/admin/stats", protect, adminOnly, getNewsletterStats);

router.delete("/admin/subscribers/:id", protect, adminOnly, deleteSubscriber);

export default router;
