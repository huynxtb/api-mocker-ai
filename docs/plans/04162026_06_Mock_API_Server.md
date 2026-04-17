# Phase 06: Mock API Server (Dynamic Route Serving)

**Status:** COMPLETED

## Goal
Serve mock APIs as real HTTP endpoints. Requests to `{apiPrefix}/{basePath}/{customEndpoint}` return generated data with correct HTTP method, status code, and pagination.

## Tasks

- [ ] Dynamic route handler: catch-all route matching `/:projectSlug/api/*`
- [ ] Route resolution: match incoming request (method + path) to stored ApiEndpoint
- [ ] Response serving:
  - Return generatedData with correct statusCode
  - For list endpoints: apply pagination (page, limit query params)
  - For detail endpoints: return single item by id param
  - For create/update: echo back request body with generated id
  - For delete: return success response
- [ ] Pagination middleware:
  - Parse page/limit from query params
  - Slice generatedData array
  - Return pagination metadata matching user's structure
- [ ] CORS enabled for all mock endpoints
- [ ] Error responses: 404 for unknown endpoints, proper error format
- [ ] Frontend: Display callable API URLs for each endpoint
- [ ] Frontend: "Try it" button or copy URL button

## Acceptance Criteria
- GET `vin-manage-ai/api/user-management` returns paginated list with correct structure
- GET `vin-manage-ai/api/user-management/1` returns single item
- POST/PUT/DELETE endpoints respond correctly
- Custom endpoints (e.g., `/approve`) work
- Status codes match configured values
- Pagination params work (page, limit)
