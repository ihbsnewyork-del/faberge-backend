import express from "express";
import {
  getAllWorker,
  getOneWorker,
  getWorkerDashboardStats,
  registerWorker,
  toggleWorkerDelete,
  updateWorker,
} from "./worker.controller";
import { authenticateAdmin } from "../../middlewares/adminMiddleware";
import { photoUpload } from "../../uploads/profilePhotoUpload";
import { authenticateCustomer } from "../../middlewares/customerMiddleware";
import { authenticateAdminOrManager } from "../../middlewares/adminOrManagerMiddleware";
import { authenticateWorker } from "../../middlewares/workerMiddleware";

const workerRouter = express.Router();

// Only admins may create or update worker profiles (incl. profile photo).
workerRouter.post(
  "/register",
  authenticateAdmin,
  photoUpload.single("workerProfileImage"),
  registerWorker
);
workerRouter.patch(
  "/update-worker/:id",
  authenticateAdmin,
  photoUpload.single("workerProfileImage"),
  updateWorker
);
workerRouter.get("/get-one-worker/:id", getOneWorker);
workerRouter.get("/get-all-worker", getAllWorker);
workerRouter.delete(
  "/delete-worker/:id",
  authenticateAdminOrManager,
  toggleWorkerDelete
);
workerRouter.get(
  "/worker-statistics",
  authenticateWorker,
  getWorkerDashboardStats
);

export default workerRouter;
