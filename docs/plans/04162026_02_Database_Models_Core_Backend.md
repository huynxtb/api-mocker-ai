# Phase 02: Database Models & Core Backend

**Status:** COMPLETED

## Goal
Define MongoDB schemas and implement repository + service layers for Project and ApiEndpoint entities.

## Tasks

- [ ] Domain: Project entity (name, slug, description, apiPrefix, createdAt, updatedAt)
- [ ] Domain: ApiEndpoint entity (projectId, name, description, endpoint, customEndpoint, httpMethod, statusCode, responseStructure, generatedData, aiPrompt, pagination config, createdAt, updatedAt)
- [ ] Infrastructure: Mongoose schemas for Project, ApiEndpoint
- [ ] Infrastructure: ProjectRepository implementation
- [ ] Infrastructure: ApiEndpointRepository implementation
- [ ] Application: Project use cases (create, list, get, update, delete)
- [ ] Application: ApiEndpoint use cases (create, list, get, update, delete, generateData)
- [ ] Utility: Slug generator (e.g., "Vin Manage AI" -> "vin-manage-ai")
- [ ] Utility: RESTful endpoint normalizer (e.g., "User Management" -> "user-management")

## Data Models

### Project
```
{
  _id, name, slug, description, apiPrefix,
  createdAt, updatedAt
}
```

### ApiEndpoint
```
{
  _id, projectId, name, description,
  basePath, customEndpoint, fullPath,
  httpMethod (GET/POST/PUT/DELETE/PATCH),
  statusCode (default 200),
  responseStructure (JSON string - user input),
  generatedData (JSON - AI generated, stored),
  aiPrompt (optional user hint),
  itemCount (default 20, max 50),
  paginationConfig, isDefault,
  createdAt, updatedAt
}
```

## Acceptance Criteria
- All CRUD operations work via repository layer
- Slug generation correct
- Default 5 endpoints auto-created on API resource creation (list, detail, create, update, delete)
