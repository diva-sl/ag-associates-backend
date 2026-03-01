import express from "express";
import passport from "passport";
import { register, login } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Normal auth
router.post("/register", register);
router.post("/login", login);

router.get("/profile", protect, (req, res) => {
  res.json(req.user);
});

// Google login
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

// Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    const { token } = req.user;

    // Local
    res.redirect(`http://localhost:5173/google-success?token=${token}`);

    // Production (later change)
    // res.redirect(`https://agandassociates.org/google-success?token=${token}`);
  },
);

export default router;
