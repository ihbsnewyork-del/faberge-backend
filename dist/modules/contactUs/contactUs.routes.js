"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const contactUs_controller_1 = require("./contactUs.controller");
const adminOrManagerMiddleware_1 = require("../../middlewares/adminOrManagerMiddleware");
const contactUsRouter = express_1.default.Router();
contactUsRouter.post("/create-contact-us", contactUs_controller_1.createContactUs);
contactUsRouter.get("/get-contact-us", adminOrManagerMiddleware_1.authenticateAdminOrManager, contactUs_controller_1.getContactUs);
contactUsRouter.get("/get-one-contact-us/:id", adminOrManagerMiddleware_1.authenticateAdminOrManager, contactUs_controller_1.getContactUsById);
contactUsRouter.get("/update-status-contact-us/:id", adminOrManagerMiddleware_1.authenticateAdminOrManager, contactUs_controller_1.updateStatusContactUsById);
contactUsRouter.delete("/delete-contact-us/:id", adminOrManagerMiddleware_1.authenticateAdminOrManager, contactUs_controller_1.deleteContactUsById);
exports.default = contactUsRouter;
