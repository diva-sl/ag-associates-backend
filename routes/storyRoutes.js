import express from "express";

import {
  getPublishedStories,
  downloadStoryPdf,
  getPublicStoryById,
} from "../controllers/successStoryController.js";

const router = express.Router();

router.get("/", getPublishedStories);

router.get("/:id/download", downloadStoryPdf);

router.get("/:id", getPublicStoryById);

export default router;
