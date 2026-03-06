import express from "express";
import passport from "passport";
import {
  register,
  login,
  updateProfile,
  changePassword,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";

import cloudinary from "../config/cloudinary.js";

import {
  uploadAvatar,
  uploadDocument,
} from "../middleware/uploadMiddleware.js";

import Document from "../models/Document.js";

const router = express.Router();

/* AUTH */

router.post("/register", register);
router.post("/login", login);

/* PROFILE */

router.get("/profile", protect, (req, res) => {
  res.json(req.user);
});

router.put("/profile", protect, updateProfile);

/* GOOGLE LOGIN */

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
  }),
  (req, res) => {
    const { token } = req.user;

    res.redirect(
      `${process.env.FRONTEND_URL}/google-success?token=${encodeURIComponent(
        token,
      )}`,
    );
  },
);

/* AVATAR UPLOAD */

router.put(
  "/avatar",
  protect,
  uploadAvatar.single("avatar"),
  async (req, res) => {
    req.user.avatar = req.file.path;

    const updatedUser = await req.user.save();

    res.json({
      success: true,
      avatar: req.file.path,
      user: updatedUser,
    });
  },
);

/* AVATAR REMOVE */

router.delete("/avatar", protect, async (req, res) => {
  req.user.avatar = "";

  const updatedUser = await req.user.save();

  res.json({
    success: true,
    user: updatedUser,
  });
});

/* PASSWORD */

router.put("/change-password", protect, changePassword);

/* DOCUMENT UPLOAD */

router.get("/documents", protect, async (req, res) => {
  const docs = await Document.find({
    user: req.user._id,
  }).sort({ createdAt: -1 });

  res.json(docs);
});

router.post(
  "/upload-document",
  protect,
  uploadDocument.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const doc = await Document.create({
        user: req.user._id,
        type: req.body.type,
        fileUrl: req.file.path,
        public_id: req.file.filename,
      });

      res.json({
        success: true,
        document: doc,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Document upload failed" });
    }
  },
);

router.delete("/document/:id", protect, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    // let resourceType = "image";

    // if (doc.fileUrl.includes("/raw/")) {
    //   resourceType = "raw";
    // }

    // await cloudinary.uploader.destroy(doc.public_id, {
    //   resource_type: resourceType,
    // });
    await cloudinary.uploader.destroy(doc.public_id, {
      resource_type: "auto",
    });

    await doc.deleteOne();

    res.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Delete error:", error);

    res.status(500).json({
      message: "Document delete failed",
    });
  }
});

export default router;
