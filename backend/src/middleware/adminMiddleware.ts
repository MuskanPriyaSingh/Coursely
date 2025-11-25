import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "jwtsecret";

interface DecodedUser {
    id: string;
}

export interface CustomRequest extends Request {
    admin?: DecodedUser; 
}

export const verifyAdminToken = (req: CustomRequest, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "No token provided, or authorization header malformed"
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as DecodedUser;
        req.admin = decoded;

        next();

    } catch (error) {
        return res.status(403).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
}

