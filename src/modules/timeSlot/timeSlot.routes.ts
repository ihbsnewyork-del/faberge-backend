import express from "express";
import {
  getAllWorkerAvailability,
  getWorkerAvailability,
  setOffDay,
  setWorkerUnAvailability,
} from "./timeSlot.controller";
import { authenticateWorker } from "../../middlewares/workerMiddleware";

const timeSlotRouter = express.Router();

timeSlotRouter.patch(
  "/update-availability",
  authenticateWorker,
  setWorkerUnAvailability
);
timeSlotRouter.patch("/assign-off-day", authenticateWorker, setOffDay);

timeSlotRouter.get("/get-all-workers-availability", getAllWorkerAvailability);
timeSlotRouter.get(
  "/get-one-worker-availability/:workerId",
  getWorkerAvailability
);

export default timeSlotRouter;
