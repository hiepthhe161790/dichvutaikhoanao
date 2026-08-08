import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  userId: mongoose.Types.ObjectId;
  email: string;
  role: 'customer' | 'admin' | 'seller' | 'staff';
  action: 'create' | 'update' | 'delete' | 'send_email' | 'other';
  resource: 'service_order' | 'account' | 'product' | 'settings' | 'user';
  resourceId?: string;
  description: string;
  ipAddress?: string;
  createdAt: Date;
}

const AuditLogSchema: Schema = new Schema(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true
    },
    email: { 
      type: String, 
      required: true,
      index: true
    },
    role: { 
      type: String, 
      enum: ['customer', 'admin', 'seller', 'staff'], 
      required: true,
      index: true
    },
    action: { 
      type: String, 
      enum: ['create', 'update', 'delete', 'send_email', 'other'], 
      required: true,
      index: true
    },
    resource: { 
      type: String, 
      enum: ['service_order', 'account', 'product', 'settings', 'user'], 
      required: true,
      index: true
    },
    resourceId: { 
      type: String,
      index: true
    },
    description: { 
      type: String, 
      required: true 
    },
    ipAddress: { 
      type: String 
    }
  },
  { 
    timestamps: { createdAt: true, updatedAt: false } 
  }
);

// Tránh lỗi overwrite model khi Next.js reload ở chế độ dev
const AuditLog = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
export default AuditLog;
