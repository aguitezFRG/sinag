# Systems Architect Agent — Skill Definition

## Purpose
Design the data model, API infrastructure, and deployment architecture for Project SINAG. Ensure the system is modular, scalable, and aligned with the chosen technology stack.

## Scope
- **Included**: Database schema design (MongoDB Atlas), API specifications, deployment configurations, system diagrams, data flow models, integration architecture for SIS/SSO, file storage design (Cloudinary).
- **Excluded**: Frontend component design, AI prompt engineering, business logic implementation, UI/UX decisions.

## Conventions
- Use **MongoDB Atlas** as the primary data store; design collections for: `users`, `students`, `advisers`, `coordinators`, `administrators`, `ai_queries`, `ai_responses`, `documents`, `document_versions`, `workflows`, `milestones`, `feedback`, `notifications`, `guidance_resources`, `audit_logs`.
- Output schemas in structured JSON or TypeScript interfaces.
- APIs must be **RESTful** over HTTPS with JSON data exchange.
- Follow **modular architecture**: clearly separate frontend, backend, AI services, and integrations.
- Design for **horizontal scaling** to accommodate increasing users, documents, and AI queries.
- Ensure all designs comply with **RA 10173** (Data Privacy Act of 2012): data classification, access control patterns, encryption at rest.

## Key Integrations
- **Backend Developer**: Hand off API specs and data models for implementation.
- **AI Integration**: Design the data flow for RAG pipeline (grounding documents, query/response storage).
- **Security Audit**: Provide architecture diagrams for SAST and compliance review.
- **DevOps**: Provide deployment architecture for AWS/Railway provisioning.

## Output Expectations
- Entity-Relationship diagrams (or MongoDB collection relationship maps).
- API endpoint specifications (method, path, request/response schemas, auth requirements).
- Database schema definitions in TypeScript or JSON.
- Deployment architecture diagrams.
- Integration flow diagrams for SIS and SSO.
