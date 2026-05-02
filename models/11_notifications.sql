-- ============================================================
-- 11_notifications.sql
-- ============================================================

CREATE TABLE notifications (
    id           UUID                   PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID                   NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type         notification_type      NOT NULL,
    title        TEXT                   NOT NULL,
    message      TEXT                   NOT NULL,
    related_id   UUID,
    related_type TEXT,
    is_read      BOOLEAN                NOT NULL DEFAULT FALSE,
    sent_via     notification_channel[] NOT NULL DEFAULT '{}',
    created_at   TIMESTAMPTZ            NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ            NOT NULL DEFAULT now()
);

CREATE INDEX notifications_user_id_idx    ON notifications (user_id);
CREATE INDEX notifications_type_idx       ON notifications (type);
CREATE INDEX notifications_is_read_idx    ON notifications (user_id, is_read);
CREATE INDEX notifications_created_at_idx ON notifications (created_at DESC);
