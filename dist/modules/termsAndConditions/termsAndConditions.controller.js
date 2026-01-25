"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTermsAndConditions = exports.updatedTermsAndConditions = void 0;
const termsAndConditions_model_1 = require("./termsAndConditions.model");
const updatedTermsAndConditions = async (req, res, next) => {
    try {
        await termsAndConditions_model_1.TermsAndConditionsModel.findOneAndUpdate({}, { $set: { termsAndConditions: req.body.termsAndConditions } }, { new: true, upsert: true });
        res.status(200).json({
            message: "Terms and conditions updated successfully",
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updatedTermsAndConditions = updatedTermsAndConditions;
const getTermsAndConditions = async (req, res, next) => {
    try {
        const termsAndConditions = await termsAndConditions_model_1.TermsAndConditionsModel.findOne();
        res.status(200).json({
            message: "Terms and conditions fetched successfully",
            termsAndConditions: termsAndConditions?.termsAndConditions,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getTermsAndConditions = getTermsAndConditions;
