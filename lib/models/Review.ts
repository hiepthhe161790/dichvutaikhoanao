import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  // MongoDB _id sẽ tự sinh
  userId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  rating: number; // 1-5
  comment: string;
  isVerifiedPurchase: boolean;
  helpful: number;
  unhelpful: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema(
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
    orderId: { 
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Order'
    },
    rating: { 
      type: Number, 
      required: true,
      min: 1,
      max: 5,
      index: true
    },
    comment: { 
      type: String, 
      required: true 
    },
    isVerifiedPurchase: { 
      type: Boolean, 
      default: true,
      index: true
    },
    helpful: { 
      type: Number, 
      default: 0 
    },
    unhelpful: { 
      type: Number, 
      default: 0 
    },
  },
  { timestamps: true }
);

// Indexes for fast queries
ReviewSchema.index({ productId: 1, rating: 1 });
ReviewSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
