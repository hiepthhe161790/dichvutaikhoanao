import mongoose, { Schema, Document } from 'mongoose';

/**
 * Log mọi giao dịch với API ngoài.
 * Dùng để debug, đối soát, và theo dõi chi tiết từng request.
 */
export interface IExternalOrderLog extends Document {
  localOrderId?: mongoose.Types.ObjectId;  // Đơn hàng tương ứng trong hệ thống (sau khi tạo thành công)
  providerId: mongoose.Types.ObjectId;
  mappingId: mongoose.Types.ObjectId;      // ref: ProductProviderMapping
  externalProductId: string;
  quantity: number;

  status: 'success' | 'failed' | 'pending';
  externalOrderId?: string;               // trans_id từ provider
  parsedAccounts?: Array<{
    username: string;
    password: string;
    email?: string;
    [key: string]: string | undefined;
  }>;

  // Debug data — lưu nguyên để có thể replay hoặc audit
  rawRequest: mongoose.Schema.Types.Mixed;   // Params/body đã gửi
  rawResponse: mongoose.Schema.Types.Mixed;  // Response gốc từ provider
  errorMessage?: string;
  durationMs: number;                        // Thời gian request (ms)

  createdAt: Date;
}

const ExternalOrderLogSchema: Schema = new Schema(
  {
    localOrderId: { type: Schema.Types.ObjectId, ref: 'Order', index: true },
    providerId:   { type: Schema.Types.ObjectId, ref: 'Provider', required: true, index: true },
    mappingId:    { type: Schema.Types.ObjectId, ref: 'ProductProviderMapping', required: true },
    externalProductId: { type: String, required: true },
    quantity: { type: Number, required: true },

    status: {
      type: String,
      enum: ['success', 'failed', 'pending'],
      default: 'pending',
      index: true,
    },
    externalOrderId: { type: String, index: true },
    parsedAccounts: [{ type: Schema.Types.Mixed }],

    rawRequest:   { type: Schema.Types.Mixed },
    rawResponse:  { type: Schema.Types.Mixed },
    errorMessage: { type: String },
    durationMs:   { type: Number, default: 0 },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Chỉ createdAt, không cần updatedAt
  }
);

// Query nhanh: lấy log theo provider + thời gian
ExternalOrderLogSchema.index({ providerId: 1, createdAt: -1 });
ExternalOrderLogSchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.ExternalOrderLog ||
  mongoose.model<IExternalOrderLog>('ExternalOrderLog', ExternalOrderLogSchema);
