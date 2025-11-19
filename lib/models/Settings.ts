import mongoose, { Document, Schema } from 'mongoose';

export interface ISettings extends Document {
  platformName: string;
  platformEmail: string;
  platformPhone: string;
  serviceFee: number;
  minDeposit: number;
  maxDeposit: number;
  minWithdraw: number;
  maxWithdraw: number;
  withdrawFee: number;
  promoCode: string;
  promoDiscount: number;
  promoMinAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

const SettingsSchema: Schema = new Schema({
  platformName: {
    type: String,
    required: true,
    default: 'HH-SHOPEE'
  },
  platformEmail: {
    type: String,
    required: true,
    default: 'support@hhshopee.vn'
  },
  platformPhone: {
    type: String,
    required: true,
    default: '0123456789'
  },
  serviceFee: {
    type: Number,
    required: true,
    default: 2,
    min: 0,
    max: 100
  },
  minDeposit: {
    type: Number,
    required: true,
    default: 10000,
    min: 0
  },
  maxDeposit: {
    type: Number,
    required: true,
    default: 50000000,
    min: 0
  },
  minWithdraw: {
    type: Number,
    required: true,
    default: 50000,
    min: 0
  },
  maxWithdraw: {
    type: Number,
    required: true,
    default: 20000000,
    min: 0
  },
  withdrawFee: {
    type: Number,
    required: true,
    default: 1,
    min: 0,
    max: 100
  },
  promoCode: {
    type: String,
    required: true,
    default: 'WELCOME2024'
  },
  promoDiscount: {
    type: Number,
    required: true,
    default: 10,
    min: 0,
    max: 100
  },
  promoMinAmount: {
    type: Number,
    required: true,
    default: 100000,
    min: 0
  }
}, {
  timestamps: true,
  collection: 'settings'
});

// Chỉ cho phép một document settings duy nhất
SettingsSchema.pre('save', async function(next) {
  const count = await mongoose.models.Settings?.countDocuments() || 0;
  if (count > 0 && !this.isNew) {
    next();
  } else if (count > 0 && this.isNew) {
    const error = new Error('Only one settings document is allowed');
    next(error);
  } else {
    next();
  }
});

export default mongoose.models.Settings || mongoose.model<ISettings>('Settings', SettingsSchema);