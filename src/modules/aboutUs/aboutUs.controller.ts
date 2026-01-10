import { Request, Response, NextFunction } from "express";
import { AboutUsModel } from "./aboutUs.model";

export const updateAboutUs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await AboutUsModel.findOneAndUpdate(
      {},
      { $set: { aboutUs: req.body.aboutUs } },
      { new: true, upsert: true }
    );
    res.status(200).json({
      message: "About us updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getAboutUs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const aboutUsData = await AboutUsModel.findOne();

    res.status(200).json({
      message: "About us fetched successfully",
      aboutUs: aboutUsData?.aboutUs,
    });
  } catch (error) {
    next(error);
  }
};
