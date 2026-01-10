import { Request, Response, NextFunction } from "express";
import { PrivacyPolicyModel } from "./privacyPolicy.model";

export const updatedPrivacyPolicy = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await PrivacyPolicyModel.findOneAndUpdate(
      {},
      { $set: { privacyPolicy: req.body.privacyPolicy } },
      { new: true, upsert: true }
    );

    res.status(200).json({
      message: "Privacy policy updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getPrivacyPolicy = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const privacyPolicy = await PrivacyPolicyModel.findOne();
    res.status(200).json({
      message: "Privacy policy fetched successfully",
      privacyPolicy: privacyPolicy?.privacyPolicy,
    });
  } catch (error) {
    next(error);
  }
};
