import express from "express";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

import {
  getStories,
  getStoryById,
  createStory,
  updateStory,
  deleteStory,
  toggleFeatured,
  togglePublishStory,
  getStoryAnalytics,
  uploadStoryAssets,
} from "../controllers/successStoryController.js";
import { uploadSuccessStory } from "../middleware/uploadMiddleware.js";

const router = express.Router();
router.use(protect);
router.use(adminOnly);

router.get("/", getStories);

router.get("/analytics", getStoryAnalytics);

router.post("/", createStory);

router.put("/:id", updateStory);

router.delete("/:id", deleteStory);

router.patch("/:id/feature", toggleFeatured);

router.patch("/:id/publish", togglePublishStory);

// router.post(
//   "/upload-assets",
//   uploadSuccessStory.fields([
//     {
//       name: "coverImage",
//       maxCount: 1,
//     },
//     {
//       name: "pdf",
//       maxCount: 1,
//     },
//   ]),
//   uploadStoryAssets,
// );

router.post(
  "/upload-assets",
  uploadSuccessStory.fields([
    {
      name: "coverImage",
      maxCount: 1,
    },
    {
      name: "pdf",
      maxCount: 1,
    },
  ]),
  (req, res, next) => {
    console.log("MULTER SUCCESS");
    next();
  },
  uploadStoryAssets,
);
router.get("/:id", getStoryById);

export default router;
