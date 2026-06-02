import multer from "multer";
import path from "path";
import fs from "fs";

const uploadFolder = path.join(__dirname, "../../picture/dynamic_file");

if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadFolder);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

export const mediaUpload = multer({
  // Home banner accepts both images and videos, so allow up to 50MB
  // (matches the dashboard's client-side limit in HomeBanner.jsx).
  limits: { fileSize: 50 * 1024 * 1024 },
  storage,
  fileFilter: function (req, file, cb) {
    if (
      !file.mimetype.startsWith("image/") &&
      !file.mimetype.startsWith("video/")
    ) {
      return cb(new Error("Only image or video files are allowed"));
    }
    cb(null, true);
  },
});
