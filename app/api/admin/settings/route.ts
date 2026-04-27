import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/lib/middleware';
import { systemSettings, auditLogs } from '@/lib/dummy-data';

// Zod schemas for settings validation
const EmailSettingsSchema = z.object({
  smtpServer: z.string().optional(),
  smtpPort: z.number().min(1).max(65535).optional(),
  fromAddress: z.string().email().optional(),
});

const NotificationsSettingsSchema = z.object({
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  weeklyReports: z.boolean().optional(),
});

const SecuritySettingsSchema = z.object({
  sessionTimeout: z.number().min(5).max(480).optional(),
  passwordExpiry: z.number().min(0).max(365).optional(),
  allowedIPs: z.string().optional(),
});

const BackupSettingsSchema = z.object({
  autoBackup: z.boolean().optional(),
  lastBackup: z.string().datetime().optional(),
});

const MaintenanceSettingsSchema = z.object({
  maintenanceMode: z.boolean().optional(),
});

const SystemSettingsSchema = z.object({
  version: z.string().optional(),
  environment: z.string().optional(),
  status: z.string().optional(),
  uptime: z.string().optional(),
});

const SettingsUpdateSchema = z.object({
  email: EmailSettingsSchema.optional(),
  notifications: NotificationsSettingsSchema.optional(),
  security: SecuritySettingsSchema.optional(),
  backup: BackupSettingsSchema.optional(),
  maintenance: MaintenanceSettingsSchema.optional(),
  system: SystemSettingsSchema.optional(),
});

export type SettingsUpdateInput = z.infer<typeof SettingsUpdateSchema>;

type AuditLogEntry = {
  _id: string;
  userId: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'login' | 'logout' | 'ai_query';
  resource: string;
  resourceId: string;
  details: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
};

/**
 * GET /api/admin/settings
 * Returns current system settings
 * Admin only
 */
export async function GET(req: NextRequest) {
  return withAuth(
    req,
    async (req, auth) => {
      try {
        // Create audit log entry
        const auditEntry: AuditLogEntry = {
          _id: `al-${Date.now()}`,
          userId: auth.userId,
          action: 'read',
          resource: 'settings',
          resourceId: '',
          details: {},
          ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
          userAgent: req.headers.get('user-agent') || 'unknown',
          timestamp: new Date().toISOString(),
        };
        auditLogs.push(auditEntry as (typeof auditLogs)[0]);

        return NextResponse.json({ settings: systemSettings });
      } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json(
          { error: 'Failed to retrieve settings' },
          { status: 500 }
        );
      }
    },
    ['admin']
  );
}

/**
 * POST /api/admin/settings
 * Updates system settings (partial or full update)
 * Admin only
 */
export async function POST(req: NextRequest) {
  return withAuth(
    req,
    async (req, auth) => {
      try {
        const body = await req.json();

        // Validate input with zod
        const validationResult = SettingsUpdateSchema.safeParse(body);

        if (!validationResult.success) {
          const errors = validationResult.error.issues.map((err: z.ZodIssue) => ({
            path: err.path.join('.'),
            message: err.message,
          }));
          return NextResponse.json(
            { error: 'Invalid settings data', errors },
            { status: 400 }
          );
        }

        const updates = validationResult.data;

        // Merge updates with existing settings
        if (updates.email) {
          systemSettings.email = { ...systemSettings.email, ...updates.email };
        }
        if (updates.notifications) {
          systemSettings.notifications = { ...systemSettings.notifications, ...updates.notifications };
        }
        if (updates.security) {
          systemSettings.security = { ...systemSettings.security, ...updates.security };
        }
        if (updates.backup) {
          systemSettings.backup = { ...systemSettings.backup, ...updates.backup };
        }
        if (updates.maintenance) {
          systemSettings.maintenance = { ...systemSettings.maintenance, ...updates.maintenance };
        }
        if (updates.system) {
          systemSettings.system = { ...systemSettings.system, ...updates.system };
        }

        // Create audit log entry
        const auditEntry: AuditLogEntry = {
          _id: `al-${Date.now()}`,
          userId: auth.userId,
          action: 'update',
          resource: 'settings',
          resourceId: '',
          details: {},
          ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
          userAgent: req.headers.get('user-agent') || 'unknown',
          timestamp: new Date().toISOString(),
        };
        auditLogs.push(auditEntry as (typeof auditLogs)[0]);

        return NextResponse.json({
          message: 'Settings updated successfully',
          settings: systemSettings,
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return NextResponse.json(
            { error: 'Validation failed', issues: error.issues },
            { status: 400 }
          );
        }
        console.error('Error updating settings:', error);
        return NextResponse.json(
          { error: 'Failed to update settings' },
          { status: 500 }
        );
      }
    },
    ['admin']
  );
}
