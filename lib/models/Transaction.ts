import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  // MongoDB _id sẽ tự sinh
  userId: mongoose.Types.ObjectId;
  type: 'deposit' | 'withdraw' | 'purchase' | 'refund';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  method: 'bank' | 'wallet' | 'credit_card' | 'crypto';
  description?: string;
  relatedOrderId?: mongoose.Types.ObjectId;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema = new Schema(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      required: true,
      index: true,
      ref: 'User'
    },
    type: { 
      type: String, 
      enum: ['deposit', 'withdraw', 'purchase', 'refund'],
      required: true,
      index: true
    },
    amount: { 
      type: Number, 
      required: true 
    },
    status: { 
      type: String, 
      enum: ['pending', 'completed', 'failed', 'cancelled'],
      default: 'pending',
      index: true
    },
    method: { 
      type: String, 
      enum: ['bank', 'wallet', 'credit_card', 'crypto'],
      required: true
    },
    description: { type: String },
    relatedOrderId: { 
      type: Schema.Types.ObjectId,
      ref: 'Order'
    },
    balanceBefore: { 
      type: Number, 
      required: true 
    },
    balanceAfter: { 
      type: Number, 
      required: true 
    },
  },
  { timestamps: true }
);

// Indexes for fast queries
TransactionSchema.index({ userId: 1, createdAt: -1 });
TransactionSchema.index({ type: 1, status: 1 });
TransactionSchema.index({ transactionId: 1 });

export default mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);
