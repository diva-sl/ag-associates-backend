// routes/adminRoutes.js

import express from "express";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

import {
  getDashboardStats,
  getUsers,
  getUserById,
  blockUser,
  deleteUser,
  getTransactions,
  getTransactionById,
  getRevenueAnalytics,
  getDocuments,
  approveDocument,
  rejectDocument,
  getRecentUsers,
  getRecentTransactions,
  getSubscriptions,
  getSubscriptionStats,
  getPlans,
  getPlanById,
  createPlan,
  updatePlan,
  deletePlan,
  togglePlanStatus,
  toggleHighlightPlan,
  getSubscriptionAnalytics,
  getRevenueByPlan,
  getUserGrowthAnalytics,
  getStoryDownloadsAnalytics,
  getTopPlans,
  getDocumentAnalytics,
} from "../controllers/adminController.js";

const router = express.Router();

/* ================= ADMIN AUTH ================= */

router.use(protect);
router.use(adminOnly);

/* ================= DASHBOARD ================= */

router.get("/dashboard", getDashboardStats);
/* ================= USERS ================= */

router.get("/users", getUsers);

router.get("/users/:id", getUserById);
router.get("/recent-users", getRecentUsers);

router.patch("/users/block/:id", blockUser);

router.delete("/users/:id", deleteUser);

/* ================= TRANSACTIONS ================= */

router.get("/transactions", getTransactions);

router.get("/transactions/:id", getTransactionById);
router.get("/recent-transactions", getRecentTransactions);

/* ================= ANALYTICS ================= */

router.get("/analytics/revenue", getRevenueAnalytics);

/* ================= DOCUMENTS ================= */

router.get("/documents", getDocuments);

router.patch("/documents/:id/approve", approveDocument);

router.patch("/documents/:id/reject", rejectDocument);

router.get("/subscriptions", getSubscriptions);

router.get("/analytics/subscriptions", getSubscriptionStats);

/* ================= PLANS ================= */

router.get("/plans", getPlans);

router.get("/plans/:id", getPlanById);

router.post("/plans", createPlan);

router.put("/plans/:id", updatePlan);

router.delete("/plans/:id", deletePlan);

router.patch("/plans/:id/toggle", togglePlanStatus);

router.patch("/plans/:id/highlight", toggleHighlightPlan);

/* ================= PLAN ANALYTICS ================= */

router.get("/analytics/subscriptions", getSubscriptionAnalytics);

/* ================= ADVANCED ANALYTICS ================= */

router.get("/analytics/revenue-plan", getRevenueByPlan);

router.get("/analytics/user-growth", getUserGrowthAnalytics);

router.get("/analytics/story-downloads", getStoryDownloadsAnalytics);

router.get("/analytics/top-plans", getTopPlans);

router.get("/analytics/documents", getDocumentAnalytics);

export default router;
