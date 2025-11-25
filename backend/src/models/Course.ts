import mongoose, { Document, Types} from "mongoose";

interface IImage {
    public_id: string;
    url: string;
}

export interface ICourse extends Document<Types.ObjectId> {
    title: string;
    description: string;
    price: number;
    image: IImage;
    creatorId: mongoose.Types.ObjectId
}

const courseSchema = new mongoose.Schema<ICourse>({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    image: {
        public_id:{
            type: String,
            required: true,
        },
        url:{
            type:String,
            required:true,
        },
    },
    creatorId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
},
    {
        timestamps: true
    }
);

export const Course = mongoose.model<ICourse>("Course", courseSchema);