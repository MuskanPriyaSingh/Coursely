import mongoose, { Document, Types} from "mongoose";

export interface IReferral extends Document<Types.ObjectId> {
    referrer: mongoose.Types.ObjectId;
    referredUser: mongoose.Types.ObjectId;
    status: "pending" | "converted";
    credited: boolean;
}

const referralSchema = new mongoose.Schema<IReferral>(
    {
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
    }, 
    { timestamps: true}
);

export const Referral = mongoose.model<IReferral>("Referral", referralSchema);