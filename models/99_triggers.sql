-- ============================================================
-- 99_triggers.sql
-- Shared updated_at trigger applied to all mutable tables.
-- Run LAST after all table DDL.
-- Excluded: document_versions, ai_query_sources, audit_logs (immutable/append-only).
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_advisers_updated_at
    BEFORE UPDATE ON advisers
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_workflows_updated_at
    BEFORE UPDATE ON workflows
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_workflow_stages_updated_at
    BEFORE UPDATE ON workflow_stages
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_ai_queries_updated_at
    BEFORE UPDATE ON ai_queries
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_guidance_resources_updated_at
    BEFORE UPDATE ON guidance_resources
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
