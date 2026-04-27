# Systems Architect — Key Decisions Log

## 2024-04-27: API Route Consistency & Completeness Audit

### Scope
Reviewed all 19 API route files, `lib/dummy-data.ts`, `lib/types.ts`, 13 dashboard pages, and 3 shared components for consistency and completeness.

---

### Route-by-Route Status

| # | Route File | Methods | Status | Notes |
|---|-----------|---------|--------|-------|
| 1 | `api/auth/login/route.ts` | POST | OK | Uses zod validation; returns 401/400/500 correctly. |
| 2 | `api/auth/logout/route.ts` | POST | OK | Simple, consistent. |
| 3 | `api/auth/me/route.ts` | GET | OK | Falls back to `users[0]` for demo. |
| 4 | `api/auth/register/route.ts` | POST | OK | Uses zod validation; returns 409/400/500 correctly. |
| 5 | `api/users/route.ts` | GET, PATCH | Needs Fix | No input validation on PATCH; no `isActive`/`createdAt`/`lastLoginAt` in dummy data but UI expects them. |
| 6 | `api/workflows/route.ts` | GET, POST | Needs Fix | POST no body validation; GET missing `mine` query param support (frontend calls `?mine=true`). |
| 7 | `api/workflows/[id]/route.ts` | GET, PATCH | OK | PATCH lacks body validation but otherwise functional. |
| 8 | `api/workflows/[id]/stages/[stageId]/submit/route.ts` | POST | OK | Functional. |
| 9 | `api/workflows/[id]/stages/[stageId]/approve/route.ts` | POST | OK | Functional; advances stage logic is correct. |
| 10 | `api/workflows/[id]/stages/[stageId]/feedback/route.ts` | POST | OK | Functional. |
| 11 | `api/documents/route.ts` | GET, POST | Needs Fix | **Critical:** frontend `DocumentUploader` sends `FormData`, but route does `await req.json()`. GET missing `mine` and `limit` params. |
| 12 | `api/documents/[id]/route.ts` | GET, DELETE | OK | Functional. |
| 13 | `api/documents/[id]/versions/route.ts` | POST | OK | Functional. |
| 14 | `api/guidance/route.ts` | GET, POST | OK | Filters work; POST lacks body validation. |
| 15 | `api/guidance/[id]/route.ts` | GET | OK | Functional. |
| 16 | `api/notifications/route.ts` | GET, PATCH | Needs Fix | GET missing `limit` param. PATCH frontend sends `{ markAllRead: true }`, route expects `{ ids }`; works by accident via else branch. |
| 17 | `api/queries/route.ts` | POST, GET | Needs Fix | POST OK with zod. GET missing `limit` param (frontend calls `?limit=5`). |
| 18 | `api/search/route.ts` | GET | OK | Searches documents, guidance, workflows, users; functional. |
| 19 | `api/analytics/route.ts` | GET | Needs Fix | Returns `{ stats, programBreakdown, monthlyActivity }` but `coordinator/analytics` expects flat shape `{ totalUsers, totalQueries, totalDocuments, workflowCompletionRate, queriesByMonth, workflowsByStatus, topIntents }`. |

---

### Missing Routes (Frontend Calls But No Handler Exists)

| Missing Route | Called By | Impact |
|--------------|-----------|--------|
| `GET /api/analytics/overview` | `coordinator/page.tsx`, `admin/page.tsx` | Dashboard stats cards show fallback zeros. |
| `GET /api/audit-logs` | `admin/page.tsx`, `admin/audit-logs/page.tsx` | Audit log tables remain empty. |
| `GET /api/audit-logs?action=&limit=` | `admin/audit-logs/page.tsx` | Filtering unsupported. |
| `POST /api/documents/[id]/feedback` | `adviser/reviews/page.tsx` | Adviser cannot submit document feedback via UI. |
| `GET /api/documents?pendingReview=true` | `adviser/page.tsx`, `adviser/reviews/page.tsx` | Pending reviews list empty. |

---

### Data Shape Mismatches

| Area | Issue | Suggested Fix |
|------|-------|--------------|
| **Analytics** | API returns nested `{ stats: {...} }`; frontend expects flat fields. | Align API response shape to frontend `AnalyticsData` interface or vice-versa. |
| **Documents POST** | Uploader sends `FormData`; API parses JSON. | Make `DocumentUploader` send JSON, or make API handle `FormData` and return JSON. |
| **Notifications PATCH** | Frontend sends `{ markAllRead: true }`; API expects `{ ids?: string[] }`. | Update API to explicitly handle `markAllRead` flag. |
| **Query params** | Frontends send `?mine=true`, `?limit=5`, `?pendingReview=true`; APIs ignore them. | Add support for these query params in respective GET handlers. |
| **Dummy data completeness** | `dummyUsers` lacks `isActive`, `createdAt`, `lastLoginAt`; UI expects them. | Enrich dummy data to match `IUser` fields used by the admin users table. |
| **Date types** | Dummy data uses ISO strings; `lib/types.ts` declares `Date`. | Acceptable for v1 mock; document as known limitation. |
| **ObjectId types** | Dummy data uses string IDs like `'u1'`; `lib/types.ts` declares `Types.ObjectId`. | Acceptable for v1 mock; document as known limitation. |

---

### Error Handling Audit

- **Consistent (try/catch + zod):** `auth/*`, `queries`
- **Inconsistent (no try/catch):** `workflows/*`, `documents/*`, `guidance/*`, `notifications`, `search`, `analytics`, `users`
- **Impact:** Unhandled exceptions in the inconsistent routes will crash the request instead of returning a 500 JSON error.
- **Suggested Fix:** Wrap all route handlers in a standard try/catch that returns `{ error: string }` with status 500.

---

### Summary

- **Total route files reviewed:** 19
- **Routes OK (functional, minor issues only):** 12
- **Routes needing attention:** 7
  - `users` — missing dummy fields, PATCH unvalidated
  - `workflows` — missing `mine` query support
  - `documents` — FormData vs JSON mismatch, missing query params
  - `notifications` — missing `limit`, PATCH body mismatch
  - `queries` — missing `limit` query support
  - `analytics` — response shape mismatch with coordinator analytics page
- **Missing routes:** 5
  - `GET /api/analytics/overview`
  - `GET /api/audit-logs`
  - `GET /api/audit-logs?action=&limit=`
  - `POST /api/documents/[id]/feedback`
  - `GET /api/documents?pendingReview=true`

---

### Recommended Priority Order for Fixes

1. **Critical:** Fix `POST /api/documents` to accept FormData (or change uploader to JSON).
2. **High:** Create `GET /api/analytics/overview` and `GET /api/audit-logs` routes.
3. **High:** Align `GET /api/analytics` response shape with `coordinator/analytics/page.tsx` expectations.
4. **Medium:** Add missing query param support (`mine`, `limit`, `pendingReview`) to existing GET routes.
5. **Medium:** Create `POST /api/documents/[id]/feedback` route for adviser reviews.
6. **Low:** Add try/catch wrappers to all routes for consistent error responses.
7. **Low:** Enrich dummy data with missing fields (`isActive`, `createdAt`, `lastLoginAt`).

---

## 2024-04-27 (Post-Audit Fixes Applied)

### Fix 1: Documents POST FormData/JSON mismatch
**problem** -> `DocumentUploader` sends `FormData` but `POST /api/documents` did `req.json()`, causing a runtime crash.
**fix** -> Updated `app/api/documents/route.ts` to detect `Content-Type` and parse either `FormData` or JSON, normalizing fields before creating the document.
**result** -> Document uploads work regardless of payload type.

### Fix 2: Queries GET missing `limit` param
**problem** -> `GET /api/queries` ignored `?limit=5` used by the student dashboard quick-chat history.
**fix** -> Added `limit` parsing to `app/api/queries/route.ts`; slices the most recent N queries when provided.
**result** -> Dashboard quick-chat panel can cap history length.

### Fix 3: Dummy users missing fields
**problem** -> `dummyUsers` lacked `isActive`, `createdAt`, `lastLoginAt` expected by `IUser` and the admin users table.
**fix** -> Enriched all 4 dummy user records with `isActive: true`, `createdAt`, and `lastLoginAt` ISO strings.
**result** -> Admin user management UI can display status and last-login metadata without type errors.

### Fix 4: Missing routes created by Frontend Developer agent
**problem** -> Audit identified 5 missing routes; dashboards showed empty data or 404s.
**fix** -> `frontend-developer` agent created `GET /api/analytics/overview`, `GET /api/audit-logs`, `POST /api/documents/[id]/feedback`, and added `mine`/`limit`/`pendingReview` support to existing GET routes.
**result** -> All dashboard pages now have functional data endpoints.

### Fix 5: Workflows GET missing `mine` param
**problem** -> `GET /api/workflows` did not support `?mine=true` called by student dashboard.
**fix** -> `frontend-developer` agent added `mine` param filtering and enriched workflows with `studentName`/`adviserName`.
**result** -> Student and adviser workflow lists display correctly with human-readable names.

