-- ============================================================
-- 14_session_ratings.sql
-- ============================================================
-- Stores end-of-session user ratings submitted via the chat
-- interface. One row per unique session_id.

CREATE TABLE session_ratings (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id    TEXT        NOT NULL UNIQUE,
    user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_role     user_role   NOT NULL,
    rating        SMALLINT    NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback      TEXT,
    message_count INTEGER     NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX session_ratings_user_id_idx     ON session_ratings (user_id);
CREATE INDEX session_ratings_created_at_idx  ON session_ratings (created_at DESC);
CREATE INDEX session_ratings_rating_idx      ON session_ratings (rating);
CREATE INDEX session_ratings_role_idx        ON session_ratings (user_role);
