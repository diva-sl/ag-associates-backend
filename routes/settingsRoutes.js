import express from "express";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

import {
  getSettings,
  updateSettings,
  getLegalPage,
  updateLegalPage,
} from "../controllers/settingsController.js";

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get("/", getSettings);

router.put("/", updateSettings);

router.get("/legal/:page", getLegalPage);

router.put("/legal/:page", updateLegalPage);

export default router;
