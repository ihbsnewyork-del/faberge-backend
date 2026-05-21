import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { WorkerModel } from "./worker.model";
import {
  updateWorkerProfileSchema,
  workerProfileSchema,
} from "./worker.validation";
import { paginate } from "../../helper/paginationHelper";
import { title } from "process";
import { BookingModel } from "../booking/booking.model";
import { Types } from "mongoose";
import { getCurrentTimeInTimezone, getDayBoundariesInUTC } from "../../helper/timezoneHelper";
import { getClientTimezone } from "../booking/booking.controller";

// --------------------
// Register Worker
// --------------------
export const registerWorker = async (req: Request, res: Response) => {
  try {
    const data = {
      ...req.body,
      uploadPhoto: req.file
        ? `/picture/profile_image/${req.file.filename}`
        : undefined,
    };

    if (typeof data.services === "string") {
      try {
        data.services = JSON.parse(data.services);
      } catch {
        res.status(400).json({ message: "Invalid JSON in services field" });
        return;
      }
    }

    console.log(data);

    const parsed = workerProfileSchema.safeParse(data);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error.errors });
      return;
    }

    const { email, password } = parsed.data;

    const existing = await WorkerModel.findOne({ email });
    if (existing) {
      res.status(400).json({ message: "Email already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const worker = new WorkerModel({
      ...parsed.data,
      uploadPhoto: `${data.uploadPhoto}`,
      password: hashedPassword,
    });

    await worker.save();

    res
      .status(201)
      .json({ message: "Worker created successfully", data: worker });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error registering worker", error: err });
  }
};

// --------------------
// Update Worker
// --------------------
export const updateWorker = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const worker = await WorkerModel.findById(id);
    if (!worker) {
      res.status(404).json({ message: "Worker not found" });
      return;
    }

    const data = {
      ...req.body,
      uploadPhoto: req.file
        ? `/picture/profile_image/${req.file.filename}`
        : worker.uploadPhoto,
    };

    if (typeof data.services === "string") {
      try {
        data.services = JSON.parse(data.services);
      } catch {
        res.status(400).json({ message: "Invalid JSON in services field" });
        return;
      }
    }

    const password = data.password;
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      data.password = hashedPassword;
    }

    const updatedWorker = await WorkerModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true },
    ).select(" -resetOtp -otpExpires -__v -otpVerified -createdAt -updatedAt");

    res.status(200).json({
      message: "Worker updated successfully",
      data: updatedWorker,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating worker", error: err });
  }
};

// --------------------
// Get One Worker
// --------------------

export const getOneWorker = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const worker = await WorkerModel.findById(id)
      .select(
        "-password -resetOtp -otpExpires -__v -otpVerified -createdAt -updatedAt",
      )
      .populate({
        path: "services",
        populate: {
          path: "service",
          model: "Service",
        },
      });
    if (!worker) {
      res.status(404).json({ message: "Worker not found" });
      return;
    }
    res.status(200).json({ message: "Worker found", data: worker });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error getting worker", error: err });
  }
};

// --------------------
// Get All Worker
// --------------------
export const getAllWorker = async (req: Request, res: Response) => {
  try {
    const { page, limit, search, isBlocked, sortBy, order } = req.query;

    const filter: any = {};

    if (isBlocked !== undefined) {
      filter.isBlocked = isBlocked === "true";
    }

    if (search) {
      const regex = new RegExp(search as string, "i");

      filter.$or = [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
        { phone: regex },
        { title: regex },
      ];
    }
    const sort: any = {};
    if (sortBy) {
      sort[String(sortBy)] = order === "asc" ? 1 : -1;
    } else {
      sort.createdAt = -1;
    }

    const result = await paginate(WorkerModel, {
      page: Number(page),
      limit: Number(limit),
      sort,
      filter,
    });

    const populatedData = await Promise.all(
      result.data.map(async (worker: any) => {
        const obj = worker.toObject ? worker.toObject() : worker;

        obj.services = await Promise.all(
          obj.services.map(async (s: any) => {
            const serviceDoc = await WorkerModel.db
              .collection("services")
              .findOne({ _id: s.service });

            const subcategories = s.subcategories
              ? await Promise.all(
                  s.subcategories.map(async (subId: any) => {
                    return await WorkerModel.db
                      .collection("subcategories")
                      .findOne({ _id: subId });
                  }),
                )
              : [];

            return {
              service: serviceDoc,
              subcategories,
            };
          }),
        );

        delete obj.password;
        delete obj.resetOtp;
        delete obj.otpExpires;
        delete obj.__v;
        delete obj.otpVerified;
        delete obj.createdAt;
        delete obj.updatedAt;

        return obj;
      }),
    );

    res.status(200).json({
      message: "Workers fetched successfully",
      data: populatedData,
      pagination: result.pagination,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error getting workers", error: err });
  }
};

// --------------------
// Delete Worker
// --------------------
export const toggleWorkerDelete = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const worker = await WorkerModel.findByIdAndDelete(id);

    if (!worker) {
      res.status(404).json({
        success: false,
        message: "Worker not found",
      });
      return;
    }

    // worker.isDeleted = !worker.isDeleted;
    // await worker.save();

    res.status(200).json({
      success: true,
      message: `Worker deleted successfully`,
      data: worker,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to toggle worker delete status",
      error,
    });
  }
};

// --------------------
// Statistics Worker
// --------------------
export const getWorkerDashboardStats = async (req: any, res: Response) => {
  try {
    const workerId = new Types.ObjectId(req.user.userId);
    const clientTimezone = getClientTimezone(req);

    // Get current time in worker's timezone
    const currentTime = getCurrentTimeInTimezone(clientTimezone);

    // Get today's boundaries in UTC for database query
    const { startOfDay: startOfToday, endOfDay: endOfToday } =
      getDayBoundariesInUTC(currentTime.date, clientTimezone);

    // Get month boundaries in UTC
    const currentDate = new Date(currentTime.date);
    const firstDayOfMonth = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, "0")}-01`;
    const { startOfDay: startOfMonth } = getDayBoundariesInUTC(
      firstDayOfMonth,
      clientTimezone,
    );

    // Get year boundaries in UTC
    const firstDayOfYear = `${currentDate.getFullYear()}-01-01`;
    const { startOfDay: startOfYear } = getDayBoundariesInUTC(
      firstDayOfYear,
      clientTimezone,
    );

    // -------------------------
    // 1. Today's completed bookings
    // -------------------------
    const todayBookings = await BookingModel.countDocuments({
      worker: workerId,
      status: "booked",
      date: { $gte: startOfToday, $lte: endOfToday },
    });

    // -------------------------
    // Common aggregation pipeline
    // -------------------------
    const statsPipeline = (startDate: Date) => [
      {
        $match: {
          worker: workerId,
          status: "booked",
          date: { $gte: startDate },
        },
      },
      {
        $addFields: {
          startMinutes: {
            $add: [
              {
                $multiply: [{ $toInt: { $substr: ["$startTime", 0, 2] } }, 60],
              },
              { $toInt: { $substr: ["$startTime", 3, 2] } },
            ],
          },
          endMinutes: {
            $add: [
              { $multiply: [{ $toInt: { $substr: ["$endTime", 0, 2] } }, 60] },
              { $toInt: { $substr: ["$endTime", 3, 2] } },
            ],
          },
        },
      },
      {
        $addFields: {
          hoursBooked: {
            $divide: [{ $subtract: ["$endMinutes", "$startMinutes"] }, 60],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalHours: { $sum: "$hoursBooked" },
          // Worker earnings = subtotal of services only.
          // priceBreakdown.subtotal excludes agency fee + tax (those belong to admin).
          // Fallback to legacy bookings without a stored breakdown.
          totalEarnings: {
            $sum: {
              $ifNull: ["$priceBreakdown.subtotal", "$paymentAmount"],
            },
          },
        },
      },
    ];

    // -------------------------
    // 2. Monthly stats
    // -------------------------
    const monthlyStats = await BookingModel.aggregate(
      statsPipeline(startOfMonth),
    );

    // -------------------------
    // 3. Yearly stats
    // -------------------------
    const yearlyStats = await BookingModel.aggregate(
      statsPipeline(startOfYear),
    );

    res.status(200).json({
      todayBookings,
      monthly: {
        hoursBooked: monthlyStats[0]?.totalHours || 0,
        totalEarnings: monthlyStats[0]?.totalEarnings || 0,
      },
      yearly: {
        hoursBooked: yearlyStats[0]?.totalHours || 0,
        totalEarnings: yearlyStats[0]?.totalEarnings || 0,
      },
      timezone: clientTimezone,
      currentDate: currentTime.date,
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      message: "Failed to fetch worker dashboard stats",
      error: error.message,
    });
  }
};
