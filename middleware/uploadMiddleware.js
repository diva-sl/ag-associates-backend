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
    resource_type: "auto",
    type: "upload",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf"],
  }),
});

/* SUCCESS STORY STORAGE */

const successStoryStorage = new CloudinaryStorage({
  cloudinary,

  params: async (req, file) => ({
    folder:
      file.fieldname === "pdf"
        ? "ag-associates/success-stories/pdfs"
        : "ag-associates/success-stories/images",

    resource_type: "auto",

    allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf"],
  }),
});

const knowledgeStorage = new CloudinaryStorage({
  cloudinary,

  params: async () => ({
    folder: "ag-associates/knowledge-center",

    resource_type: "image",

    allowed_formats: ["jpg", "jpeg", "png", "webp"],
  }),
});

export const uploadAvatar = multer({ storage: avatarStorage });

export const uploadDocument = multer({ storage: documentStorage });

export const uploadSuccessStory = multer({
  storage: successStoryStorage,
});

export const uploadKnowledgePost = multer({
  storage: knowledgeStorage,
});
