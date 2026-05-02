-- ============================================================
-- 09_ai_query_sources.sql
-- Normalized from Mongoose embedded sources[]{title,type,url}.
-- Immutable records — no updated_at, no update trigger.
-- ============================================================

CREATE TABLE ai_query_sources (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    ai_query_id UUID        NOT NULL REFERENCES ai_queries(id) ON DELETE CASCADE,
    title       TEXT,
    source_type TEXT,
    url         TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ai_query_sources_ai_query_id_idx ON ai_query_sources (ai_query_id);
