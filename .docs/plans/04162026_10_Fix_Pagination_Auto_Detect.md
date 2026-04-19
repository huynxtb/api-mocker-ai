# Fix: Auto-detect pagination parameters, remove manual config fields

**Status:** COMPLETED
**Date:** 2026-04-16

## Bug Description
Pagination config has 5 manual fields (dataKey, pageKey, limitKey, totalKey, defaultLimit) that should be auto-detected:
- Data key: auto-detect from JSON structure (find array field)
- Total key: auto-add & calculate if not in response
- Page/Limit params: auto-detect from JSON, use defaults

## Root Cause
UI exposes all pagination config fields manually. Backend mock route relies on stored config instead of auto-detecting.

## Fix Strategy
1. **Frontend**: Remove 5 pagination config input fields. Keep isList toggle + itemCount. Auto-detect keys from responseStructure on save.
2. **Backend mock route**: Auto-detect dataKey via `findArrayKey()`. Support common page/limit query param names. Auto-calculate total. Auto-add total to root if not in pagination metadata.

## Affected Files
- `frontend/src/pages/EndpointDetailPage.tsx`
- `backend/src/presentation/routes/mockApiRoutes.ts`

## Tasks
- [ ] Remove pagination state vars and UI fields from frontend
- [ ] Auto-detect pagination config on save
- [ ] Update backend mock route to auto-detect dataKey
- [ ] Backend: support common page/limit param names
- [ ] Backend: auto-add total to root if missing
- [ ] TypeScript compile check
