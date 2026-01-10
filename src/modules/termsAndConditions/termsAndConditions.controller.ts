import { Request, Response, NextFunction } from "express";
import { TermsAndConditionsModel } from "./termsAndConditions.model";

export const updatedTermsAndConditions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await TermsAndConditionsModel.findOneAndUpdate(
      {},
      { $set: { termsAndConditions: req.body.termsAndConditions } },
      { new: true, upsert: true }
    );
    res.status(200).json({
      message: "Terms and conditions updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getTermsAndConditions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const termsAndConditions = await TermsAndConditionsModel.findOne();
    res.status(200).json({
      message: "Terms and conditions fetched successfully",
      termsAndConditions: termsAndConditions?.termsAndConditions,
    });
  } catch (error) {
    next(error);
  }
};
