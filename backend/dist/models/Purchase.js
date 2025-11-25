import mongoose from "mongoose";
const purchaseSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    creditsUsed: { type: Number, default: 0 },
    isFirstPurchase: {
        type: Boolean,
        default: false
    },
    // prevents double reward
    rewarded: {
        type: Boolean,
        default: false
    },
    createdAt: { type: Date, default: Date.now },
}, { timestamps: true });
export const Purchase = mongoose.model("Purchase", purchaseSchema);
