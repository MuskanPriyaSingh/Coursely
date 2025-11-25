import mongoose from "mongoose";
const referralSchema = new mongoose.Schema({
    referrer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    referredUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "converted"],
        default: "pending"
    },
    // prevents double-crediting
    credited: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });
export const Referral = mongoose.model("Referral", referralSchema);
