-- ============================================================
-- 02_students.sql
-- adviser_id FK is added by 03_advisers.sql via ALTER TABLE
-- to resolve the circular dependency with advisers.
-- ============================================================

CREATE TABLE students (
    id                       UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id                  UUID              NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_number           TEXT              NOT NULL UNIQUE,
    program                  TEXT              NOT NULL,
    enrollment_status        enrollment_status NOT NULL DEFAULT 'active',
    thesis_title             TEXT,
    adviser_id               UUID,
    start_date               DATE              NOT NULL,
    expected_completion_date DATE,
    created_at               TIMESTAMPTZ       NOT NULL DEFAULT now(),
    updated_at               TIMESTAMPTZ       NOT NULL DEFAULT now()
);

CREATE INDEX students_user_id_idx    ON students (user_id);
CREATE INDEX students_adviser_id_idx ON students (adviser_id);
CREATE INDEX students_program_idx    ON students (program);
CREATE INDEX students_enrollment_idx ON students (enrollment_status);
