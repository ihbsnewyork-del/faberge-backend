"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const accessibility_controller_1 = require("./accessibility.controller");
const adminMiddleware_1 = require("../../middlewares/adminMiddleware");
const accessibilityRouter = express_1.default.Router();
accessibilityRouter.get("/get-all-accessibility", adminMiddleware_1.authenticateAdmin, accessibility_controller_1.getAccessibility);
accessibilityRouter.patch("/update-status-accessibility/:managerId", adminMiddleware_1.authenticateAdmin, accessibility_controller_1.updateManagerAccessibility);
exports.default = accessibilityRouter;
