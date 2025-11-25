import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Admin } from "../models/Admin.ts";
import { CookieOptions } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "jwtsecret"; 

// Register Admin
export const register = async (req: Request, res: Response) => {
    const { name, email, password} = req.body;
    try {
        const existingUser = await Admin.findOne({email});

        if (existingUser) {
            return res.status(400).json({
                success: false,   
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new Admin({
            name,
            email,
            password: hashedPassword,
        });

        await newUser.save();

        res.status(201).json({
            success: true,
            message: "User registered successfully",
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Registration failed",
        });
    }
};

// Login Admin
export const login = async (req: Request, res: Response) => {
    const {email, password} = req.body;
    try {
        const user = await Admin.findOne({email}).select("+password");

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

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });

        const cookieOptions: CookieOptions = {
            expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
        }
        res.cookie("jwt", token, cookieOptions);

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Login failed",
        });
    }
};

// Logout Admin
export const logout = async (req: Request, res: Response) => {
    try {
        res.clearCookie("jwt");

        res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Logout failed"
        });
    }
};

// Change forgot Password
export const changePassword = async (req: Request, res: Response) => {
    
    try {
        const { email, newPassword } = req.body;

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "User not found" 
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        admin.password = hashedPassword;
        await admin.save();

        res.status(200).json({
            success: true,
            message: "Password updated successfully" 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false,
            message: "Something went wrong" 
        });
    }
};