import express from "express";
import {
  changePassword,
  deleteManager,
  getAllManagers,
  getMyProfile,
  loginManger,
  registerManager,
  sendOtp,
  setNewPassword,
  toggleBlockManager,
  updateProfile,
  verifyOtp,
} from "./manager.controller";
import { photoUpload } from "../../uploads/profilePhotoUpload";
import { authenticateAdmin } from "../../middlewares/adminMiddleware";
import { authenticateManager } from "../../middlewares/managerMiddleware";
import { authenticateAdminOrManager } from "../../middlewares/adminOrManagerMiddleware";

const managerRouter = express.Router();

managerRouter.post(
  "/register",
  authenticateAdmin,
  photoUpload.single("managerProfileImage"),
  registerManager
);
managerRouter.post("/login", loginManger);

managerRouter.get("/me", authenticateAdminOrManager, getMyProfile);
managerRouter.patch(
  "/update-profile",
  authenticateAdminOrManager,
  photoUpload.single("managerProfileImage"),
  updateProfile
);
managerRouter.post("/forgot-password", sendOtp);
managerRouter.post("/verify-otp", verifyOtp);
managerRouter.post("/set-new-password", setNewPassword);
managerRouter.post(
  "/change-password",
  authenticateAdminOrManager,
  changePassword
);
managerRouter.get("/get-all-managers", authenticateAdmin, getAllManagers);

managerRouter.patch(
  "/block-unblock/:managerId",
  authenticateAdmin,
  toggleBlockManager
);
managerRouter.delete("/manager-delete/:id", authenticateAdmin, deleteManager);

export default managerRouter;
