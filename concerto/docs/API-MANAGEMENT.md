---
title: "API Reference - File Management System"
version: "1.0"
---

# API Reference - Configuration Management

## Endpoints for .md Files Management

### Specs API

```
GET    /api/config/specs              # List all specs
GET    /api/config/specs/:id          # Get specific spec
POST   /api/config/specs              # Create new spec
PUT    /api/config/specs/:id          # Update spec
DELETE /api/config/specs/:id          # Delete spec

GET    /api/config/specs/search?q=text  # Search specs
```

**Example GET /api/config/specs**
```json
[
  {
    "id": "SPEC-001",
    "title": "Dev Page Frontend",
    "filename": "SPEC-001-dev-page.md",
    "phase": "dev",
    "status": "in-progress",
    "version": "1.0",
    "owner": "Frontend Developer",
    "priority": "high",
    "related": ["SPEC-002"],
    "path": "concerto-config/spec/SPEC-001-dev-page.md",
    "content": "# Full markdown content...",
    "modified": "2026-04-18T12:30:00Z"
  }
]
```

**Example POST /api/config/specs**
```json
{
  "title": "New Feature",
  "phase": "dev",
  "status": "draft",
  "owner": "Backend Developer",
  "priority": "medium",
  "description": "Feature description",
  "criteria": ["Criterion 1", "Criterion 2"]
}
```

### Prompts API

```
GET    /api/config/prompts               # List all prompts
GET    /api/config/prompts/:id           # Get specific prompt
POST   /api/config/prompts               # Create new prompt
PUT    /api/config/prompts/:id           # Update prompt
DELETE /api/config/prompts/:id           # Delete prompt

GET    /api/config/prompts/phase/:phase  # Prompts for a phase
GET    /api/config/prompts/role/:role    # Prompts for a role
```

**Example GET /api/config/prompts**
```json
[
  {
    "id": "implement-feature-backend",
    "filename": "implement-feature-backend.md",
    "role": "Backend Developer",
    "phase": "dev",
    "action": "implement-feature",
    "version": "1.0",
    "triggers": ["feature-request", "sprint-start"],
    "path": "concerto-config/dev/prompts/implement-feature-backend.md",
    "content": "# Prompt content...",
    "modified": "2026-04-18T12:30:00Z"
  }
]
```

### Maestros API

```
GET    /api/config/maestros             # List all maestros
GET    /api/config/maestros/:id         # Get specific maestro
POST   /api/config/maestros             # Create new maestro
PUT    /api/config/maestros/:id         # Update maestro
DELETE /api/config/maestros/:id         # Delete maestro

GET    /api/config/maestros/phase/:phase  # Maestros for phase
```

**Example GET /api/config/maestros**
```json
[
  {
    "id": "backend-dev",
    "filename": "backend-dev.md",
    "name": "Backend Developer",
    "phase": "dev",
    "category": "dev",
    "expertise": ["typescript", "nodejs", "databases"],
    "path": "maestros/dev/backend-dev.md",
    "content": "# Maestro profile...",
    "modified": "2026-04-18T12:30:00Z"
  }
]
```

### Workflows API

```
GET    /api/config/workflows            # List all workflows
GET    /api/config/workflows/:id        # Get specific workflow
POST   /api/config/workflows            # Create new workflow
PUT    /api/config/workflows/:id        # Update workflow
DELETE /api/config/workflows/:id        # Delete workflow
```

**Example GET /api/config/workflows**
```json
[
  {
    "id": "WF-FEATURE",
    "filename": "new-feature.md",
    "title": "Workflow: Nouvelle Fonctionnalité",
    "path": "workflows/new-feature.md",
    "phases": ["conception", "dev", "test", "deploy"],
    "content": "# Workflow content...",
    "modified": "2026-04-18T12:30:00Z"
  }
]
```

### File Upload API

```
POST   /api/config/upload              # Upload .md file
POST   /api/config/import              # Import multiple files (zip)
GET    /api/config/export              # Export all configs (zip)
```

### Tracking API

```
GET    /api/config/tracking            # Get TRACKING.md
PUT    /api/config/tracking            # Update TRACKING.md
```

## Error Responses

```json
// 400 Bad Request - Validation failed
{
  "error": "Invalid YAML frontmatter",
  "details": "Missing required field: 'id'",
  "code": "VALIDATION_ERROR"
}

// 404 Not Found
{
  "error": "Spec not found",
  "id": "SPEC-999",
  "code": "NOT_FOUND"
}

// 409 Conflict - File already exists
{
  "error": "File already exists",
  "path": "concerto-config/spec/SPEC-001-dev-page.md",
  "code": "ALREADY_EXISTS"
}
```

## Validation Rules

### Specs
- `id`: SPEC-XXX format (required, unique)
- `title`: Non-empty string (required)
- `phase`: One of [conception, dev, test, deploy, security] (required)
- `status`: One of [draft, approved, in-progress, completed, blocked] (required)
- `version`: Semantic version (required)
- `owner`: Non-empty string (required)

### Prompts
- `role`: Non-empty string (required)
- `phase`: Valid phase (required)
- `action`: kebab-case (required)
- `version`: Semantic version (required)

### Maestros
- `id`: kebab-case (required, unique)
- `name`: Non-empty string (required)
- `phase`: Valid phase (required)
- `category`: One of [core, dev, qa] (required)

## File Structure

After operations, files are organized as:
```
concerto-config/
├── spec/
│   ├── SPEC-001-name.md
│   ├── SPEC-002-name.md
│   └── TRACKING.md
├── dev/prompts/
│   ├── action-1.md
│   └── action-2.md
├── test/prompts/
│   └── action.md
└── deploy/prompts/
    └── action.md

maestros/
├── dev/
│   ├── backend-dev.md
│   └── frontend-dev.md
└── qa/
    ├── tester.md
    └── reviewer.md

workflows/
├── new-feature.md
├── bug-fix.md
└── hotfix.md
```

## Response Headers

All responses include:
```
X-Total-Count: 10          # For list endpoints
X-Last-Modified: ISO8601   # Last file modification time
Content-Type: application/json
```
