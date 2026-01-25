"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const privacyPolicy_controller_1 = require("./privacyPolicy.controller");
const adminOrManagerMiddleware_1 = require("../../middlewares/adminOrManagerMiddleware");
const privacyPolicyRouter = express_1.default.Router();
privacyPolicyRouter.patch("/create-or-update-privacy-policy", adminOrManagerMiddleware_1.authenticateAdminOrManager, privacyPolicy_controller_1.updatedPrivacyPolicy);
privacyPolicyRouter.get("/get-privacy-policy", privacyPolicy_controller_1.getPrivacyPolicy);
exports.default = privacyPolicyRouter;
