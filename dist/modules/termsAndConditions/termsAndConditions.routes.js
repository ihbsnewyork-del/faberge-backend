"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const termsAndConditions_controller_1 = require("./termsAndConditions.controller");
const adminOrManagerMiddleware_1 = require("../../middlewares/adminOrManagerMiddleware");
const termsAndConditionsRouter = express_1.default.Router();
termsAndConditionsRouter.patch("/create-or-update-terms-and-conditions", adminOrManagerMiddleware_1.authenticateAdminOrManager, termsAndConditions_controller_1.updatedTermsAndConditions);
termsAndConditionsRouter.get("/get-terms-and-conditions", termsAndConditions_controller_1.getTermsAndConditions);
exports.default = termsAndConditionsRouter;
