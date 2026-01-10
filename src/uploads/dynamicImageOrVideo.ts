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
  storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "video/mp4",
      "video/mkv",
      "video/avi",
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only images and videos are allowed"));
    }
    cb(null, true);
  },
});
