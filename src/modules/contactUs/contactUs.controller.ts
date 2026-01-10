import { Request, Response, NextFunction } from "express";
import { ContactUsModel } from "./contactUs.model";
import { paginate } from "../../helper/paginationHelper";

// --------------------
// Create Contact Message
// --------------------
export const createContactUs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { firstName, lastName, email, message, subject } = req.body;

    if (!firstName || !email || !message || !subject) {
      res
        .status(400)
        .json({ message: "First name, email, and message are required." });
      return;
    }
    await ContactUsModel.create({
      firstName,
      lastName,
      email,
      message,
      subject,
    });

    res.status(201).json({
      message: "Your message has been submitted successfully.",
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// --------------------
// Get All Contact Message
// --------------------
export const getContactUs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await paginate(ContactUsModel, {
      page,
      limit,
      sort: { createdAt: -1 },
    });

    res.status(200).json({
      message: "Contact messages fetched successfully",
      ...result,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// -----------------------
// Get One Contact Message
// -----------------------
export const getContactUsById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const contactUsData = await ContactUsModel.findById(id);
    if (!contactUsData) {
      res.status(404).json({ message: "Message not found" });
      return;
    }

    res.status(200).json({
      message: "Contact message fetched successfully",
      data: contactUsData,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// -----------------------
// Get One Contact Message
// -----------------------
export const updateStatusContactUsById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const contactUsData = await ContactUsModel.findById(id);
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
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// -----------------------
// Delete Contact Message
// -----------------------
export const deleteContactUsById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const deletedContact = await ContactUsModel.findByIdAndDelete(id);

    if (!deletedContact) {
      res.status(404).json({ message: "Message not found" });
      return;
    }

    res.status(200).json({
      message: "Contact message deleted successfully",
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
