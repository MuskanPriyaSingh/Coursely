import { Request, Response } from "express";
import { Course } from "../models/Course.js";
import { Purchase } from "../models/Purchase.js";
import { User } from "../models/User.js";
import { Referral } from "../models/Referral.js";
import { CreditTransaction } from "../models/creditTransaction.js";  
import { CustomRequest as adminRequest } from "../middleware/adminMiddleware.js";
import { CustomRequest as userRequest } from "../middleware/userMiddleware.js";
import { v2 as cloudinary } from "cloudinary";

// Create a course
export const createCourse = async (req: adminRequest, res: Response) => {
    const adminId = req.admin?.id;
    const { title, description, price } = req.body;

    try {
        
        if (!title || !description || !price) {
            return res.status(400).json({ 
                success: false, 
                message: "All fields are required" 
            });
        }

        
        if (!req.files || !req.files.image) {
            return res.status(400).json({ 
                success: false, 
                message: "Image file is required" 
            });
        }

        const image = req.files.image;
        const allowedFormat = ["image/png", "image/jpeg", "image/jpg"];

        if (Array.isArray(image)) {
            return res.status(400).json({
                success: false,
                message: "Multiple files uploaded, but only a single file is expected."
            });
        }

        if (!allowedFormat.includes(image.mimetype)) {
            return res.status(400).json({
                success: false,
                message: "Invalid file format. Only PNG, JPG, JPEG allowed."
            });
        }

        // Upload to Cloudinary
        const cloud_response = await cloudinary.uploader.upload(image.tempFilePath, {
            folder: "Coursely"
        });

        const course = await Course.create({
            title,
            description,
            price,
            image: {
                public_id: cloud_response.public_id,
                url: cloud_response.secure_url
            },
            creatorId: adminId,
        });

        res.status(201).json({
            success: true,
            message: "Course created successfully",
            course
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false, 
            message: "Error creating course" 
        });
    }
};

// Update a course
export const updateCourse = async (req: adminRequest, res: Response) => {
    const adminId = req.admin?.id;
    const { courseId } = req.params;
    const { title, description, price } = req.body;

    try {
        const course = await Course.findOne({
            _id: courseId,
            creatorId: adminId, 
        });

        if (!course) {
            return res.status(404).json({ 
                success: false, 
                message: "Cannot update the course, created by other admin" 
            });
        }

        if (title) course.title = title;
        if (description) course.description = description;
        if (price) course.price = price;

        if (req.files && req.files.image) {
            const image = req.files.image;

            const allowedFormat = ["image/png", "image/jpeg", "image/jpg"];

            if (Array.isArray(image)) {
                return res.status(400).json({
                    success: false,
                    message: "Multiple files uploaded, but only a single file is expected."
                });
            }

            if (!allowedFormat.includes(image.mimetype)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid file format"
                });
            }

            if (course.image && course.image.public_id){
                await cloudinary.uploader.destroy(course.image.public_id);   
            }

            const cloud_response = await cloudinary.uploader.upload(image.tempFilePath, {
                folder: "Coursely"
            });

            course.image = {
                public_id: cloud_response.public_id,
                url: cloud_response.secure_url
            };
        }

        await course.save();

        res.status(202).json({ success: true, message: "Course updated successfully", course });

    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false, 
            message: "Error while updating course" 
        });
    }
};

// Delete a course
export const deleteCourse = async (req: adminRequest, res: Response) => {
    const adminId = req.admin?.id;
    const { courseId } = req.params;

    try {
        const course = await Course.findOne({
            _id: courseId,
            creatorId: adminId,
        });
        if (!course) {
            return res.status(404).json({ 
                success: false, 
                message: "Cannot delete the course, created by other admin"
            });
        }

        await cloudinary.uploader.destroy(course.image.public_id);

        await course.deleteOne();

        res.status(200).json({
            success: true,
            message: "Course deleted successfully",
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Error in deleting course",
        });
    }
};

// Fetch all courses
export const getCourses = async (req: Request, res: Response) => {
    try {
        const courses = await Course.find({});
        res.status(200).json({ 
            success: true, 
            message: "All courses are fetched Successfully", 
            courses 
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ 
            success: false, 
            message: "Error to Fetch all courses" 
        })
    }
};

// Fetch a course by id
export const courseDetails = async (req: Request, res: Response) => {
    const { courseId } = req.params;

    try {
        const course = await Course.findById(courseId);
    
        if (!course) {
            return res.status(404).json({ 
                success: false, 
                message: "Course not found" 
            });
        }

        res.status(200).json({
            success: true,
            message: "Course details fetched successfully",
            course
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Error fetching course details" });
    }
};

// Buy a course
export const makePurchase = async (req: userRequest, res: Response) => {
    const userId = req.user?.id;
    const { courseId } = req.params;
    const { useCredits = 0 } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            }); 
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ 
                success: false, 
                message: "Course not found" 
            });
        }

        const existingPurchase = await Purchase.findOne({ user: userId, courseId });
        if (existingPurchase) {
            return res.status(400).json({
                success: false,
                message: "User has already purchased this course",
            });
        }

        let finalAmount = course.price;

        const creditsToUse = Math.min(useCredits, user.credits, finalAmount);
        finalAmount -= creditsToUse;

        if (creditsToUse > 0) {
            user.credits -= creditsToUse;
            await CreditTransaction.create({
                user: user._id,
                type: "USED",
                amount: creditsToUse,
                description: `Used ${creditsToUse} credits for course purchase`,
            });
        }

        const purchase = new Purchase({
            user: user._id,
            courseId,
            amount: finalAmount,
            creditsUsed: creditsToUse,
            rewarded: false,
        });

        await purchase.save();

        if (!user.hasMadeFirstPurchase) {
            user.hasMadeFirstPurchase = true;

            user.credits += 200;
            await CreditTransaction.create({
                user: user._id,
                type: "EARNED",
                amount: 200,
                description: "Earned 200 credits for first purchase",
                relatedPurchase: purchase._id,
            });

            if (user.referrer) {
                const referral = await Referral.findOne({
                    referredUser: user._id,
                    credited: false,
                });

                if (referral) {
                    const referrer = await User.findById(referral.referrer);
                    if (referrer) {
                        referrer.credits += 200;
                        await CreditTransaction.create({
                        user: referrer._id,
                        type: "EARNED",
                        amount: 200,
                        description: `Earned 200 credits for referring ${user.name || "a friend"}`,
                        });
                        await referrer.save();
                    }

                    referral.status = "converted";
                    referral.credited = true;
                    await referral.save();
                    purchase.rewarded = true;
                    await purchase.save();
                }
            }
        }

        await user.save();

        return res.status(201).json({
            success: true,
            message: "Purchase successful",
            data: {
                purchase,
                finalAmountPaid: finalAmount,
                remainingCredits: user.credits,
            },
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
        success: false,
        message: "Error processing purchase"
        });
    }
};