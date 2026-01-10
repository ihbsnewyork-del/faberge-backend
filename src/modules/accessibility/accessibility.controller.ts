import { Request, Response } from "express";
import { AccessibilityModel } from "./accessibility.model";
import { updateAccessibilityValidation } from "./accessibility.validation";
import { ManagerModel } from "../manager/manager.model";

// --------------------
// UPDATE Accessibility
// --------------------
export const updateManagerAccessibility = async (
  req: Request,
  res: Response
) => {
  try {
    const { managerId } = req.params;

    const validation = updateAccessibilityValidation.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: validation.error.errors,
      });
      return;
    }

    const manager = await ManagerModel.findById(managerId);
    if (!manager) {
      res.status(404).json({ message: "Manager not found" });
      return;
    }

    const accessibility = await AccessibilityModel.findByIdAndUpdate(
      manager.accessibility,
      validation.data,
      { new: true }
    );

    res.status(200).json({
      message: "Accessibility updated successfully",
      data: accessibility,
    });
  } catch (error: any) {
    console.error("Error updating manager accessibility:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// --------------------
// GET All Accessibility
// --------------------
export const getAccessibility = async (_req: Request, res: Response) => {
  try {
    let accessibility = await AccessibilityModel.findOne();

    res.status(200).json({
      message: "Accessibility retrieved successfully",
      data: accessibility,
    });
  } catch (error: any) {
    console.error("Error fetching accessibility:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
