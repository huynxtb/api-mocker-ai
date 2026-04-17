# Feature: Authentication

**Status:** COMPLETED
**Date:** 2026-04-17

## Goal

Add login/logout with JWT (access token 60m) + refresh token. Hash passwords. Gate all admin pages behind login. On first run, if no account exists, redirect user to a "Create System Account" page that can be used only once. Add a change-password page for logged-in users. Mock API endpoints (`/mock/*`) remain public.

## Affected Files

### Backend (new)
- `backend/src/domain/entities/User.ts`
- `backend/src/domain/interfaces/IUserRepository.ts`
- `backend/src/infrastructure/database/models/UserModel.ts`
- `backend/src/infrastructure/database/repositories/UserRepositoryImpl.ts`
- `backend/src/infrastructure/auth/password.ts`
- `backend/src/infrastructure/auth/jwt.ts`
- `backend/src/application/use-cases/AuthUseCases.ts`
- `backend/src/presentation/controllers/AuthController.ts`
- `backend/src/presentation/routes/authRoutes.ts`
- `backend/src/presentation/middleware/authMiddleware.ts`

### Backend (modified)
- `backend/package.json` — add `bcryptjs`, `jsonwebtoken`, `@types/bcryptjs`, `@types/jsonwebtoken`
- `backend/src/infrastructure/config/index.ts` — add JWT secrets + TTLs
- `backend/src/server.ts` — mount auth routes; protect `/api/projects` & `/api/settings` with `authMiddleware`
- `backend/src/presentation/routes/projectRoutes.ts`, `endpointRoutes.ts`, `settingsRoutes.ts` — keep, middleware applied in server.ts

### Frontend (new)
- `frontend/src/pages/LoginPage.tsx`
- `frontend/src/pages/RegisterSystemAccountPage.tsx`
- `frontend/src/pages/ChangePasswordPage.tsx`
- `frontend/src/context/AuthContext.tsx`

### Frontend (modified)
- `frontend/src/services/api.ts` — axios interceptors: attach access token; on 401 call `/auth/refresh`; add `authApi`
- `frontend/src/App.tsx` — wrap with AuthProvider; add `/login`, `/setup`, `/change-password` routes; add `AuthGuard`
- `frontend/src/components/layout/Layout.tsx` — logout button, change password link, hide nav if not logged in
- `frontend/src/i18n/locales/{en,vi,zh,ja}.json` — auth keys

## Tasks

- [x] Install backend deps (`bcryptjs`, `jsonwebtoken`, types)
- [x] Backend: domain entity + repo interface
- [x] Backend: User mongoose model + repo impl
- [x] Backend: password (bcrypt) + jwt utils
- [x] Backend: AuthUseCases (register-system, login, refresh, logout, changePassword, status)
- [x] Backend: AuthController + routes
- [x] Backend: authMiddleware
- [x] Backend: config JWT secrets + TTL
- [x] Backend: mount auth routes + protect `/api/projects`, `/api/settings`
- [x] Backend: `tsc --noEmit` passes
- [x] Frontend: AuthContext + token storage
- [x] Frontend: api.ts interceptors + authApi
- [x] Frontend: LoginPage, RegisterSystemAccountPage, ChangePasswordPage
- [x] Frontend: AuthGuard + routing
- [x] Frontend: Layout updates (logout, change pw)
- [x] Frontend: i18n 4 locales
- [x] Frontend: `tsc --noEmit` passes

## Architecture Decisions

- **bcryptjs over bcrypt** — pure JS, no native build; acceptable speed for a single-user admin app.
- **Refresh token storage** — store bcrypt-hashed refresh token on the `User` document (`refreshTokenHash`). One active refresh per user. Login rotates it; logout clears it. Simple, no extra collection.
- **Access token TTL 60m, refresh TTL 7d** — matches spec (60m) and lets logged-in users stay warm for a week.
- **Single-account system** — `POST /api/auth/register` is gated by `User.countDocuments() === 0`. Once an account exists, the endpoint (and the setup UI) return 403. "Full permission" is implicit — no role field yet; every authenticated user can do everything.
- **Token transport** — `Authorization: Bearer` header. Tokens stored in `localStorage` on the client. Matches existing Axios setup; no new CORS/cookie work.
- **Mock API stays public** — `/mock/*` is not gated; only `/api/*` (except `/api/auth/*`) requires auth. Mock consumers are external clients, not humans.
- **JWT secrets** — `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` from env. Auto-generate at boot if absent (dev convenience) with a warning, same pattern as `ENCRYPTION_KEY`. Non-persistent across restarts when auto-generated — users must set env for prod.

## Risks

- If `JWT_*_SECRET` is not set in prod, restarts invalidate tokens and log everyone out. `.env.example` should mention.
- `localStorage` tokens are vulnerable to XSS. Helmet + React escaping mitigate; acceptable for now.
- Refresh-token rotation: we don't rotate the refresh on each use (only on login). Good enough for single-user admin; revisit if multi-device matters.
