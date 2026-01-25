"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const aboutUs_controller_1 = require("./aboutUs.controller");
const adminOrManagerMiddleware_1 = require("../../middlewares/adminOrManagerMiddleware");
const aboutUsRouter = express_1.default.Router();
aboutUsRouter.patch("/create-or-update-about-us", adminOrManagerMiddleware_1.authenticateAdminOrManager, aboutUs_controller_1.updateAboutUs);
aboutUsRouter.get("/get-about-us", aboutUs_controller_1.getAboutUs);
exports.default = aboutUsRouter;
