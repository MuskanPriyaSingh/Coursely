import express from "express";
import { verifyAdminToken } from "../middleware/adminMiddleware.ts";
import { verifyUserToken } from "../middleware/userMiddleware.ts";
import { courseDetails, createCourse, deleteCourse, getCourses, makePurchase, updateCourse } from "../controllers/courseController.ts";

const router = express.Router();

router.post("/create", verifyAdminToken, createCourse);
router.put("/:courseId", verifyAdminToken, updateCourse);
router.delete("/:courseId", verifyAdminToken, deleteCourse);
router.get("/", getCourses);
router.get("/:courseId", courseDetails);

router.post("/purchase/:courseId", verifyUserToken, makePurchase);

export default router;