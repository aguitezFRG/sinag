-- ============================================================
-- 00_enums.sql
-- All shared PostgreSQL ENUM types for SINAG.
-- Run before any table DDL.
-- ============================================================

CREATE TYPE user_role AS ENUM ('student', 'adviser', 'coordinator', 'admin');

CREATE TYPE enrollment_status AS ENUM ('active', 'leave', 'graduated');

CREATE TYPE workflow_status AS ENUM ('active', 'completed', 'on_hold');

CREATE TYPE stage_status AS ENUM ('pending', 'in_progress', 'submitted', 'approved', 'rejected');

CREATE TYPE document_type AS ENUM ('proposal', 'manuscript', 'checklist', 'template', 'feedback');

CREATE TYPE guidance_category AS ENUM ('template', 'checklist', 'guideline', 'policy');

CREATE TYPE notification_type AS ENUM ('milestone', 'deadline', 'feedback', 'approval', 'system');

CREATE TYPE notification_channel AS ENUM ('in_app', 'email');

CREATE TYPE audit_action AS ENUM ('create', 'read', 'update', 'delete', 'login', 'logout', 'ai_query');
