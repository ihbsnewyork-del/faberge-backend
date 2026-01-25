"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteContactUsById = exports.updateStatusContactUsById = exports.getContactUsById = exports.getContactUs = exports.createContactUs = void 0;
const contactUs_model_1 = require("./contactUs.model");
const paginationHelper_1 = require("../../helper/paginationHelper");
// --------------------
// Create Contact Message
// --------------------
const createContactUs = async (req, res, next) => {
    try {
        const { firstName, lastName, email, message, subject } = req.body;
        if (!firstName || !email || !message || !subject) {
            res
                .status(400)
                .json({ message: "First name, email, and message are required." });
            return;
        }
        await contactUs_model_1.ContactUsModel.create({
            firstName,
            lastName,
            email,
            message,
            subject,
        });
        res.status(201).json({
            message: "Your message has been submitted successfully.",
        });
    }
    catch (error) {
        console.error(error);
        next(error);
    }
};
exports.createContactUs = createContactUs;
// --------------------
// Get All Contact Message
// --------------------
const getContactUs = async (req, res, next) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const result = await (0, paginationHelper_1.paginate)(contactUs_model_1.ContactUsModel, {
            page,
            limit,
            sort: { createdAt: -1 },
        });
        res.status(200).json({
            message: "Contact messages fetched successfully",
            ...result,
        });
    }
    catch (error) {
        console.error(error);
        next(error);
    }
};
exports.getContactUs = getContactUs;
// -----------------------
// Get One Contact Message
// -----------------------
const getContactUsById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const contactUsData = await contactUs_model_1.ContactUsModel.findById(id);
        if (!contactUsData) {
            res.status(404).json({ message: "Message not found" });
            return;
        }
        res.status(200).json({
            message: "Contact message fetched successfully",
            data: contactUsData,
        });
    }
    catch (error) {
        console.error(error);
        next(error);
    }
};
exports.getContactUsById = getContactUsById;
// -----------------------
// Get One Contact Message
// -----------------------
const updateStatusContactUsById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const contactUsData = await contactUs_model_1.ContactUsModel.findById(id);
        if (!contactUsData) {
            res.status(404).json({ message: "Message not found" });
            return;
        }
        const status = !contactUsData?.isRead;
        contactUsData.isRead = status;
        await contactUsData.save();
        res.status(200).json({
            message: "Contact message status updated successfully",
            data: contactUsData,
        });
    }
    catch (error) {
        console.error(error);
        next(error);
    }
};
exports.updateStatusContactUsById = updateStatusContactUsById;
// -----------------------
// Delete Contact Message
// -----------------------
const deleteContactUsById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedContact = await contactUs_model_1.ContactUsModel.findByIdAndDelete(id);
        if (!deletedContact) {
            res.status(404).json({ message: "Message not found" });
            return;
        }
        res.status(200).json({
            message: "Contact message deleted successfully",
        });
    }
    catch (error) {
        console.error(error);
        next(error);
    }
};
exports.deleteContactUsById = deleteContactUsById;
