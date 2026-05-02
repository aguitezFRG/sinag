-- ============================================================
-- 05_workflow_stages.sql
-- Normalized from Mongoose embedded WorkflowStage[].
-- ============================================================

CREATE TABLE workflow_stages (
    id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id  UUID         NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    name         TEXT         NOT NULL,
    stage_order  INTEGER      NOT NULL,
    status       stage_status NOT NULL DEFAULT 'pending',
    due_date     TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    feedback     TEXT,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT workflow_stages_order_positive CHECK (stage_order > 0),
    UNIQUE (workflow_id, stage_order)
);

CREATE INDEX workflow_stages_workflow_id_idx ON workflow_stages (workflow_id);
CREATE INDEX workflow_stages_status_idx      ON workflow_stages (status);
CREATE INDEX workflow_stages_due_date_idx    ON workflow_stages (due_date);
