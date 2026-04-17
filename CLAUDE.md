# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

API Mocker AI — web app that generates realistic mock API data using AI. Users define projects with RESTful endpoints, paste a JSON response structure, and AI generates matching mock data served via live API endpoints. Think "API spec with real data" for frontend teams.

## Commands

### Backend (from `backend/`)
- `npm run dev` — start dev server with tsx watch (port 4000)
- `npm run build` — compile TypeScript
- `npm run start` — run compiled JS
- `npm run lint` — ESLint

### Frontend (from `frontend/`)
- `npm run dev` — Vite dev server (port 4002), proxies `/api` and `/mock` to backend
- `npm run build` — TypeScript check + Vite build
- `npm run lint` — ESLint

### Docker
- `docker-compose up` — runs MongoDB (27017), backend (4000), frontend (4002)

### Environment
- Backend reads `.env`: `PORT`, `MONGODB_URI`, `ENCRYPTION_KEY`, `CORS_ORIGINS`, `NODE_ENV`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_TTL` (default `60m`), `JWT_REFRESH_TTL` (default `7d`)
- Frontend uses Vite proxy in dev; `VITE_BACKEND_URL` overrides backend target (default `http://localhost:4000`)
- `ENCRYPTION_KEY` (64-char hex or any string) encrypts AI API keys at rest. Auto-generated if missing but won't persist across restarts.
- JWT secrets auto-generate on boot if missing — dev only; set in prod or every restart logs all users out.

## Architecture

Monorepo with two packages, no shared code. Backend uses **Clean Architecture** layers:

```
backend/src/
  domain/          — entities (Project, ApiEndpoint, Settings, User), repository interfaces, IAiProvider
  application/     — use cases (Project, Endpoint, Settings, GenerateData, Auth)
  infrastructure/  — MongoDB (Mongoose), AI providers, config, crypto (AES-256-GCM), auth (jwt + bcrypt)
  presentation/    — Express routes, controllers, authMiddleware, errorHandler
```

Frontend is a standard **React + Vite + TailwindCSS** SPA:

```
frontend/src/
  pages/           — Project/Endpoint/Settings pages + Login, RegisterSystemAccount, ChangePassword
  components/      — layout, common (ConfirmDialog, LoadingSkeleton), endpoint modals
  context/         — AuthContext (loading/no-account/unauthenticated/authenticated states)
  services/api.ts  — Axios client (projectApi, endpointApi, settingsApi, authApi) with refresh interceptor
  hooks/, utils/   — useTheme etc.
  i18n/            — 4 locales: en, vi, zh, ja
  types/           — shared TypeScript interfaces
```

### Key Data Flow

1. **Project** has a `slug`/`apiPrefix` (e.g., `vin-manage-ai/api`)
2. Creating an **endpoint resource** auto-generates 5 default CRUD endpoints (list, detail, create, update, delete)
3. Each endpoint stores `responseStructure` (user-pasted JSON), `generatedData` (AI output), pagination config
4. `GenerateDataUseCase` picks AI provider from Settings, calls `IAiProvider.generateMockData()`, stores result, then **syncs data to sibling `:id` endpoints** so detail/update/delete share the same dataset
5. Mock API served at `/mock/{fullPath}` — catch-all router matches exact paths first, then parameterized routes (`:id`)

### AI Provider System

Factory pattern (`AiProviderFactory`) supporting OpenAI, Gemini, Grok. All implement `IAiProvider`. API keys stored encrypted in MongoDB Settings collection (AES-256-GCM).

### Routing

- Auth API: `/api/auth/*` — `status`, `register` (bootstrap only, 403 after first account), `login`, `refresh`, `logout`, `change-password`, `me`
- Admin API (wrapped with `authMiddleware`): `/api/projects`, `/api/projects/:id/endpoints`, `/api/settings`
- Mock API: `/mock/*` — **public by design**, catch-all matching `fullPath` + `httpMethod` in DB
- Frontend routes: `/`, `/projects/new`, `/projects/:id/edit`, `/projects/:projectId/endpoints`, `/projects/:projectId/endpoints/:endpointId`, `/settings`, `/login`, `/setup`, `/change-password`
- `SettingsGuard` component redirects to `/settings` if active AI provider has no key configured

### Authentication

- Single-account model. First run: `/api/auth/status` returns `hasAccount:false` → FE redirects to `/setup`. Additional registrations are blocked with 403.
- Access JWT TTL 60m, refresh TTL 7d. Refresh token stored as SHA-256 hash on `User.refreshTokenHash` (one active per user, rotated on login, cleared on logout / password change).
- Passwords hashed with `bcryptjs` (10 rounds). Tokens sent via `Authorization: Bearer`, stored in `localStorage` as `apimocker.accessToken` / `apimocker.refreshToken`.
- Axios interceptor auto-refreshes on 401 (single-flight). `AuthProvider` in `frontend/src/App.tsx` gates every route automatically — new pages need no extra wiring.

## i18n

All user-facing strings must use `react-i18next` `t()` function. Four locale files in `frontend/src/i18n/locales/`: `en.json`, `vi.json`, `zh.json`, `ja.json`. Always update all four when adding UI text.

## Language

Project description and docs (`DESCRIPTION.md`, `FIX.md`) are in Vietnamese. Code, comments, and commit messages should be in English.
