-- ============================================================
-- 01_users.sql
-- ============================================================

CREATE TABLE users (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    email           TEXT        NOT NULL UNIQUE,
    password_hash   TEXT        NOT NULL,
    role            user_role   NOT NULL,
    first_name      TEXT        NOT NULL,
    last_name       TEXT        NOT NULL,
    avatar          TEXT,
    is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enforce lowercase email at DB level
CREATE UNIQUE INDEX users_email_lower_idx ON users (lower(email));

-- Lookup by role (dashboard filters)
CREATE INDEX users_role_idx ON users (role);

-- Lookup by active status
CREATE INDEX users_is_active_idx ON users (is_active);
