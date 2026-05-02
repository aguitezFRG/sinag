-- ============================================================
-- 13_system_settings.sql
-- Stores global JSON settings managed by /api/admin/settings
-- ============================================================

CREATE TABLE IF NOT EXISTS system_settings (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    key        TEXT        NOT NULL UNIQUE,
    payload    JSONB       NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS system_settings_key_idx ON system_settings (key);
CREATE INDEX IF NOT EXISTS system_settings_payload_idx ON system_settings USING GIN (payload);
