import mongoose, { Schema } from "mongoose";
const creditTransactionSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
        type: String,
        enum: ["EARNED", "USED"],
        required: true
    },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    relatedPurchase: { type: Schema.Types.ObjectId, ref: "Purchase" },
    createdAt: { type: Date, default: Date.now },
});
export const CreditTransaction = mongoose.model("CreditTransaction", creditTransactionSchema);
