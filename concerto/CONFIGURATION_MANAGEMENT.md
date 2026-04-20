# Configuration Management System

**Piloter la structure de fichiers d'IA depuis l'interface graphique**

Complete CRUD operations for managing AI calibration files directly from the UI.

## Overview

The Configuration Management System provides a dedicated sidebar panel in the CONCERTO dashboard for managing all AI calibration files:

- **Specs** - AI specifications (SPEC-XXX format)
- **Prompts** - Role-based prompts by phase
- **Maestros** - AI personality profiles
- **Workflows** - Process workflows

## Features

### ✅ Complete CRUD Operations

- **Create** - Generate new specifications, prompts, maestros, workflows
- **Read** - View all items with metadata and detailed content
- **Update** - Edit frontmatter and markdown body
- **Delete** - Remove items safely with confirmation

### 📋 Resource Types

#### Specs (Specifications)
```yaml
id: SPEC-001
title: Feature Name
phase: dev | test | deploy
status: draft | approved | in-progress | completed
owner: Team/Person name
priority: high | medium | low
version: 1.0
```

#### Prompts (Role-based)
```yaml
role: Backend Developer | Frontend Developer | QA
phase: dev | test | deploy
action: review | refactor | optimize | test
version: 1.0
triggers: [trigger1, trigger2]
```

#### Maestros (AI Profiles)
```yaml
name: Profile Name
phase: dev | test | deploy
category: core | dev | qa
expertise: [skill1, skill2, skill3]
version: 1.0
```

#### Workflows
```yaml
id: WORKFLOW_NAME
title: Workflow Title
version: 1.0
```

## Usage

### Accessing Configuration Panel

1. Open CONCERTO dashboard
2. Click the **Settings ⚙️** button in the top-right corner
3. Configuration panel slides in from the right

### Tabs Navigation

The panel contains 4 tabs:
- **Specs** (📋) - Manage specifications
- **Prompts** (💬) - Manage prompts
- **Maestros** (🎭) - Manage AI profiles
- **Workflows** (🔄) - Manage workflows

### Viewing Items

1. Select tab for desired resource type
2. Items appear in a list
3. Click item to expand and view metadata
4. Expanded view shows all frontmatter fields

### Creating Items

1. Navigate to desired tab
2. Click **New [Type]** button at bottom
3. Fill form fields:
   - Required fields marked with *
   - Use dropdowns for predefined options
4. Click **Save** to create

### Editing Items

1. Hover over item in list
2. Click **Edit** button (pencil icon)
3. Form opens with current values
4. Modify fields as needed
5. Click **Save** to update

### Deleting Items

1. Hover over item in list
2. Click **Delete** button (trash icon)
3. Confirm deletion in dialog
4. Item removed from file system

## Backend Routes

All operations communicate with REST API on port 3500:

### Configuration Endpoints

```
GET    /api/config/specs              List all specs
POST   /api/config/specs              Create new spec
GET    /api/config/specs/:id          Get spec details
PUT    /api/config/specs/:id          Update spec
DELETE /api/config/specs/:id          Delete spec

GET    /api/config/prompts            List all prompts
GET    /api/config/prompts?phase=dev  Filter by phase
POST   /api/config/prompts            Create new prompt
GET    /api/config/prompts/:id        Get prompt details
PUT    /api/config/prompts/:id        Update prompt
DELETE /api/config/prompts/:id        Delete prompt

(maestros and workflows follow same pattern)
```

### Response Format

```json
{
  "id": "SPEC-001",
  "title": "Feature Name",
  "filename": "SPEC-001-feature-name.md",
  "path": "/full/path/to/file.md",
  "frontmatter": {
    "id": "SPEC-001",
    "title": "Feature Name",
    "phase": "dev",
    // ... all YAML front matter fields
  },
  "modified": "2024-01-15T10:30:00Z",
  "content": "Full markdown content"
}
```

## File Organization

Configuration files are organized by type:

```
concerto-config/
├── spec/                    # Specifications
│   ├── SPEC-001-*.md
│   └── SPEC-002-*.md
├── dev/
│   ├── prompts/             # Dev phase prompts
│   ├── rules/
│   └── sprints/
├── test/
│   ├── prompts/             # Test phase prompts
│   ├── rules/
│   └── sprints/
└── deploy/
    ├── prompts/             # Deploy phase prompts
    ├── rules/
    └── sprints/

maestros/
├── core/
│   └── profile-name.md
├── dev/
│   └── profile-name.md
└── qa/
    └── profile-name.md

workflows/
├── workflow-1.md
└── workflow-2.md
```

## Technical Details

### Frontend Component

**File**: `engine/dashboard/client/src/components/ConfigPanel.tsx`

- React component with sidebar panel
- Fetches data from backend API
- Handles form submission and validation
- Expandable list view for items

### Backend Services

**File**: `engine/dashboard/server/fileManager.js`

- Node.js file I/O operations
- YAML frontmatter parsing/generation
- Directory management
- Manager classes for each resource type

**File**: `engine/dashboard/server/server.js`

- Express-style HTTP request handling
- RESTful endpoints for CRUD operations
- Error handling and validation

### ID Generation

- **Specs**: Auto-generated SPEC-XXX format
- **Others**: kebab-case from name/filename

## Error Handling

The system validates:

- Required fields presence
- YAML frontmatter syntax
- File path conflicts
- Directory permissions

Errors return descriptive HTTP status codes:
- `400` - Bad request (validation failed)
- `404` - Not found (item doesn't exist)
- `409` - Conflict (file already exists)
- `500` - Server error

## Example Workflow

### Creating a New Spec

1. Open Configuration panel
2. Select **Specs** tab
3. Click **New Spec**
4. Fill form:
   - Title: "User Authentication"
   - Phase: dev
   - Owner: "Backend Team"
   - Priority: high
   - Description: "Implement OAuth 2.0 authentication"
5. Click Save
6. New SPEC-XXX file created in `concerto-config/spec/`

### Managing Prompts

1. Select **Prompts** tab
2. List shows all prompts (filterable by phase)
3. Edit: Hover → Edit button → Modify fields → Save
4. Delete: Hover → Delete button → Confirm

## Keyboard Shortcuts

- `Esc` - Close configuration panel
- `Enter` - Save form (when in form focus)

## Performance Notes

- Item list loads on tab selection
- Forms validate in real-time
- API calls are debounced
- UI updates optimistically

## Future Enhancements

- [ ] Bulk operations (create multiple items at once)
- [ ] Import/export functionality
- [ ] Search and advanced filtering
- [ ] Markdown editor with live preview
- [ ] Template presets for common patterns
- [ ] Version history and rollback
- [ ] Collaborative editing indicators

## Troubleshooting

**Panel not appearing?**
- Check Settings button in top bar
- Ensure backend server running on port 3500

**Cannot save items?**
- Verify backend API responding (`GET http://localhost:3500/api/config/specs`)
- Check browser console for errors
- Ensure directories exist in filesystem

**Items not loading?**
- Check file paths match expected structure
- Verify YAML syntax in markdown files
- Check file permissions

For issues, check `/concerto.log` for backend errors.
