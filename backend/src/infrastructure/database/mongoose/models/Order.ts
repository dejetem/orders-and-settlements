import mongoose, { Document, Schema } from 'mongoose';

export type OrderStatus = 'pending' | 'partially_paid' | 'paid' | 'overdue';

export interface ILineItem {
  description: string;
  quantity: number;
  unitPrice: number; // Stored in cents to avoid float issues
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  customer: string;
  dueDate: Date;
  status: OrderStatus;
  lineItems: ILineItem[];
  subtotal: number; // Stored in cents
  total: number; // Stored in cents
  amountPaid: number; // Stored in cents
  amountDue: number; // Stored in cents
  updateStatus(): void;
}

const lineItemSchema = new Schema<ILineItem>({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
});

const orderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    customer: { type: String, required: true },
    dueDate: { type: Date, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'partially_paid', 'paid', 'overdue'], 
      default: 'pending' 
    },
    lineItems: [lineItemSchema],
    subtotal: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    amountPaid: { type: Number, default: 0, min: 0 },
    amountDue: { type: Number, required: true, min: 0 },
  },
  { 
    timestamps: true,
    optimisticConcurrency: true // Enables __v checking on save() to prevent overpayment race conditions
  }
);

// Method to automatically update status based on amountPaid and dueDate
orderSchema.methods.updateStatus = function() {
  const isOverdue = this.dueDate < new Date();

  if (this.amountPaid >= this.total) {
    this.status = 'paid';
  } else if (this.amountPaid > 0 && this.amountPaid < this.total) {
    this.status = isOverdue ? 'overdue' : 'partially_paid';
  } else {
    this.status = isOverdue ? 'overdue' : 'pending';
  }
  
  // Recalculate amountDue
  this.amountDue = this.total - this.amountPaid;
};

// Pre-save hook to ensure totals and status are correct
orderSchema.pre('save', function() {
  if (this.isModified('lineItems')) {
    let sub = 0;
    for (const item of this.lineItems) {
      sub += item.quantity * item.unitPrice;
    }
    this.subtotal = sub;
    this.total = sub; // As per assignment, total == subtotal
  }
  
  this.updateStatus();
});

export const Order = mongoose.model<IOrder>('Order', orderSchema);
