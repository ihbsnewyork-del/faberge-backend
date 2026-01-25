"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const services_controller_1 = require("./services.controller");
const adminOrManagerMiddleware_1 = require("../../middlewares/adminOrManagerMiddleware");
const serviceRouter = express_1.default.Router();
serviceRouter.post("/create-service", adminOrManagerMiddleware_1.authenticateAdminOrManager, services_controller_1.createService);
serviceRouter.get("/get-all-services", services_controller_1.getAllServices);
serviceRouter.get("/get-one-service/:id", services_controller_1.getServiceById);
serviceRouter.patch("/update-service/:id", adminOrManagerMiddleware_1.authenticateAdminOrManager, services_controller_1.updateService);
serviceRouter.delete("/delete-service/:id", adminOrManagerMiddleware_1.authenticateAdminOrManager, services_controller_1.deleteService);
serviceRouter.get("/popularity", adminOrManagerMiddleware_1.authenticateAdminOrManager, services_controller_1.getServicePopularity);
serviceRouter.post("/service-time", adminOrManagerMiddleware_1.authenticateAdminOrManager, services_controller_1.createOrUpdateServiceTime);
serviceRouter.get("/service-time", adminOrManagerMiddleware_1.authenticateAdminOrManager, services_controller_1.getServiceTime);
exports.default = serviceRouter;
