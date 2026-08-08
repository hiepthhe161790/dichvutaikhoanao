import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  phone: string;
  fullName: string;
  password: string;
  avatar?: string;
  role: 'customer' | 'admin' | 'seller' | 'staff';
  status: 'active' | 'blocked' | 'pending';
  balance: number;
  bonusPercentage: number; // Current bonus tier percentage
  totalPurchased: number;
  totalSpent: number;
  apiKey?: string;
  apiEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: { 
      type: String, 
      required: true, 
      unique: true,
      lowercase: true,
      index: true
    },
    phone: { 
      type: String, 
      required: true, 
      unique: true,
      index: true 
    },
    fullName: { 
      type: String, 
      required: true 
    },
    password: { 
      type: String, 
      required: true 
    },
    avatar: { type: String },
    role: { 
      type: String, 
      enum: ['customer', 'admin', 'seller', 'staff'],
      default: 'customer',
      index: true
    },
    status: { 
      type: String, 
      enum: ['active', 'blocked', 'pending'],
      default: 'active',
      index: true
    },
    balance: { 
      type: Number, 
      default: 0 
    },
    bonusPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100 // Allow admin to set up to 100% promotion
    },
    totalPurchased: { 
      type: Number, 
      default: 0 
    },
    totalSpent: { 
      type: Number, 
      default: 0 
    },
    apiKey: {
      type: String,
      unique: true,
      sparse: true,
      select: false // Do not return API key in default queries for security
    },
    apiEnabled: {
      type: Boolean,
      default: true
    },
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
