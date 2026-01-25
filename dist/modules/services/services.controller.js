"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServiceTime = exports.createOrUpdateServiceTime = exports.getServicePopularity = exports.deleteService = exports.getServiceById = exports.getAllServices = exports.updateService = exports.createService = void 0;
const services_validation_1 = require("./services.validation");
const services_model_1 = require("./services.model");
const paginationHelper_1 = require("../../helper/paginationHelper");
const booking_model_1 = require("../booking/booking.model");
// --------------------
//  Create Service
// --------------------
const createService = async (req, res) => {
    try {
        const validation = services_validation_1.createServiceValidation.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({
                message: "Validation failed",
                errors: validation.error.errors,
            });
            return;
        }
        const newService = await services_model_1.ServiceModel.create(validation.data);
        res.status(201).json({
            message: "Service created successfully",
            data: newService,
        });
    }
    catch (error) {
        console.error("Error creating service:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};
exports.createService = createService;
// --------------------
//  Update Service
// --------------------
const updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const validation = services_validation_1.updateServiceValidation.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({
                message: "Validation failed",
                errors: validation.error.errors,
            });
            return;
        }
        const updatedService = await services_model_1.ServiceModel.findByIdAndUpdate(id, validation.data, { new: true });
        if (!updatedService) {
            res.status(404).json({ message: "Service not found" });
            return;
        }
        res.status(200).json({
            message: "Service updated successfully",
            data: updatedService,
        });
    }
    catch (error) {
        console.error("Error updating service:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};
exports.updateService = updateService;
// --------------------
//  Get All Service
// --------------------
const getAllServices = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const sortField = String(req.query.sortField || "createdAt");
        const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
        const filter = {};
        if (req.query.serviceName) {
            filter.serviceName = { $regex: req.query.serviceName, $options: "i" };
        }
        const result = await (0, paginationHelper_1.paginate)(services_model_1.ServiceModel, {
            page,
            limit,
            sort: { [sortField]: sortOrder },
            filter,
        });
        res.status(200).json({
            message: "Services retrieved successfully",
            data: result.data,
            pagination: result.pagination,
        });
    }
    catch (error) {
        console.error("Error fetching services:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};
exports.getAllServices = getAllServices;
// --------------------
//  Get One Service
// --------------------
const getServiceById = async (req, res) => {
    try {
        const { id } = req.params;
        const service = await services_model_1.ServiceModel.findById(id);
        if (!service) {
            res.status(404).json({ message: "Service not found" });
            return;
        }
        res.status(200).json({
            message: "Service retrieved successfully",
            data: service,
        });
    }
    catch (error) {
        console.error("Error fetching service:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};
exports.getServiceById = getServiceById;
// --------------------
//  Delete Service
// --------------------
const deleteService = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await services_model_1.ServiceModel.findByIdAndDelete(id);
        if (!deleted) {
            res.status(404).json({ message: "Service not found" });
            return;
        }
        res.status(200).json({
            message: "Service deleted successfully",
            data: deleted,
        });
    }
    catch (error) {
        console.error("Error deleting service:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};
exports.deleteService = deleteService;
// --------------------
//   Service Popularity
// --------------------
const getServicePopularity = async (req, res) => {
    try {
        console.log(req.query);
        const year = Number(req.query.year) || new Date().getFullYear();
        const month = Number(req.query.month) || new Date().getMonth() + 1;
        console.log(year);
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);
        const result = await booking_model_1.BookingModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                    status: { $in: ["booked", "completed"] },
                },
            },
            { $unwind: "$services" },
            {
                $group: {
                    _id: "$services.service",
                    totalBookings: { $sum: 1 },
                },
            },
            {
                $lookup: {
                    from: "services",
                    localField: "_id",
                    foreignField: "_id",
                    as: "service",
                },
            },
            { $unwind: "$service" },
            {
                $project: {
                    serviceId: "$service._id",
                    serviceName: "$service.serviceName",
                    totalBookings: 1,
                },
            },
            { $sort: { totalBookings: -1 } },
        ]);
        res.status(200).json({
            message: "Service popularity retrieved successfully",
            data: result,
        });
    }
    catch (error) {
        console.error("Error fetching service popularity:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};
exports.getServicePopularity = getServicePopularity;
// --------------------
//  Update and Create Service Time
// --------------------
const createOrUpdateServiceTime = async (req, res) => {
    try {
        const { startTime, endTime } = req.body;
        if (!startTime && !endTime) {
            res.status(400).json({
                success: false,
                message: "startTime and endTime are required",
            });
            return;
        }
        const serviceTime = await services_model_1.ServiceTimeModel.findOneAndUpdate({}, { startTime, endTime }, {
            new: true,
            upsert: true,
        });
        res.status(200).json({
            success: true,
            message: "Service time saved successfully",
            data: serviceTime,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to save service time",
            error,
        });
    }
};
exports.createOrUpdateServiceTime = createOrUpdateServiceTime;
// --------------------
// Get Service Time
// --------------------
const getServiceTime = async (req, res) => {
    try {
        const serviceTime = await services_model_1.ServiceTimeModel.findOne();
        res.status(200).json({
            success: true,
            message: "Service time retrieved successfully",
            data: serviceTime,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get service time",
            error,
        });
    }
};
exports.getServiceTime = getServiceTime;
