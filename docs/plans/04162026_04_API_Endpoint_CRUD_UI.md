# Phase 04: API Endpoint CRUD & UI

**Status:** COMPLETED

## Goal
CRUD for API endpoints within a project. Detail page with custom response, status code, method, pagination config.

## Tasks

### Backend
- [ ] POST /api/projects/:projectId/endpoints - Create endpoint (auto-generates 5 default RESTful endpoints)
- [ ] GET /api/projects/:projectId/endpoints - List endpoints
- [ ] GET /api/projects/:projectId/endpoints/:id - Get endpoint detail
- [ ] PUT /api/projects/:projectId/endpoints/:id - Update endpoint (custom endpoint, method, status code, response structure, AI prompt, item count)
- [ ] DELETE /api/projects/:projectId/endpoints/:id - Delete endpoint
- [ ] Auto-create default endpoints: list(GET), detail(GET /:id), create(POST), update(PUT /:id), delete(DELETE /:id)

### Frontend
- [ ] API Endpoints list page (shows project name, description, list of endpoints)
- [ ] Create API Resource form (Name, Description, Base Endpoint with Custom toggle)
- [ ] Endpoint detail/edit page:
  - Custom Endpoint field
  - HTTP Method selector
  - Status Code input
  - Response JSON structure textarea (code editor)
  - AI description textarea (optional)
  - Item count selector (1-50, default 20)
- [ ] Add new endpoint button
- [ ] Delete endpoint button with confirmation
- [ ] Full path preview showing final URL

## Acceptance Criteria
- Creating "User Management" auto-generates 5 RESTful endpoints
- Each endpoint individually editable (method, status, response structure, etc.)
- User can add extra endpoints (e.g., "approve")
- User can delete any endpoint
- Full path displays correctly: `{apiPrefix}/{basePath}/{customEndpoint}`
