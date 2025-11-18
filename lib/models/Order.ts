import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  accountId: mongoose.Types.ObjectId; // First account reference
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  paymentMethod: 'wallet'; // Thanh toán từ ví
  paymentStatus: 'paid' | 'failed';
  account?: {
    username: string;
    password: string;
    email?: string;
    emailPassword?: string;
    phone?: string;
  };
  accounts?: Array<{
    username: string;
    password: string;
    email?: string;
    emailPassword?: string;
    phone?: string;
  }>;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema: Schema = new Schema(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      required: true,
      index: true,
      ref: 'User'
    },
    productId: { 
      type: Schema.Types.ObjectId, 
      required: true,
      index: true,
      ref: 'Product'
    },
    accountId: { 
      type: Schema.Types.ObjectId, 
      required: true,
      index: true,
      ref: 'Account'
    },
    quantity: { 
      type: Number, 
      required: true,
      default: 1
    },
    totalPrice: { 
      type: Number, 
      required: true 
    },
    status: { 
      type: String, 
      enum: ['pending', 'completed', 'cancelled', 'refunded'],
      default: 'completed',
      index: true
    },
    paymentMethod: { 
      type: String, 
      enum: ['wallet'],
      default: 'wallet'
    },
    paymentStatus: { 
      type: String, 
      enum: ['paid', 'failed'],
      default: 'paid',
      index: true
    },
    account: {
      username: String,
      password: String,
      email: String,
      emailPassword: String,
      phone: String
    },
    accounts: [{
      username: String,
      password: String,
      email: String,
      emailPassword: String,
      phone: String
    }],
    notes: { type: String },
  },
  { timestamps: true }
);

// Indexes for fast queries
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1, paymentStatus: 1 });
OrderSchema.index({ productId: 1, status: 1 });

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);
