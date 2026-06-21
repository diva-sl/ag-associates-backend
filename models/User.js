// // import mongoose from "mongoose";

// // const userSchema = new mongoose.Schema(
// //   {
// //     name: {
// //       type: String,
// //     },
// //     email: {
// //       type: String,
// //       required: true,
// //       unique: true,
// //     },
// //     password: {
// //       type: String,
// //     },
// //     googleId: {
// //       type: String,
// //     },

// //     role: {
// //       type: String,
// //       default: "user",
// //     },
// //   },
// //   { timestamps: true },
// // );

// // export default mongoose.model("User", userSchema);
// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema(
//   {
//     /* ================= BASIC AUTH ================= */

//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//       trim: true,
//     },

//     password: {
//       type: String,
//       minlength: 6,
//     },

//     googleId: {
//       type: String,
//     },

//     /* ================= PROFILE DETAILS ================= */

//     phone: {
//       type: String,
//       trim: true,
//     },

//     address: {
//       type: String,
//       trim: true,
//     },

//     pan: {
//       type: String,
//       uppercase: true,
//       trim: true,
//     },

//     aadhaar: {
//       type: String,
//       trim: true,
//     },

//     gstin: {
//       type: String,
//       uppercase: true,
//       trim: true,
//     },

//     avatar: {
//       type: String, // Cloudinary / URL
//     },

//     /* ================= SYSTEM ================= */

//     role: {
//       type: String,
//       enum: ["user", "client", "admin"],
//       default: "user",
//     },

//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//     subscription: {
//       type: String,
//       enum: ["none", "basic", "premium", "corporate"],
//       default: "none",
//     },
//     subscriptionExpiry: {
//       type: Date,
//     },
//   },

//   {
//     timestamps: true,
//   },
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
      select: false, // 🔥 important for security
    },

    googleId: {
      type: String,
    },

    /* ================= PROFILE DETAILS ================= */

    phone: {
      type: String,
      trim: true,
      match: [/^[0-9]{10}$/, "Phone must be 10 digits"],
    },

    address: {
      type: String,
      trim: true,
    },

    pan: {
      type: String,
      uppercase: true,
      trim: true,
      match: [/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format"],
    },

    aadhaar: {
      type: String,
      trim: true,
      match: [/^[0-9]{12}$/, "Aadhaar must be 12 digits"],
    },

    gstin: {
      type: String,
      uppercase: true,
      trim: true,
      match: [
        /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{3}$/,
        "Invalid GSTIN format",
      ],
    },

    avatar: {
      type: String,
    },
    avatarKey: { type: String },

    /* ================= PASSWORD RESET ================= */

    resetPasswordToken: {
      type: String,
    },

    resetPasswordExpire: {
      type: Date,
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
      default: "none",
    },
    subscriptionPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionPlan",
    },

    subscriptionAmount: {
      type: Number,
      default: 0,
    },

    subscriptionPurchasedAt: {
      type: Date,
    },

    subscriptionStatus: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
    },

    subscriptionExpiry: {
      type: Date,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },

    lastLogin: {
      type: Date,
    },
    lastLoginIP: {
      type: String,
    },

    lastDevice: {
      type: String,
    },

    passwordChangedAt: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },

  {
    timestamps: true,
  },
);

export default mongoose.model("User", userSchema);
