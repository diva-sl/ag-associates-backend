import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashed,
    });

    res.status(201).json({
      user,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ message: "Invalid password" });
    }

    res.json({
      user,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// export const updateProfile = async (req, res) => {
//   const user = await User.findById(req.user._id);

//   if (!user) {
//     return res.status(404).json({ message: "User not found" });
//   }

//   user.name = req.body.name || user.name;
//   user.email = req.body.email || user.email;
//   user.phone = req.body.phone || user.phone;
//   user.address = req.body.address || user.address;
//   user.pan = req.body.pan || user.pan;
//   user.aadhaar = req.body.aadhaar || user.aadhaar;
//   user.gstin = req.body.gstin || user.gstin;
//   user.avatar = req.body.avatar || user.avatar;

//   const updatedUser = await user.save();

//   res.json({
//     user: updatedUser,
//     token: generateToken(updatedUser._id),
//   });
// };

// export const changePassword = async (req, res) => {
//   const { currentPassword, newPassword } = req.body;

//   const user = await User.findById(req.user._id);

//   const isMatch = await bcrypt.compare(currentPassword, user.password);

//   if (!isMatch)
//     return res.status(400).json({ message: "Incorrect current password" });

//   user.password = await bcrypt.hash(newPassword, 10);
//   await user.save();

//   res.json({ message: "Password updated successfully" });
// };

/* ================= UPDATE PROFILE ================= */

// export const updateProfile = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     // Update fields only if provided

//     user.name = req.body.name ?? user.name;
//     user.phone = req.body.phone ?? user.phone;
//     user.address = req.body.address ?? user.address;
//     user.pan = req.body.pan ?? user.pan;
//     user.aadhaar = req.body.aadhaar ?? user.aadhaar;
//     user.gstin = req.body.gstin ?? user.gstin;

//     const updatedUser = await user.save();

//     res.json({
//       success: true,
//       user: {
//         _id: updatedUser._id,
//         name: updatedUser.name,
//         email: updatedUser.email,
//         phone: updatedUser.phone,
//         address: updatedUser.address,
//         pan: updatedUser.pan,
//         aadhaar: updatedUser.aadhaar,
//         gstin: updatedUser.gstin,
//         avatar: updatedUser.avatar,
//         role: updatedUser.role,
//         subscription: updatedUser.subscription,
//         subscriptionExpiry: updatedUser.subscriptionExpiry,
//         createdAt: updatedUser.createdAt,
//       },
//     });
//   } catch (error) {
//     console.error("Profile update error:", error);

//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.name = req.body.name ?? user.name;
    user.phone = req.body.phone ?? user.phone;
    user.address = req.body.address ?? user.address;
    user.pan = req.body.pan ?? user.pan;
    user.aadhaar = req.body.aadhaar ?? user.aadhaar;
    user.gstin = req.body.gstin ?? user.gstin;

    const updatedUser = await user.save();

    res.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Profile update error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ================= CHANGE PASSWORD ================= */

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select("+password");

    if (!user || !user.password) {
      return res
        .status(400)
        .json({ message: "Password not set for this user" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Current password incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Password change error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
