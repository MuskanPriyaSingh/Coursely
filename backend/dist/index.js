import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { v2 as cloudinary } from "cloudinary";
import fileUpload from 'express-fileupload';
import userRoute from './routes/userRoute.js';
import adminRoute from './routes/adminRoute.js';
import courseRoute from './routes/courseRoute.js';
dotenv.config();
// Connect to DB
connectDB();
const app = express();
// Middlewares
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use(express.json());
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));
// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
});
// Defining routes
app.use("/api/v1/user", userRoute);
app.use("/api/v1/admin", adminRoute);
app.use("/api/v1/course", courseRoute);
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
