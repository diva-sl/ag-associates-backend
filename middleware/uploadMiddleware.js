import multer from "multer";

const storage = multer.memoryStorage();

const imageFileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG and WEBP images are allowed"), false);
  }
};

const documentFileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only Images and PDF files are allowed"), false);
  }
};

const uploadImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

const uploadDocument = multer({
  storage,
  fileFilter: documentFileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});

/* Avatar */

export const uploadAvatar = uploadImage.single("avatar");

/* Knowledge Center */

export const uploadKnowledgePost = uploadImage.single("featuredImage");

/* User Documents */

export const uploadUserDocument = uploadDocument.single("file");

/* Success Story */

export const uploadSuccessStory = uploadDocument.fields([
  {
    name: "coverImage",
    maxCount: 1,
  },
  {
    name: "pdf",
    maxCount: 1,
  },
]);
