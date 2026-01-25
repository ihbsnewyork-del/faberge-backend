"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateActiveState = exports.getStateById = exports.getAllStates = exports.updateState = exports.createState = void 0;
const state_1 = __importDefault(require("../../helper/state"));
const state_model_1 = require("./state.model");
const paginationHelper_1 = require("../../helper/paginationHelper");
// --------------------
// SEED States
// --------------------
const seedStates = async () => {
    try {
        for (const state of state_1.default) {
            await state_model_1.StateModel.findOneAndUpdate({ name: state.name }, { active: state.active }, { upsert: true, new: true });
        }
        console.log("States seeded successfully!");
    }
    catch (err) {
        console.error("Error seeding states:", err);
    }
};
seedStates();
// -------------------- 
// CREATE State
// --------------------
const createState = async (req, res) => {
    try {
        const { name, active } = req.body;
        const existing = await state_model_1.StateModel.findOne({ name });
        if (existing) {
            res.status(400).json({ message: "State already exists" });
            return;
        }
        const state = await state_model_1.StateModel.create({ name, active: !!active });
        res.status(201).json({
            message: "State created successfully",
            data: state,
        });
    }
    catch (error) {
        console.error("Error creating state:", error);
        res
            .status(500)
            .json({ message: "Internal server error", error: error.message });
    }
};
exports.createState = createState;
// --------------------
// UPDATE State
// --------------------
const updateState = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, active } = req.body;
        const state = await state_model_1.StateModel.findByIdAndUpdate(id, { name, active }, { new: true, runValidators: true });
        if (!state) {
            res.status(404).json({ message: "State not found" });
            return;
        }
        res.status(200).json({
            message: "State updated successfully",
            data: state,
        });
    }
    catch (error) {
        console.error("Error updating state:", error);
        res
            .status(500)
            .json({ message: "Internal server error", error: error.message });
    }
};
exports.updateState = updateState;
// --------------------
// GET ALL States
// --------------------
const getAllStates = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 49;
        const sortField = String(req.query.sortField || "name");
        const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
        const filter = {};
        if (req.query.name) {
            filter.name = { $regex: String(req.query.name), $options: "i" };
        }
        if (req.query.active !== undefined) {
            filter.active = req.query.active === "true";
        }
        const result = await (0, paginationHelper_1.paginate)(state_model_1.StateModel, {
            page,
            limit,
            sort: { [sortField]: sortOrder },
            filter,
        });
        res.status(200).json({
            message: "States retrieved successfully",
            data: result.data,
            pagination: result.pagination,
        });
    }
    catch (error) {
        console.error("Error fetching states:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};
exports.getAllStates = getAllStates;
// --------------------
// GET ONE State
// --------------------
const getStateById = async (req, res) => {
    try {
        const { id } = req.params;
        const state = await state_model_1.StateModel.findById(id);
        if (!state) {
            res.status(404).json({ message: "State not found" });
            return;
        }
        res.status(200).json({
            message: "State retrieved successfully",
            data: state,
        });
    }
    catch (error) {
        console.error("Error fetching state:", error);
        res
            .status(500)
            .json({ message: "Internal server error", error: error.message });
    }
};
exports.getStateById = getStateById;
// --------------------
// UPDATE Active State
// --------------------
const updateActiveState = async (req, res) => {
    try {
        const { id } = req.params;
        const { active } = req.body;
        const state = await state_model_1.StateModel.findByIdAndUpdate(id, { active: !!active }, { new: true });
        if (!state) {
            res.status(404).json({ message: "State not found" });
            return;
        }
        res.status(200).json({
            message: `State "${state.name}" updated successfully`,
            data: state,
        });
    }
    catch (error) {
        console.error("Error updating active state:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};
exports.updateActiveState = updateActiveState;
