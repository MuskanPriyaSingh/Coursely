import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    referralCode: {
        type: String,
        unique: true
    },
    referrer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    referredUsers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }],
    credits: {
        type: Number,
        default: 0
    },
    hasMadeFirstPurchase: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });
export const User = mongoose.model("User", userSchema);
