import express from "express";
import {
  createState,
  updateState,
  getAllStates,
  getStateById,
  updateActiveState,
} from "./state.controller";
import { authenticateAdminOrManager } from "../../middlewares/adminOrManagerMiddleware";

const stateRouter = express.Router();

stateRouter.post("/create-state", authenticateAdminOrManager, createState);
stateRouter.patch("/update-state/:id",authenticateAdminOrManager, updateState);
stateRouter.get("/get-all-state", getAllStates);
stateRouter.get("/get-one-state/:id", getStateById);


export default stateRouter;
