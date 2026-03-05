import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

/* AVATAR STORAGE */

const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "ag-associates/avatars",
    resource_type: "image",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  },
});

/* DOCUMENT STORAGE */
const documentStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "ag-associates/documents",
    resource_type: "image",
    type: "upload",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf"],
  }),
});

export const uploadAvatar = multer({ storage: avatarStorage });

export const uploadDocument = multer({ storage: documentStorage });
