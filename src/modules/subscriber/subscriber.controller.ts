import { Request, Response, NextFunction } from "express";
import { SubscriberModel } from "./subscriber.model";
import { paginate } from "../../helper/paginationHelper";

// --------------------
// Create Subscriber (Public)
// --------------------
export const createSubscriber = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: "Email is required." });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: "Please provide a valid email." });
      return;
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existing = await SubscriberModel.findOne({ email: normalizedEmail });
    if (existing) {
      res.status(409).json({ message: "You are already subscribed." });
      return;
    }

    await SubscriberModel.create({ email: normalizedEmail });

    res.status(201).json({
      message: "Subscribed successfully. Thank you for joining!",
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// --------------------
// Get All Subscribers (Admin / Manager)
// --------------------
export const getSubscribers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await paginate(SubscriberModel, {
      page,
      limit,
      sort: { createdAt: -1 },
    });

    const unreadCount = await SubscriberModel.countDocuments({ isRead: false });

    res.status(200).json({
      message: "Subscribers fetched successfully",
      unreadCount,
      ...result,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// --------------------
// Toggle Subscriber Read Status (Admin / Manager)
// --------------------
export const updateStatusSubscriberById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const subscriber = await SubscriberModel.findById(id);
    if (!subscriber) {
      res.status(404).json({ message: "Subscriber not found" });
      return;
    }

    subscriber.isRead = !subscriber.isRead;
    await subscriber.save();

    res.status(200).json({
      message: "Subscriber status updated successfully",
      data: subscriber,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// --------------------
// Delete Subscriber (Admin / Manager)
// --------------------
export const deleteSubscriberById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const deleted = await SubscriberModel.findByIdAndDelete(id);
    if (!deleted) {
      res.status(404).json({ message: "Subscriber not found" });
      return;
    }

    res.status(200).json({
      message: "Subscriber deleted successfully",
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
