import { Request, Response } from "express";
import { BookingModel } from "./booking.model";
import { TimeSlotModel } from "../timeSlot/timeSlot.model";
import { CustomerModel } from "../customer/customer.model";
import { WorkerModel } from "../worker/worker.model";
import { ServiceModel } from "../services/services.model";
import generateDefaultSlots from "../timeSlot/timeSlot.controller";
import { paginate } from "../../helper/paginationHelper";
import nodemailer from "nodemailer";

import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

function convertTo24Hour(time12h: string) {
  const [time, modifier] = time12h.trim().split(" "); // "02:30", "PM"
  let [hours, minutes] = time.split(":").map(Number);

  if (modifier.toUpperCase() === "PM" && hours !== 12) {
    hours += 12;
  }
  if (modifier.toUpperCase() === "AM" && hours === 12) {
    hours = 0;
  }

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
}

// --------------------
// Payment Method
// --------------------
const calculateTotalPrice = async (booking: any) => {
  let total = 0;

  for (const srv of booking.services) {
    const serviceDoc = await ServiceModel.findById(srv.service);
    if (!serviceDoc) {
      console.warn(`Service ${srv.service} not found`);
      continue;
    }

    // Add base service price
    total += serviceDoc.price;

    // Add subcategory prices if they exist
    if (srv.subcategories && srv.subcategories.length > 0) {
      for (const subId of srv.subcategories) {
        const sub = serviceDoc.subcategory?.find(
          (s: any) => s._id.toString() === subId.toString()
        );
        if (sub) {
          total += sub.subcategoryPrice; // ← Changed from sub.price
        }
      }
    }
  }

  return total;
};
export const initializePayment = async (req: any, res: Response) => {
  try {
    const { bookingId } = req.body;
    const customerId = req.user.userId;
    const currency = "usd";
    const success_url = "https://inhomebeautyservices.com/success";
    const cancel_url = "https://inhomebeautyservices.com/cancel";

    const customer = await CustomerModel.findById(customerId);
    if (!customer) {
      res.status(404).json({ message: "Customer not found" });
      return;
    }

    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    const workerId = booking.worker;

    const worker = await WorkerModel.findById(workerId);
    if (!worker) {
      res.status(404).json({ message: "Worker not found" });
      return;
    }

    const amount = await calculateTotalPrice(booking);

    const metadata = {
      bookingId: booking._id.toString(),
      customerId: customerId.toString(),
      workerId: workerId.toString(),
    };

    const session = await stripe.checkout.sessions.create({
      customer_email: customer.email,
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency,
            product_data: { name: "Total Price" },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      metadata,
      success_url,
      cancel_url,
    });
    res.json({ url: session?.url, totalAmount: amount });
  } catch (err: any) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error initializing payment", error: err.message });
  }
};

export const handleStripeWebhook = async (req: Request, res: Response) => {
  console.log(
    "===============================================================first"
  );
  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  switch (event.type) {
    case "checkout.session.completed":
      const session = event.data.object as Stripe.Checkout.Session;
      await handleSuccessfulPayment(session);
      break;

    case "checkout.session.async_payment_succeeded":
      const asyncSession = event.data.object as Stripe.Checkout.Session;
      await handleSuccessfulPayment(asyncSession);
      break;

    case "checkout.session.async_payment_failed":
      const failedSession = event.data.object as Stripe.Checkout.Session;
      await handleFailedPayment(failedSession);
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
};

const handleSuccessfulPayment = async (session: Stripe.Checkout.Session) => {
  try {
    const { bookingId, customerId, workerId } = session.metadata || {};

    if (!bookingId) {
      console.error("❌ No bookingId in webhook metadata");
      return;
    }

    console.log("✅ Payment successful for booking:", bookingId);

    const booking = await BookingModel.findByIdAndUpdate(
      bookingId,
      {
        isPayment: true,
        transactionId: session.payment_intent as string,
        paymentAmount: (session.amount_total as number) / 100,
        status: "booked",
        paymentExpiresAt: null,
      },
      { new: true }
    );

    if (!booking) {
      console.error("❌ Booking not found:", bookingId);
      return;
    }

    // Confirm the slot booking
    const timeSlotDoc = await TimeSlotModel.findOne({
      worker: booking.worker,
      date: booking.date,
    });

    if (timeSlotDoc) {
      const slot = timeSlotDoc.slots.find(
        (s) => s.startTime === booking.startTime
      );

      if (slot) {
        slot.isBooked = true; // Now permanently booked
        slot.isAvailable = false;
        slot.heldBy = null;
        slot.heldUntil = null;
        await timeSlotDoc.save();
      }
    }

    const customer = await CustomerModel.findById(customerId);
    if (!customer) {
      console.error("❌ Customer not found:", customerId);
      return;
    }

    const worker = await WorkerModel.findById(workerId);
    if (!worker) {
      console.error("❌ Worker not found:", workerId);
      return;
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: worker.email,
      subject: "A booking has been confirmed",
      text: `Your booking has been confirmed. Booking ID: ${bookingId}. Customer: ${
        customer.firstName
      } ${customer.lastName}. Date: ${booking.date}. Time: ${
        booking.startTime
      }. Location: ${customer.address}, ${customer.city}, ${customer.state} ${
        customer.zipCode ? ", " + customer.zipCode : ""
      }.`,
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: customer.email,
      subject: "A booking has been confirmed",
      text: `Your booking has been confirmed. Booking ID: ${bookingId}. Worker: ${worker.firstName} ${worker.lastName}. Date: ${booking.date}. Time: ${booking.startTime}`,
    });

    console.log("✅ Booking confirmed:", {
      bookingId: booking._id,
      isPayment: booking.isPayment,
      transactionId: booking.transactionId,
      status: booking.status,
    });
  } catch (error: any) {
    console.error("❌ Error handling successful payment:", error.message);
  }
};

export const cleanupExpiredBookings = async () => {
  try {
    const now = new Date();

    // Find all expired pending bookings
    const expiredBookings = await BookingModel.find({
      status: "pending",
      isPayment: false,
      paymentExpiresAt: { $lte: now },
    });

    console.log(`🧹 Cleaning up ${expiredBookings.length} expired bookings`);

    for (const booking of expiredBookings) {
      // Update booking status to expired
      booking.status = "expired";
      await booking.save();

      // Release the time slot
      const timeSlotDoc = await TimeSlotModel.findOne({
        worker: booking.worker,
        date: booking.date,
      });

      if (timeSlotDoc) {
        const slotIndex = timeSlotDoc.slots.findIndex(
          (s) => s.startTime === booking.startTime
        );

        if (slotIndex !== -1) {
          const slot = timeSlotDoc.slots[slotIndex];

          // Release the slot
          slot.isAvailable = true;
          slot.isBooked = false;
          slot.heldBy = null;
          slot.heldUntil = null;

          // Unblock adjacent slots
          const prevSlot = timeSlotDoc.slots[slotIndex - 1];
          const nextSlot = timeSlotDoc.slots[slotIndex + 1];

          if (prevSlot) prevSlot.isBlocked = false;
          if (nextSlot) nextSlot.isBlocked = false;

          await timeSlotDoc.save();

          console.log(`✅ Released slot for booking: ${booking._id}`);
        }
      }
    }

    console.log(
      `✅ Cleanup completed: ${expiredBookings.length} bookings expired`
    );
  } catch (error: any) {
    console.error("❌ Error cleaning up expired bookings:", error.message);
  }
};

export const startCleanupScheduler = () => {
  setInterval(cleanupExpiredBookings, 60 * 1000);
  console.log("Cleanup scheduler started");
};

const handleFailedPayment = async (session: Stripe.Checkout.Session) => {
  try {
    const { bookingId } = session.metadata!;
    console.log("❌ Payment failed for booking:", bookingId);
  } catch (error: any) {
    console.error("Error handling failed payment:", error.message);
  }
};

// --------------------
// Booking Slot By Customer with Payment Hold
// --------------------
export const bookTimeSlot = async (req: any, res: Response) => {
  try {
    const { userId: customerId } = req.user;
    const { workerId, services, date, startTime } = req.body;
    console.log({ customerId, workerId, services, date, startTime });

    if (
      !workerId ||
      !services ||
      !Array.isArray(services) ||
      services.length === 0 ||
      !date ||
      !startTime
    ) {
      res.status(400).json({ message: "Missing or invalid required fields" });
      return;
    }

    const customer = await CustomerModel.findById(customerId);
    if (!customer) {
      res.status(404).json({ message: "Customer not found" });
      return;
    }

    const worker = await WorkerModel.findById(workerId).populate("services");
    if (!worker) {
      res.status(404).json({ message: "Worker not found" });
      return;
    }

    const workerServiceIds = worker.services.map((s: any) =>
      s.service.toString()
    );

    for (const srv of services) {
      if (!workerServiceIds.includes(srv.serviceId)) {
        res.status(400).json({
          message: `Worker does not provide service ${srv.serviceId}`,
        });
        return;
      }
    }

    let timeSlotDoc = await TimeSlotModel.findOne({ worker: workerId, date });
    if (!timeSlotDoc) {
      timeSlotDoc = new TimeSlotModel({
        worker: workerId,
        date,
        slots: generateDefaultSlots(),
        heldBy: customer?._id,
      });
      await timeSlotDoc.save();
    }

    if (timeSlotDoc.isOffDay) {
      res.status(400).json({ message: "Worker is off on this day" });
      return;
    }

    const convertedStartTime = convertTo24Hour(startTime);

    const slotIndex = timeSlotDoc.slots.findIndex(
      (s) => s.startTime === convertedStartTime
    );

    if (slotIndex === -1) {
      res.status(404).json({ message: "Slot not found" });
      return;
    }

    const slot = timeSlotDoc.slots[slotIndex];
    const now = new Date();

    if (slot.heldUntil && now >= slot.heldUntil && !slot.isBooked) {
      console.log(`🔓 Releasing expired hold on slot ${startTime}`);

      slot.isAvailable = true;
      slot.heldBy = null;
      slot.heldUntil = null;

      const prevSlot = timeSlotDoc.slots[slotIndex - 1];
      const nextSlot = timeSlotDoc.slots[slotIndex + 1];

      if (prevSlot && prevSlot.isBlocked) prevSlot.isBlocked = false;
      if (nextSlot && nextSlot.isBlocked) nextSlot.isBlocked = false;

      await timeSlotDoc.save();

      if (slot.heldBy) {
        await BookingModel.findByIdAndUpdate(slot.heldBy, {
          status: "expired",
        });
      }
    }

    if (slot.heldUntil && now < slot.heldUntil) {
      const remainingMinutes = Math.ceil(
        (slot.heldUntil.getTime() - now.getTime()) / (1000 * 60)
      );

      res.status(400).json({
        message: `Slot is temporarily held by another customer. Available in ${remainingMinutes} minute(s).`,
        availableAt: slot.heldUntil,
      });
      return;
    }

    if (slot.isBooked) {
      res.status(400).json({ message: "Slot is already booked" });
      return;
    }

    if (slot.isBlocked) {
      res.status(400).json({ message: "Slot is blocked" });
      return;
    }

    if (!slot.isAvailable) {
      res.status(400).json({ message: "Slot is not available" });
      return;
    }

    const formattedServices = services.map((srv: any) => ({
      service: srv.serviceId,
      subcategories: srv.serviceCategories || [],
    }));

    const HOLD_MINUTES = 3;

    const paymentExpiresAt = new Date(Date.now() + HOLD_MINUTES * 60 * 1000);

    const booking = await BookingModel.create({
      customer: customerId,
      worker: workerId,
      services: formattedServices,
      date,
      startTime: slot.startTime,
      endTime: slot.endTime,
      status: "pending",
      isPayment: false,
      paymentExpiresAt,
    });

    slot.isAvailable = false;
    slot.heldBy = booking._id;
    slot.heldUntil = paymentExpiresAt;

    const prevSlot = timeSlotDoc.slots[slotIndex - 1];
    const nextSlot = timeSlotDoc.slots[slotIndex + 1];

    if (prevSlot) prevSlot.isBlocked = true;
    if (nextSlot) nextSlot.isBlocked = true;

    await timeSlotDoc.save();

    console.log(`✅ Slot temporarily reserved until: ${paymentExpiresAt}`);

    res.status(201).json({
      message:
        "Slot temporarily reserved. Please complete payment within 3 minutes.",
      data: booking,
      expiresAt: paymentExpiresAt,
      expiresInMinutes: 3,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      message: "Error booking slot",
      error: err.message,
    });
  }
};

// --------------------
// Get One Worker Bookings Information
// --------------------
export const getWorkerBookings = async (req: any, res: Response) => {
  try {
    const workerId = req.user.userId;

    const worker = await WorkerModel.findById(workerId);
    if (!worker) {
      res.status(404).json({ message: "Worker not found" });
      return;
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const month = parseInt(req.query.month);
    const year = parseInt(req.query.year);
    const date = req.query.date;
    const status = req.query.status; // optional: "booked" | "completed" | "cancelled"
    const filterType = req.query.filter; // optional: "upcoming" | "completed"

    console.log(date);

    const query: any = { worker: workerId };

    if (date) {
      const target = new Date(date);

      const startOfDay = new Date(target);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(target);
      endOfDay.setHours(23, 59, 59, 999);

      query.date = { $gte: startOfDay, $lte: endOfDay };
    } else if (!isNaN(month) && !isNaN(year)) {
      const start = new Date(year, month - 1, 1, 0, 0, 0);
      const end = new Date(year, month, 0, 23, 59, 59, 999);

      query.date = { $gte: start, $lte: end };
    } else if (filterType === "upcoming" || filterType === "completed") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (filterType === "upcoming") query.date = { $gte: today };

      if (filterType === "completed") query.date = { $lt: today };
    }
    if (status) {
      query.status = status;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (filterType === "upcoming") {
      query.date = { ...query.date, $gte: today };
    } else if (filterType === "completed") {
      query.date = { ...query.date, $lt: today };
    }

    const total = await BookingModel.countDocuments(query);
    const bookings = await BookingModel.find(query)
      .populate({
        path: "customer",
        select: "firstName lastName email phone uploadPhoto address",
      })
      .populate({
        path: "worker",
        select: "firstName lastName email phone uploadPhoto address",
      })
      .populate({
        path: "services.service",
        select: "serviceName price subcategory",
      })
      .sort({ date: -1, startTime: -1 })
      .skip(skip)
      .limit(limit);

    const groupedByDate = bookings.reduce((acc: any, booking: any) => {
      const day = booking.date.toISOString().split("T")[0];
      if (!acc[day]) acc[day] = [];
      acc[day].push(booking);
      return acc;
    }, {});

    res.status(200).json({
      message: "Worker bookings fetched successfully",
      month,
      year,
      data: groupedByDate,
      pagination: {
        total: total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    console.error("Error fetching worker bookings:", err);
    res.status(500).json({
      message: "Error fetching worker bookings",
      error: err.message,
    });
  }
};

// --------------------
// Get Worker Monthly Calendar
// --------------------
export const getWorkerMonthlyCalendar = async (req: any, res: Response) => {
  try {
    const workerId = req.params.workerId;

    const worker = await WorkerModel.findById(workerId);
    if (!worker) {
      res.status(404).json({ message: "Worker not found" });
      return;
    }

    const year = parseInt(req.query.year);
    const month = parseInt(req.query.month);

    if (!year || !month || month < 1 || month > 12) {
      res.status(400).json({ message: "Valid year and month are required" });
      return;
    }

    const startDate = new Date(year, month - 1, 1, 0, 0, 0);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const daysInMonth = new Date(year, month, 0).getDate();

    const getDateKey = (d: Date) => {
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .split("T")[0];
    };

    const timeSlots = await TimeSlotModel.find({
      worker: workerId,
      date: { $gte: startDate, $lte: endDate },
    });

    const bookings = await BookingModel.find({
      worker: workerId,
      date: { $gte: startDate, $lte: endDate },
    });

    const timeSlotMap = new Map();
    const bookingCountMap = new Map();

    timeSlots.forEach((slot) => {
      const key = getDateKey(slot.date);
      timeSlotMap.set(key, slot);
    });

    bookings.forEach((booking) => {
      const key = getDateKey(booking.date);
      bookingCountMap.set(key, (bookingCountMap.get(key) || 0) + 1);
    });

    const calendarData: any[] = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month - 1, day, 0, 0, 0);
      const dateKey = getDateKey(currentDate);

      const timeSlot = timeSlotMap.get(dateKey);
      const bookingCount = bookingCountMap.get(dateKey) || 0;

      let color = "";

      if (currentDate < today) {
        color = "bg-gray-200";
      } else if (timeSlot) {
        if (timeSlot.isOffDay) {
          color = "bg-red-500";
        } else {
          const totalSlots = timeSlot.slots.length;
          const bookedSlots = timeSlot.slots.filter(
            (s: any) => s.isBooked
          ).length;

          if (bookedSlots === totalSlots) {
            color = "bg-gray-400"; // fully booked
          } else {
            color = "bg-green-500"; // available
          }
        }
      } else {
        color = "bg-white"; // No timeslot created
      }

      calendarData.push({
        date: dateKey,
        day,
        color,
        isOffDay: timeSlot?.isOffDay || false,
        totalBookings: bookingCount,
        availableSlots: timeSlot
          ? timeSlot.slots.filter(
              (s: any) => s.isAvailable && !s.isBooked && !s.isBlocked
            ).length
          : generateDefaultSlots().length,
      });
    }

    res.status(200).json({
      message: "Worker monthly calendar fetched successfully",
      year,
      month,
      data: calendarData,
    });
  } catch (err: any) {
    console.error("Error fetching worker monthly calendar:", err);
    res.status(500).json({
      message: "Error fetching worker monthly calendar",
      error: err.message,
    });
  }
};

// --------------------
// Get Customer Bookings
// --------------------
export const getCustomerBookings = async (req: any, res: Response) => {
  try {
    const customerId = req.user.userId;

    const customer = await CustomerModel.findById(customerId);
    if (!customer) {
      res.status(404).json({ message: "Customer not found" });
      return;
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const month = parseInt(req.query.month);
    const year = parseInt(req.query.year);
    const status = req.query.status; // optional: "booked" | "completed" | "cancelled"
    const filterType = req.query.filter; // optional: "upcoming" | "completed"

    const query: any = { customer: customerId };

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    }

    if (status) {
      query.status = status;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (filterType === "upcoming") {
      query.date = { ...query.date, $gte: today };
    } else if (filterType === "completed") {
      query.date = { ...query.date, $lt: today };
    }

    const total = await BookingModel.countDocuments(query);
    const bookings = await BookingModel.find(query)
      .populate({
        path: "worker",
        select: "firstName lastName email phone uploadPhoto",
      })
      .populate({
        path: "customer",
        select: "firstName lastName email phone uploadPhoto",
      })
      .populate({
        path: "services.service",
        select: "serviceName price subcategory",
      })
      .sort({ date: -1, startTime: -1 })
      .skip(skip)
      .limit(limit);

    const groupedByDate = bookings.reduce((acc: any, booking: any) => {
      const day = booking.date.toISOString().split("T")[0];
      if (!acc[day]) acc[day] = [];
      acc[day].push(booking);
      return acc;
    }, {});

    res.status(200).json({
      message: "Customer bookings fetched successfully",
      month,
      year,
      data: groupedByDate,
      pagination: {
        total: total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    console.error("Error fetching customer bookings:", err);
    res.status(500).json({
      message: "Error fetching customer bookings",
      error: err.message,
    });
  }
};

// --------------------
// Get Workers Popularity
// --------------------
export const getWorkerPopularity = async (req: Request, res: Response) => {
  try {
    const month = parseInt(req.query.month as string);
    const year = parseInt(req.query.year as string);

    if (!month || !year) {
      res.status(400).json({
        message: "Month and year are required",
      });
      return;
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const popularity = await BookingModel.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$worker",
          totalBookings: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "workers",
          localField: "_id",
          foreignField: "_id",
          as: "worker",
        },
      },
      { $unwind: "$worker" },

      {
        $project: {
          _id: 0,
          workerName: {
            $concat: ["$worker.firstName", " ", "$worker.lastName"],
          },
          totalBookings: 1,
        },
      },

      { $sort: { totalBookings: -1 } },
    ]);

    res.status(200).json({
      message: "Worker popularity fetched successfully",
      data: popularity,
    });
  } catch (err: any) {
    console.error("Error fetching popularity:", err);
    res.status(500).json({
      message: "Error fetching worker popularity",
      error: err.message,
    });
  }
};

// --------------------
// Get Bookings Trends
// --------------------
export const getBookingTrends = async (req: Request, res: Response) => {
  try {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();

    if (!year) {
      res.status(400).json({
        message: "Year is required",
      });
      return;
    }

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    const result = await BookingModel.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $month: "$date" },
          totalBookings: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const finalData = monthNames.map((name, index) => {
      const monthNumber = index + 1;
      const found = result.find((r: any) => r._id === monthNumber);

      return {
        month: name,
        totalBookings: found ? found.totalBookings : 0,
      };
    });

    res.status(200).json({
      message: "Booking trends fetched successfully",
      data: finalData,
    });
  } catch (err: any) {
    console.error("Error fetching booking trends:", err);
    res.status(500).json({
      message: "Error fetching booking trends",
      error: err.message,
    });
  }
};

// --------------------
// Get All Bookings
// --------------------
export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const { page, limit, status, filterType } = req.query;
    const filter: any = {};

    if (status) filter.status = status;

    // ================== TIME BASED FILTER ==================
    const now = new Date();

    const convertTimeToMs = (time: string) => {
      const [h, m] = time.split(":").map(Number);
      return h * 60 * 60 * 1000 + m * 60 * 1000;
    };

    // Upcoming = endTime not passed
    if (filterType === "upcoming") {
      filter.$expr = {
        $gt: [
          {
            $add: [
              "$date",
              {
                $add: [
                  {
                    $multiply: [
                      { $toInt: { $substr: ["$endTime", 0, 2] } },
                      3600000,
                    ],
                  },
                  {
                    $multiply: [
                      { $toInt: { $substr: ["$endTime", 3, 2] } },
                      60000,
                    ],
                  },
                ],
              },
            ],
          },
          now,
        ],
      };
    }

    // Completed = endTime already passed
    if (filterType === "completed") {
      filter.$expr = {
        $lte: [
          {
            $add: [
              "$date",
              {
                $add: [
                  {
                    $multiply: [
                      { $toInt: { $substr: ["$endTime", 0, 2] } },
                      3600000,
                    ],
                  },
                  {
                    $multiply: [
                      { $toInt: { $substr: ["$endTime", 3, 2] } },
                      60000,
                    ],
                  },
                ],
              },
            ],
          },
          now,
        ],
      };
    }
    // ========================================================

    const result = await paginate(BookingModel, {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      sort: { createdAt: -1 },
      filter,
    });

    let populatedData = await BookingModel.populate(result.data, [
      {
        path: "customer",
        select:
          "firstName lastName email phone uploadPhoto address city state zipCode",
      },
      {
        path: "worker",
        select: "firstName lastName email phone uploadPhoto workerId",
      },
      {
        path: "services.service",
        model: "Service",
        select: "serviceName price subcategory",
      },
    ]);

    populatedData = populatedData.map((booking: any) => {
      const bookingObj = booking.toObject ? booking.toObject() : booking;

      bookingObj.services = bookingObj.services.map((srv: any) => {
        const serviceDoc = srv.service;
        if (!serviceDoc) return srv;

        const selectedSubcategories = (srv.subcategories || [])
          .map((subId: any) =>
            (serviceDoc.subcategory || []).find(
              (sub: any) => sub._id.toString() === subId.toString()
            )
          )
          .filter(Boolean);

        return {
          _id: srv._id,
          service: {
            _id: serviceDoc._id,
            serviceName: serviceDoc.serviceName,
            price: serviceDoc.price,
          },
          subcategories: selectedSubcategories.map((sub: any) => ({
            _id: sub._id,
            subcategoryName: sub.subcategoryName,
            subcategoryPrice: sub.subcategoryPrice,
          })),
        };
      });

      return bookingObj;
    });

    result.data = populatedData;

    res
      .status(200)
      .json({ message: "All bookings fetched successfully", ...result });
  } catch (err: any) {
    console.error("Error fetching all bookings:", err);
    res
      .status(500)
      .json({ message: "Error fetching all bookings", error: err.message });
  }
};

// --------------------
// Get All Transaction
// --------------------
export const getAllTransactions = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const result = await paginate(BookingModel, {
      page: Number(page),
      limit: Number(limit),
      filter: { isPayment: true, isTransactionDeleted: false },
      sort: { createdAt: -1 },
    });

    const populatedData = await BookingModel.populate(result.data, [
      { path: "customer", select: "firstName lastName email phone" },
      {
        path: "worker",
        select: "firstName lastName phone uploadPhoto workerId",
      },
      { path: "services.service", select: "serviceName price" },
    ]);

    res.status(200).json({
      message: "All Transactions fetched successfully",
      pagination: result.pagination,
      transactions: populatedData,
    });
  } catch (err: any) {
    res.status(500).json({
      message: "Error fetching transactions",
      error: err.message,
    });
  }
};

export const getAllNotifications = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const result = await paginate(BookingModel, {
      page: Number(page),
      limit: Number(limit),
      filter: { isNotificationDeleted: false },
      sort: { createdAt: -1 },
    });

    const populatedData = await BookingModel.populate(result.data, [
      { path: "customer", select: "firstName lastName email phone" },
      {
        path: "worker",
        select: "firstName lastName phone uploadPhoto workerId",
      },
      {
        path: "services.service",
        model: "Service",
        select: "serviceName price subcategory",
      },
    ]);

    res.status(200).json({
      message: "All notification fetched successfully",
      pagination: result.pagination,
      notification: populatedData,
    });
  } catch (err: any) {
    res.status(500).json({
      message: "Error fetching notification",
      error: err.message,
    });
  }
};

// --------------------
// Get Review Api
// --------------------
export const getMonthlyEarnings = async (req: Request, res: Response) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();

    const result = await BookingModel.aggregate([
      {
        $match: {
          isPayment: true,
          status: { $in: ["completed", "booked"] },
          date: {
            $gte: new Date(year, 0, 1),
            $lte: new Date(year, 11, 31, 23, 59, 59),
          },
        },
      },

      // group by month
      {
        $group: {
          _id: { month: { $month: "$date" } },
          totalAmount: { $sum: "$paymentAmount" },
          count: { $sum: 1 },
        },
      },

      // sort by month
      { $sort: { "_id.month": 1 } },

      // final formatting
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $toString: year },
              "-",
              {
                $cond: [
                  { $lte: ["$_id.month", 9] },
                  { $concat: ["0", { $toString: "$_id.month" }] },
                  { $toString: "$_id.month" },
                ],
              },
            ],
          },
          totalAmount: 1,
          count: 1,
        },
      },
    ]);

    res.status(200).json({
      message: "Monthly earnings retrieved successfully",
      data: result,
    });
  } catch (error: any) {
    console.error("Error fetching monthly earnings:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// --------------------
// Revenue Graph
// --------------------
export const getMonthlyRevenue = async (req: Request, res: Response) => {
  try {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const revenueData = await BookingModel.aggregate([
      {
        $match: {
          isPayment: true,
          paymentAmount: { $gt: 0 },
          createdAt: {
            $gte: new Date(`${year}-01-01T00:00:00Z`),
            $lte: new Date(`${year}-12-31T23:59:59Z`),
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          revenue: { $sum: "$paymentAmount" },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    const finalData = months.map((m, index) => {
      const monthIndex = index + 1;
      const match = revenueData.find((d) => d._id.month === monthIndex);

      return {
        month: m,
        revenue: match ? match.revenue : 0,
      };
    });

    res.status(200).json({
      year,
      revenue: finalData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// --------------------
// update status of booking by customer
// --------------------

export const updateBookingStatus = async (req: any, res: Response) => {
  try {
    const { bookingId } = req.params;
    const id = bookingId;
    const booking = await BookingModel.findById(id);

    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }
    if (booking?.status === "completed") {
      res.status(404).json({ message: "Booking already completed" });
      return;
    }
    if (!booking.worker.equals(req.user.userId)) {
      res.status(400).json({ message: "You are not authorized" });
      return;
    }
    booking.status = "completed";
    await booking.save();
    res.status(200).json({ message: "Booking status updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// --------------------
// Delete Booking (Super Admin)
// --------------------
export const deleteBookingByAdmin = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;

    const booking = await BookingModel.findById(bookingId);
    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    // if (booking.status === "completed") {
    //   return res.status(400).json({
    //     message: "Completed bookings cannot be deleted",
    //   });
    // }

    // const timeSlotDoc = await TimeSlotModel.findOne({
    //   worker: booking.worker,
    //   date: booking.date,
    // });

    // if (timeSlotDoc) {
    //   const slotIndex = timeSlotDoc.slots.findIndex(
    //     (s) => s.startTime === booking.startTime
    //   );

    //   if (slotIndex !== -1) {
    //     const slot = timeSlotDoc.slots[slotIndex];

    //     slot.isAvailable = true;
    //     slot.isBooked = false;
    //     slot.heldBy = null;
    //     slot.heldUntil = null;

    //     if (timeSlotDoc.slots[slotIndex - 1])
    //       timeSlotDoc.slots[slotIndex - 1].isBlocked = false;

    //     if (timeSlotDoc.slots[slotIndex + 1])
    //       timeSlotDoc.slots[slotIndex + 1].isBlocked = false;

    //     await timeSlotDoc.save();
    //   }
    // }

    await BookingModel.findByIdAndDelete(bookingId);

    res.status(200).json({
      message: "Booking deleted successfully by super admin",
    });
  } catch (error: any) {
    console.error("Delete booking error:", error);
    res.status(500).json({
      message: "Failed to delete booking",
      error: error.message,
    });
  }
};

export const deleteTransactionByAdmin = async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.params;

    const booking = await BookingModel.findById(transactionId);
    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    booking.isTransactionDeleted = true;

    await booking.save();

    res.status(200).json({
      message: "Transaction deleted successfully ",
    });
  } catch (error: any) {
    console.error("Delete transaction error:", error);
    res.status(500).json({
      message: "Failed to delete transaction",
      error: error.message,
    });
  }
};

export const deleteNotificationByAdmin = async (
  req: Request,
  res: Response
) => {
  try {
    const { notificationId } = req.params;
    console.log(notificationId);

    const booking = await BookingModel.findById(notificationId);
    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    booking.isNotificationDeleted = true;

    await booking.save();

    res.status(200).json({
      message: "Notification deleted successfully ",
    });
  } catch (error: any) {
    console.error("Delete notification error:", error);
    res.status(500).json({
      message: "Failed to delete notification",
      error: error.message,
    });
  }
};
