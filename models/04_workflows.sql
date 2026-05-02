-- ============================================================
-- 04_workflows.sql
-- ============================================================

CREATE TABLE workflows (
    id            UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id    UUID            NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    adviser_id    UUID            NOT NULL REFERENCES advisers(id) ON DELETE RESTRICT,
    title         TEXT            NOT NULL,
    status        workflow_status NOT NULL DEFAULT 'active',
    current_stage TEXT            NOT NULL DEFAULT 'Topic Selection',
    created_at    TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE INDEX workflows_student_id_idx ON workflows (student_id);
CREATE INDEX workflows_adviser_id_idx ON workflows (adviser_id);
CREATE INDEX workflows_status_idx     ON workflows (status);
CREATE INDEX workflows_created_at_idx ON workflows (created_at DESC);
