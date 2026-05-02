import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { withAuth } from '@/lib/middleware';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { isUuid } from '@/lib/supabase-mappers';

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

type SettingsPayload = {
  email: { smtpServer: string; smtpPort: number; fromAddress: string };
  notifications: { emailNotifications: boolean; pushNotifications: boolean; weeklyReports: boolean };
  security: { sessionTimeout: number; passwordExpiry: number; allowedIPs: string };
  backup: { autoBackup: boolean; lastBackup: string };
  maintenance: { maintenanceMode: boolean };
  system: { version: string; environment: string; status: string; uptime: string };
};

const defaultSettings: SettingsPayload = {
  email: { smtpServer: '', smtpPort: 587, fromAddress: '' },
  notifications: { emailNotifications: true, pushNotifications: true, weeklyReports: false },
  security: { sessionTimeout: 60, passwordExpiry: 90, allowedIPs: '' },
  backup: { autoBackup: true, lastBackup: new Date().toISOString() },
  maintenance: { maintenanceMode: false },
  system: { version: '0.1.0', environment: 'development', status: 'operational', uptime: '0d' },
};

async function getOrCreateSettings(): Promise<SettingsPayload> {
  const { data, error } = await supabaseAdmin
    .from('system_settings')
    .select('id, payload')
    .eq('key', 'global')
    .maybeSingle();

  if (error) {
    throw new Error(`settings lookup failed: ${error.message}`);
  }

  if (data?.payload) {
    return {
      ...defaultSettings,
      ...(data.payload as Partial<SettingsPayload>),
    };
  }

  const { error: insertError } = await supabaseAdmin.from('system_settings').insert({
    key: 'global',
    payload: defaultSettings,
  });
  if (insertError) {
    throw new Error(`settings create failed: ${insertError.message}`);
  }

  return defaultSettings;
}

async function writeAudit(req: NextRequest, userId: string, action: 'read' | 'update') {
  if (!isUuid(userId)) return;
  await supabaseAdmin.from('audit_logs').insert({
    user_id: userId,
    action,
    resource: 'settings',
    details: {},
    ip_address:
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      null,
    user_agent: req.headers.get('user-agent') || null,
  });
}

export async function GET(req: NextRequest) {
  return withAuth(
    req,
    async (_request, auth) => {
      try {
        const settings = await getOrCreateSettings();
        await writeAudit(req, auth.userId, 'read');
        return NextResponse.json({ settings });
      } catch (error) {
        return NextResponse.json(
          {
            error: 'Failed to retrieve settings',
            detail:
              error instanceof Error
                ? error.message
                : 'unknown error',
          },
          { status: 500 }
        );
      }
    },
    ['admin']
  );
}

export async function POST(req: NextRequest) {
  return withAuth(
    req,
    async (_request, auth) => {
      try {
        const body = await req.json();
        const validation = SettingsUpdateSchema.safeParse(body);

        if (!validation.success) {
          const errors = validation.error.issues.map((err: z.ZodIssue) => ({
            path: err.path.join('.'),
            message: err.message,
          }));
          return NextResponse.json({ error: 'Invalid settings data', errors }, { status: 400 });
        }

        const current = await getOrCreateSettings();
        const updates = validation.data;
        const merged: SettingsPayload = {
          ...current,
          email: { ...current.email, ...(updates.email ?? {}) },
          notifications: { ...current.notifications, ...(updates.notifications ?? {}) },
          security: { ...current.security, ...(updates.security ?? {}) },
          backup: { ...current.backup, ...(updates.backup ?? {}) },
          maintenance: { ...current.maintenance, ...(updates.maintenance ?? {}) },
          system: { ...current.system, ...(updates.system ?? {}) },
        };

        const { error } = await supabaseAdmin
          .from('system_settings')
          .update({ payload: merged })
          .eq('key', 'global');
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }

        await writeAudit(req, auth.userId, 'update');
        return NextResponse.json({ message: 'Settings updated successfully', settings: merged });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return NextResponse.json({ error: 'Validation failed', issues: error.issues }, { status: 400 });
        }
        return NextResponse.json(
          {
            error: 'Failed to update settings',
            detail:
              error instanceof Error
                ? error.message
                : 'unknown error',
          },
          { status: 500 }
        );
      }
    },
    ['admin']
  );
}
