# Feature: Export endpoints as Postman Collection

**Status:** COMPLETED
**Date:** 2026-04-17

## Goal

Let users export their project's endpoints as a Postman Collection v2.1 JSON file so they can open/share them in Postman, Insomnia, Bruno, or any compatible tool. Two modes:

- **Export all** — every endpoint in the project
- **Export selected** — pick resources (basePaths) via checkboxes

Click "Export" in the top-right of `/projects/:id/endpoints` → modal opens → choose mode → download triggers.

## Affected Files

- `frontend/src/utils/postmanExport.ts` (new) — pure function converting `Project + ApiEndpoint[]` to Postman v2.1 JSON
- `frontend/src/components/endpoint/ExportCollectionModal.tsx` (new) — modal UI
- `frontend/src/pages/EndpointListPage.tsx` — add Export button + modal wiring
- `frontend/src/i18n/locales/{en,vi,zh,ja}.json` — new strings

## Tasks

- [x] Write plan (this file)
- [x] Build `postmanExport.ts` utility
- [x] Build `ExportCollectionModal` component
- [x] Wire Export button into `EndpointListPage` header
- [x] Add i18n keys in all 4 locales
- [x] Verify frontend `tsc --noEmit`

## Architecture Decisions

### Frontend-only

No backend endpoint needed. The endpoint list is already fetched; conversion is pure JSON manipulation. Keeps server load zero and avoids a round-trip.

### Postman Collection v2.1 shape

- `info.name` = project name; `info.schema` = `https://schema.getpostman.com/json/collection/v2.1.0/collection.json`
- **Folders by resource** — one folder per `basePath`
- `variable[]` holds a `baseUrl` variable (default `http://localhost:4000/mock`) so the user can switch environments without editing every request
- Each request:
  - `url.raw` = `{{baseUrl}}/{fullPath}` (colon-prefixed segments like `:id` stay as Postman path variables)
  - `method` / `description` / `name` mapped straight through
  - For POST/PUT/PATCH, include `body.mode = "raw"` with the `responseStructure` as a template so the user has something to edit. For GET/DELETE, no body.
  - `response[]` contains one example using `generatedData` if present, otherwise the `responseStructure`. Status code + status text.

### Download mechanism

Standard Blob + `URL.createObjectURL` + synthetic `<a>` click. No third-party dep.

### Filename

`{projectSlug || projectName}.postman_collection.json` — matches Postman's own export naming convention.

### Selection UX

Radio for mode. Selected mode shows a scrollable checkbox list of resources with a count badge and a Select-all / Deselect-all toggle. Export button disabled when nothing is selected in "selected" mode.

## Risks

- Postman v2.1 is stable but has many optional fields — we emit only required + commonly used ones. Should import cleanly in Postman, Insomnia (v8+), and Bruno.
- Request body for POST/PUT is **the response structure**, which is semantically wrong (that's what the server returns, not what the client sends). Acceptable trade — users can edit it in Postman; alternative is empty body which is less useful.
