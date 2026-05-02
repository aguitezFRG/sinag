-- ============================================================
-- 08_ai_queries.sql
-- ============================================================

CREATE TABLE ai_queries (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_id TEXT        NOT NULL,
    query      TEXT        NOT NULL,
    response   TEXT        NOT NULL,
    intent     TEXT        NOT NULL,
    is_flagged BOOLEAN     NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ai_queries_user_id_idx    ON ai_queries (user_id);
CREATE INDEX ai_queries_session_id_idx ON ai_queries (session_id);
CREATE INDEX ai_queries_intent_idx     ON ai_queries (intent);
CREATE INDEX ai_queries_is_flagged_idx ON ai_queries (is_flagged) WHERE is_flagged = TRUE;
CREATE INDEX ai_queries_created_at_idx ON ai_queries (created_at DESC);
