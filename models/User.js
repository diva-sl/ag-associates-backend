// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     password: {
//       type: String,
//     },
//     googleId: {
//       type: String,
//     },

//     role: {
//       type: String,
//       default: "user",
//     },
//   },
//   { timestamps: true },
// );

// export default mongoose.model("User", userSchema);
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    /* ================= BASIC AUTH ================= */

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      minlength: 6,
    },

    googleId: {
      type: String,
    },

    /* ================= PROFILE DETAILS ================= */

    phone: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    pan: {
      type: String,
      uppercase: true,
      trim: true,
    },

    aadhaar: {
      type: String,
      trim: true,
    },

    gstin: {
      type: String,
      uppercase: true,
      trim: true,
    },

    avatar: {
      type: String, // Cloudinary / URL
    },

    /* ================= SYSTEM ================= */

    role: {
      type: String,
      enum: ["user", "client", "admin"],
      default: "user",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    subscription: {
      type: String,
      enum: ["none", "basic", "premium", "corporate"],
      default: "none",
    },
    subscriptionExpiry: {
      type: Date,
    },
  },

  {
    timestamps: true,
  },
);

export default mongoose.model("User", userSchema);
