import mongoose, { Schema, Document } from "mongoose";

export interface ICreditTransaction extends Document {
  user: mongoose.Types.ObjectId;
  type: "EARNED" | "USED" 
  amount: number;
  description: string;
  relatedPurchase?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const creditTransactionSchema = new Schema<ICreditTransaction>({
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

export const CreditTransaction = mongoose.model<ICreditTransaction>("CreditTransaction", creditTransactionSchema);
