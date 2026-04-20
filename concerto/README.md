# CONCERTO - Orchestration IA Framework

**Orchestrate AI-driven development workflows with precision and clarity.**

## 🎯 Vision

CONCERTO est un framework d'orchestration IA conçu pour:
- 🤖 **Coordonner** les rôles IA (Maestros) sur les phases du projet
- 📊 **Tracker** l'avancement avec traçabilité complète (Spec Kit style)
- 🔄 **Automatiser** les workflows répétitifs du dev au déploiement
- 📈 **Mesurer** la qualité et les performances à chaque étape

## 🏗️ Foundation Setup ✅

Le framework est maintenant configuré avec:

### ✨ Structure Complète
```
concerto/
├── concerto-config/          # Configuration par phase
│   ├── base/                 # Configuration universelle
│   ├── dev/                  # Phase développement
│   ├── test/                 # Phase test
│   ├── deploy/               # Phase déploiement
│   └── spec/                 # Spécifications (Spec Kit)
├── maestros/                 # Rôles IA
├── workflows/                # Workflows prédéfinis
├── docs/                     # Documentation
├── engine/                   # Cœur d'orchestration
└── orchestrator/             # Orchestrator autonome
```

### 📋 Spec Kit Integration

Traçabilité complète avec:
- **Spécifications** (`SPEC-XXX`) : Traçables, versionnées, approuvables
- **Tracking** (`TRACKING.md`) : Vue d'ensemble des specs + timeline
- **Workflows** (`workflows/*.md`) : Procédures standard + maestros assignés

## 🚀 Démarrage Rapide

### 1. Lancer une Nouvelle Fonctionnalité

```bash
# 1. Créer la spécification
cat > concerto-config/spec/SPEC-002-feature-name.md << 'EOF'
---
id: "SPEC-002"
title: "Feature Title"
phase: "dev"
status: "draft"
---
# Spécification: Feature Title
EOF

# 2. Lire le guide complet
cat docs/USAGE.md
```

### 2. Dashboard Frontend

Le dashboard permet de tracker les 5 phases du projet:
- 🗺️ **Conception** : Roadmap et spécifications
- ⚡ **Développement** : Git, pipelines, code
- 🧪 **Test** : Tests, qualité, audits
- 🚀 **Déploiement** : Releases, staging, production
- 🔒 **Sécurité** : Scanning, compliance

```bash
cd engine/dashboard/client
npm run dev
# → http://localhost:3000
```

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [docs/USAGE.md](docs/USAGE.md) | Guide complet d'utilisation quotidienne |
| [docs/STRUCTURE.md](docs/STRUCTURE.md) | Architecture détaillée du framework |
| [docs/EXTENDING.md](docs/EXTENDING.md) | Comment étendre (maestros, workflows, phases) |
| [concerto-config/spec/TRACKING.md](concerto-config/spec/TRACKING.md) | Tableau de suivi des spécifications |

## 🎯 Spécifications Actuelles

### Phase 1: Frontend Architecture (SPEC-001)
- 🟡 Dev Page Frontend - In Progress

### Phase 2: APIs & Backend (SPEC-010, 011, 012)
- 🔵 Task Runner API - Draft
- 🔵 Git Ops API - Draft
- 🔵 WebSocket Logs - Draft

### Phase 3: Test & Deploy Pages (SPEC-002, 003)
- 🟢 Test Page Frontend - Approved
- 🟢 Deploy Page Frontend - Approved

Voir [concerto-config/spec/TRACKING.md](concerto-config/spec/TRACKING.md) pour la liste complète.

## 🔄 Workflows Disponibles

### Principal
- [workflows/new-feature.md](workflows/new-feature.md)
  
  Guideline complète pour développer une nouvelle fonctionnalité :
  - Phase Conception : Créer et approuver la spec
  - Phase Dev : Backend + Frontend implementation
  - Phase Test : Unit tests + Code review
  - Phase Deploy : Staging + Production

## 🤖 Maestros

Rôles IA spécialisés pour chaque phase:

### Backend Developer
- Expertise: TypeScript, Node.js, APIs, databases
- Configuration: [maestros/dev/backend-dev.md](maestros/dev/backend-dev.md)

### Frontend Developer
- Expertise: React, TypeScript, Next.js, Tailwind, UI/UX
- Configuration: [maestros/dev/frontend-dev.md](maestros/dev/frontend-dev.md)

### QA Tester
- Expertise: Testing, automation, quality assurance
- Configuration: [concerto-config/test/maestros/tester.md](concerto-config/test/maestros/tester.md)

## 📊 Metrics & Health

### Current Project Status
- **Foundation** : ✅ Complete
- **Frontend Pages** : 1 in-progress, 2 planned
- **Backend APIs** : 3 planned
- **Testing** : To start after Dev
- **Timeline** : 3 weeks to v1.0 (May 4, 2026)

## 🔧 Configuration

### Base Configuration
- File: [concerto-config/base/CONFIG.md](concerto-config/base/CONFIG.md)
- Contient: Phases, maestros, actions, statuses

### Phases
1. **Conception** 🗺️ - Design, planning, roadmap
2. **Développement** ⚡ - Backend APIs + Frontend UI
3. **Test** 🧪 - Unit tests, E2E, code review
4. **Déploiement** 🚀 - Staging, production, monitoring
5. **Sécurité** 🔒 - Security audit, compliance

## 📝 Conventions

### Spec Format
```markdown
---
id: "SPEC-XXX"
title: "Feature Title"
phase: "dev"
status: "draft|approved|in-progress|completed"
version: "1.0"
owner: "Maestro Name"
priority: "high|medium|low"
---
# Spécification: Feature Title
...
```

### Commit Format
```
[PHASE] action: short message

[dev] feat: implement JWT authentication
[test] test: add unit tests for auth
[deploy] chore: update docker config
```

### File Naming
- Specs: `SPEC-XXX-name-short.md`
- Prompts: `{action}-{role}.md`
- Workflows: `{type}-workflow.md`

## 🎓 Learning Path

### New to CONCERTO?
1. Read [docs/USAGE.md](docs/USAGE.md) - 10 min
2. Review [docs/STRUCTURE.md](docs/STRUCTURE.md) - 20 min
3. Check [concerto-config/spec/SPEC-001-dev-page.md](concerto-config/spec/SPEC-001-dev-page.md) - 10 min
4. Follow [workflows/new-feature.md](workflows/new-feature.md) - 15 min

### Want to extend the framework?
- Read [docs/EXTENDING.md](docs/EXTENDING.md)
- Create a new maestro or workflow
- Add a new phase to the dashboard

## 🚨 Quick Guide

### Starting a Feature
```bash
# 1. Create spec
cat > concerto-config/spec/SPEC-002-name.md << 'EOF'
---
id: "SPEC-002"
title: "..."
phase: "dev"
status: "draft"
---
EOF

# 2. Approve (edit status: draft → approved)

# 3. Assign and follow workflow/new-feature.md
```

### Tracking Progress
```bash
# View all specs + timeline
cat concerto-config/spec/TRACKING.md

# View specific spec
cat concerto-config/spec/SPEC-001-dev-page.md

# Update status
# Edit the spec file, changing status field
```

### Adding New Content
```bash
# New maestro → Extend docs/EXTENDING.md
# New workflow → Add to workflows/
# New phase → Follow docs/EXTENDING.md "Add New Phase"
```

## 🔗 Resources

- **Framework** : This repo + `/docs/`
- **Frontend** : `/engine/dashboard/client/` (Next.js)
- **Backend** : `/engine/dashboard/server/` (Node.js)
- **Rules** : `/ai-dev-rules/dev-rules.md`
- **Config** : `/concerto-config/`

## 📞 Support

- **How to use?** → Read [docs/USAGE.md](docs/USAGE.md)
- **Extending?** → Read [docs/EXTENDING.md](docs/EXTENDING.md)
- **Architecture?** → Read [docs/STRUCTURE.md](docs/STRUCTURE.md)
- **Tracking?** → Check [concerto-config/spec/TRACKING.md](concerto-config/spec/TRACKING.md)

## 🎯 Next Steps

1. ✅ **Foundation** : Complete (Spec Kit + structure)
2. ⏳ **SPEC-001** : Develop Dev Page Frontend (2-3 days)
3. ⏳ **SPEC-010-012** : Implement backend APIs (2-3 days)
4. ⏳ **SPEC-002-003** : Develop remaining pages (2-3 days)
5. ⏳ **Testing** : Unit tests + E2E (1-2 days)
6. ⏳ **Deployment** : Docker + Production (1 day)

**Target Release** : May 4, 2026 (v1.0)

---

**Version** : 1.0 (Foundation Complete)  
**Status** : 🟢 Ready for Implementation  
**Last Updated** : 2026-04-18