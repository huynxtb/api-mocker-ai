# Feature: Delete API Resource

**Status:** COMPLETED
**Date:** 2026-04-17

## Goal
Allow user to delete an entire API resource (all 5 default + custom endpoints sharing a `basePath`) in one action from the EndpointListPage resource header, instead of deleting endpoints one by one.

## Affected Files

### Backend
- `backend/src/domain/interfaces/IApiEndpointRepository.ts` — add `deleteByProjectIdAndBasePath`
- `backend/src/infrastructure/database/repositories/ApiEndpointRepositoryImpl.ts` — implement method
- `backend/src/application/use-cases/EndpointUseCases.ts` — add `deleteApiResource`
- `backend/src/presentation/controllers/EndpointController.ts` — add `deleteResource` handler
- `backend/src/presentation/routes/endpointRoutes.ts` — add `DELETE /:projectId/resources/:basePath`

### Frontend
- `frontend/src/services/api.ts` — add `endpointApi.deleteResource`
- `frontend/src/pages/EndpointListPage.tsx` — add delete button on resource group header, confirm dialog, handler
- `frontend/src/i18n/locales/{en,vi,zh,ja}.json` — add `endpoint.deleteResource`, `endpoint.deleteResourceConfirm`, `endpoint.deleteResourceSuccess`

## Tasks
- [x] Add repo interface + Mongo impl method
- [x] Add use case `deleteApiResource(projectId, basePath)` with project existence check
- [x] Add controller `deleteResource` + register route
- [x] Add `endpointApi.deleteResource` client
- [x] Add resource-level delete button + ConfirmDialog + state in EndpointListPage
- [x] Add i18n keys to all 4 locales
- [x] tsc --noEmit passes for backend + frontend

## Architecture Decisions
- Route `DELETE /api/projects/:projectId/resources/:basePath` — resource is a logical grouping, not a DB entity, so no separate resource router. Keep under project scope.
- `basePath` in URL path: normalized slug (URL-safe), still `encodeURIComponent` on FE for safety.
- Repository method filters `{ projectId, basePath }` — avoids cross-project basePath collisions.
- UI confirmation shows endpoint count so user sees blast radius before confirming.

## Risks
- User accidentally deletes whole resource thinking single-endpoint delete → mitigated by separate confirm dialog + count in message.
- `basePath` with special chars if ever non-slug → URL encoding handles it.
