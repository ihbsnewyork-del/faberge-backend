"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteManager = exports.getAllManagers = exports.changePassword = exports.setNewPassword = exports.verifyOtp = exports.sendOtp = exports.toggleBlockManager = exports.updateProfile = exports.getMyProfile = exports.loginManger = exports.registerManager = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const manager_model_1 = require("./manager.model");
const manager_validation_1 = require("./manager.validation");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const accessibility_model_1 = require("../accessibility/accessibility.model");
// --------------------
// Seed Default Accessibility
// --------------------
const seedDefaultAccessibility = async () => {
    let accessibility = await accessibility_model_1.AccessibilityModel.findOne();
    if (!accessibility) {
        accessibility = await accessibility_model_1.AccessibilityModel.create({
            isDashboardShow: false,
            isAnalyticsShow: false,
            isUsersShow: false,
            isServicesShow: false,
            isTransactionsShow: false,
        });
    }
    manager_model_1.ManagerModel.schema.path("accessibility").default(accessibility._id);
};
seedDefaultAccessibility();
// --------------------
// Register Manager
// --------------------
const registerManager = async (req, res) => {
    try {
        const data = {
            ...req.body,
            uploadPhoto: req.file
                ? `/picture/profile_image/${req.file.filename}`
                : undefined,
        };
        const parsed = manager_validation_1.managerProfileSchema.safeParse(data);
        if (!parsed.success) {
            res.status(400).json({ message: parsed.error.errors });
            return;
        }
        const { email, password } = parsed.data;
        const existing = await manager_model_1.ManagerModel.findOne({ email });
        if (existing) {
            res.status(400).json({ message: "Email already exists" });
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const accessibility = await accessibility_model_1.AccessibilityModel.create({});
        const manager = new manager_model_1.ManagerModel({
            ...parsed.data,
            accessibility: accessibility._id,
            uploadPhoto: `${data.uploadPhoto}`,
            password: hashedPassword,
        });
        await manager.save();
        res
            .status(201)
            .json({ message: "Manager created successfully", data: manager });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error registering manager", error: err });
    }
};
exports.registerManager = registerManager;
// --------------------
//  Login
// --------------------
const loginManger = async (req, res, next) => {
    try {
        const { email, password } = manager_validation_1.managerLoginSchema.parse(req.body);
        const user = await manager_model_1.ManagerModel.findOne({ email }).populate("accessibility");
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
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: "Invalid credentials" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({
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
        }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.json({ message: "Login successful", token });
    }
    catch (error) {
        next(error);
    }
};
exports.loginManger = loginManger;
// --------------------
// Get My Profile
// --------------------
const getMyProfile = async (req, res) => {
    try {
        const { userId, role } = req.user;
        if (role !== "manager" && role !== "admin") {
            res.status(403).json({ message: "Access denied" });
            return;
        }
        const user = await manager_model_1.ManagerModel.findById(userId)
            .populate("accessibility")
            .select("-password -_v -otpVerified -resetOtp -otpExpires -isDeleted");
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.json(user);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching profile" });
    }
};
exports.getMyProfile = getMyProfile;
// --------------------
// Update Profile
// --------------------
const updateProfile = async (req, res) => {
    try {
        const { userId, role } = req.user;
        if (role !== "manager" && role !== "admin") {
            res.status(403).json({ message: "Access denied" });
            return;
        }
        const data = manager_validation_1.managerProfileSchema.partial().parse(req.body);
        delete data.email;
        delete data.password;
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
        const updatedManager = await manager_model_1.ManagerModel.findByIdAndUpdate(userId, updateData, { new: true }).select("-password -email -isDeleted");
        if (!updatedManager) {
            res.status(404).json({ message: "Manager not found" });
            return;
        }
        res.json({
            message: "Profile updated successfully",
            data: updatedManager,
        });
    }
    catch (err) {
        console.error(err);
        res.status(400).json({
            message: err.errors?.[0]?.message || "Error updating profile",
        });
    }
};
exports.updateProfile = updateProfile;
// --------------------
// Block/Unblock Manager
// --------------------
const toggleBlockManager = async (req, res) => {
    try {
        const { managerId } = req.params;
        if (!managerId) {
            res.status(400).json({ message: "managerId is required" });
            return;
        }
        const manager = await manager_model_1.ManagerModel.findById(managerId);
        if (!manager) {
            res.status(404).json({ message: "Manager not found" });
            return;
        }
        manager.isBlocked = !manager.isBlocked;
        await manager.save();
        res.status(200).json({
            message: `Manager has been ${manager.isBlocked ? "blocked" : "unblocked"} successfully`,
            data: manager,
        });
    }
    catch (error) {
        console.error("Error toggling manager status:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};
exports.toggleBlockManager = toggleBlockManager;
// --------------------
// Send OTP (Forgot Password)
// --------------------
const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await manager_model_1.ManagerModel.findOne({ email });
        if (!user) {
            res.status(404).json({ message: "Manager not found" });
            return;
        }
        const otp = Math.floor(100000 + Math.random() * 900000);
        user.resetOtp = otp;
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();
        const transporter = nodemailer_1.default.createTransport({
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
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error sending OTP" });
    }
};
exports.sendOtp = sendOtp;
// --------------------
// Verify OTP
// --------------------
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await manager_model_1.ManagerModel.findOne({ email });
        if (!user) {
            res.status(404).json({ message: "Manager not found" });
            return;
        }
        if (user.resetOtp !== Number(otp) ||
            (user.otpExpires?.getTime() ?? 0) < Date.now()) {
            res.status(400).json({ message: "Invalid or expired OTP" });
            return;
        }
        user.otpVerified = true;
        await user.save();
        res.json({ message: "OTP verified successfully" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error verifying OTP" });
    }
};
exports.verifyOtp = verifyOtp;
// --------------------
// Set New Password
// --------------------
const setNewPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const user = await manager_model_1.ManagerModel.findOne({ email });
        if (!user) {
            res.status(404).json({ message: "Manager not found" });
            return;
        }
        if (!user.otpVerified) {
            res.status(400).json({ message: "First verify OTP" });
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetOtp = null;
        user.otpExpires = null;
        user.otpVerified = false;
        await user.save();
        const token = jsonwebtoken_1.default.sign({
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            address: user.address,
            city: user.city,
            state: user.state,
            phone: user.phone,
            email: user.email,
            role: user.role,
        }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.json({ message: "Password reset successful", token });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error resetting password" });
    }
};
exports.setNewPassword = setNewPassword;
// --------------------
// Change Password (for logged-in user)
// --------------------
const changePassword = async (req, res) => {
    try {
        const { userId } = req.user;
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            res
                .status(400)
                .json({ message: "Both current and new passwords are required" });
            return;
        }
        const user = await manager_model_1.ManagerModel.findById(userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const isPasswordValid = await bcryptjs_1.default.compare(currentPassword, user.password);
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
        const hashedNewPassword = await bcryptjs_1.default.hash(newPassword, 10);
        user.password = hashedNewPassword;
        await user.save();
        res.json({ message: "Password changed successfully" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error changing password" });
    }
};
exports.changePassword = changePassword;
// --------------------
// Get All Managers (with Search)
// --------------------
const getAllManagers = async (req, res) => {
    try {
        const { search } = req.query;
        const searchCondition = {};
        if (search) {
            const regex = new RegExp(search, "i");
            searchCondition.$or = [
                { firstName: regex },
                { lastName: regex },
                { email: regex },
                { phone: regex },
                { city: regex },
                { state: regex },
            ];
        }
        const managers = await manager_model_1.ManagerModel.find({
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
    }
    catch (error) {
        console.error("Error fetching managers:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch managers",
            error: error.message,
        });
    }
};
exports.getAllManagers = getAllManagers;
// --------------------
// Delete Manager
// --------------------
const deleteManager = async (req, res) => {
    try {
        const { id } = req.params;
        const manager = await manager_model_1.ManagerModel.findByIdAndDelete(id);
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete manager",
            error,
        });
    }
};
exports.deleteManager = deleteManager;
