"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const _1 = require(".");
const connectDB = async () => {
    try {
        const dbUrl = _1.config.db_url;
        if (!dbUrl) {
            throw new Error('DB_URL is not defined in .env file');
        }
        await mongoose_1.default.connect(dbUrl);
        console.log('Database connected successfully');
    }
    catch (error) {
        console.error('Failed to connect to DB:', error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
