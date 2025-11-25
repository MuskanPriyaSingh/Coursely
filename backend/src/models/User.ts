import mongoose, { Document, Types} from "mongoose";

export interface IUser extends Document<Types.ObjectId> {
    name: string;
    email: string;
    password: string;
    referralCode: string;
    referrer?: mongoose.Types.ObjectId;
    referredUsers: mongoose.Types.ObjectId[];
    credits: number;
    hasMadeFirstPurchase: boolean;
}

const userSchema = new mongoose.Schema<IUser>(
    {
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
    },
    { timestamps: true }
);

export const User = mongoose.model<IUser>("User", userSchema);