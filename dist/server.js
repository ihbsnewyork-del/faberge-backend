"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const app_1 = __importDefault(require("./app"));
const config_1 = require("./config");
const db_1 = require("./config/db");
const seedAdmin_1 = require("./config/seedAdmin");
const booking_controller_1 = require("./modules/booking/booking.controller");
const fs_1 = __importDefault(require("fs"));
const https_1 = __importDefault(require("https"));
(0, db_1.connectDB)().then(async () => {
    await (0, seedAdmin_1.seedAdmin)();
    const PORT = config_1.config.port;
    const HOST = config_1.config.host;
    const options = {
        key: fs_1.default.readFileSync(path_1.default.join(process.cwd(), 'key.pem')),
        cert: fs_1.default.readFileSync(path_1.default.join(process.cwd(), 'cert.pem')),
    };
    // Create an HTTPS server
    const server = https_1.default.createServer(options, app_1.default);
    server.listen(PORT, () => {
        console.log(`Server running at http://${HOST}:${PORT}`);
        (0, booking_controller_1.startCleanupScheduler)();
    });
});
