# CONCERTO Configuration Management Implementation

## Summary

Fully implemented a **configuration management system** allowing complete UI-driven control of AI calibration files (Specs, Prompts, Maestros, Workflows) from a dedicated sidebar panel in the CONCERTO dashboard.

**User Requirement (French →)**: *"L'idée est de pouvoir pilotter la structure de fichier liée au calibrage de l'ia. En effet tout doit pouvoir etre fait depuis l'interface graphique"*

**Translation**: "The idea is to be able to control the file structure related to AI calibration. Everything must be doable from the graphical interface"

## What Was Implemented

### ✅ Backend Infrastructure

**File**: `engine/dashboard/server/fileManager.js` (350+ lines)
- YAML frontmatter parsing and generation
- File I/O operations (read/write/delete/list)
- Manager classes for each resource type:
  - `specsManager` - Handles SPEC-XXX specifications
  - `promptsManager` - Handles role-based prompts by phase
  - `maestrosManager` - Handles AI personality profiles
  - `workflowsManager` - Handles workflow definitions
- Full CRUD interface (create, read, update, delete)
- Error handling for edge cases

**File**: `engine/dashboard/server/server.js` (200+ lines added)
- RESTful API endpoints for all 4 resource types
- HTTP methods: GET, POST, PUT, DELETE
- Query parameter support (filtering)
- Response headers with metadata (X-Total-Count, X-Last-Modified)
- Input validation and error responses
- Proper HTTP status codes (200, 201, 400, 404, 500)

**File**: `engine/dashboard/server/fileManager.js`
- Node.js version (not TypeScript) for server.js compatibility
- No external dependencies except `yaml` library

### ✅ Frontend UI Components

**File**: `engine/dashboard/client/src/components/ConfigPanel.tsx` (500+ lines)
- Sidebar panel (right-side) with smooth animations
- Tab navigation for 4 resource types
- Sortable item list with expand/collapse details
- Hover actions (Edit, Delete buttons)
- Modal form for CRUD operations
- Real-time form validation
- Loading states and error handling
- Responsive design consistent with existing dashboard

**File**: `engine/dashboard/client/src/components/TopBar.tsx` (updated)
- Added Settings button (⚙️) to open configuration panel
- Integration with existing phase navigation

**File**: `engine/dashboard/client/src/components/DashboardLayout.tsx` (updated)
- Imported and mounted ConfigPanel component
- Added state management for panel open/close
- Passes onConfigClick handler to TopBar

### ✅ API Specification

**File**: `docs/API-MANAGEMENT.md` (reference document)
- Complete endpoint specifications
- Request/response examples
- Error handling patterns
- Validation rules for each resource type

### ✅ Dependencies

**File**: `engine/package.json` (updated)
- Added `yaml@^2.3.1` for frontmatter parsing
- Required for Node.js server

## Architecture Overview

```
┌─────────────────────────────────────────────┐
│  CONCERTO Dashboard (Next.js Frontend)      │
│  - TopBar with Settings button (⚙️)          │
│  - ConfigPanel (Right Sidebar)              │
│    ├── Specs Tab (📋)                        │
│    ├── Prompts Tab (💬)                      │
│    ├── Maestros Tab (🎭)                     │
│    └── Workflows Tab (🔄)                    │
└─────────────────────────────────────────────┘
                      ↓ HTTP/REST
┌─────────────────────────────────────────────┐
│  Backend API Server (Node.js, Port 3500)    │
│  - /api/config/specs/*                      │
│  - /api/config/prompts/*                    │
│  - /api/config/maestros/*                   │
│  - /api/config/workflows/*                  │
└─────────────────────────────────────────────┘
                      ↓ File I/O
┌─────────────────────────────────────────────┐
│  File System (Markdown with YAML Frontmatter)│
│  - concerto-config/spec/SPEC-*.md           │
│  - concerto-config/{phase}/prompts/*.md     │
│  - maestros/{category}/*.md                 │
│  - workflows/*.md                           │
└─────────────────────────────────────────────┘
```

## Features Implemented

### CRUD Operations
- ✅ **Create**: Form modal to create new items with auto-generated IDs
- ✅ **Read**: List view with expandable details
- ✅ **Update**: Edit form populated with current values
- ✅ **Delete**: Confirmation dialog before deletion

### Resource Management
- ✅ **Specs**: Auto-ID generation (SPEC-001, SPEC-002, etc.)
- ✅ **Prompts**: Phase/role filtering
- ✅ **Maestros**: Category organization (core/dev/qa)
- ✅ **Workflows**: Simple workflow management

### UI/UX
- ✅ Sidebar panel (not embedded modals)
- ✅ Tab navigation between resource types
- ✅ Expandable list items with metadata
- ✅ Hover-activated action buttons
- ✅ Modal forms with validation
- ✅ Loading states during operations
- ✅ Success/error feedback
- ✅ Keyboard support (Escape to close)

### Data Protection
- ✅ Confirmation dialogs for destructive actions
- ✅ Required field validation
- ✅ YAML frontmatter validation
- ✅ File path conflict detection
- ✅ Graceful error handling

## File Organization

```
concerto/
├── CONFIGURATION_MANAGEMENT.md ← User documentation
├── engine/
│   ├── package.json ← Updated with yaml dependency
│   ├── dashboard/
│   │   ├── client/src/components/
│   │   │   ├── ConfigPanel.tsx ← Main UI panel (new)
│   │   │   ├── TopBar.tsx ← Updated with Settings button
│   │   │   └── DashboardLayout.tsx ← Updated layout integration
│   │   └── server/
│   │       ├── fileManager.js ← File I/O service (new)
│   │       └── server.js ← Updated with API routes
│   └── src/
│       └── index.ts
├── concerto-config/
│   ├── spec/ ← Managed by ConfigPanel
│   ├── dev/prompts/ ← Managed by ConfigPanel
│   ├── test/prompts/ ← Managed by ConfigPanel
│   └── deploy/prompts/ ← Managed by ConfigPanel
├── maestros/ ← Managed by ConfigPanel
└── workflows/ ← Managed by ConfigPanel
```

## Getting Started

### 1. Install Dependencies

```bash
cd concerto/engine
npm install
# or: yarn install
```

This installs the new `yaml` package required for frontmatter parsing.

### 2. Start Backend Server

```bash
npm run dashboard
# or: node dashboard/server/server.js
```

Server runs on `http://localhost:3500`

### 3. Start Frontend (from another terminal)

```bash
cd concerto/engine/dashboard/client
npm install  # if not already done
npm run dev
# Frontend runs on http://localhost:3000
```

### 4. Open Dashboard

Navigate to `http://localhost:3000` and click the Settings button (⚙️) in top bar.

## API Endpoints

All endpoints are accessible at `http://localhost:3500/api/config/`:

### Specs Management
```http
GET     /api/config/specs
POST    /api/config/specs
GET     /api/config/specs/:id
PUT     /api/config/specs/:id
DELETE  /api/config/specs/:id
```

### Prompts Management (with phase filtering)
```http
GET     /api/config/prompts
GET     /api/config/prompts?phase=dev&role=Backend
POST    /api/config/prompts
GET     /api/config/prompts/:id
PUT     /api/config/prompts/:id
DELETE  /api/config/prompts/:id
```

### Maestros Management
```http
GET     /api/config/maestros
GET     /api/config/maestros?phase=dev
POST    /api/config/maestros
GET     /api/config/maestros/:id
PUT     /api/config/maestros/:id
DELETE  /api/config/maestros/:id
```

### Workflows Management
```http
GET     /api/config/workflows
POST    /api/config/workflows
GET     /api/config/workflows/:id
PUT     /api/config/workflows/:id
DELETE  /api/config/workflows/:id
```

## Testing

### Test Endpoint (via curl)

```bash
# Get all specs
curl http://localhost:3500/api/config/specs

# Create new spec
curl -X POST http://localhost:3500/api/config/specs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Spec",
    "phase": "dev",
    "owner": "Developer",
    "priority": "high",
    "description": "Test specification",
    "criteria": ["Criterion 1", "Criterion 2"]
  }'

# Get specific spec
curl http://localhost:3500/api/config/specs/SPEC-001

# Update spec
curl -X PUT http://localhost:3500/api/config/specs/SPEC-001 \
  -H "Content-Type: application/json" \
  -d '{"status": "approved"}'

# Delete spec
curl -X DELETE http://localhost:3500/api/config/specs/SPEC-001
```

## Data Flow Example

### Creating a Specification through UI

1. **User clicks** Settings button → ConfigPanel opens
2. **User selects** Specs tab
3. **User clicks** "New Spec" button
4. **Form opens** with input fields
5. **User fills** form:
   - Title: "New Feature"
   - Phase: "dev"
   - Owner: "Team A"
   - etc.
6. **User clicks** "Save"
7. **ConfigPanel sends** POST request to `/api/config/specs`
8. **Backend receives** request in `server.js`
9. **fileManager.js** creates file:
   - Generates ID: SPEC-001
   - Creates frontmatter YAML
   - Writes to: `concerto-config/spec/SPEC-001-new-feature.md`
10. **Backend responds** with created item metadata
11. **Frontend updates** list with new item
12. **User sees** new spec in list

## Markdown File Format

All configuration files follow this format:

```markdown
---
id: SPEC-001
title: Feature Name
phase: dev
status: draft
version: 1.0
owner: Developer Name
priority: high
---

# Spécification: Feature Name

## Description
Feature description here...

## Critères d'Acceptation
- [ ] Criterion 1
- [ ] Criterion 2
```

## Next Steps

Potential enhancements:
1. **Bulk Operations** - Create/update multiple items at once
2. **Import/Export** - YAML/JSON export functionality
3. **Search** - Full-text search across all resources
4. **Markdown Editor** - Built-in markdown editor with preview
5. **Version History** - Track changes and rollback
6. **Collaborative** - Show who's editing what
7. **Templates** - Create from templates
8. **Webhooks** - Trigger actions on changes

## Troubleshooting

### Panel doesn't appear
- Check Settings button in top bar (visible after TopBar loads)
- Ensure backend is running on port 3500
- Check browser console for errors

### Cannot save items
- Verify backend API: `curl http://localhost:3500/api/config/specs`
- Check file permissions in `concerto-config/`, `maestros/`, `workflows/` directories
- Check `/concerto.log` for backend errors

### Items not loading
- Verify file paths match expected structure
- Check YAML syntax in existing `.md` files
- Ensure `yaml` package is installed

### "Module not found" error
- Run `npm install` in `engine/` directory
- Ensure `yaml` package is in `node_modules`
- Check Node.js version (>=14 required)

## Summary

**Status**: ✅ **Complete and Ready to Use**

The configuration management system is fully implemented with:
- ✅ Backend REST API for all 4 resource types
- ✅ Frontend sidebar panel with full CRUD UI
- ✅ File I/O operations with YAML parsing
- ✅ Error handling and validation
- ✅ User-friendly interface consistent with dashboard design

The system allows users to completely manage AI calibration files from the graphical interface as requested.
