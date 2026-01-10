import express from "express";
import cors from "cors";
import {
  customerOrWorkerRouter,
  customerRouter,
} from "./modules/customer/customer.routes";
import workerRouter from "./modules/worker/worker.routes";
import managerRouter from "./modules/manager/manager.routes";
import privacyPolicyRouter from "./modules/privacyPolicy/privacyPolicy.routes";
import termsAndConditionsRouter from "./modules/termsAndConditions/termsAndConditions.routes";
import aboutUsRouter from "./modules/aboutUs/aboutUs.routes";
import contactUsRouter from "./modules/contactUs/contactUs.routes";
import serviceRouter from "./modules/services/services.routes";
import stateRouter from "./modules/state/state.routes";
import accessibilityRouter from "./modules/accessibility/accessibility.routes";
import timeSlotRouter from "./modules/timeSlot/timeSlot.routes";
import bookingRouter, { payment } from "./modules/booking/booking.routes";
import uploadPhotoRouter from "./modules/uploadPhoto/uploadPhoto.routes";
import { handleStripeWebhook } from "./modules/booking/booking.controller";

const app = express();

app.post(
  "/api/webhook/stripe",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);
app.use(
  cors({
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
  })
);

app.use(express.json());

app.use("/picture", express.static("picture"));

app.use("/customer", customerRouter);
app.use("/customer-or-worker", customerOrWorkerRouter);
app.use("/worker", workerRouter);
app.use("/manager", managerRouter);
app.use("/service", serviceRouter);
app.use("/state", stateRouter);
app.use("/accessibility", accessibilityRouter);
app.use("/time-slot", timeSlotRouter);
app.use("/booking", bookingRouter);
app.use("/photo", uploadPhotoRouter);
app.use("/contact-us", payment);

// common api
app.use(
  "/public",
  privacyPolicyRouter,
  termsAndConditionsRouter,
  aboutUsRouter,
  contactUsRouter
);

export default app;
