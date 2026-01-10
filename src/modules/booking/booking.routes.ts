import express from "express";
import {
  bookTimeSlot,
  deleteBookingByAdmin,
  deleteNotificationByAdmin,
  deleteTransactionByAdmin,
  getAllBookings,
  getAllNotifications,
  getAllTransactions,
  getBookingTrends,
  getCustomerBookings,
  getMonthlyRevenue,
  getWorkerBookings,
  getWorkerMonthlyCalendar,
  getWorkerPopularity,
  handleStripeWebhook,
  initializePayment,
  updateBookingStatus,
} from "./booking.controller";
import { authenticateCustomer } from "../../middlewares/customerMiddleware";
import { authenticateWorker } from "../../middlewares/workerMiddleware";
import { authenticateAdminOrManager } from "../../middlewares/adminOrManagerMiddleware";
import bodyParser from "body-parser";

const bookingRouter = express.Router();
const payment = express.Router();

bookingRouter.post("/book-slot", authenticateCustomer, bookTimeSlot);
bookingRouter.post(
  "/initialize-payment",
  authenticateCustomer,
  initializePayment
);
// bookingRouter.post(
//   "/webhook/stripe",
//   express.raw({ type: "application/json" }),
//   handleStripeWebhook
// );

bookingRouter.get("/worker-book-slot", authenticateWorker, getWorkerBookings);
bookingRouter.get(
  "/customer-book-slot",
  authenticateCustomer,
  getCustomerBookings
);
bookingRouter.get(
  "/worker-monthly-calendar/:workerId",
  getWorkerMonthlyCalendar
);
bookingRouter.get(
  "/popularity",
  authenticateAdminOrManager,
  getWorkerPopularity
);
bookingRouter.get(
  "/booking-trends",
  authenticateAdminOrManager,
  getBookingTrends
);
bookingRouter.get(
  "/get-all-bookings",
  authenticateAdminOrManager,
  getAllBookings
);
bookingRouter.get(
  "/get-all-transactions",
  authenticateAdminOrManager,
  getAllTransactions
);
bookingRouter.get(
  "/get-all-notifications",
  authenticateAdminOrManager,
  getAllNotifications
);
bookingRouter.get(
  "/get-monthly-revenue",
  authenticateAdminOrManager,
  getMonthlyRevenue
);
bookingRouter.patch(
  "/update-booking-status/:bookingId",
  authenticateWorker,
  updateBookingStatus
);

bookingRouter.delete(
  "/delete-booking/:bookingId",
  authenticateAdminOrManager,
  deleteBookingByAdmin
);
bookingRouter.delete(
  "/delete-transaction/:transactionId",
  authenticateAdminOrManager,
  deleteTransactionByAdmin
);


bookingRouter.delete(
  "/delete-notification/:notificationId",
  authenticateAdminOrManager,
  deleteNotificationByAdmin
);

export default bookingRouter;
export { payment };
