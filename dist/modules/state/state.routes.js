"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const state_controller_1 = require("./state.controller");
const adminOrManagerMiddleware_1 = require("../../middlewares/adminOrManagerMiddleware");
const stateRouter = express_1.default.Router();
stateRouter.post("/create-state", adminOrManagerMiddleware_1.authenticateAdminOrManager, state_controller_1.createState);
stateRouter.patch("/update-state/:id", adminOrManagerMiddleware_1.authenticateAdminOrManager, state_controller_1.updateState);
stateRouter.get("/get-all-state", state_controller_1.getAllStates);
stateRouter.get("/get-one-state/:id", state_controller_1.getStateById);
exports.default = stateRouter;
