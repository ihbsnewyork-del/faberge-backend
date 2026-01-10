import { Request, Response } from "express";
import { TimeSlotModel } from "./timeSlot.model";
import { BookingModel } from "../booking/booking.model";

function generateDefaultSlots() {
  const slots = [];
  let hour = 9;
  let minute = 0;

  // ⛔ 19:00 থেকে slot start হবে না
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

    // ⛔ extra safety (optional)
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

// ---------------------------------------
// Set Worker Unavailability
// ---------------------------------------
export const setWorkerUnAvailability = async (req: any, res: Response) => {
  try {
    const workerId = req.user.userId;
    const { date, unavailableSlots } = req.body;

    if (!date || !Array.isArray(unavailableSlots)) {
      res
        .status(400)
        .json({ message: "Date and unavailableSlots are required" });
      return;
    }

    let timeSlot = await TimeSlotModel.findOne({ worker: workerId, date });

    if (timeSlot?.isOffDay === true) {
      res.status(400).json({ message: "Worker is off day" });
      return;
    }

    if (!timeSlot) {
      timeSlot = new TimeSlotModel({
        worker: workerId,
        date,
        slots: generateDefaultSlots(),
      });
    }

    console.log(timeSlot);

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

    if (!date) {
      res.status(400).json({ message: "Date is required" });
      return;
    }

    const inputDate = new Date(date);
    const today = new Date();

    inputDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (inputDate < today) {
      res.status(400).json({ message: "You cannot set past date as off day" });
      return;
    }

    const timeSlot = await TimeSlotModel.findOne({
      worker: workerId,
      date,
    });

    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay = new Date(`${date}T23:59:59.999Z`);

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
        { worker: workerId, date: startOfDay },
        {
          worker: workerId,
          date: startOfDay,
          isOffDay: false,
          slots: generateDefaultSlots(),
        },
        { upsert: true, new: true }
      );
      res.status(200).json({
        message: "Off day removed successfully",
        data: offDay,
      });
      return;
    }

    const offDay = await TimeSlotModel.findOneAndUpdate(
      { worker: workerId, date: startOfDay },
      { worker: workerId, date: startOfDay, isOffDay: true, slots: [] },
      { upsert: true, new: true }
    );

    res.status(200).json({
      message: "Off day set successfully",
      data: offDay,
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

    const total = await TimeSlotModel.countDocuments();
    const timeSlots = await TimeSlotModel.find()
      .populate("worker", "firstName lastName workerId city state address")
      .skip(skip)
      .limit(limit)
      .sort({ date: 1 });

    res.status(200).json({
      message: "Workers availability fetched successfully",
      data: timeSlots,
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
export const getWorkerAvailability = async (req: Request, res: Response) => {
  try {
    const { workerId } = req.params;
    const { date } = req.query;

    if (!date) {
      res.status(400).json({ message: "Date query parameter is required" });
      return;
    }

    let timeSlot = await TimeSlotModel.findOne({
      worker: workerId,
      date,
    });

    if (
      !timeSlot ||
      (timeSlot.isOffDay === false && timeSlot.slots.length === 0)
    ) {
      timeSlot = new TimeSlotModel({
        worker: workerId,
        date,
        slots: generateDefaultSlots(),
      });
    }

    const requestedDate = new Date(date as string);
    const today = new Date();

    const isToday =
      requestedDate.getFullYear() === today.getFullYear() &&
      requestedDate.getMonth() === today.getMonth() &&
      requestedDate.getDate() === today.getDate();

    if (isToday) {
      const currentTime = today.getHours() * 60 + today.getMinutes();

      const slotsToRemove = timeSlot.slots.filter((slot) => {
        const [h, m] = slot.startTime.split(":").map(Number);
        const slotStartMinutes = h * 60 + m;
        return slotStartMinutes <= currentTime;
      });

      slotsToRemove.forEach((slot) => {
        timeSlot!.slots.pull(slot._id);
      });
    }

    await timeSlot.save();

    res.status(200).json({
      message: "Worker availability fetched successfully",
      data: timeSlot,
    });
  } catch (err: any) {
    console.error(err);
    res.status(500).json({
      message: "Error fetching worker availability",
      error: err.message,
    });
  }
};
