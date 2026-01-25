"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mediaUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uploadFolder = path_1.default.join(__dirname, "../../picture/dynamic_file");
if (!fs_1.default.existsSync(uploadFolder)) {
    fs_1.default.mkdirSync(uploadFolder, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadFolder);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    },
});
exports.mediaUpload = (0, multer_1.default)({
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
