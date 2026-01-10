import { Request, Response } from "express";
import states from "../../helper/state";
import { StateModel } from "./state.model";
import { paginate } from "../../helper/paginationHelper";

// --------------------
// SEED States
// --------------------
const seedStates = async () => {
  try {
    for (const state of states) {
      await StateModel.findOneAndUpdate(
        { name: state.name },
        { active: state.active },
        { upsert: true, new: true }
      );
    }
    console.log("States seeded successfully!");
  } catch (err) {
    console.error("Error seeding states:", err);
  }
};

seedStates();

// -------------------- 
// CREATE State
// --------------------
export const createState = async (req: Request, res: Response) => {
  try {
    const { name, active } = req.body;

    const existing = await StateModel.findOne({ name });
    if (existing) {
      res.status(400).json({ message: "State already exists" });
      return;
    }

    const state = await StateModel.create({ name, active: !!active });

    res.status(201).json({
      message: "State created successfully",
      data: state,
    });
  } catch (error: any) {
    console.error("Error creating state:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// --------------------
// UPDATE State
// --------------------
export const updateState = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, active } = req.body;

    const state = await StateModel.findByIdAndUpdate(
      id,
      { name, active },
      { new: true, runValidators: true }
    );

    if (!state) {
      res.status(404).json({ message: "State not found" });
      return;
    }

    res.status(200).json({
      message: "State updated successfully",
      data: state,
    });
  } catch (error: any) {
    console.error("Error updating state:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// --------------------
// GET ALL States
// --------------------
export const getAllStates = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 49;
    const sortField = String(req.query.sortField || "name");
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;

    const filter: Record<string, any> = {};
    if (req.query.name) {
      filter.name = { $regex: String(req.query.name), $options: "i" };
    }
    if (req.query.active !== undefined) {
      filter.active = req.query.active === "true";
    }

    const result = await paginate(StateModel, {
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
  } catch (error: any) {
    console.error("Error fetching states:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// --------------------
// GET ONE State
// --------------------
export const getStateById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const state = await StateModel.findById(id);

    if (!state) {
      res.status(404).json({ message: "State not found" });
      return;
    }

    res.status(200).json({
      message: "State retrieved successfully",
      data: state,
    });
  } catch (error: any) {
    console.error("Error fetching state:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// --------------------
// UPDATE Active State
// --------------------
export const updateActiveState = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    const state = await StateModel.findByIdAndUpdate(
      id,
      { active: !!active },
      { new: true }
    );

    if (!state) {
      res.status(404).json({ message: "State not found" });
      return;
    }

    res.status(200).json({
      message: `State "${state.name}" updated successfully`,
      data: state,
    });
  } catch (error: any) {
    console.error("Error updating active state:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
