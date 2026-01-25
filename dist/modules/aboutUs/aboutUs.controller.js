"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAboutUs = exports.updateAboutUs = void 0;
const aboutUs_model_1 = require("./aboutUs.model");
const updateAboutUs = async (req, res, next) => {
    try {
        await aboutUs_model_1.AboutUsModel.findOneAndUpdate({}, { $set: { aboutUs: req.body.aboutUs } }, { new: true, upsert: true });
        res.status(200).json({
            message: "About us updated successfully",
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateAboutUs = updateAboutUs;
const getAboutUs = async (req, res, next) => {
    try {
        const aboutUsData = await aboutUs_model_1.AboutUsModel.findOne();
        res.status(200).json({
            message: "About us fetched successfully",
            aboutUs: aboutUsData?.aboutUs,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAboutUs = getAboutUs;
