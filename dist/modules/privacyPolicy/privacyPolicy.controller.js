"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPrivacyPolicy = exports.updatedPrivacyPolicy = void 0;
const privacyPolicy_model_1 = require("./privacyPolicy.model");
const updatedPrivacyPolicy = async (req, res, next) => {
    try {
        await privacyPolicy_model_1.PrivacyPolicyModel.findOneAndUpdate({}, { $set: { privacyPolicy: req.body.privacyPolicy } }, { new: true, upsert: true });
        res.status(200).json({
            message: "Privacy policy updated successfully",
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updatedPrivacyPolicy = updatedPrivacyPolicy;
const getPrivacyPolicy = async (req, res, next) => {
    try {
        const privacyPolicy = await privacyPolicy_model_1.PrivacyPolicyModel.findOne();
        res.status(200).json({
            message: "Privacy policy fetched successfully",
            privacyPolicy: privacyPolicy?.privacyPolicy,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPrivacyPolicy = getPrivacyPolicy;
