"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateAdmin = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const authenticateAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        res.status(401).json({ message: "Unauthorized: No token provided" });
        return;
    }
    try {
        const token = authHeader.split(" ")[1];
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwt_secret);
        console.log(decoded);
        if (decoded?.role !== "admin") {
            res.status(403).json({ message: "Forbidden: Not an admin" });
            return;
        }
        if (decoded?.isBlocked) {
            res.status(401).json({ message: "Unauthorized: User is blocked" });
            return;
        }
        if (decoded?.isDeleted) {
            res.status(401).json({ message: "Unauthorized: User is deleted" });
            return;
        }
        req.user = {
            userId: decoded.id,
            email: decoded.email,
            role: decoded.role,
        };
        next();
    }
    catch (error) {
        console.error("JWT Verification Error:", error);
        res.status(401).json({ message: "Invalid or expired token" });
    }
};
exports.authenticateAdmin = authenticateAdmin;
