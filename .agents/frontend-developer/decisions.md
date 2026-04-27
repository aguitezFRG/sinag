# Frontend Developer — Key Decisions Log

This file records significant frontend implementation decisions. New entries should be added as a single line when possible.

- Missing API routes for analytics/overview and audit-logs caused 404s on admin/coordinator dashboards -> created `app/api/analytics/overview/route.ts` and `app/api/audit-logs/route.ts` wired to dummy data -> dashboards now load stats and logs correctly
- API routes lacked query params used by frontends (documents pendingReview, queries limit, users enrich) -> updated `app/api/documents/route.ts`, `app/api/queries/route.ts`, `app/api/users/route.ts` to support params and enrich responses with derived fields (ownerName, workflowStatus, currentStage) -> frontend gets complete data in single requests
- Adviser reviews page only supported feedback, not approve/reject -> redesigned modal to support three actions (feedback, approve, reject) and created `app/api/documents/[id]/feedback/route.ts` -> advisers can now approve/reject submissions
- Coordinator analytics page expected different API shape than existing `/api/analytics` -> updated page to fetch both `/api/analytics/overview` and `/api/analytics`, mapping fields correctly -> charts and stats render without errors
- Inconsistent loading, error, and empty states across dashboards -> standardized all pages to use `LoadingSpinner` centered in full height container, red error banners, gray empty-state boxes -> uniform UX across student, adviser, coordinator, and admin dashboards
- Admin and coordinator dashboards had `useEffect` dependency loops (`[stats]`) and `any` types -> replaced with cleanup-safe `useEffect` (cancelled flag) and `unknown`/`Error` type narrowing -> eliminated lint warnings and potential infinite re-renders
- Workflows API returned raw IDs instead of human-readable names -> updated `app/api/workflows/route.ts` to join `dummyStudents`, `dummyAdvisers`, and `users` to populate `studentName` and `adviserName` -> tables show names instead of IDs
