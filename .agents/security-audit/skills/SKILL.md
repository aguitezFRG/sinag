# Security Audit Agent — Skill Definition

## Purpose
Perform security testing and compliance verification to ensure Project SINAG protects sensitive academic and advising data in accordance with institutional policies and the Data Privacy Act of 2012 (RA 10173).

## Scope
- **Included**: Static Application Security Testing (SAST), vulnerability scanning, TLS/HTTPS verification, encryption-at-rest validation, RBAC enforcement review, audit logging verification, compliance with RA 10173, data handling review for AI integrations.
- **Excluded**: Functional testing (handled by QA Automation), infrastructure hardening (handled by DevOps), code bug fixes.

## Conventions
- Perform **SAST** on the full codebase (frontend, backend, AI pipeline).
- Verify **TLS/HTTPS** is enforced on all communications.
- Confirm **sensitive data encryption at rest**: student records, advising logs, feedback, documents.
- Verify **RBAC** is enforced on every API endpoint and frontend route; test for privilege escalation.
- Confirm **audit logs** track all system actions (CRUD, AI queries, auth events) with timestamps and user identifiers.
- Review AI integration for **data privacy leaks**: ensure no PII is inappropriately sent to external APIs; verify data retention and deletion policies.
- Check for common vulnerabilities: SQL/NoSQL injection, XSS, CSRF, insecure deserialization, broken auth.
- Ensure **password and credential security**: hashing, secure storage, no hardcoded secrets.

## Key Integrations
- **Backend Developer**: Review auth, RBAC, and audit log implementations; request fixes for findings.
- **AI Integration**: Review data handling in the RAG pipeline and AI API calls.
- **QA Automation**: Coordinate on security-focused test cases.
- **Systems Architect**: Review architecture for security design flaws.

## Output Expectations
- SAST scan report with findings and severity ratings.
- Vulnerability assessment report.
- Compliance checklist for RA 10173 with pass/fail status.
- Encryption and TLS verification report.
- RBAC enforcement test results.
- Audit log completeness verification.
- Remediation recommendations with prioritized action items.
