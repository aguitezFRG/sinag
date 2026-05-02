-- ============================================================
-- 03_advisers.sql
-- Adds the adviser_id FK back to students after this table exists.
-- ============================================================

CREATE TABLE advisers (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id          UUID        NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    specialization   TEXT[]      NOT NULL DEFAULT '{}',
    max_students     INTEGER     NOT NULL DEFAULT 10,
    current_students INTEGER     NOT NULL DEFAULT 0,
    department       TEXT        NOT NULL,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT advisers_max_students_positive  CHECK (max_students > 0),
    CONSTRAINT advisers_current_students_check CHECK (current_students >= 0)
);

CREATE INDEX advisers_user_id_idx    ON advisers (user_id);
CREATE INDEX advisers_department_idx ON advisers (department);

-- Resolve forward FK from students (02_students.sql created the column without the constraint)
ALTER TABLE students
    ADD CONSTRAINT students_adviser_id_fkey
    FOREIGN KEY (adviser_id) REFERENCES advisers(id) ON DELETE SET NULL;
