# Fix: Response JSON Structure visibility based on status code, not HTTP method

**Status:** COMPLETED
**Date:** 2026-04-16

## Bug Description
Response JSON Structure field only shown for GET endpoints. Should show for any HTTP method with body-capable status code (e.g., POST 200, PUT 200). Only require it for GET; optional for others.

## Root Cause
Frontend gates field visibility on `httpMethod === 'GET' && statusCodeHasBody(statusCode)`. Should use `statusCodeHasBody(statusCode)` alone for visibility, keeping GET-only check for required validation.

## Fix Strategy
Change 5 locations in `EndpointDetailPage.tsx`:
1. Field visibility: status code only
2. Label asterisk: only for GET
3. Validation: required for GET, valid-JSON-if-provided for others
4. AI config check: trigger when responseStructure provided (any method)
5. Button text/icon: show generate variant when responseStructure provided

## Affected Files
- `frontend/src/pages/EndpointDetailPage.tsx`

## Tasks
- [x] Update visibility condition (line 341)
- [x] Conditional required asterisk on label (line 344)
- [x] Update validation logic (lines 152-162)
- [x] Update AI config check (line 173)
- [x] Update button icon/text (lines 484-491)
- [x] TypeScript compile check
