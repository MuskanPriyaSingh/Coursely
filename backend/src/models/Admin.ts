import mongoose, { Document, Types} from "mongoose";

export interface IAdmin extends Document<Types.ObjectId> {
    name: string;
    email: string;
    password: string;
}

const adminSchema = new mongoose.Schema<IAdmin>(
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
    },
    { timestamps: true }
);

export const Admin = mongoose.model<IAdmin>("Admin", adminSchema);