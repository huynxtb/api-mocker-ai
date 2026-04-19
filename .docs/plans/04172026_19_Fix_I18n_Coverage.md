# Fix: Missing i18n coverage across forms and detail pages

**Status:** COMPLETED
**Date:** 2026-04-17

## Bug Description

Several hardcoded English strings remain in the UI, and some input fields have hardcoded English placeholders instead of `t()` calls:

- **Edit Endpoint (`EndpointDetailPage`)**: section titles ("Endpoint Config", "Response", "Pagination", "Advanced Options", "Paging Params") are hardcoded; "— JSON structure" suffix, "Enable to generate a list of items..." description, loading text, and validation messages ("Invalid JSON", "Invalid status code") are hardcoded; Resource Name input has no placeholder; custom-endpoint and data-path placeholders are hardcoded English.
- **Project Form (`ProjectFormPage`)**: `editSubtitle` / `createSubtitle` / `copy` / `copied` / `optional` keys are called with fallback strings but never added to locale files.
- **ConfirmDialog**: `common.confirmTitle` ("Are you sure?") called with fallback, never added to locale files.
- **Add Endpoint Modal**: "e.g. Approve" and "e.g. approve" placeholders hardcoded.
- **Project List**: `project.noDescription` called with fallback, never in locales.
- **Endpoint List**: hover title `"Data ready" / "No data"` hardcoded.

## Root Cause

Prior PRs introduced `t('key', 'fallback')` calls without ever adding the corresponding keys to the locale files — so the fallback English text ships to all languages. Other spots were written with raw English instead of being routed through `t()` at all.

## Fix Strategy

1. Add the missing keys (`common.*`, `project.*`, `endpoint.*`) to all four locales: `en`, `vi`, `zh`, `ja`.
2. Replace hardcoded strings / placeholders with `t()` calls.
3. Add a placeholder to the Resource Name input in Edit Endpoint.

## Affected Files

- `frontend/src/i18n/locales/{en,vi,zh,ja}.json` — add missing keys
- `frontend/src/pages/EndpointDetailPage.tsx` — section headers, placeholders, error messages, loading text, description hint
- `frontend/src/pages/EndpointListPage.tsx` — status title tooltip
- `frontend/src/components/endpoint/AddEndpointModal.tsx` — name/customEndpoint placeholders

## Tasks

- [x] Add missing i18n keys in all 4 locales
- [x] Replace hardcoded strings in EndpointDetailPage
- [x] Replace hardcoded strings in AddEndpointModal
- [x] Replace hardcoded status tooltip in EndpointListPage
- [x] Verify `tsc --noEmit` clean on frontend
