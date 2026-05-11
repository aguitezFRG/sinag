import { z } from 'zod';

export type UserRole = 'student' | 'adviser' | 'coordinator' | 'admin';

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export type UserRow = {
  id: string;
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  avatar: string | null;
  is_active: boolean;
  created_at: string;
  last_login_at: string | null;
};

export function toLegacyUser(user: UserRow) {
  return {
    id: user.id,
    _id: user.id,
    email: user.email,
    role: user.role,
    profile: {
      firstName: user.first_name,
      lastName: user.last_name,
      avatar: user.avatar ?? '',
    },
    isActive: user.is_active,
    createdAt: user.created_at,
    lastLoginAt: user.last_login_at ?? undefined,
  };
}

/**
 * Flatten a ZodError into a single human-readable string.
 * Example output: "email: Invalid email; password: Must be at least 8 characters"
 */
export function formatZodError(error: z.ZodError): string {
  return error.issues.map((issue) => `${issue.path.join('.') || 'input'}: ${issue.message}`).join('; ');
}
