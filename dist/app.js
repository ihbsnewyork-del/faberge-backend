"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const customer_routes_1 = require("./modules/customer/customer.routes");
const worker_routes_1 = __importDefault(require("./modules/worker/worker.routes"));
const manager_routes_1 = __importDefault(require("./modules/manager/manager.routes"));
const privacyPolicy_routes_1 = __importDefault(require("./modules/privacyPolicy/privacyPolicy.routes"));
const termsAndConditions_routes_1 = __importDefault(require("./modules/termsAndConditions/termsAndConditions.routes"));
const aboutUs_routes_1 = __importDefault(require("./modules/aboutUs/aboutUs.routes"));
const contactUs_routes_1 = __importDefault(require("./modules/contactUs/contactUs.routes"));
const services_routes_1 = __importDefault(require("./modules/services/services.routes"));
const state_routes_1 = __importDefault(require("./modules/state/state.routes"));
const accessibility_routes_1 = __importDefault(require("./modules/accessibility/accessibility.routes"));
const timeSlot_routes_1 = __importDefault(require("./modules/timeSlot/timeSlot.routes"));
const booking_routes_1 = __importStar(require("./modules/booking/booking.routes"));
const uploadPhoto_routes_1 = __importDefault(require("./modules/uploadPhoto/uploadPhoto.routes"));
const booking_controller_1 = require("./modules/booking/booking.controller");
const app = (0, express_1.default)();
app.post("/api/webhook/stripe", express_1.default.raw({ type: "application/json" }), booking_controller_1.handleStripeWebhook);
app.use((0, cors_1.default)({
    // origin: [
    //   'http://localhost:5173',
    //   'http://localhost:5174',
    //   'http://10.0.60.27:5173',
    // ],
    // credentials: true,
    origin: (origin, callback) => {
        callback(null, origin);
    },
    credentials: true,
}));
app.use(express_1.default.json());
app.get("/", (_req, res) => {
    res.send("Farberge server is running perfectly!");
});
app.use("/picture", express_1.default.static("picture"));
app.use("/customer", customer_routes_1.customerRouter);
app.use("/customer-or-worker", customer_routes_1.customerOrWorkerRouter);
app.use("/worker", worker_routes_1.default);
app.use("/manager", manager_routes_1.default);
app.use("/service", services_routes_1.default);
app.use("/state", state_routes_1.default);
app.use("/accessibility", accessibility_routes_1.default);
app.use("/time-slot", timeSlot_routes_1.default);
app.use("/booking", booking_routes_1.default);
app.use("/photo", uploadPhoto_routes_1.default);
app.use("/contact-us", booking_routes_1.payment);
// common api
app.use("/public", privacyPolicy_routes_1.default, termsAndConditions_routes_1.default, aboutUs_routes_1.default, contactUs_routes_1.default);
exports.default = app;
