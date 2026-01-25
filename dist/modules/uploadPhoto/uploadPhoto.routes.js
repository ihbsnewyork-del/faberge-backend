"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const uploadPhoto_controller_1 = require("./uploadPhoto.controller");
const adminOrManagerMiddleware_1 = require("../../middlewares/adminOrManagerMiddleware");
const dynamicImageOrVideo_1 = require("../../uploads/dynamicImageOrVideo");
const uploadPhotoRouter = express_1.default.Router();
uploadPhotoRouter.post("/create-dynamic-photo-or-video", dynamicImageOrVideo_1.mediaUpload.single("dynamicUpload"), adminOrManagerMiddleware_1.authenticateAdminOrManager, uploadPhoto_controller_1.createUploadPhoto);
uploadPhotoRouter.get("/get-all-dynamic-photo", uploadPhoto_controller_1.getAllPhotos);
uploadPhotoRouter.get("/get-one-dynamic-photo/:name", adminOrManagerMiddleware_1.authenticateAdminOrManager, uploadPhoto_controller_1.getPhotoByTitle);
exports.default = uploadPhotoRouter;
