"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.payment = void 0;
const express_1 = __importDefault(require("express"));
const booking_controller_1 = require("./booking.controller");
const customerMiddleware_1 = require("../../middlewares/customerMiddleware");
const workerMiddleware_1 = require("../../middlewares/workerMiddleware");
const adminOrManagerMiddleware_1 = require("../../middlewares/adminOrManagerMiddleware");
const bookingRouter = express_1.default.Router();
const payment = express_1.default.Router();
exports.payment = payment;
bookingRouter.post("/book-slot", customerMiddleware_1.authenticateCustomer, booking_controller_1.bookTimeSlot);
bookingRouter.post("/initialize-payment", customerMiddleware_1.authenticateCustomer, booking_controller_1.initializePayment);
// bookingRouter.post(
//   "/webhook/stripe",
//   express.raw({ type: "application/json" }),
//   handleStripeWebhook
// );
bookingRouter.get("/worker-book-slot", workerMiddleware_1.authenticateWorker, booking_controller_1.getWorkerBookings);
bookingRouter.get("/customer-book-slot", customerMiddleware_1.authenticateCustomer, booking_controller_1.getCustomerBookings);
bookingRouter.get("/worker-monthly-calendar/:workerId", booking_controller_1.getWorkerMonthlyCalendar);
bookingRouter.get("/popularity", adminOrManagerMiddleware_1.authenticateAdminOrManager, booking_controller_1.getWorkerPopularity);
bookingRouter.get("/booking-trends", adminOrManagerMiddleware_1.authenticateAdminOrManager, booking_controller_1.getBookingTrends);
bookingRouter.get("/get-all-bookings", adminOrManagerMiddleware_1.authenticateAdminOrManager, booking_controller_1.getAllBookings);
bookingRouter.get("/get-all-transactions", adminOrManagerMiddleware_1.authenticateAdminOrManager, booking_controller_1.getAllTransactions);
bookingRouter.get("/get-all-notifications", adminOrManagerMiddleware_1.authenticateAdminOrManager, booking_controller_1.getAllNotifications);
bookingRouter.get("/get-monthly-revenue", adminOrManagerMiddleware_1.authenticateAdminOrManager, booking_controller_1.getMonthlyRevenue);
bookingRouter.patch("/update-booking-status/:bookingId", workerMiddleware_1.authenticateWorker, booking_controller_1.updateBookingStatus);
bookingRouter.delete("/delete-booking/:bookingId", adminOrManagerMiddleware_1.authenticateAdminOrManager, booking_controller_1.deleteBookingByAdmin);
bookingRouter.delete("/delete-transaction/:transactionId", adminOrManagerMiddleware_1.authenticateAdminOrManager, booking_controller_1.deleteTransactionByAdmin);
bookingRouter.delete("/delete-notification/:notificationId", adminOrManagerMiddleware_1.authenticateAdminOrManager, booking_controller_1.deleteNotificationByAdmin);
exports.default = bookingRouter;
