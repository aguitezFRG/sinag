-- Add a stored tsvector column for weighted full-text search across title, tags, and content.
-- Title carries the highest weight (A), tags intermediate (B), content lowest (C).
-- The GIN index makes PostgREST .textSearch() fast even on large resource tables.

ALTER TABLE guidance_resources
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(array_to_string(tags, ' '), '')), 'B') ||
    setweight(to_tsvector('english', coalesce(content, '')), 'C')
  ) STORED;

CREATE INDEX IF NOT EXISTS guidance_resources_search_vector_idx
  ON guidance_resources USING GIN(search_vector);
