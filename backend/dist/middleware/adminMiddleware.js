import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "jwtsecret";
export const verifyAdminToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "No token provided, or authorization header malformed"
        });
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.admin = decoded;
        next();
    }
    catch (error) {
        return res.status(403).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};
