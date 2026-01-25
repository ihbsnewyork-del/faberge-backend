"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.superAdminUpdateWorker = exports.superAdminUpdateCustomer = exports.toggleCustomerDelete = exports.getOneCustomer = exports.getAllCustomers = exports.setNewPassword = exports.verifyOtp = exports.sendOtp = exports.toggleBlockUser = exports.updateProfile = exports.getMyProfile = exports.loginCustomerOrWorker = exports.uploadProfilePicture = exports.setPassword = exports.createCustomer = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const zod_1 = require("zod");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const customer_model_1 = require("./customer.model");
const customer_validation_1 = require("./customer.validation");
const checkCustomerOrWorker_1 = __importDefault(require("../../utils/checkCustomerOrWorker"));
const worker_model_1 = require("../worker/worker.model");
const worker_validation_1 = require("../worker/worker.validation");
const paginationHelper_1 = require("../../helper/paginationHelper");
// --------------------
// Register Customer
// --------------------
const createCustomer = async (req, res, next) => {
    try {
        const data = customer_validation_1.customerProfileSchema.parse(req.body);
        const existing = await customer_model_1.CustomerModel.findOne({ email: data.email });
        if (existing) {
            res.status(400).json({ message: "Email already registered" });
            return;
        }
        const newCustomer = await customer_model_1.CustomerModel.create({
            ...data,
        });
        res
            .status(201)
            .json({ message: "Customer created successfully", data: newCustomer });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError)
            res.status(400).json({ message: error.errors.map((e) => e.message) });
        next(error);
    }
};
exports.createCustomer = createCustomer;
// -----------------------
// Set Password Customer
// -----------------------
const setPassword = async (req, res) => {
    try {
        const { email, password } = customer_validation_1.customerPasswordSchema.parse(req.body);
        const user = await customer_model_1.CustomerModel.findOne({ email });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        if (user.password) {
            res.status(400).json({ message: "Password already set" });
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        user.password = hashedPassword;
        await user.save();
        res.json({ message: "Password set successfully" });
    }
    catch (err) {
        res
            .status(400)
            .json({ message: err.errors?.[0]?.message || "Error setting password" });
    }
};
exports.setPassword = setPassword;
// -------------------------------
// Upload Profile Picture Customer
// -------------------------------
const uploadProfilePicture = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await customer_model_1.CustomerModel.findOne({ email });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        if (!req.file) {
            res.status(400).json({ message: "No file uploaded" });
            return;
        }
        const profileImagePath = `/picture/profile_image/${req.file.filename}`;
        user.uploadPhoto = `${profileImagePath}`;
        await user.save();
        res.json({
            message: "Profile picture uploaded successfully",
            data: {
                customerProfileImage: `${profileImagePath}`,
            },
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error uploading profile picture" });
    }
};
exports.uploadProfilePicture = uploadProfilePicture;
// --------------------
//  Login
// --------------------
const loginCustomerOrWorker = async (req, res, next) => {
    try {
        const { email, password } = customer_validation_1.customerLoginSchema.parse(req.body);
        const found = await (0, checkCustomerOrWorker_1.default)(email);
        if (found && found?.user?.isBlocked) {
            res.status(400).json({ message: "Your account is blocked" });
            return;
        }
        if (!found || !found.user.password) {
            res.status(400).json({ message: "Invalid credentials" });
            return;
        }
        const { user } = found;
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
            isBlocked: user.isBlocked,
            isDeleted: user.isDeleted,
        }, process.env.JWT_SECRET, { expiresIn: "7d" });
        res.json({ message: "Login successful", token, data: user?.role });
    }
    catch (error) {
        next(error);
    }
};
exports.loginCustomerOrWorker = loginCustomerOrWorker;
// --------------------
// Get My Profile
// --------------------
const getMyProfile = async (req, res) => {
    try {
        const { userId, role } = req.user;
        if (role === "worker") {
            const user = await worker_model_1.WorkerModel.findById(userId).select("-password");
            if (!user) {
                res.status(404).json({ message: "Worker not found" });
                return;
            }
            res.json(user);
            return;
        }
        const user = await customer_model_1.CustomerModel.findById(userId).select("-password -__v -otpVerified -resetOtp -otpExpires -isDeleted");
        if (!user) {
            res.status(404).json({ message: "Customer not found" });
            return;
        }
        res.json(user);
    }
    catch (err) {
        res.status(500).json({ message: "Error fetching profile" });
    }
};
exports.getMyProfile = getMyProfile;
// --------------------
//  Update Profile
// --------------------
const updateProfile = async (req, res) => {
    try {
        const { userId, role } = req.user;
        let data = req.body;
        if (data.services && typeof data.services === "string") {
            try {
                data.services = JSON.parse(data.services);
            }
            catch {
                res.status(400).json({ message: "Invalid JSON in services field" });
                return;
            }
        }
        const uploadedPhotoPath = req.file
            ? `/picture/profile_image/${req.file.filename}`
            : undefined;
        //  WORKER SECTION
        if (role === "worker") {
            const parsed = worker_validation_1.workerProfileSchema.partial().safeParse(data);
            if (!parsed.success) {
                res.status(400).json({ message: parsed.error.errors });
                return;
            }
            delete parsed.data.email;
            delete parsed.data.password;
            const updateData = {
                ...parsed.data,
                ...(uploadedPhotoPath ? { uploadPhoto: uploadedPhotoPath } : {}),
            };
            const updatedWorker = await worker_model_1.WorkerModel.findByIdAndUpdate(userId, updateData, {
                new: true,
            }).select("-password -isDeleted");
            if (!updatedWorker) {
                res.status(404).json({ message: "Worker not found" });
                return;
            }
            res.json({
                message: "Worker profile updated successfully",
                data: updatedWorker,
            });
            return;
        }
        // CUSTOMER SECTION
        const parsed = customer_validation_1.customerProfileSchema.partial().safeParse(data);
        if (!parsed.success) {
            res.status(400).json({ message: parsed.error.errors });
            return;
        }
        const updateData = {
            ...parsed.data,
            ...(uploadedPhotoPath ? { uploadPhoto: uploadedPhotoPath } : {}),
        };
        const updatedCustomer = await customer_model_1.CustomerModel.findByIdAndUpdate(userId, updateData, { new: true }).select("-password");
        if (!updatedCustomer) {
            res.status(404).json({ message: "Customer not found" });
            return;
        }
        res.json({
            message: "Customer profile updated successfully",
            data: updatedCustomer,
        });
    }
    catch (err) {
        res.status(500).json({
            message: err.errors?.[0]?.message || "Error updating profile",
            error: err.message,
        });
        return;
    }
};
exports.updateProfile = updateProfile;
// --------------------
//  Block Unblocked user
// --------------------
const toggleBlockUser = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            res.status(400).json({ message: "userId is required" });
            return;
        }
        let user = await worker_model_1.WorkerModel.findById(userId);
        if (user) {
            user.isBlocked = !user.isBlocked;
            await user.save();
            res.json({
                message: `Worker has been ${user.isBlocked ? "blocked" : "unblocked"} successfully`,
                data: user,
            });
            return;
        }
        user = await customer_model_1.CustomerModel.findById(userId);
        if (user) {
            user.isBlocked = !user.isBlocked; // Toggle
            await user.save();
            res.json({
                message: `Customer has been ${user.isBlocked ? "blocked" : "unblocked"} successfully`,
                data: user,
            });
            return;
        }
        res.status(404).json({ message: "User not found" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error updating user status" });
    }
};
exports.toggleBlockUser = toggleBlockUser;
// --------------------
// Send OTP (Forgot Password)
// --------------------
const sendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const found = await (0, checkCustomerOrWorker_1.default)(email);
        if (!found) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const { user } = found;
        const otp = Math.floor(100000 + Math.random() * 900000);
        user.resetOtp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000;
        await user.save();
        const transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset OTP",
            text: `Your OTP is ${otp}. It expires in 10 minutes.`,
        });
        res.json({ message: `OTP sent to ${email} email` });
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
        const found = await (0, checkCustomerOrWorker_1.default)(email);
        if (!found) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const { user } = found;
        if (user.resetOtp !== Number(otp) ||
            user.otpExpires < Date.now()) {
            res.status(400).json({ message: "Invalid or expired OTP" });
            return;
        }
        user.otpVerified = true;
        await user.save();
        res.json({ message: `OTP verified successfully for ${email}` });
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
        const found = await (0, checkCustomerOrWorker_1.default)(email);
        if (!found) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const { user } = found;
        if (user.otpVerified !== true) {
            res.status(400).json({ message: "First verify OTP" });
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetOtp = undefined;
        user.otpExpires = undefined;
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
            isBlocked: user.isBlocked,
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
// Get All Customers
// --------------------
const getAllCustomers = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const sortField = String(req.query.sortField || "createdAt");
        const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
        const filter = { role: "customer" };
        if (req.query.search) {
            const search = String(req.query.search);
            filter.$or = [
                { firstName: { $regex: search, $options: "i" } },
                { lastName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { phone: { $regex: search, $options: "i" } },
            ];
        }
        const result = await (0, paginationHelper_1.paginate)(customer_model_1.CustomerModel, {
            page,
            limit,
            sort: { [sortField]: sortOrder },
            filter,
        });
        res.status(200).json({
            message: "Customers retrieved successfully",
            data: result.data,
            pagination: result.pagination,
        });
    }
    catch (error) {
        console.error("Error fetching customers:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};
exports.getAllCustomers = getAllCustomers;
// --------------------
// Get One Customer
// --------------------
const getOneCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ message: "Customer ID is required" });
            return;
        }
        const customer = await customer_model_1.CustomerModel.findById(id).select("-password -resetOtp -otpExpires");
        if (!customer) {
            res.status(404).json({ message: "Customer not found" });
            return;
        }
        res.status(200).json({
            message: "Customer retrieved successfully",
            data: customer,
        });
    }
    catch (error) {
        console.error("Error fetching customer:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};
exports.getOneCustomer = getOneCustomer;
// --------------------
// Delete Customer
// --------------------
const toggleCustomerDelete = async (req, res) => {
    try {
        const { id } = req.params;
        const customer = await customer_model_1.CustomerModel.findByIdAndDelete(id);
        if (!customer) {
            res.status(404).json({
                success: false,
                message: "Customer not found",
            });
            return;
        }
        // customer.isDeleted = !customer.isDeleted;
        // await customer.save();
        res.status(200).json({
            success: true,
            message: `Customer deleted successfully`,
            data: customer,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to toggle customer delete status",
            error,
        });
    }
};
exports.toggleCustomerDelete = toggleCustomerDelete;
// ------------------------
// Update Customer (Superadmin)
// ------------------------
const superAdminUpdateCustomer = async (req, res) => {
    try {
        const { id } = req.params;
        let data = req.body;
        if (data.services && typeof data.services === "string") {
            try {
                data.services = JSON.parse(data.services);
            }
            catch {
                res.status(400).json({ message: "Invalid JSON in services field" });
                return;
            }
        }
        const uploadedPhotoPath = req.file
            ? `/picture/profile_image/${req.file.filename}`
            : undefined;
        const updateData = {
            ...data,
            ...(uploadedPhotoPath ? { uploadPhoto: uploadedPhotoPath } : {}),
        };
        const updatedCustomer = await customer_model_1.CustomerModel.findByIdAndUpdate(id, updateData, {
            new: true,
        }).select("-password");
        if (!updatedCustomer) {
            res.status(404).json({ message: "Customer not found" });
            return;
        }
        res.json({
            message: "Customer updated successfully",
            data: updatedCustomer,
        });
        return;
    }
    catch (err) {
        res.status(500).json({
            message: err.errors?.[0]?.message || "Error updating customer",
            error: err.message,
        });
        return;
    }
};
exports.superAdminUpdateCustomer = superAdminUpdateCustomer;
// ------------------------
// Update Worker (Superadmin)
// ------------------------
const superAdminUpdateWorker = async (req, res) => {
    try {
        const { id } = req.params;
        let data = req.body;
        if (data.services && typeof data.services === "string") {
            try {
                data.services = JSON.parse(data.services);
            }
            catch {
                res.status(400).json({ message: "Invalid JSON in services field" });
                return;
            }
        }
        const uploadedPhotoPath = req.file
            ? `/picture/profile_image/${req.file.filename}`
            : undefined;
        const parsed = worker_validation_1.workerProfileSchema.partial().safeParse(data);
        if (!parsed.success) {
            res.status(400).json({ message: parsed.error.errors });
            return;
        }
        delete parsed.data.email;
        if (parsed.data.password) {
            const hashedPassword = await bcryptjs_1.default.hash(parsed.data.password, 10);
            parsed.data.password = hashedPassword;
        }
        const updateData = {
            ...parsed.data,
            ...(uploadedPhotoPath ? { uploadPhoto: uploadedPhotoPath } : {}),
        };
        const updatedWorker = await worker_model_1.WorkerModel.findByIdAndUpdate(id, updateData, {
            new: true,
        }).select("-password -isDeleted");
        if (!updatedWorker) {
            res.status(404).json({ message: "Worker not found" });
            return;
        }
        res.json({
            message: "Worker updated successfully",
            data: updatedWorker,
        });
        return;
    }
    catch (err) {
        res.status(500).json({
            message: err.errors?.[0]?.message || "Error updating worker",
            error: err.message,
        });
        return;
    }
};
exports.superAdminUpdateWorker = superAdminUpdateWorker;
