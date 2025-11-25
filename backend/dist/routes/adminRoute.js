import express from "express";
import { register, login, logout, changePassword } from "../controllers/adminController.js";
const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.post("/forgot-password", changePassword);
export default router;
