"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const worker_controller_1 = require("./worker.controller");
const profilePhotoUpload_1 = require("../../uploads/profilePhotoUpload");
const adminOrManagerMiddleware_1 = require("../../middlewares/adminOrManagerMiddleware");
const workerMiddleware_1 = require("../../middlewares/workerMiddleware");
const workerRouter = express_1.default.Router();
workerRouter.post("/register", adminOrManagerMiddleware_1.authenticateAdminOrManager, profilePhotoUpload_1.photoUpload.single("workerProfileImage"), worker_controller_1.registerWorker);
workerRouter.patch("/update-worker/:id", adminOrManagerMiddleware_1.authenticateAdminOrManager, profilePhotoUpload_1.photoUpload.single("workerProfileImage"), worker_controller_1.updateWorker);
workerRouter.get("/get-one-worker/:id", worker_controller_1.getOneWorker);
workerRouter.get("/get-all-worker", worker_controller_1.getAllWorker);
workerRouter.delete("/delete-worker/:id", adminOrManagerMiddleware_1.authenticateAdminOrManager, worker_controller_1.toggleWorkerDelete);
workerRouter.get("/worker-statistics", workerMiddleware_1.authenticateWorker, worker_controller_1.getWorkerDashboardStats);
exports.default = workerRouter;
