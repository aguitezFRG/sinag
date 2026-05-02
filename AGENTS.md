<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Project SINAG — Agent Reference

## Project Overview

**Project SINAG** is an AI-powered, natural language-driven consultation platform for graduate thesis and dissertation advising within **SESAM** (School of Environmental Science and Management), UPLB.

It provides:
- An **AI Query Engine** for context-aware, multi-turn advising on topics, methodologies, timelines, and academic requirements
- **Structured advising workflows** for topic approval, proposal development, milestone tracking, and defense preparation
- A **JESAM-inspired Guidance Library** of templates, checklists, and research standards
- **Document management** with version control
- **Notifications and calendaring** for milestones and deadlines
- **Search and discovery** across guidance materials and advising records
- **Role-based access control (RBAC)** and audit logging
- **Integration** with Student Information Systems (SIS) and Single Sign-On (SSO)
- **Analytics and reporting dashboards** for program oversight

### Stakeholders
| Role | Description |
|------|-------------|
| Graduate Students | Primary users; AI consultation, document submission, milestone tracking |
| Faculty Advisers | Review submissions, provide feedback, validate AI-generated guidance |
| Program Coordinators | Oversee workflows, assign advisers, monitor program-level progress |
| SESAM Administrators | Governance, policy enforcement, system oversight, analytics |
| System Administrators | Infrastructure, security, integrations, data integrity |

### 9 Core Modules
| Module | Description |
|--------|-------------|
| AI Query Engine | Natural language interface for advising queries; RAG-grounded, explainable outputs |
| Advising Workflow Management | Topic approval, proposal dev, milestone tracking, committee approvals |
| JESAM-Inspired Guidance Library | Templates, checklists, research standards aligned with JESAM practices |
| Notifications and Calendaring | Alerts, reminders, shared calendar for milestones and meetings |
| Search and Discovery System | Keyword search and filtering across documents, guidance, records |
| Security, Privacy, and Access Control (RBAC) | Role-based access, encryption, audit logging |
| Integration and Interoperability | SIS, SSO, and research support system integrations |
| Analytics and Reporting Dashboard | Advising activity, milestone completion, system usage metrics |
| UI/UX Design | High-fidelity interface design and responsive prototyping ([Figma Prototype](https://pen-ignite-95990799.figma.site)) |

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | React 18+ with TypeScript, Vite, Tailwind CSS | SPA, responsive UI, role-based dashboards |
| Backend | Node.js with Express.js | RESTful API, business logic, authentication, workflows |
| Database | MongoDB Atlas | Primary data store for users, plans, documents, conversations, audit logs |
| File Storage | Cloudinary | Secure cloud storage for research documents |
| AI / NLP | OpenAI API / LangChain (or equivalent) | NLP, RAG, advisory response generation |
| Hosting / Cloud | AWS or Railway | Deployment environment |
| Email | SendGrid | Automated notifications, alerts |
| Testing | Jest, Supertest | Unit and API integration testing |

**Current project setup:** Next.js 16.2.4 (App Router), React 19.2.4, Tailwind CSS v4, TypeScript 5.x.

---

## Architecture Conventions

### App Router (Next.js 16+)
- Use the `app/` directory for all routes
- Route handlers in `app/api/` for backend API endpoints
- Server Components by default; use `'use client'` only for interactivity
- Follow `node_modules/next/dist/docs/01-app/` for current App Router patterns

### Component Structure
- Co-locate components with their routes when possible
- Shared UI components in `app/components/`
- Hooks in `app/hooks/`, utilities in `lib/`
- Use TypeScript strictly; avoid `any`

### Data Flow
- Frontend fetches via standard `fetch` or route handlers
- Backend Express API handles business logic and DB operations
- AI service (OpenAI/LangChain) processes queries through a RAG pipeline grounded in the Guidance Library
- All external integrations (SIS, SSO) go through the Integration module

---

## Security & Compliance

- **RA 10173** (Data Privacy Act of 2012): All personal and academic data must be handled with least-privilege access
- **RBAC**: Enforced across all modules; no endpoint should be accessible without role verification
- **TLS/HTTPS**: All communications encrypted
- **Encryption at rest**: Sensitive student records and advising logs
- **Audit logging**: All CRUD actions and AI outputs logged with timestamps and user identifiers
- **AI outputs are advisory only**: Human validation is the final authority; outputs must be flagged as advisory

---

## Module Directory Map (Proposed)

```
app/
├── (auth)/              # Login, SSO callback
├── (dashboard)/         # Role-specific dashboards
│   ├── student/
│   ├── adviser/
│   ├── coordinator/
│   └── admin/
├── api/                 # RESTful API routes
│   ├── queries/         # AI Query Engine endpoints
│   ├── workflows/       # Advising workflow endpoints
│   ├── documents/       # Document upload/versioning
│   ├── notifications/   # Alerts and calendar events
│   ├── search/          # Search and discovery
│   ├── rbac/            # Users, roles, permissions
│   ├── integrations/    # SIS, SSO connectors
│   └── analytics/       # Reporting data
├── components/          # Shared UI components
├── hooks/               # Reusable React hooks
├── lib/                 # Utilities, DB client, AI pipeline
└── types/               # Shared TypeScript types
```

---

## Agent Role Directory

Agent definitions live in `.agents/{role}/`. Each directory contains:
- `skills/SKILL.md` — Domain-specific instructions and conventions for that agent
- `tmp/` — Temporary workspace for the agent
- `decisions.md` — Running log of key decisions (suggested format: `problem -> fix -> result`)

| Agent | Responsibilities | Modules |
|-------|----------------|---------|
| `systems-architect` | DB modeling, API design, schema definition, deployment architecture | All (foundation) |
| `ui-ux-designer` | Figma-to-code translation, component design system, Tailwind patterns, responsive layouts | UI/UX Design |
| `frontend-developer` | React/Next.js implementation, client-side state, API integration, dashboard UIs | AI Query Engine, Workflow Management, Guidance Library, Notifications, Search, Analytics |
| `backend-developer` | API routes, RBAC enforcement, business logic, workflow orchestration, integrations | Workflow Management, RBAC, Integrations, Notifications, Search |
| `ai-integration` | RAG pipeline, OpenAI/LangChain config, prompt engineering, grounding in Guidance Library, explainability | AI Query Engine |
| `qa-automation` | Unit tests, API integration tests, performance validation, test coverage reporting | All |
| `security-audit` | SAST, vulnerability scanning, compliance verification (RA 10173), encryption review, audit logging | RBAC, Security |

---

## Repository Runtime Context

- App source is in `sinag/`; run project commands from that directory
- Dev URL: `http://localhost:3000`
- Scripts:
  - `npm run dev` — start dev server (Turbopack)
  - `npm run build` — production build
  - `npm run lint` — ESLint
  - `npm run start` — serve production build
- Current state: no automated test suite is configured yet

## Current Implementation Notes

- Database connection is implemented in `lib/db.ts` (cached Mongoose connection)
- Authentication uses JWT in httpOnly cookies via `jose`; passwords are hashed with `bcryptjs` (12 rounds)
- AI integration is currently a local mock in `lib/ai-service.ts` using keyword scoring and `lib/dummy-data.ts` (no live OpenAI calls yet)
- Protected API routes should use `withAuth` from `lib/middleware.ts` with optional role whitelists

## Environment Variables

Required in `sinag/.env.local`:

- `MONGODB_URI`
- `JWT_SECRET`

Optional (for planned integrations):

- `OPENAI_API_KEY`
- `CLOUDINARY_URL`
- `SENDGRID_API_KEY`

---

## Reference Materials

- `.sinag-instructions/Project_SINAG_AI_Implementation_Plan-v2.pdf` — Full implementation plan with agent prompts and timeline
- `.sinag-instructions/AI Based Program and JESAM Consultation.pdf` — Complete project specification: stakeholders, modules, tech stack, NFRs
- `.sinag-instructions/references/` — Academic policy documents (thesis formats, university codes, research guides)
- `sinag/docs/DESIGN.md` — DB schema, API spec, component architecture, AI pipeline, security design
- `sinag/docs/SRS.md` — software requirements specification
- `node_modules/next/dist/docs/` — Current Next.js App Router documentation ( heed deprecation notices )
- [Next.js Documentation](https://nextjs.org/docs) — Official Next.js docs
- [Figma Prototype](https://pen-ignite-95990799.figma.site) — High-fidelity UI/UX design reference
