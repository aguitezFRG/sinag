import { AuditLog } from './models';

export async function logAudit(data: {
  userId?: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout' | 'ai_query';
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}) {
  try {
    await AuditLog.create({
      ...data,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error('Audit log error:', err);
  }
}
