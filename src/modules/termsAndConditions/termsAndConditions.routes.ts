import express from "express";

import {
  getTermsAndConditions,
  updatedTermsAndConditions,
} from "./termsAndConditions.controller";
import { authenticateAdminOrManager } from "../../middlewares/adminOrManagerMiddleware";

const termsAndConditionsRouter = express.Router();

termsAndConditionsRouter.patch(
  "/create-or-update-terms-and-conditions",
  authenticateAdminOrManager,
  updatedTermsAndConditions
);

termsAndConditionsRouter.get(
  "/get-terms-and-conditions",
  getTermsAndConditions
);

export default termsAndConditionsRouter;
