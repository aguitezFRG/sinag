-- ============================================================
-- 10_guidance_resources.sql
-- ============================================================

CREATE TABLE guidance_resources (
    id         UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
    title      TEXT              NOT NULL,
    category   guidance_category NOT NULL,
    content    TEXT              NOT NULL,
    file_url   TEXT,
    tags       TEXT[]            NOT NULL DEFAULT '{}',
    program    TEXT,
    is_active  BOOLEAN           NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ       NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ       NOT NULL DEFAULT now()
);

CREATE INDEX guidance_resources_category_idx  ON guidance_resources (category);
CREATE INDEX guidance_resources_program_idx   ON guidance_resources (program);
CREATE INDEX guidance_resources_is_active_idx ON guidance_resources (is_active);
CREATE INDEX guidance_resources_tags_idx      ON guidance_resources USING GIN (tags);

-- Full-text search on title + content
CREATE INDEX guidance_resources_fts_idx ON guidance_resources
    USING GIN (to_tsvector('english', title || ' ' || content));
