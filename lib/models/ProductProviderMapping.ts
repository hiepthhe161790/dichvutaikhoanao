import mongoose, { Schema, Document } from 'mongoose';

/**
 * Mapping giữa sản phẩm nội bộ và sản phẩm của provider ngoài.
 * Một sản phẩm nội bộ có thể có nhiều provider với priority khác nhau.
 * Khi hết hàng nội bộ, hệ thống thử từng provider theo thứ tự priority (thấp = ưu tiên cao hơn).
 */
export interface IProductProviderMapping extends Document {
  localProductId: mongoose.Types.ObjectId;   // ref: Product
  providerId: mongoose.Types.ObjectId;        // ref: Provider
  externalProductId: string;                  // ID sản phẩm bên provider

  /**
   * Thứ tự ưu tiên: 1 = thử trước, 2 = dự phòng, v.v.
   * Cho phép cấu hình nhiều provider backup cho cùng 1 sản phẩm.
   */
  priority: number;
  isActive: boolean;

  // Thống kê
  totalPurchased: number;
  totalFailed: number;
  lastUsedAt?: Date;
  lastError?: string;

  createdAt: Date;
  updatedAt: Date;
}

const ProductProviderMappingSchema: Schema = new Schema(
  {
    localProductId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Product',
      index: true,
    },
    providerId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Provider',
      index: true,
    },
    externalProductId: { type: String, required: true },

    priority: { type: Number, default: 1, min: 1 },
    isActive: { type: Boolean, default: true, index: true },

    totalPurchased: { type: Number, default: 0 },
    totalFailed:    { type: Number, default: 0 },
    lastUsedAt:     { type: Date },
    lastError:      { type: String },
  },
  { timestamps: true }
);

// Đảm bảo không có 2 mapping trùng (1 sản phẩm - 1 provider)
ProductProviderMappingSchema.index(
  { localProductId: 1, providerId: 1 },
  { unique: true }
);

// Query nhanh: tìm providers cho 1 sản phẩm, sort theo priority
ProductProviderMappingSchema.index({ localProductId: 1, isActive: 1, priority: 1 });

export default mongoose.models.ProductProviderMapping ||
  mongoose.model<IProductProviderMapping>(
    'ProductProviderMapping',
    ProductProviderMappingSchema
  );
