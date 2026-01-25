"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '.env') });
if (!process.env.DB_URL)
    throw new Error('DB_URL is not defined in .env');
if (!process.env.JWT_SECRET)
    throw new Error('JWT_SECRET is not defined in .env');
exports.config = {
    port: process.env.PORT || '5000',
    host: process.env.HOST || 'localhost',
    db_url: process.env.DB_URL,
    jwt_secret: process.env.JWT_SECRET,
    jwt_expires_in: process.env.JWT_EXPIRES_IN || '7d',
};
