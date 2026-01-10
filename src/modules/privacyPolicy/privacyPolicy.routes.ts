import express from "express";

import {
  getPrivacyPolicy,
  updatedPrivacyPolicy,
} from "./privacyPolicy.controller";
import { authenticateAdminOrManager } from "../../middlewares/adminOrManagerMiddleware";

const privacyPolicyRouter = express.Router();

privacyPolicyRouter.patch(
  "/create-or-update-privacy-policy",
  authenticateAdminOrManager,
  updatedPrivacyPolicy
);

privacyPolicyRouter.get("/get-privacy-policy", getPrivacyPolicy);

export default privacyPolicyRouter;
