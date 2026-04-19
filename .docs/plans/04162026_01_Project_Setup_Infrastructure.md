# Phase 01: Project Setup & Infrastructure

**Status:** COMPLETED

## Goal
Scaffold entire project: Docker, MongoDB, Node.js backend (Express, Clean Architecture), React frontend (Vite), monorepo structure.

## Tasks

- [ ] Create monorepo structure (`/backend`, `/frontend`)
- [ ] Backend: Express + TypeScript, Clean Architecture layers (domain, application, infrastructure, presentation)
- [ ] Frontend: React + Vite + TypeScript
- [ ] Docker Compose: MongoDB, backend, frontend
- [ ] Environment config (.env files)
- [ ] ESLint + Prettier config
- [ ] Backend: MongoDB connection via Mongoose
- [ ] Backend: Base error handling middleware
- [ ] Frontend: Routing setup (React Router)
- [ ] Frontend: Base layout component

## Architecture

```
backend/
  src/
    domain/         # Entities, interfaces
    application/    # Use cases, DTOs
    infrastructure/ # DB repos, AI providers, external services
    presentation/   # Routes, controllers, middleware
    config/         # App config
  Dockerfile
frontend/
  src/
    components/
    pages/
    services/       # API client
    hooks/
    i18n/
    types/
  Dockerfile
docker-compose.yml
```

## Acceptance Criteria
- `docker-compose up` boots all 3 services (mongo, backend, frontend)
- Backend responds to health check
- Frontend renders base layout
