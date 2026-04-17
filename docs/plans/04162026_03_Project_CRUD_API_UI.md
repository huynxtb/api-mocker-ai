# Phase 03: Project CRUD - API & UI

**Status:** COMPLETED

## Goal
Full CRUD for Projects: backend REST APIs + frontend pages (List Projects, Create/Edit Project).

## Tasks

### Backend
- [ ] POST /api/projects - Create project
- [ ] GET /api/projects - List projects
- [ ] GET /api/projects/:id - Get project detail
- [ ] PUT /api/projects/:id - Update project
- [ ] DELETE /api/projects/:id - Delete project
- [ ] Input validation (name required, unique slug)

### Frontend
- [ ] API client service for projects
- [ ] List Projects page (table/cards with name, prefix, description, actions)
- [ ] Create Project page/modal (name, description fields)
- [ ] Edit Project page/modal
- [ ] Delete confirmation dialog
- [ ] Navigation between pages

## Acceptance Criteria
- User can create project with name, see generated apiPrefix
- User can list, edit, delete projects
- Slug auto-generated from name
- Validation errors shown in UI
