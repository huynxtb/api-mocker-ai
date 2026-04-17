# Feature: AI Provider Fallback Chain

**Status:** COMPLETED
**Date:** 2026-04-17

## Goal

Let users register unlimited AI provider accounts (e.g. 3 OpenAI, 5 Gemini, 10 Grok) and configure a primary + ordered fallback chain — similar to n8n's fallback model. When the primary account fails, the system automatically retries with the next account in the chain.

## Affected Files

### Backend (create / modify)
- `backend/src/domain/entities/Settings.ts` — replace single-provider fields with `accounts[]` + `primaryAccountId` + `fallbackAccountIds`
- `backend/src/infrastructure/database/models/SettingsModel.ts` — new schema
- `backend/src/infrastructure/database/repositories/SettingsRepositoryImpl.ts` — per-account encryption, legacy-shape migration, masked-key preservation on update
- `backend/src/presentation/controllers/SettingsController.ts` — mask each account's apiKey; emit `ready` flag
- `backend/src/application/use-cases/GenerateDataUseCase.ts` — iterate chain, catch + fallback

### Frontend (modify)
- `frontend/src/types/index.ts` — `AiAccount`, new `Settings` shape
- `frontend/src/pages/SettingsPage.tsx` — rewrite UI
- `frontend/src/App.tsx` — `SettingsGuard` uses `ready` flag
- `frontend/src/pages/EndpointDetailPage.tsx` — same readiness check
- `frontend/src/i18n/locales/{en,vi,zh,ja}.json` — new strings

## Tasks

- [x] Write plan (this file)
- [x] Update Settings domain entity + repository interface
- [x] Update Mongoose model + repository (encrypt per-account, migrate legacy, preserve masked keys)
- [x] Update SettingsController (mask + ready flag)
- [x] Implement fallback chain in GenerateDataUseCase
- [x] Update frontend types
- [x] Rewrite SettingsPage UI (accounts + execution chain)
- [x] Update SettingsGuard + EndpointDetailPage to use `ready`
- [x] Add i18n keys across 4 locales
- [x] Verify `tsc --noEmit` in both packages

## Architecture Decisions

### New Settings shape

```ts
interface AiAccount {
  id: string;          // uuid generated client-side on add
  provider: 'openai' | 'gemini' | 'grok';
  label: string;       // user-friendly name
  apiKey: string;      // encrypted at rest; masked on wire
  model: string;
}

interface ISettings {
  accounts: AiAccount[];
  primaryAccountId: string;
  fallbackAccountIds: string[]; // ordered; unlimited
}
```

### Legacy migration

Existing docs have top-level `openaiApiKey`, `aiProvider`, etc. On first `get()`, if `accounts` is missing/empty and legacy fields are present, the repo creates one `AiAccount` per populated provider key, picks the active `aiProvider` as primary, persists, and returns the new shape. No migration script needed.

### Masked key preservation

`GET /api/settings` masks each account's key (`sk-1234****abcd`). When the client PUTs the full settings object back, the repo detects `apiKey` values containing `****` and substitutes the existing encrypted value for that account id — so unchanged keys survive a round-trip.

### Fallback execution

`GenerateDataUseCase` builds an ordered chain `[primary, ...fallbacks]`, filters out accounts that don't exist or have no key, and tries each via `AiProviderFactory.create(...)`. On any exception, it logs and continues to the next. If the entire chain fails, it rethrows the last error wrapped in a clear message.

### Risks

- **Breaking API shape.** Frontend must be deployed together with backend. Acceptable — single-user self-hosted app.
- **Legacy migration edge case:** if the DB has legacy fields AND a partial `accounts` array, we keep `accounts` and discard legacy. Fine because `accounts` wins in the new world.
- **Fallback masking same cost noise:** all errors go through — a hard billing error on provider A would silently fall to B. Noted, will log at warn level so it's visible.
