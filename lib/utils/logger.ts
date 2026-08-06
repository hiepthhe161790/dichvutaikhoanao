import { connectDB } from '@/lib/db';
import AuditLog from '@/lib/models/AuditLog';

interface AuditLogChanges {
  field: string;
  oldValue: any;
  newValue: any;
}

interface LogActionParams {
  action: string;
  actor: string;
  actorRole: 'admin' | 'customer' | 'system';
  target: 'product' | 'account' | 'user' | 'order' | 'transaction';
  targetId: string;
  changes?: AuditLogChanges[];
  ipAddress?: string;
  userAgent?: string;
  status?: 'success' | 'failed';
}

/**
 * Helper to write a system audit log to MongoDB.
 * Fail-safe: catches errors to avoid blocking core business logic.
 */
export async function logAction(params: LogActionParams): Promise<boolean> {
  try {
    await connectDB();

    const log = new AuditLog({
      action: params.action,
      actor: params.actor,
      actorRole: params.actorRole,
      target: params.target,
      targetId: params.targetId,
      changes: params.changes || [],
      ipAddress: params.ipAddress || '',
      userAgent: params.userAgent || '',
      status: params.status || 'success',
      createdAt: new Date(),
    });

    await log.save();
    return true;
  } catch (error) {
    console.error('[AuditLog] Failed to write audit log:', error);
    return false;
  }
}
