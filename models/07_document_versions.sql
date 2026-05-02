-- ============================================================
-- 07_document_versions.sql
-- Normalized from Mongoose embedded DocumentVersion[].
-- Immutable records — no updated_at, no update trigger.
-- ============================================================

CREATE TABLE document_versions (
    id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id    UUID        NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    version_number INTEGER     NOT NULL,
    file_url       TEXT        NOT NULL,
    uploaded_by    UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    uploaded_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    change_log     TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT document_versions_number_positive CHECK (version_number > 0),
    UNIQUE (document_id, version_number)
);

CREATE INDEX document_versions_document_id_idx ON document_versions (document_id);
CREATE INDEX document_versions_uploaded_by_idx ON document_versions (uploaded_by);
CREATE INDEX document_versions_uploaded_at_idx ON document_versions (uploaded_at DESC);
