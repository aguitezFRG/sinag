import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
}

if (!supabaseServiceRoleKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY fallback)');
}

function decodeJwtPayload(token: string): { role?: string } | null {
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf8');
    return JSON.parse(payloadJson);
  } catch {
    return null;
  }
}

const keyPayload = decodeJwtPayload(supabaseServiceRoleKey);
if (keyPayload?.role && keyPayload.role !== 'service_role') {
  throw new Error(
    `Invalid Supabase admin key role "${keyPayload.role}". Expected service_role key for server APIs.`
  );
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export const DOCUMENTS_BUCKET = process.env.SUPABASE_DOCS_BUCKET || 'documents-private';

export async function getGuidanceSignedUrl(
  filePath: string,
  expiresInSeconds = 3600
): Promise<string | null> {
  const { data, error } = await supabaseAdmin.storage
    .from(DOCUMENTS_BUCKET)
    .createSignedUrl(filePath, expiresInSeconds);
  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}
