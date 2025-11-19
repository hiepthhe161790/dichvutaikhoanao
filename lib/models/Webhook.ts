import mongoose, { Document, Schema } from 'mongoose';

export interface IWebhookData {
  accountNumber: string;
  amount: number;
  description: string;
  reference: string;
  transactionDateTime: string;
  virtualAccountNumber?: string;
  counterAccountBankId?: string;
  counterAccountBankName?: string;
  counterAccountName?: string;
  counterAccountNumber?: string;
  virtualAccountName?: string;
  currency?: string;
  orderCode?: number;
  paymentLinkId?: string;
  code?: string;
  desc?: string;
  signature?: string;
}

export interface IWebhook extends Document {
  _id: mongoose.Types.ObjectId;
  code: string;
  desc: string;
  success: boolean;
  data: IWebhookData;
  createdAt: Date;
  updatedAt: Date;
}

const WebhookDataSchema = new Schema<IWebhookData>({
  accountNumber: { type: String, required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  reference: { type: String, required: true },
  transactionDateTime: { type: String, required: true },
  virtualAccountNumber: { type: String, default: '' },
  counterAccountBankId: { type: String, default: '' },
  counterAccountBankName: { type: String, default: '' },
  counterAccountName: { type: String, default: '' },
  counterAccountNumber: { type: String, default: '' },
  virtualAccountName: { type: String, default: '' },
  currency: { type: String, default: 'VND' },
  orderCode: { type: Number },
  paymentLinkId: { type: String },
  code: { type: String, default: '00' },
  desc: { type: String, default: 'success' },
  signature: { type: String }
});

const WebhookSchema = new Schema<IWebhook>({
  code: { type: String, required: true, default: '00' },
  desc: { type: String, required: true, default: 'success' },
  success: { type: Boolean, required: true, default: true },
  data: { type: WebhookDataSchema, required: true }
}, {
  timestamps: true
});

export default mongoose.models.Webhook || mongoose.model<IWebhook>('Webhook', WebhookSchema);