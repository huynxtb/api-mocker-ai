# Update: Delete icon color + default collapse on endpoints page

**Status:** COMPLETED
**Date:** 2026-04-17

## Current Behavior

1. **Projects page delete icon** — uses `tone="danger"` in `IconButton`, which is grey (`text-gray-400`) at rest and only turns red on hover. Looks visually inconsistent with the destructive nature of the action; other delete buttons in the app (e.g. EndpointListPage) override with `!text-red-500` for always-red styling.
2. **Endpoints page resource groups** — load expanded by default. With many resources, the page becomes very long and the user has to scroll a lot before collapsing manually.

## Desired Behavior

1. Project card delete icon should render in red on rest (matching other delete buttons across the app).
2. When the project has **more than one resource** (base path), the Endpoints page should render with **all groups collapsed** on the initial load. If there's a single resource, keep it expanded (no reason to hide a single group).

## Change Strategy

1. **Projects page:** add `className="!text-red-500 dark:!text-red-400"` to the delete `IconButton` in `ProjectListPage.tsx`. Tailwind `!` is already used elsewhere in the codebase for the same purpose.
2. **Endpoints page:** after `setEndpoints`, compute unique base paths; if count > 1, initialize `collapsedGroups` to all-collapsed. Gate on a `useRef` so subsequent reloads (add/delete) don't re-collapse groups the user has just expanded.

## Affected Files

- `frontend/src/pages/ProjectListPage.tsx` — add `className` override to delete `IconButton`
- `frontend/src/pages/EndpointListPage.tsx` — add `useRef` + initial-collapse logic in `loadData`

## Tasks

- [x] Update delete icon styling on ProjectListPage
- [x] Add default-collapse-all logic on EndpointListPage (only first load, only when >1 resource)
- [x] Verify frontend `tsc --noEmit`

## Breaking Changes

None. Pure UI behavior tweaks.
