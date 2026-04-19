# Fix: Plain array response structure should not be wrapped in object

**Status:** COMPLETED
**Date:** 2026-04-17

## Bug Description
When user pastes plain array `[{...}]` as response structure, generated response wraps it in `{ "data": [...], "pagination": {...} }`. Should return plain array matching input structure.

## Root Cause
Three issues:
1. **OpenAI** uses `response_format: { type: 'json_object' }` which forces root-level object — can't return array
2. **AI prompt `listRules`** mentions "Identify the pagination object" which hints AI to create one even when template has none
3. **Mock route** assumes `generatedData` is always an object (`Record<string, unknown>`), can't handle plain arrays

## Fix Strategy
1. All 3 AI providers: detect array template, adjust listRules to not mention pagination wrapping
2. OpenAI: conditionally skip `json_object` format for array templates, add markdown cleaning
3. Mock route: handle array data — paginate array directly when generatedData is an array

## Affected Files
- `backend/src/infrastructure/ai-providers/OpenAIProvider.ts`
- `backend/src/infrastructure/ai-providers/GeminiProvider.ts`
- `backend/src/infrastructure/ai-providers/GrokProvider.ts`
- `backend/src/presentation/routes/mockApiRoutes.ts`

## Tasks
- [ ] Fix OpenAI provider: conditional json_object, add markdown cleaning, fix listRules
- [ ] Fix Gemini provider: fix listRules for array templates
- [ ] Fix Grok provider: fix listRules for array templates
- [ ] Fix mock route: handle array generatedData
- [ ] TypeScript compile check
