# Fix: AddEndpointModal 401 Unauthorized

**Status:** COMPLETED
**Date:** 2026-04-17

## Bug Description
`POST /api/projects/:id/endpoints/add` returns 401 from the Add Endpoint modal.

## Root Cause
`frontend/src/components/endpoint/AddEndpointModal.tsx:56` uses raw `fetch()` instead of the shared axios `api` client. The axios client attaches `Authorization: Bearer <token>` via a request interceptor; raw fetch bypasses it, so the request arrives unauthenticated and `authMiddleware` rejects with 401.

## Fix Strategy
- Add `endpointApi.add(projectId, body)` in `services/api.ts`.
- Replace raw `fetch` in `AddEndpointModal` with `endpointApi.add`.

## Affected Files
- `frontend/src/services/api.ts`
- `frontend/src/components/endpoint/AddEndpointModal.tsx`

## Tasks
- [x] Add `endpointApi.add`
- [x] Swap fetch → endpointApi.add in modal
- [x] tsc --noEmit passes
