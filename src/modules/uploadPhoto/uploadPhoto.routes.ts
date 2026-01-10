import express from "express";
import multer from "multer";
import {
  createUploadPhoto,
  getAllPhotos,
  getPhotoByTitle,
} from "./uploadPhoto.controller";
import { photoUpload } from "../../uploads/profilePhotoUpload";
import { authenticateAdminOrManager } from "../../middlewares/adminOrManagerMiddleware";
import { mediaUpload } from "../../uploads/dynamicImageOrVideo";
import { authenticateCustomer } from "../../middlewares/customerMiddleware";
import { authenticateWorker } from "../../middlewares/workerMiddleware";

const uploadPhotoRouter = express.Router();

uploadPhotoRouter.post(
  "/create-dynamic-photo-or-video",
  mediaUpload.single("dynamicUpload"),
  authenticateAdminOrManager,
  createUploadPhoto
);

uploadPhotoRouter.get(
  "/get-all-dynamic-photo",
  getAllPhotos
);

uploadPhotoRouter.get(
  "/get-one-dynamic-photo/:name",
  authenticateAdminOrManager,
  getPhotoByTitle
);

export default uploadPhotoRouter;
