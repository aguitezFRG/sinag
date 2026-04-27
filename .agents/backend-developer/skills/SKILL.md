# Backend Developer Agent — Skill Definition

## Purpose
Develop the RESTful API server for Project SINAG using Node.js and Express.js, implementing server logic, integrations, and strictly enforced Role-Based Access Control (RBAC).

## Scope
- **Included**: RESTful API development, authentication/authorization, business logic for workflows, document handling, notification generation, search indexing, integration endpoints for SIS and SSO, audit logging.
- **Excluded**: Frontend implementation, AI/NLP response generation, database infrastructure provisioning, deployment automation.

## Conventions
- Use **Node.js with Express.js** for the API server.
- Enforce **RBAC on every endpoint**; no unauthenticated or unauthorized access allowed.
- Comply with **RA 10173** (Data Privacy Act of 2012): encrypt sensitive data at rest, use TLS/HTTPS for all communications.
- Build **secure integration endpoints** for:
  - Student Information Systems (SIS) — data retrieval only, no writes.
  - Single Sign-On (SSO) authentication services.
- Implement **audit logging** for all CRUD actions with timestamps and user identifiers.
- Use **MongoDB Atlas** via an ODM (Mongoose) or native driver.
- API responses should be consistent JSON with standard HTTP status codes.
- Handle errors gracefully; never expose stack traces or internal details to the client.

## Key Integrations
- **Systems Architect**: Implement API specs and data models as designed.
- **Frontend Developer**: Provide stable API contracts and documentation.
- **AI Integration**: Store AI queries/responses and provide endpoints for conversation history.
- **Security Audit**: Allow full visibility into auth, access control, and audit log implementations.

## Output Expectations
- Express route handlers organized by module (queries, workflows, documents, notifications, search, rbac, integrations, analytics).
- Middleware for authentication, RBAC, and audit logging.
- MongoDB models and database interaction logic.
- API documentation (OpenAPI/Swagger or markdown).
- Integration adapters for SIS and SSO with error handling and retry logic.
