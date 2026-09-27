import express from "express";

import {
  createSubscriber,
  deleteSubscriberById,
  getSubscribers,
  updateStatusSubscriberById,
} from "./subscriber.controller";
import { authenticateAdminOrManager } from "../../middlewares/adminOrManagerMiddleware";

const subscriberRouter = express.Router();

// Public: website footer subscribe form
subscriberRouter.post("/subscribe", createSubscriber);

// Admin / Manager: notification section
subscriberRouter.get(
  "/get-all-subscribers",
  authenticateAdminOrManager,
  getSubscribers
);

subscriberRouter.get(
  "/update-status-subscriber/:id",
  authenticateAdminOrManager,
  updateStatusSubscriberById
);

subscriberRouter.delete(
  "/delete-subscriber/:id",
  authenticateAdminOrManager,
  deleteSubscriberById
);

export default subscriberRouter;
