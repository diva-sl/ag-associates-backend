// routes/legalRoutes.js

import express from "express";
import LegalPage from "../models/LegalPage.js";

const router = express.Router();

router.get("/:page", async (req, res) => {
  try {
    const page = await LegalPage.findOne({
      page: req.params.page,
    });

    if (!page) {
      return res.status(404).json({
        message: "Legal page not found",
      });
    }

    res.json(page);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

export default router;
