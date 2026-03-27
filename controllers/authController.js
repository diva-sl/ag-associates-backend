// import User from "../models/User.js";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";

// const generateToken = (id) => {
//   return jwt.sign({ id }, process.env.JWT_SECRET, {
//     expiresIn: "1h",
//   });
// };

// export const register = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     if (!name || !email || !password) {
//       return res.status(400).json({ message: "All fields required" });
//     }

//     const existingUser = await User.findOne({ email });

//     if (existingUser) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     const hashed = await bcrypt.hash(password, 10);

//     const user = await User.create({
//       name,
//       email,
//       password: hashed,
//     });

//     res.status(201).json({
//       user,
//       token: generateToken(user._id),
//     });
//   } catch (error) {
//     console.error("Register Error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// // export const login = async (req, res) => {
// //   try {
// //     const { email, password } = req.body;

// //     const user = await User.findOne({ email });

// //     if (!user) {
// //       return res.status(400).json({ message: "Invalid email" });
// //     }

// //     const match = await bcrypt.compare(password, user.password);

// //     if (!match) {
// //       return res.status(400).json({ message: "Invalid password" });
// //     }

// //     res.json({
// //       user,
// //       token: generateToken(user._id),
// //     });
// //   } catch (error) {
// //     console.error("Login Error:", error);
// //     res.status(500).json({ message: "Server error" });
// //   }
// // };
// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await User.findOne({ email }).select("+password");

//     if (!user) {
//       return res.status(400).json({ message: "Invalid email" });
//     }

//     // 🔥 GOOGLE USER WITHOUT PASSWORD
//     if (!user.password) {
//       return res.status(400).json({
//         message: "This account uses Google login. Please continue with Google.",
//       });
//     }

//     const match = await bcrypt.compare(password, user.password);

//     if (!match) {
//       return res.status(400).json({ message: "Invalid password" });
//     }

//     res.json({
//       user,
//       token: generateToken(user._id),
//     });
//   } catch (error) {
//     console.error("Login Error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// export const updateProfile = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     user.name = req.body.name ?? user.name;
//     user.phone = req.body.phone ?? user.phone;
//     user.address = req.body.address ?? user.address;
//     user.pan = req.body.pan ?? user.pan;
//     user.aadhaar = req.body.aadhaar ?? user.aadhaar;
//     user.gstin = req.body.gstin ?? user.gstin;

//     const updatedUser = await user.save();

//     res.json({
//       success: true,
//       user: updatedUser,
//     });
//   } catch (error) {
//     console.error("Profile update error:", error);

//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };

// /* ================= CHANGE PASSWORD ================= */

// // export const changePassword = async (req, res) => {
// //   try {
// //     const { currentPassword, newPassword } = req.body;

// //     const user = await User.findById(req.user._id).select("+password");

// //     if (!user || !user.password) {
// //       return res
// //         .status(400)
// //         .json({ message: "Password not set for this user" });
// //     }

// //     const isMatch = await bcrypt.compare(currentPassword, user.password);

// //     if (!isMatch) {
// //       return res.status(400).json({ message: "Current password incorrect" });
// //     }

// //     const salt = await bcrypt.genSalt(10);
// //     user.password = await bcrypt.hash(newPassword, salt);

// //     await user.save();

// //     res.json({ message: "Password updated successfully" });
// //   } catch (error) {
// //     console.error("Password change error:", error);
// //     res.status(500).json({ message: "Server error" });
// //   }
// // };
// export const changePassword = async (req, res) => {
//   try {
//     const { currentPassword, newPassword, confirmPassword } = req.body;

//     // 🔥 1. Validate input
//     if (!newPassword || !confirmPassword) {
//       return res.status(400).json({ message: "All fields required" });
//     }

//     if (newPassword !== confirmPassword) {
//       return res.status(400).json({ message: "Passwords do not match" });
//     }

//     if (newPassword.length < 6) {
//       return res
//         .status(400)
//         .json({ message: "Password must be at least 6 characters" });
//     }

//     const user = await User.findById(req.user._id).select("+password");

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     /* ================= GOOGLE USER FIRST TIME ================= */

//     if (!user.password) {
//       // 🔥 Google user setting password first time
//       const salt = await bcrypt.genSalt(10);
//       user.password = await bcrypt.hash(newPassword, salt);

//       await user.save();

//       return res.json({
//         success: true,
//         message: "Password set successfully",
//       });
//     }

//     /* ================= NORMAL USER ================= */

//     if (!currentPassword) {
//       return res.status(400).json({ message: "Current password is required" });
//     }

//     const isMatch = await bcrypt.compare(currentPassword, user.password);

//     if (!isMatch) {
//       return res.status(400).json({ message: "Current password incorrect" });
//     }

//     const salt = await bcrypt.genSalt(10);
//     user.password = await bcrypt.hash(newPassword, salt);

//     await user.save();

//     res.json({
//       success: true,
//       message: "Password updated successfully",
//     });
//   } catch (error) {
//     console.error("Password change error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

/* ================= TOKEN ================= */

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
};

/* ================= REGISTER ================= */

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      // 🔥 Google user case
      if (existingUser.googleId && !existingUser.password) {
        return res.status(400).json({
          message:
            "This email is registered with Google. Please login with Google.",
        });
      }

      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
    });

    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= LOGIN ================= */

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    // 🔥 Google user without password
    if (!user.password) {
      return res.status(400).json({
        message: "This account uses Google login. Please continue with Google.",
      });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ message: "Invalid password" });
    }

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= UPDATE PROFILE ================= */

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ SAFE UPDATE (NO EMPTY OVERRIDE BUG)
    if (req.body.name !== undefined) user.name = req.body.name;
    if (req.body.phone !== undefined) user.phone = req.body.phone;
    if (req.body.address !== undefined) user.address = req.body.address;
    if (req.body.pan !== undefined) user.pan = req.body.pan.toUpperCase();
    if (req.body.aadhaar !== undefined) user.aadhaar = req.body.aadhaar;
    if (req.body.gstin !== undefined) user.gstin = req.body.gstin.toUpperCase();

    const updatedUser = await user.save();

    res.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= CHANGE PASSWORD ================= */

// export const changePassword = async (req, res) => {
//   try {
//     const { currentPassword, newPassword, confirmPassword } = req.body;

//     if (!newPassword || !confirmPassword) {
//       return res.status(400).json({ message: "All fields required" });
//     }

//     if (newPassword !== confirmPassword) {
//       return res.status(400).json({ message: "Passwords do not match" });
//     }

//     const user = await User.findById(req.user._id).select("+password");

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // 🔥 Google user first time
//     if (!user.password) {
//       const salt = await bcrypt.genSalt(10);
//       user.password = await bcrypt.hash(newPassword, salt);

//       await user.save();

//       return res.json({ message: "Password set successfully" });
//     }

//     if (!currentPassword) {
//       return res.status(400).json({ message: "Current password required" });
//     }

//     const isMatch = await bcrypt.compare(currentPassword, user.password);

//     if (!isMatch) {
//       return res.status(400).json({ message: "Incorrect current password" });
//     }

//     const salt = await bcrypt.genSalt(10);
//     user.password = await bcrypt.hash(newPassword, salt);

//     await user.save();

//     res.json({ message: "Password updated successfully" });
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// };
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 🔥 GOOGLE USER FIRST TIME
    if (!user.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);

      await user.save();

      return res.json({ message: "Password set successfully" });
    }

    if (!currentPassword) {
      return res.status(400).json({ message: "Current password required" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }

    // 🔥 prevent same password reuse
    const isSame = await bcrypt.compare(newPassword, user.password);
    if (isSame) {
      return res.status(400).json({
        message: "New password cannot be same as current password",
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= FORGOT PASSWORD ================= */

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  await user.save();

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  console.log("RESET LINK:", resetUrl);

  res.json({ message: "Reset link sent (check console)" });
};

/* ================= RESET PASSWORD ================= */

export const resetPassword = async (req, res) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired token" });
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(req.body.password, salt);

  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.json({ message: "Password reset successful" });
};
