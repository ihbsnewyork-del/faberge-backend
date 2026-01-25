"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccessibility = exports.updateManagerAccessibility = void 0;
const accessibility_model_1 = require("./accessibility.model");
const accessibility_validation_1 = require("./accessibility.validation");
const manager_model_1 = require("../manager/manager.model");
// --------------------
// UPDATE Accessibility
// --------------------
const updateManagerAccessibility = async (req, res) => {
    try {
        const { managerId } = req.params;
        const validation = accessibility_validation_1.updateAccessibilityValidation.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({
                message: "Validation failed",
                errors: validation.error.errors,
            });
            return;
        }
        const manager = await manager_model_1.ManagerModel.findById(managerId);
        if (!manager) {
            res.status(404).json({ message: "Manager not found" });
            return;
        }
        const accessibility = await accessibility_model_1.AccessibilityModel.findByIdAndUpdate(manager.accessibility, validation.data, { new: true });
        res.status(200).json({
            message: "Accessibility updated successfully",
            data: accessibility,
        });
    }
    catch (error) {
        console.error("Error updating manager accessibility:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};
exports.updateManagerAccessibility = updateManagerAccessibility;
// --------------------
// GET All Accessibility
// --------------------
const getAccessibility = async (_req, res) => {
    try {
        let accessibility = await accessibility_model_1.AccessibilityModel.findOne();
        res.status(200).json({
            message: "Accessibility retrieved successfully",
            data: accessibility,
        });
    }
    catch (error) {
        console.error("Error fetching accessibility:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};
exports.getAccessibility = getAccessibility;
