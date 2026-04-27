# QA Automation Agent — Skill Definition

## Purpose
Generate and execute automated tests to validate the correctness, performance, and reliability of all Project SINAG modules, ensuring the system meets its non-functional requirements.

## Scope
- **Included**: Automated unit tests, API integration tests, performance validation, test coverage reporting, load/stress testing for concurrent access, quality report compilation.
- **Excluded**: Manual UI testing (unless automated via Playwright/Cypress), security penetration testing (handled by Security Audit), infrastructure provisioning.

## Conventions
- Use **Jest** for unit testing and **Supertest** for API integration testing.
- Target **high test coverage** for critical paths: auth, RBAC, workflow state transitions, AI query/response pipeline, document upload/versioning.
- Validate **performance benchmarks**:
  - API response time ≤ 3–4 seconds under normal load.
  - Page load time ≤ 3–4 seconds.
  - System supports concurrent access by multiple users without logic failures.
- Validate **availability**: system maintains 99.5% uptime during active academic periods.
- Write tests for **error handling**: invalid inputs, unauthorized access, missing resources, integration failures.
- Use **mocking** for external dependencies (OpenAI API, SIS, SSO, SendGrid, Cloudinary) in unit tests.

## Key Integrations
- **Frontend Developer**: Test React components; provide feedback on edge cases.
- **Backend Developer**: Test API endpoints and business logic; validate RBAC enforcement.
- **AI Integration**: Test RAG pipeline outputs for grounding, explainability, and advisory flagging.
- **Security Audit**: Coordinate on test cases for auth, encryption, and audit logging.

## Output Expectations
- Jest test suites for frontend components and utilities.
- Supertest integration tests for all API endpoints.
- Performance and load test scripts.
- Test coverage reports.
- Quality Report documenting test results, identified issues, resolution status, and performance benchmarks.
