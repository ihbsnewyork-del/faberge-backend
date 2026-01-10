import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import { ManagerModel } from "./manager.model";
import { managerLoginSchema, managerProfileSchema } from "./manager.validation";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { AccessibilityModel } from "../accessibility/accessibility.model";

// --------------------
// Seed Default Accessibility
// --------------------
const seedDefaultAccessibility = async () => {
  let accessibility = await AccessibilityModel.findOne();
  if (!accessibility) {
    accessibility = await AccessibilityModel.create({
      isDashboardShow: false,
      isAnalyticsShow: false,
      isUsersShow: false,
      isServicesShow: false,
      isTransactionsShow: false,
    });
  }
  ManagerModel.schema.path("accessibility").default(accessibility._id);
};
seedDefaultAccessibility();

// --------------------
// Register Manager
// --------------------
export const registerManager = async (req: Request, res: Response) => {
  try {
    const data = {
      ...req.body,
      uploadPhoto: req.file
        ? `/picture/profile_image/${req.file.filename}`
        : undefined,
    };

    const parsed = managerProfileSchema.safeParse(data);
    if (!parsed.success) {
      res.status(400).json({ message: parsed.error.errors });
      return;
    }

    const { email, password } = parsed.data;

    const existing = await ManagerModel.findOne({ email });
    if (existing) {
      res.status(400).json({ message: "Email already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const accessibility = await AccessibilityModel.create({});

    const manager = new ManagerModel({
      ...parsed.data,
      accessibility: accessibility._id,
      uploadPhoto: `${data.uploadPhoto}`,
      password: hashedPassword,
    });

    await manager.save();

    res
      .status(201)
      .json({ message: "Manager created successfully", data: manager });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error registering manager", error: err });
  }
};

// --------------------
//  Login
// --------------------
export const loginManger = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = managerLoginSchema.parse(req.body);

    const user = await ManagerModel.findOne({ email }).populate(
      "accessibility"
    );

    if (user?.isBlocked) {
      res
        .status(400)
        .json({ message: "Your account is blocked. Contact super admin" });
      return;
    }

    if (!user || !user.password) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password as string);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }
    const token = jwt.sign(
      {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        address: user.address,
        city: user.city,
        state: user.state,
        phone: user.phone,
        email: user.email,
        role: user.role,
        managerId: user.managerId,
        uploadPhoto: user.uploadPhoto,
        accessibility: user.accessibility,
        isBlocked: user.isBlocked,
        // isDeleted: user.isDeleted,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.json({ message: "Login successful", token });
  } catch (error) {
    next(error);
  }
};

// --------------------
// Get My Profile
// --------------------
export const getMyProfile = async (req: any, res: Response) => {
  try {
    const { userId, role } = req.user;

    if (role !== "manager" && role !== "admin") {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    const user = await ManagerModel.findById(userId)
      .populate("accessibility")
      .select("-password -_v -otpVerified -resetOtp -otpExpires -isDeleted");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching profile" });
  }
};

// --------------------
// Update Profile
// --------------------
export const updateProfile = async (req: any, res: Response) => {
  try {
    const { userId, role } = req.user;

    if (role !== "manager" && role !== "admin") {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    const data = managerProfileSchema.partial().parse(req.body);

    delete (data as any).email;
    delete (data as any).password;

    const uploadedPhotoPath = req.file
      ? `/picture/profile_image/${req.file.filename}`
      : undefined;

    const updateData = {
      ...data,
      ...(uploadedPhotoPath
        ? {
            uploadPhoto: `${uploadedPhotoPath}`,
          }
        : {}),
    };

    const updatedManager = await ManagerModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select("-password -email -isDeleted");

    if (!updatedManager) {
      res.status(404).json({ message: "Manager not found" });
      return;
    }

    res.json({
      message: "Profile updated successfully",
      data: updatedManager,
    });
  } catch (err: any) {
    console.error(err);
    res.status(400).json({
      message: err.errors?.[0]?.message || "Error updating profile",
    });
  }
};

// --------------------
// Block/Unblock Manager
// --------------------

export const toggleBlockManager = async (req: Request, res: Response) => {
  try {
    const { managerId } = req.params;

    if (!managerId) {
      res.status(400).json({ message: "managerId is required" });
      return;
    }

    const manager = await ManagerModel.findById(managerId);

    if (!manager) {
      res.status(404).json({ message: "Manager not found" });
      return;
    }

    manager.isBlocked = !manager.isBlocked;
    await manager.save();

    res.status(200).json({
      message: `Manager has been ${
        manager.isBlocked ? "blocked" : "unblocked"
      } successfully`,
      data: manager,
    });
  } catch (error: any) {
    console.error("Error toggling manager status:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

// --------------------
// Send OTP (Forgot Password)
// --------------------
export const sendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await ManagerModel.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "Manager not found" });
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    user.resetOtp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
    });

    res.json({ message: `OTP sent to ${email}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error sending OTP" });
  }
};

// --------------------
// Verify OTP
// --------------------
export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    const user = await ManagerModel.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "Manager not found" });
      return;
    }

    if (
      user.resetOtp !== Number(otp) ||
      (user.otpExpires?.getTime() ?? 0) < Date.now()
    ) {
      res.status(400).json({ message: "Invalid or expired OTP" });
      return;
    }

    user.otpVerified = true;
    await user.save();

    res.json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error verifying OTP" });
  }
};

// --------------------
// Set New Password
// --------------------
export const setNewPassword = async (req: Request, res: Response) => {
  try {
    const { email, newPassword } = req.body;

    const user = await ManagerModel.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "Manager not found" });
      return;
    }

    if (!user.otpVerified) {
      res.status(400).json({ message: "First verify OTP" });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = null;
    user.otpExpires = null;
    user.otpVerified = false;

    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        address: user.address,
        city: user.city,
        state: user.state,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.json({ message: "Password reset successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error resetting password" });
  }
};

// --------------------
// Change Password (for logged-in user)
// --------------------
export const changePassword = async (req: any, res: Response) => {
  try {
    const { userId } = req.user;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res
        .status(400)
        .json({ message: "Both current and new passwords are required" });
      return;
    }

    const user = await ManagerModel.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      res.status(400).json({ message: "Current password is incorrect" });
      return;
    }

    if (currentPassword === newPassword) {
      res
        .status(400)
        .json({ message: "New password cannot be same as current password" });
      return;
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error changing password" });
  }
};

// --------------------
// Get All Managers (with Search)
// --------------------
export const getAllManagers = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;

    const searchCondition: any = {};

    if (search) {
      const regex = new RegExp(search as string, "i");

      searchCondition.$or = [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
        { phone: regex },
        { city: regex },
        { state: regex },
      ];
    }

    const managers = await ManagerModel.find({
      ...searchCondition,
      role: "manager",
    })
      .populate("accessibility")
      .select("-password -resetOtp -otpExpires")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Managers fetched successfully",
      data: managers,
    });
  } catch (error: any) {
    console.error("Error fetching managers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch managers",
      error: error.message,
    });
  }
};

// --------------------
// Delete Manager
// --------------------

export const deleteManager = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const manager = await ManagerModel.findByIdAndDelete(id);

    if (!manager) {
      res.status(404).json({
        success: false,
        message: "Manager not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Manager has been deleted successfully",
      data: manager,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete manager",
      error,
    });
  }
};
