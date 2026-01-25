"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAdmin = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const manager_model_1 = require("../modules/manager/manager.model");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const seedAdmin = async () => {
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
        console.warn("Missing ADMIN_EMAIL or ADMIN_PASSWORD in .env file");
        return;
    }
    const existingManager = await manager_model_1.ManagerModel.findOne({ email: ADMIN_EMAIL });
    if (existingManager) {
        console.log("Admin manager already exists");
        return;
    }
    const hashedPassword = await bcryptjs_1.default.hash(ADMIN_PASSWORD, 10);
    const adminManager = new manager_model_1.ManagerModel({
        firstName: process.env.ADMIN_FIRST_NAME,
        lastName: process.env.ADMIN_LAST_NAME,
        address: process.env.ADMIN_ADDRESS,
        city: process.env.ADMIN_CITY,
        state: process.env.ADMIN_STATE,
        phone: process.env.ADMIN_PHONE,
        email: ADMIN_EMAIL,
        password: hashedPassword,
        role: "admin",
    });
    await adminManager.save();
    console.log("Admin manager created successfully!");
};
exports.seedAdmin = seedAdmin;
