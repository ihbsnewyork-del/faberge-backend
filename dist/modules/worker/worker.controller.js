"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWorkerDashboardStats = exports.toggleWorkerDelete = exports.getAllWorker = exports.getOneWorker = exports.updateWorker = exports.registerWorker = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const worker_model_1 = require("./worker.model");
const worker_validation_1 = require("./worker.validation");
const paginationHelper_1 = require("../../helper/paginationHelper");
const booking_model_1 = require("../booking/booking.model");
const mongoose_1 = require("mongoose");
// --------------------
// Register Worker
// --------------------
const registerWorker = async (req, res) => {
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
            }
            catch {
                res.status(400).json({ message: "Invalid JSON in services field" });
                return;
            }
        }
        console.log(data);
        const parsed = worker_validation_1.workerProfileSchema.safeParse(data);
        if (!parsed.success) {
            res.status(400).json({ message: parsed.error.errors });
            return;
        }
        const { email, password } = parsed.data;
        const existing = await worker_model_1.WorkerModel.findOne({ email });
        if (existing) {
            res.status(400).json({ message: "Email already exists" });
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const worker = new worker_model_1.WorkerModel({
            ...parsed.data,
            uploadPhoto: `${data.uploadPhoto}`,
            password: hashedPassword,
        });
        await worker.save();
        res
            .status(201)
            .json({ message: "Worker created successfully", data: worker });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error registering worker", error: err });
    }
};
exports.registerWorker = registerWorker;
// --------------------
// Update Worker
// --------------------
const updateWorker = async (req, res) => {
    try {
        const { id } = req.params;
        const worker = await worker_model_1.WorkerModel.findById(id);
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
            }
            catch {
                res.status(400).json({ message: "Invalid JSON in services field" });
                return;
            }
        }
        const password = data.password;
        if (password) {
            const hashedPassword = await bcryptjs_1.default.hash(password, 10);
            data.password = hashedPassword;
        }
        const updatedWorker = await worker_model_1.WorkerModel.findByIdAndUpdate(id, { $set: data }, { new: true }).select(" -resetOtp -otpExpires -__v -otpVerified -createdAt -updatedAt");
        res.status(200).json({
            message: "Worker updated successfully",
            data: updatedWorker,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error updating worker", error: err });
    }
};
exports.updateWorker = updateWorker;
// --------------------
// Get One Worker
// --------------------
const getOneWorker = async (req, res) => {
    try {
        const { id } = req.params;
        const worker = await worker_model_1.WorkerModel.findById(id)
            .select("-password -resetOtp -otpExpires -__v -otpVerified -createdAt -updatedAt")
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
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error getting worker", error: err });
    }
};
exports.getOneWorker = getOneWorker;
// --------------------
// Get All Worker
// --------------------
const getAllWorker = async (req, res) => {
    try {
        const { page, limit, search, isBlocked, sortBy, order } = req.query;
        const filter = {};
        if (isBlocked !== undefined) {
            filter.isBlocked = isBlocked === "true";
        }
        if (search) {
            const regex = new RegExp(search, "i");
            filter.$or = [
                { firstName: regex },
                { lastName: regex },
                { email: regex },
                { phone: regex },
                { title: regex },
            ];
        }
        const sort = {};
        if (sortBy) {
            sort[String(sortBy)] = order === "asc" ? 1 : -1;
        }
        else {
            sort.createdAt = -1;
        }
        const result = await (0, paginationHelper_1.paginate)(worker_model_1.WorkerModel, {
            page: Number(page),
            limit: Number(limit),
            sort,
            filter,
        });
        const populatedData = await Promise.all(result.data.map(async (worker) => {
            const obj = worker.toObject ? worker.toObject() : worker;
            obj.services = await Promise.all(obj.services.map(async (s) => {
                const serviceDoc = await worker_model_1.WorkerModel.db
                    .collection("services")
                    .findOne({ _id: s.service });
                const subcategories = s.subcategories
                    ? await Promise.all(s.subcategories.map(async (subId) => {
                        return await worker_model_1.WorkerModel.db
                            .collection("subcategories")
                            .findOne({ _id: subId });
                    }))
                    : [];
                return {
                    service: serviceDoc,
                    subcategories,
                };
            }));
            delete obj.password;
            delete obj.resetOtp;
            delete obj.otpExpires;
            delete obj.__v;
            delete obj.otpVerified;
            delete obj.createdAt;
            delete obj.updatedAt;
            return obj;
        }));
        res.status(200).json({
            message: "Workers fetched successfully",
            data: populatedData,
            pagination: result.pagination,
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error getting workers", error: err });
    }
};
exports.getAllWorker = getAllWorker;
// --------------------
// Delete Worker
// --------------------
const toggleWorkerDelete = async (req, res) => {
    try {
        const { id } = req.params;
        const worker = await worker_model_1.WorkerModel.findByIdAndDelete(id);
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to toggle worker delete status",
            error,
        });
    }
};
exports.toggleWorkerDelete = toggleWorkerDelete;
// --------------------
// Statistics Worker
// --------------------
const getWorkerDashboardStats = async (req, res) => {
    try {
        const workerId = new mongoose_1.Types.ObjectId(req.user.userId);
        const now = new Date();
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        // -------------------------
        // 1. Today's completed bookings
        // -------------------------
        const todayBookings = await booking_model_1.BookingModel.countDocuments({
            worker: workerId,
            status: "booked",
            date: { $gte: startOfToday, $lte: endOfToday },
        });
        // -------------------------
        // Common aggregation pipeline
        // -------------------------
        const statsPipeline = (startDate) => [
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
                    totalEarnings: { $sum: "$paymentAmount" },
                },
            },
        ];
        // -------------------------
        // 2. Monthly stats
        // -------------------------
        const monthlyStats = await booking_model_1.BookingModel.aggregate(statsPipeline(startOfMonth));
        // -------------------------
        // 3. Yearly stats
        // -------------------------
        const yearlyStats = await booking_model_1.BookingModel.aggregate(statsPipeline(startOfYear));
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
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to fetch worker dashboard stats",
            error: error.message,
        });
    }
};
exports.getWorkerDashboardStats = getWorkerDashboardStats;
