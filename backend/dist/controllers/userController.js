import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { Referral } from "../models/Referral.js";
import { Purchase } from "../models/Purchase.js";
import { Course } from "../models/Course.js";
import { CreditTransaction } from "../models/creditTransaction.js";
const JWT_SECRET = process.env.JWT_SECRET || "jwtsecret";
// Helper: generate referral code
const generateReferralCode = (name) => {
    const random = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `${name.slice(0, 3).toUpperCase()}${random}`;
};
// Register User
export const register = async (req, res) => {
    const { name, email, password, referralCode } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already registered"
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            referralCode: generateReferralCode(name)
        });
        // if referral code was used
        if (referralCode) {
            const referrer = await User.findOne({ referralCode });
            if (referrer) {
                newUser.referrer = referrer._id;
                await Referral.create({
                    referrer: referrer._id,
                    referredUser: newUser._id,
                    status: "pending"
                });
                referrer.referredUsers.push(newUser._id);
                await referrer.save();
            }
        }
        await newUser.save();
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            referralLink: `https://coursely.com/register?ref=${newUser.referralCode}`
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Registration failed",
        });
    }
};
// Login User
export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User not found"
            });
        }
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }
        // Generate token for authentication purpose
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });
        const cookieOptions = {
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
        };
        res.cookie("jwt", token, cookieOptions);
        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                referralCode: user.referralCode
            }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Login failed",
        });
    }
};
// Logout User
export const logout = async (req, res) => {
    try {
        res.clearCookie("jwt");
        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Logout failed"
        });
    }
};
// Change forgot Password
export const changePassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        res.status(200).json({
            success: true,
            message: "Password updated successfully"
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};
// Get all purchased courses
export const purchasedCourses = async (req, res) => {
    const userId = req.user?.id;
    try {
        const purchased = await Purchase.find({ user: userId });
        if (!purchased.length) {
            return res.status(200).json({
                success: false,
                message: "No purchased courses found",
                courses: []
            });
        }
        let purchasedCourseIds = [];
        for (let i = 0; i < purchased.length; i++) {
            purchasedCourseIds.push(purchased[i].courseId);
        }
        const coursesData = await Course.find({
            _id: { $in: purchasedCourseIds }
        });
        res.status(200).json({
            success: true,
            message: "Purchased courses fetched successfully",
            purchased,
            coursesData,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error while fetching purchased courses"
        });
    }
};
// Get all referralData
export const getReferralData = async (req, res) => {
    const userId = req.user?.id;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        const totalReferrals = await Referral.countDocuments({ referrer: user._id });
        const convertedReferrals = await Referral.countDocuments({ referrer: user._id, status: "converted" });
        res.json({
            success: true,
            message: "Referral data fetched successfully",
            name: user.name,
            totalReferrals,
            convertedReferrals,
            totalCredits: user.credits,
            referralLink: `https://coursely.com/register?ref=${user.referralCode}`
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
// Get credit history of a user
export const getCreditHistory = async (req, res) => {
    const userId = req.user?.id;
    try {
        const history = await CreditTransaction.find({ user: userId })
            .sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            transactions: history
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Error fetching credit history"
        });
    }
};
