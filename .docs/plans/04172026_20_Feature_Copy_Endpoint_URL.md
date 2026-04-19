# Feature: Copy-URL icon on each endpoint row

**Status:** COMPLETED
**Date:** 2026-04-17

## Goal

Let users copy the full mock URL of any endpoint directly from the list (`/projects/:id/endpoints`) without opening the detail page. Mirrors the existing `copyUrl` button in `EndpointDetailPage`.

## Affected Files

- `frontend/src/pages/EndpointListPage.tsx` — add per-row Copy icon button

## Tasks

- [x] Add `Copy` icon import from lucide-react
- [x] Add `copyEndpointUrl(ep, e)` handler that stops row-click propagation and writes `${origin}/mock/${ep.fullPath}` to clipboard, showing success alert
- [x] Insert `<IconButton>` with Copy icon between the status dot and the delete button
- [x] Verify frontend `tsc --noEmit` clean

## Architecture Decisions

- Reuses existing `endpoint.copyUrl` i18n key ("Copy URL"). No new strings needed.
- Icon placed left of the delete button for consistency with the detail page header.
- `stopPropagation()` prevents the row's navigate click from firing when the copy button is clicked.
