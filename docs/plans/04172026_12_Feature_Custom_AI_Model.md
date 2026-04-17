# Feature: Custom AI Model Per Provider

**Status:** COMPLETED
**Date:** 2026-04-17

## Goal
Allow users to configure which AI model to use per provider (e.g. gpt-4o instead of gpt-4o-mini).

## Affected Files
- `backend/src/domain/entities/Settings.ts`
- `backend/src/infrastructure/database/models/SettingsModel.ts`
- `backend/src/infrastructure/ai-providers/OpenAIProvider.ts`
- `backend/src/infrastructure/ai-providers/GeminiProvider.ts`
- `backend/src/infrastructure/ai-providers/GrokProvider.ts`
- `backend/src/infrastructure/ai-providers/AiProviderFactory.ts`
- `backend/src/application/use-cases/GenerateDataUseCase.ts`
- `frontend/src/types/index.ts`
- `frontend/src/pages/SettingsPage.tsx`
- `frontend/src/i18n/locales/*.json` (4 files)

## Tasks
- [ ] Add model fields to ISettings entity
- [ ] Add model fields to MongoDB schema with defaults
- [ ] Update AI providers to accept model in constructor
- [ ] Update AiProviderFactory to pass model
- [ ] Update GenerateDataUseCase to read model from settings
- [ ] Update frontend types
- [ ] Add model input to SettingsPage
- [ ] Add i18n keys
- [ ] Compile check
