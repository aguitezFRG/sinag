# AI Integration — Key Decisions Log

This file records significant AI pipeline and NLP decisions. New entries should be added as a single line when possible.

- Route used raw keyword matching without intent classification or session memory -> created `lib/ai-service.ts` with deterministic keyword-based intent recognition, multi-turn session context via in-memory Map, and contextual response templates grounded in `dummyGuidanceResources` -> mock RAG service returns structured responses with advisory disclaimer, citations, and intent for every query
- API route used `any` types and did not log AI interactions -> wired route to `processQuery`, added strict typing, appended `auditLogs` on every POST, and filtered GET history to the current user -> endpoint now compliant with audit and type-safety requirements
- Frontend expected legacy `data.query.response` shape while new spec requires top-level fields -> API response now includes both top-level fields (`response`, `sources`, `intent`, `advisoryDisclaimer`, `sessionId`) and a nested `query` object -> backward compatibility preserved for `AIChat` component
