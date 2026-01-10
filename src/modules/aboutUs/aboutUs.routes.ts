import express from "express";

import { getAboutUs, updateAboutUs } from "./aboutUs.controller";
import { authenticateAdminOrManager } from "../../middlewares/adminOrManagerMiddleware";

const aboutUsRouter = express.Router();

aboutUsRouter.patch(
  "/create-or-update-about-us",
  authenticateAdminOrManager,
  updateAboutUs
);

aboutUsRouter.get("/get-about-us", getAboutUs);

export default aboutUsRouter;
