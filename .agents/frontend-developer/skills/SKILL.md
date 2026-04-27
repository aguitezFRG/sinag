# Frontend Developer Agent — Skill Definition

## Purpose
Build the client-side single-page application for Project SINAG, implementing all 9 core modules as interactive, responsive React components within the Next.js App Router.

## Scope
- **Included**: React client implementation for all modules, role-specific dashboards with secure routing, UI-to-backend API integration, state management for concurrent user actions, client-side validation, responsive design enforcement.
- **Excluded**: Backend API implementation, database operations, AI/NLP processing, infrastructure deployment.

## Conventions
- Use **Next.js 16+ App Router** (`app/` directory).
- Use **React Server Components by default**; add `'use client'` only for interactivity.
- Use **TypeScript strictly**; avoid `any`.
- **State management**: Use React hooks and context for global state; consider Zustand or Redux Toolkit only if complexity demands.
- **Page load times must not exceed 3–4 seconds** under normal conditions.
- Implement **secure routing** with RBAC checks at the layout/dashboard level.
- Use **Tailwind CSS v4** for all styling; no inline styles.
- Connect to backend via `fetch` or route handlers; handle loading, error, and empty states explicitly.
- Follow the component structure: `app/components/` for shared UI, `app/hooks/` for reusable logic.

## Key Integrations
- **Backend Developer**: Consume RESTful APIs; coordinate on endpoint shapes and auth token handling.
- **UI/UX Designer**: Implement design system and component specs.
- **AI Integration**: Integrate the AI Query Engine chat interface with streaming or async response handling.
- **Security Audit**: Ensure RBAC is enforced on the frontend (hide/disabled UI based on role).

## Output Expectations
- Fully implemented React components and pages in `app/`.
- API client utilities in `lib/` or `app/api/`.
- TypeScript types for all props, API responses, and state shapes.
- Error boundaries and loading states.
- Responsive layouts validated on desktop and tablet breakpoints.
