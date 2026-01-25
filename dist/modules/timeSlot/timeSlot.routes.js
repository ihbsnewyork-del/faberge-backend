"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const timeSlot_controller_1 = require("./timeSlot.controller");
const workerMiddleware_1 = require("../../middlewares/workerMiddleware");
const timeSlotRouter = express_1.default.Router();
timeSlotRouter.patch("/update-availability", workerMiddleware_1.authenticateWorker, timeSlot_controller_1.setWorkerUnAvailability);
timeSlotRouter.patch("/assign-off-day", workerMiddleware_1.authenticateWorker, timeSlot_controller_1.setOffDay);
timeSlotRouter.get("/get-all-workers-availability", timeSlot_controller_1.getAllWorkerAvailability);
timeSlotRouter.get("/get-one-worker-availability/:workerId", timeSlot_controller_1.getWorkerAvailability);
exports.default = timeSlotRouter;
