import { Request, Response } from "express";
import { TimeSlotModel } from "./timeSlot.model";
import { BookingModel } from "../booking/booking.model";
import {
  getCurrentTimeInTimezone,
  getDayBoundariesInUTC,
  convertFromUTC,
} from "../../helper/timezoneHelper";

function generateDefaultSlots() {
  const slots = [];
  let hour = 9;
  let minute = 0;

  while (hour < 19) {
    const start = `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;

    let nextHour = hour;
    let nextMinute = minute + 30;

    if (nextMinute >= 60) {
      nextHour += 1;
      nextMinute -= 60;
    }

    if (nextHour > 19 || (nextHour === 19 && nextMinute > 0)) {
      break;
    }

    const end = `${nextHour.toString().padStart(2, "0")}:${nextMinute
      .toString()
      .padStart(2, "0")}`;

    slots.push({
      startTime: start,
      endTime: end,
      isAvailable: true,
      isBooked: false,
    });

    hour = nextHour;
    minute = nextMinute;
  }

  return slots;
}

export default generateDefaultSlots;

// Helper to get client timezone from request
const getClientTimezone = (req: any): string => {
  return (
    req.headers["x-timezone"] ||
    req.query.timezone ||
    req.user?.timezone ||
    "UTC"
  );
};

// ---------------------------------------
// Set Worker Unavailability
// ---------------------------------------
export const setWorkerUnAvailability = async (req: any, res: Response) => {
  try {
    const workerId = req.user.userId;
    const { date, unavailableSlots } = req.body;
    const clientTimezone = getClientTimezone(req);

    if (!date || !Array.isArray(unavailableSlots)) {
      res
        .status(400)
        .json({ message: "Date and unavailableSlots are required" });
      return;
    }

    // Convert client date to UTC for database query
    const { startOfDay, endOfDay } = getDayBoundariesInUTC(
      date,
      clientTimezone,
    );

    let timeSlot = await TimeSlotModel.findOne({
      worker: workerId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (timeSlot?.isOffDay === true) {
      res.status(400).json({ message: "Worker is off day" });
      return;
    }

    if (!timeSlot) {
      timeSlot = new TimeSlotModel({
        worker: workerId,
        date: startOfDay, // Store in UTC
        slots: generateDefaultSlots(),
      });
    }

    timeSlot.slots.forEach((slot) => {
      if (unavailableSlots.includes(slot.startTime)) {
        slot.isAvailable = false;
      } else {
        slot.isAvailable = true;
      }
    });

    await timeSlot.save();

    res.status(200).json({
      message: "Unavailability updated successfully",
      data: timeSlot,
      timezone: clientTimezone,
    });
  } catch (err: any) {
    console.error("Error setting unavailability:", err);
    res.status(500).json({
      message: "Error setting unavailability",
      error: err.message,
    });
  }
};

// -------------------------
// Set OffDay
// -------------------------
export const setOffDay = async (req: any, res: Response) => {
  try {
    const workerId = req.user.userId;
    const { date } = req.body;
    const clientTimezone = getClientTimezone(req);

    if (!date) {
      res.status(400).json({ message: "Date is required" });
      return;
    }

    // Get current time in client's timezone
    const currentTime = getCurrentTimeInTimezone(clientTimezone);
    const currentDate = new Date(currentTime.date);
    const inputDate = new Date(date);

    if (inputDate < currentDate) {
      res.status(400).json({ message: "You cannot set past date as off day" });
      return;
    }

    // Convert to UTC for database operations
    const { startOfDay, endOfDay } = getDayBoundariesInUTC(
      date,
      clientTimezone,
    );

    const timeSlot = await TimeSlotModel.findOne({
      worker: workerId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    const bookingExists = await BookingModel.findOne({
      worker: workerId,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: ["pending", "booked"] },
    });

    if (bookingExists) {
      res.status(400).json({
        message:
          "You cannot set this day as off day. A booking already exists.",
      });
      return;
    }

    if (timeSlot && timeSlot.isOffDay) {
      const offDay = await TimeSlotModel.findOneAndUpdate(
        { worker: workerId, date: { $gte: startOfDay, $lte: endOfDay } },
        {
          worker: workerId,
          date: startOfDay,
          isOffDay: false,
          slots: generateDefaultSlots(),
        },
        { upsert: true, new: true },
      );
      res.status(200).json({
        message: "Off day removed successfully",
        data: offDay,
        timezone: clientTimezone,
      });
      return;
    }

    const offDay = await TimeSlotModel.findOneAndUpdate(
      { worker: workerId, date: { $gte: startOfDay, $lte: endOfDay } },
      { worker: workerId, date: startOfDay, isOffDay: true, slots: [] },
      { upsert: true, new: true },
    );

    res.status(200).json({
      message: "Off day set successfully",
      data: offDay,
      timezone: clientTimezone,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      message: "Failed to set off day",
      error: error.message,
    });
  }
};

// -------------------------
// Get All Workers Availability (Paginated)
// -------------------------
export const getAllWorkerAvailability = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const clientTimezone = getClientTimezone(req);

    const total = await TimeSlotModel.countDocuments();
    const timeSlots = await TimeSlotModel.find()
      .populate("worker", "firstName lastName workerId city state address")
      .skip(skip)
      .limit(limit)
      .sort({ date: 1 });

    // Convert UTC dates to client timezone
    const timeSlotsWithClientTime = timeSlots.map((slot: any) => {
      const slotObj = slot.toObject();
      const clientDateTime = convertFromUTC(slot.date, clientTimezone);
      slotObj.displayDate = clientDateTime.date;
      slotObj.timezone = clientTimezone;
      return slotObj;
    });

    res.status(200).json({
      message: "Workers availability fetched successfully",
      data: timeSlotsWithClientTime,
      timezone: clientTimezone,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      message: "Error fetching worker availability",
      error: err.message,
    });
  }
};

// -------------------------
// Get One Worker's Availability
// -------------------------
// Supports an optional ?durationMinutes=N query param so the UI can ask "which
// of these slots can actually fit a service of duration N?". When provided, each
// slot gets a derived `feasibleStart` boolean reflecting whether a booking that
// long (plus the 1-hour buffer) would fit starting at that slot.
const SLOT_DURATION_MIN = 30;
const BUFFER_MINUTES = 60;

export const getWorkerAvailability = async (req: Request, res: Response) => {
  try {
    const { workerId } = req.params;
    const { date, durationMinutes: durationMinutesRaw } = req.query;
    const clientTimezone = getClientTimezone(req);

    if (!date) {
      res.status(400).json({ message: "Date query parameter is required" });
      return;
    }

    const { startOfDay, endOfDay } = getDayBoundariesInUTC(
      date as string,
      clientTimezone,
    );

    let timeSlot = await TimeSlotModel.findOne({
      worker: workerId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    if (
      !timeSlot ||
      (timeSlot.isOffDay === false && timeSlot.slots.length === 0)
    ) {
      timeSlot = new TimeSlotModel({
        worker: workerId,
        date: startOfDay,
        slots: generateDefaultSlots(),
      });
    }

    const currentTime = getCurrentTimeInTimezone(clientTimezone);
    const requestedDate = new Date(date as string);
    const currentDate = new Date(currentTime.date);

    const isToday =
      requestedDate.getFullYear() === currentDate.getFullYear() &&
      requestedDate.getMonth() === currentDate.getMonth() &&
      requestedDate.getDate() === currentDate.getDate();

    if (isToday) {
      const [currentHour, currentMinute] = currentTime.time
        .split(":")
        .map(Number);
      const currentTimeInMinutes = currentHour * 60 + currentMinute;

      const slotsToRemove = timeSlot.slots.filter((slot) => {
        const [h, m] = slot.startTime.split(":").map(Number);
        const slotStartMinutes = h * 60 + m;
        return slotStartMinutes <= currentTimeInMinutes;
      });

      slotsToRemove.forEach((slot) => {
        timeSlot!.slots.pull(slot._id);
      });
    }

    await timeSlot.save();

    const timeSlotObj: any = timeSlot.toObject();
    const clientDateTime = convertFromUTC(timeSlot.date, clientTimezone);

    // Feasibility annotation: if the caller passed a duration, compute whether
    // each remaining slot can be the START of a booking of that length.
    const durationMinutes = Number(durationMinutesRaw);
    if (
      Number.isFinite(durationMinutes) &&
      durationMinutes >= SLOT_DURATION_MIN
    ) {
      const slotsArr = timeSlotObj.slots;
      const durationSlots = Math.max(
        1,
        Math.ceil(durationMinutes / SLOT_DURATION_MIN),
      );
      const bufferSlots = Math.ceil(BUFFER_MINUTES / SLOT_DURATION_MIN);

      const slotIsFree = (s: any) => {
        if (s.isBooked) return false;
        if (s.isBlocked) return false;
        if (s.heldUntil && new Date() < new Date(s.heldUntil)) return false;
        if (!s.isAvailable && !(s.heldUntil && new Date() >= new Date(s.heldUntil)))
          return false;
        return true;
      };

      timeSlotObj.slots = slotsArr.map((slot: any, idx: number) => {
        // Need durationSlots consecutive slots starting here.
        if (idx + durationSlots > slotsArr.length) {
          return { ...slot, feasibleStart: false };
        }
        for (let i = idx; i < idx + durationSlots; i++) {
          if (!slotIsFree(slotsArr[i])) {
            return { ...slot, feasibleStart: false };
          }
        }
        // Buffer slots only constrain feasibility if they exist on the day; if
        // the buffer runs past closing, that's allowed (nothing to overlap).
        const bufferEnd = Math.min(
          idx + durationSlots + bufferSlots,
          slotsArr.length,
        );
        for (let i = idx + durationSlots; i < bufferEnd; i++) {
          if (!slotIsFree(slotsArr[i])) {
            return { ...slot, feasibleStart: false };
          }
        }
        return { ...slot, feasibleStart: true };
      });
    }

    res.status(200).json({
      message: "Worker availability fetched successfully",
      data: {
        ...timeSlotObj,
        displayDate: clientDateTime.date,
        timezone: clientTimezone,
        durationMinutes: Number.isFinite(durationMinutes)
          ? durationMinutes
          : null,
      },
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      message: "Error fetching worker availability",
      error: err.message,
    });
  }
};
