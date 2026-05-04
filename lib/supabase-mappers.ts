/**
 * Supabase data type definitions and mapper functions.
 * These keep the route handlers decoupled from raw database row shapes.
 */

export type UserRole = 'student' | 'adviser' | 'coordinator' | 'admin';

export interface UserRow {
  id: string;
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  avatar: string | null;
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
}

export interface LegacyUser {
  _id: string;
  email: string;
  role: UserRole;
  profile: {
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
  isActive?: boolean;
  createdAt?: string;
  lastLoginAt?: string | null;
}

export interface FrontendUser {
  id: string;
  email: string;
  role: UserRole;
  profile: {
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_RE.test(value);
}

export function toLegacyUser(row: UserRow): LegacyUser {
  return {
    _id: row.id,
    email: row.email,
    role: row.role,
    profile: {
      firstName: row.first_name,
      lastName: row.last_name,
      avatar: row.avatar,
    },
    isActive: row.is_active,
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at,
  };
}

export function toFrontendUser(row: UserRow): FrontendUser {
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    profile: {
      firstName: row.first_name,
      lastName: row.last_name,
      avatar: row.avatar,
    },
  };
}
