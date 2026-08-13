import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  orderId: mongoose.Types.ObjectId;
  amount: number; // Stored in cents
  date: Date;
  note?: string;
  idempotencyKey?: string;
}

const paymentSchema = new Schema<IPayment>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    amount: { type: Number, required: true, min: 1 }, // min 1 cent (0.01 dollars)
    date: { type: Date, required: true, default: Date.now },
    note: { type: String },
    idempotencyKey: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);
