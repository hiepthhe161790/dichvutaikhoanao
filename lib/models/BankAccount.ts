import mongoose, { Document, Schema } from 'mongoose';

export interface IBankAccount extends Document {
  bankCode: string;      // VietQR bank code (e.g., "vietinbank", "vcb", "acb")
  bankName: string;      // Display name (e.g., "Vietinbank", "Vietcombank")
  accountNumber: string; // Bank account number
  accountName: string;   // Account holder name
  isActive: boolean;     // Whether this account is active for receiving payments
  displayOrder: number;  // Order to display in UI
  note?: string;         // Optional note for admin
  createdAt: Date;
  updatedAt: Date;
}

const BankAccountSchema = new Schema<IBankAccount>(
  {
    bankCode: {
      type: String,
      required: true,
      trim: true,
    },
    bankName: {
      type: String,
      required: true,
      trim: true,
    },
    accountNumber: {
      type: String,
      required: true,
      trim: true,
    },
    accountName: {
      type: String,
      required: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
      index: true,
    },
    note: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

BankAccountSchema.index({ isActive: 1, displayOrder: 1 });

export default mongoose.models.BankAccount ||
  mongoose.model<IBankAccount>('BankAccount', BankAccountSchema);
