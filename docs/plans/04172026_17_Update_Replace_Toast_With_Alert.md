# Update: Replace Toast Notifications with Alert Message Boxes

**Status:** COMPLETED
**Date:** 2026-04-17

## Current Behavior
- Uses `react-hot-toast` library for all success/error notifications
- Toast appears as small floating popup in top-right corner
- `<Toaster position="top-right" />` in App.tsx
- 31+ toast calls across 11 files (8 pages + 2 modals + App.tsx)

## Desired Behavior
- Use inline alert message boxes (not modal, not toast) for all API success/error feedback
- Alert banners appear at the top center of the page with success (green) or error (red) styling
- Auto-dismiss after 4s (success) or 7s (error), with manual close button
- Supports deduplication via optional `id` parameter

## Change Strategy
1. Created `AlertContext` with `AlertProvider`, `useAlert` hook, and `AlertDisplay` component
2. Replaced `<Toaster />` with `<AlertProvider>` wrapping the entire app
3. Replaced all `toast.success()`/`toast.error()` calls with `showAlert('success'|'error', message)`
4. Removed all `react-hot-toast` imports

## Affected Files
- `frontend/src/context/AlertContext.tsx` (NEW)
- `frontend/src/App.tsx`
- `frontend/src/pages/EndpointDetailPage.tsx`
- `frontend/src/pages/EndpointListPage.tsx`
- `frontend/src/pages/ProjectListPage.tsx`
- `frontend/src/pages/ProjectFormPage.tsx`
- `frontend/src/pages/SettingsPage.tsx`
- `frontend/src/pages/LoginPage.tsx`
- `frontend/src/pages/RegisterSystemAccountPage.tsx`
- `frontend/src/pages/ChangePasswordPage.tsx`
- `frontend/src/components/endpoint/AddEndpointModal.tsx`
- `frontend/src/components/endpoint/CreateResourceModal.tsx`

## Tasks
- [x] Create AlertContext with provider, hook, and display component
- [x] Update App.tsx - remove Toaster, add AlertProvider
- [x] Replace toast calls in all 8 page files
- [x] Replace toast calls in 2 modal components
- [x] Verify TypeScript compilation passes

## Breaking Changes
None. `react-hot-toast` package remains in package.json (unused, can be removed later).
