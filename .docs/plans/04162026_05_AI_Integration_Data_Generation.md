# Phase 05: AI Integration & Data Generation

**Status:** COMPLETED

## Goal
Multi-provider AI integration to analyze JSON structure and generate realistic mock data. Data generated once and stored in DB.

## Tasks

- [ ] AI Provider interface (domain layer)
- [ ] OpenAI (ChatGPT) provider implementation
- [ ] Google Gemini provider implementation
- [ ] Grok provider implementation
- [ ] AI config: provider selection + API key management in settings/env
- [ ] JSON structure analyzer:
  - Detect root data array vs single object
  - Detect pagination object
  - Identify field types and patterns
- [ ] Data generation prompt engineering:
  - Generate N items (user-selected, max 50) matching structure
  - Respect field types, patterns, relationships
  - Use optional user AI description for context
- [ ] POST /api/projects/:projectId/endpoints/:id/generate - Trigger AI data generation
- [ ] Store generated data in DB (generatedData field)
- [ ] Pagination logic: slice generated data based on page/limit params
- [ ] Frontend: Generate button on endpoint detail page
- [ ] Frontend: Preview generated data
- [ ] Frontend: AI provider settings page

## AI Prompt Strategy
1. Send JSON structure to AI
2. AI identifies root array, pagination, field semantics
3. AI generates N realistic items
4. Store full dataset in DB
5. Serve sliced data with correct pagination on API calls

## Acceptance Criteria
- AI correctly identifies root data array and pagination
- Generates realistic, varied data matching structure
- Supports at least 2 AI providers
- Data persisted in DB after generation
- User can re-generate data
