import mongoose, { Document, Types} from "mongoose";

export interface IPurchase extends Document<Types.ObjectId> {
    user: mongoose.Types.ObjectId;
    courseId?: mongoose.Types.ObjectId;
    amount: number;
    creditsUsed: number;
    isFirstPurchase: boolean;
    rewarded: boolean
    createdAt: Date;
}

const purchaseSchema = new mongoose.Schema<IPurchase>(
    {
        user: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "User", 
            required: true 
        },
        courseId:{
            type:mongoose.Schema.Types.ObjectId,
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
    }, 
    { timestamps: true}
);

export const Purchase = mongoose.model<IPurchase>("Purchase", purchaseSchema);
