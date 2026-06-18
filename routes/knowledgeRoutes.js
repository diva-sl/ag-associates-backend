import express from "express";

import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  createPost,
  getPosts,
  getPostBySlug,
  getPostById,
  updatePost,
  deletePost,
  toggleFeatured,
  toggleStatus,
  getFeaturedPosts,
  getTrendingPosts,
  ratePost,
  markHelpful,
  addQuestion,
  getQuestions,
  answerQuestion,
  approveQuestion,
  deleteQuestion,
  getKnowledgeAnalytics,
  getTopArticles,
  getCategoryStats,
} from "../controllers/knowledgeController.js";

import { uploadKnowledgePost } from "../middleware/uploadMiddleware.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";
const router = express.Router();

/* Categories */

router.post("/categories", protect, adminOnly, createCategory);

router.get("/categories", getCategories);

router.put("/categories/:id", protect, adminOnly, updateCategory);

router.delete("/categories/:id", protect, adminOnly, deleteCategory);

/* Posts */

router.post(
  "/",
  protect,
  adminOnly,
  uploadKnowledgePost.single("featuredImage"),
  createPost,
);
router.put(
  "/:id",
  protect,
  adminOnly,
  uploadKnowledgePost.single("featuredImage"),
  updatePost,
);
router.get("/", getPosts);

router.get("/featured", getFeaturedPosts);

router.get("/trending", getTrendingPosts);

router.get("/analytics", protect, adminOnly, getKnowledgeAnalytics);

router.get("/analytics/top-articles", protect, adminOnly, getTopArticles);

router.get("/analytics/categories", protect, adminOnly, getCategoryStats);

router.get("/edit/:id", protect, adminOnly, getPostById);

router.get("/:slug", getPostBySlug);

router.delete("/:id", protect, adminOnly, deletePost);

/* Feature & Status Routes */
router.patch("/:id/featured", protect, adminOnly, toggleFeatured);

router.patch("/:id/status", protect, adminOnly, toggleStatus);

/*Public Engagement */
router.post("/:id/rate", ratePost);

router.post("/:id/helpful", markHelpful);

router.post("/:id/question", addQuestion);

/* Question Management */

router.get("/questions/all", protect, adminOnly, getQuestions);

router.patch("/questions/:id/approve", protect, adminOnly, approveQuestion);

router.patch("/questions/:id/answer", protect, adminOnly, answerQuestion);

router.delete("/questions/:id", protect, adminOnly, deleteQuestion);

export default router;
