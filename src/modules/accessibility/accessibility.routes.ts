import express from "express";
import {
  getAccessibility,
  updateManagerAccessibility,
} from "./accessibility.controller";
import { authenticateAdmin } from "../../middlewares/adminMiddleware";

const accessibilityRouter = express.Router();

accessibilityRouter.get(
  "/get-all-accessibility",
  authenticateAdmin,
  getAccessibility
);
accessibilityRouter.patch(
  "/update-status-accessibility/:managerId",
  authenticateAdmin,
  updateManagerAccessibility
);

export default accessibilityRouter;
