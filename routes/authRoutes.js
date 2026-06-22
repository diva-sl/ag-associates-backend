import express from "express";
import passport from "passport";
import {
  register,
  login,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

import {
  uploadToS3,
  uploadPrivateToS3,
  deleteFromS3,
  getSignedFileUrl,
  getDownloadSignedUrl,
} from "../utils/uploadToS3.js";

import {
  uploadAvatar,
  uploadUserDocument,
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

router.get("/google", (req, res, next) => {
  const redirect = req.query.redirect || "";

  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: redirect,
  })(req, res, next);
});

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/auth`,
  }),
  (req, res) => {
    const { token, user } = req.user;
    const redirect = req.query.state || "";

    res.redirect(
      `${process.env.FRONTEND_URL}/google-success?token=${token}&name=${encodeURIComponent(
        user.name,
      )}&email=${encodeURIComponent(user.email)}&avatar=${encodeURIComponent(
        user.avatar || "",
      )}&redirect=${redirect}`,
    );
  },
);
router.put("/avatar", protect, uploadAvatar, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded",
      });
    }

    /* Delete Old Avatar */

    if (req.user.avatarKey) {
      await deleteFromS3(req.user.avatarKey);
    }

    const avatarUpload = await uploadToS3(req.file, "public/avatars");

    req.user.avatar = avatarUpload.url;

    req.user.avatarKey = avatarUpload.key;

    const updatedUser = await req.user.save();

    res.json({
      success: true,
      avatar: avatarUpload.url,
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
});
/* AVATAR REMOVE */

router.delete("/avatar", protect, async (req, res) => {
  try {
    if (req.user.avatarKey) {
      await deleteFromS3(req.user.avatarKey);
    }

    req.user.avatar = "";

    req.user.avatarKey = "";

    const updatedUser = await req.user.save();

    res.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
/* ================= PASSWORD ================= */

router.put("/change-password", protect, changePassword);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
/* DOCUMENT UPLOAD */
router.get("/documents", protect, async (req, res) => {
  try {
    const docs = await Document.find({
      user: req.user._id,
    }).sort({
      createdAt: -1,
    });

    const documents = await Promise.all(
      docs.map(async (doc) => ({
        ...doc.toObject(),

        fileUrl: await getSignedFileUrl(doc.public_id),
      })),
    );

    res.json({
      success: true,
      documents,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
router.post(
  "/upload-document",
  protect,
  uploadUserDocument,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "No file uploaded",
        });
      }

      const uploadedFile = await uploadPrivateToS3(
        req.file,
        "private/documents",
      );

      const document = await Document.create({
        user: req.user._id,
        type: req.body.type,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        public_id: uploadedFile.key,
      });

      const user = await User.findById(req.user._id);

      if (user) {
        switch (req.body.type) {
          case "PAN_CARD":
            user.panStatus = "pending";
            break;

          case "AADHAAR_CARD":
            user.aadhaarStatus = "pending";
            break;

          case "GST_CERTIFICATE":
            user.gstinStatus = "pending";
            break;

          default:
            break;
        }

        await user.save();
      }
      res.status(201).json({
        success: true,
        document,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Document upload failed",
      });
    }
  },
);

router.get("/document/:id/download", protect, async (req, res) => {
  try {
    const doc = await Document.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!doc) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    const url = await getDownloadSignedUrl(doc.public_id, doc.fileName);
    res.json({
      success: true,
      url,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

router.delete("/document/:id", protect, async (req, res) => {
  try {
    const doc = await Document.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!doc) {
      return res.status(404).json({
        message: "Document not found",
      });
    }

    await deleteFromS3(doc.public_id);

    await doc.deleteOne();

    res.json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

export default router;
