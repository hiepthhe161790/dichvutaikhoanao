import mongoose, { Schema, Document } from 'mongoose';

export type SupportStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type SupportPriority = 'low' | 'medium' | 'high' | 'urgent';
export type SupportCategory = 'general' | 'payment' | 'technical' | 'account' | 'other';

export interface ISupportTicket extends Document {
  userId: mongoose.Types.ObjectId;
  subject: string;
  category: SupportCategory;
  priority: SupportPriority;
  status: SupportStatus;
  messages: ISupportMessage[];
  assignedTo?: mongoose.Types.ObjectId; // Admin user ID
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  closedAt?: Date;
}

export interface ISupportMessage {
  _id?: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  senderType: 'user' | 'admin';
  message: string;
  attachments?: string[]; // File URLs
  createdAt: Date;
  isRead: boolean;
}

const SupportMessageSchema = new Schema({
  senderId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  senderType: { type: String, required: true, enum: ['user', 'admin'] },
  message: { type: String, required: true },
  attachments: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false },
});

const SupportTicketSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    category: {
      type: String,
      required: true,
      enum: ['general', 'payment', 'technical', 'account', 'other'],
      default: 'general'
    },
    priority: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    status: {
      type: String,
      required: true,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
      index: true
    },
    messages: [SupportMessageSchema],
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true
    },
    resolvedAt: { type: Date },
    closedAt: { type: Date },
  },
  { timestamps: true }
);

// Indexes for performance
SupportTicketSchema.index({ userId: 1, status: 1 });
SupportTicketSchema.index({ status: 1, priority: 1 });
SupportTicketSchema.index({ assignedTo: 1, status: 1 });
SupportTicketSchema.index({ createdAt: -1 });
SupportTicketSchema.index({ updatedAt: -1 });

export default mongoose.models.SupportTicket || mongoose.model<ISupportTicket>('SupportTicket', SupportTicketSchema);