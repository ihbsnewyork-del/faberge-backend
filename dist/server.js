"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = require("./config");
const db_1 = require("./config/db");
const seedAdmin_1 = require("./config/seedAdmin");
const booking_controller_1 = require("./modules/booking/booking.controller");
(0, db_1.connectDB)().then(async () => {
    await (0, seedAdmin_1.seedAdmin)();
    const PORT = config_1.config.port;
    const HOST = config_1.config.host;
    app_1.default.get("/", (_req, res) => {
        res.send("Farberge server is running perfectly!");
    });
    app_1.default.listen(PORT, () => {
        console.log(`Server running at http://${HOST}:${PORT}`);
        (0, booking_controller_1.startCleanupScheduler)();
    });
});
