-- ============================================================
-- 06_documents.sql
-- workflow_stage_id replaces the Mongoose documents[] array on WorkflowStage.
-- ============================================================

CREATE TABLE documents (
    id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    title             TEXT          NOT NULL,
    type              document_type NOT NULL,
    owner_id          UUID          NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    workflow_id       UUID          REFERENCES workflows(id) ON DELETE SET NULL,
    workflow_stage_id UUID          REFERENCES workflow_stages(id) ON DELETE SET NULL,
    is_public         BOOLEAN       NOT NULL DEFAULT FALSE,
    tags              TEXT[]        NOT NULL DEFAULT '{}',
    created_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ   NOT NULL DEFAULT now()
);

CREATE INDEX documents_owner_id_idx          ON documents (owner_id);
CREATE INDEX documents_workflow_id_idx       ON documents (workflow_id);
CREATE INDEX documents_workflow_stage_id_idx ON documents (workflow_stage_id);
CREATE INDEX documents_type_idx              ON documents (type);
CREATE INDEX documents_is_public_idx         ON documents (is_public);
CREATE INDEX documents_tags_idx              ON documents USING GIN (tags);
CREATE INDEX documents_created_at_idx        ON documents (created_at DESC);
