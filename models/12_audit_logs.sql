-- ============================================================
-- 12_audit_logs.sql
-- Append-only audit trail — no updated_at, no update trigger.
-- user_id is SET NULL on user delete to preserve audit history.
-- ============================================================

CREATE TABLE audit_logs (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID         REFERENCES users(id) ON DELETE SET NULL,
    action      audit_action NOT NULL,
    resource    TEXT         NOT NULL,
    resource_id UUID,
    details     JSONB        NOT NULL DEFAULT '{}',
    ip_address  TEXT,
    user_agent  TEXT,
    timestamp   TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- Primary query patterns: by time, by user+time, by resource
CREATE INDEX audit_logs_timestamp_idx    ON audit_logs (timestamp DESC);
CREATE INDEX audit_logs_user_id_time_idx ON audit_logs (user_id, timestamp DESC);
CREATE INDEX audit_logs_resource_idx     ON audit_logs (resource, timestamp DESC);
CREATE INDEX audit_logs_action_idx       ON audit_logs (action);
CREATE INDEX audit_logs_details_idx      ON audit_logs USING GIN (details);
