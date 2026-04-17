# Phase 08: Docker & Deployment

**Status:** COMPLETED

## Goal
Production-ready Docker setup. Single `docker-compose up` boots entire stack.

## Tasks

- [ ] Backend Dockerfile (multi-stage build)
- [ ] Frontend Dockerfile (build + nginx serve)
- [ ] docker-compose.yml:
  - MongoDB with volume persistence
  - Backend with env vars
  - Frontend with nginx config
  - Network config
- [ ] Environment variable documentation
- [ ] Health check endpoints
- [ ] MongoDB initialization script (optional indexes)
- [ ] Nginx config for frontend (SPA routing + API proxy)
- [ ] .dockerignore files
- [ ] README with setup instructions

## Acceptance Criteria
- `docker-compose up` starts full stack from scratch
- Data persists across container restarts (MongoDB volume)
- Frontend proxies API requests to backend
- All environment variables configurable
