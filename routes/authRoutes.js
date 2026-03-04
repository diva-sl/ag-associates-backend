// import express from "express";
// import passport from "passport";
// import { register, login } from "../controllers/authController.js";
// import { protect } from "../middleware/authMiddleware.js";

// const router = express.Router();

// // Normal auth
// router.post("/register", register);
// router.post("/login", login);

// router.get("/profile", protect, (req, res) => {
//   res.json(req.user);
// });

// // Google login
// router.get(
//   "/google",
//   passport.authenticate("google", { scope: ["profile", "email"] }),
// );

// // Google callback
// router.get(
//   "/google/callback",
//   passport.authenticate("google", { session: false }),
//   (req, res) => {
//     const { token } = req.user;

//     // Local
//     res.redirect(`http://localhost:5173/google-success?token=${token}`);

//     // Production (later change)
//     // res.redirect(`https://agandassociates.org/google-success?token=${token}`);
//   },
// );

// router.put("/profile", protect, updateProfile);

// export default router;
import express from "express";
import passport from "passport";
import {
  register,
  login,
  updateProfile,
  changePassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

import Document from "../models/Document.js";
// import { FRONTEND_URL } from "../config/env.js";

const router = express.Router();

/* ================= NORMAL AUTH ================= */

router.post("/register", register);
router.post("/login", login);

/* ================= PROFILE ================= */

router.get("/profile", protect, (req, res) => {
  res.json(req.user);
});

router.put("/profile", protect, updateProfile);

/* ================= GOOGLE AUTH ================= */

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const { token } = req.user;

    // Dynamic redirect (works local + production)

    res.redirect(`${process.env.FRONTEND_URL}/google-success?token=${token}`);
  },
);

// router.put("/avatar", protect, upload.single("avatar"), async (req, res) => {
//   req.user.avatar = req.file.path;
//   await req.user.save();
//   res.json({ avatar: req.file.path });
// });

router.put("/avatar", protect, upload.single("avatar"), async (req, res) => {
  req.user.avatar = req.file.path;

  const updatedUser = await req.user.save();

  res.json({
    success: true,
    user: updatedUser,
  });
});

router.put("/change-password", protect, changePassword);

router.post(
  "/upload-document",
  protect,
  upload.single("file"),
  async (req, res) => {
    const doc = await Document.create({
      user: req.user._id,
      type: req.body.type,
      fileUrl: req.file.path,
    });

    res.json(doc);
  },
);

export default router;
