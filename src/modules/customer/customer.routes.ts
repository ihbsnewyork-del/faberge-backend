import express from "express";
import {
  loginCustomerOrWorker,
  updateProfile,
  getMyProfile,
  sendOtp,
  setNewPassword,
  createCustomer,
  setPassword,
  uploadProfilePicture,
  verifyOtp,
  getAllCustomers,
  toggleBlockUser,
  getOneCustomer,
  toggleCustomerDelete,
  superAdminUpdateCustomer,
  superAdminUpdateWorker,
} from "./customer.controller";
import { photoUpload } from "../../uploads/profilePhotoUpload";
import { customerOrWorkerMiddleware } from "../../middlewares/customerOrWorkerMiddleware";
import { authenticateAdminOrManager } from "../../middlewares/adminOrManagerMiddleware";

const customerRouter = express.Router();
const customerOrWorkerRouter = express.Router();

customerRouter.post("/register", createCustomer);
customerRouter.patch("/set-password", setPassword);
customerRouter.patch(
  "/upload-picture",
  photoUpload.single("customerProfileImage"),
  uploadProfilePicture
);
customerRouter.get(
  "/get-all-customers",
  authenticateAdminOrManager,
  getAllCustomers
);
customerRouter.get(
  "/get-one-customer/:id",
  authenticateAdminOrManager,
  getOneCustomer
);

// common api for customer and worker
customerOrWorkerRouter.post("/login", loginCustomerOrWorker);
customerOrWorkerRouter.post("/forgot-password", sendOtp);
customerOrWorkerRouter.post("/verify-otp", verifyOtp);
customerOrWorkerRouter.post("/set-new-password", setNewPassword);
customerOrWorkerRouter.get("/me", customerOrWorkerMiddleware, getMyProfile);
customerOrWorkerRouter.patch(
  "/update-profile",
  customerOrWorkerMiddleware,
  photoUpload.single("customerProfileImage"),
  updateProfile
);
customerOrWorkerRouter.patch(
  "/update-block-unblock/:userId",
  authenticateAdminOrManager,
  toggleBlockUser
);
customerRouter.delete(
  "/customer-delete/:id",
  authenticateAdminOrManager,
  toggleCustomerDelete
);

customerRouter.patch(
  "/update-profile/:id",
  authenticateAdminOrManager,
  photoUpload.single("customerProfileImage"),
  superAdminUpdateCustomer
);

customerRouter.patch(
  "/worker/:id",
  authenticateAdminOrManager,
  photoUpload.single("customerProfileImage"),
  superAdminUpdateWorker
);
export { customerOrWorkerRouter, customerRouter };
