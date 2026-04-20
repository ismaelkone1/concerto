# CONCERTO Framework - Architecture Complète

## 📋 Arborescence

```
concerto/
│
├── 📄 README.md (ce fichier)
├── 📄 docs/USAGE.md                    ← Guide complet d'utilisation
│
├── 📁 concerto-config/                 ← Configuration du projet
│   ├── 📁 base/                        ← Configuration universelle
│   │   ├── 📄 CONFIG.md                ← Config système + maestros
│   │   └── 📄 prompts/                 ← Prompts réutilisables **base**
│   │
│   ├── 📁 dev/                         ← Configuration phase Développement
│   │   └── 📄 prompts/
│   │       ├── 📄 implement-feature-backend.md
│   │       ├── 📄 implement-feature-frontend.md
│   │       ├── 📄 fix-bug-backend.md
│   │       ├── 📄 fix-bug-frontend.md
│   │       └── 📄 refactor.md
│   │
│   ├── 📁 test/                        ← Configuration phase Test
│   │   └── 📄 prompts/
│   │       ├── 📄 write-unit-tests.md
│   │       ├── 📄 write-e2e-tests.md
│   │       ├── 📄 audit-code.md
│   │       └── 📄 generate-report.md
│   │
│   ├── 📁 deploy/                      ← Configuration phase Déploiement
│   │   └── 📄 prompts/
│   │       ├── 📄 prepare-release.md
│   │       ├── 📄 deploy-staging.md
│   │       ├── 📄 deploy-production.md
│   │       └── 📄 monitor-deployment.md
│   │
│   └── 📁 spec/                        ← Spécifications du projet (Spec Kit)
│       ├── 📄 CONFIG.md                ← Référence de configuration
│       ├── 📄 TRACKING.md              ← Tableau d'avancement global
│       ├── 📄 SPEC-001-dev-page.md     ← Spécifications individuelles
│       ├── 📄 SPEC-002-test-page.md
│       ├── 📄 SPEC-003-deploy-page.md
│       ├── 📄 SPEC-010-api-task-runner.md
│       ├── 📄 SPEC-011-api-git-ops.md
│       └── 📄 SPEC-012-websocket-logs.md
│
├── 📁 maestros/                        ← Rôles IA (Maestros)
│   ├── 📁 core/
│   │   ├── 📄 architect.md
│   │   └── 📄 analyst.md
│   │
│   ├── 📁 dev/
│   │   ├── 📄 backend-dev.md
│   │   └── 📄 frontend-dev.md
│   │
│   └── 📁 qa/
│       ├── 📄 tester.md
│       └── 📄 reviewer.md
│
├── 📁 workflows/                       ← Workflows prédéfinis
│   ├── 📄 new-feature.md               ← Workflow: Développer une feature
│   ├── 📄 bug-fix.md
│   ├── 📄 hotfix.md
│   ├── 📄 release.md
│   └── 📄 emergency-patch.md
│
├── 📁 engine/                          ← Moteur d'orchestration
│   ├── orchestrator.ts
│   ├── dashboard/
│   │   ├── client/ (Next.js frontend)
│   │   └── server/ (Backend server)
│   └── ...
│
├── 📁 ai-dev-rules/                    ← Règles globales du projet
│   ├── 📄 dev-rules.md
│   └── 📄 steps.md
│
└── 📁 orchestrator/                    ← Orchestrator autonome
    └── ...
```

---

## 🎯 Utilisation

### Pour Démarrer une Nouvelle Fonctionnalité

1. **Créer la spécification**
   ```bash
   cp concerto-config/base/templates/spec-template.md \
      concerto-config/spec/SPEC-XXX-nom-court.md
   ```
   Remplir les détails (title, description, critères d'acceptation)

2. **Approuver la spec**
   ```bash
   # Modifier concerto-config/spec/SPEC-XXX-nom-court.md
   # Passer status: draft → status: approved
   ```

3. **Suivre le workflow**
   ```bash
   cat workflows/new-feature.md
   # Parcourir: Conception → Développement → Test → Déploiement
   ```

4. **Assigner aux maestros**
   - Backend Developer : `concerto-config/dev/prompts/implement-feature-backend.md`
   - Frontend Developer : `concerto-config/dev/prompts/implement-feature-frontend.md`

5. **Tracker l'avancement**
   ```bash
   # Mettre à jour: concerto-config/spec/TRACKING.md
   # Changer status & progress pour chaque spec
   ```

---

## 📊 Spec Kit Integration

Le projet utilise une approche inspirée de **Spec Kit** pour la gestion des spécifications :

### Concepts Clés

**Spécification** (`SPEC-XXX`)
- Identificateur unique
- Status: draft → approved → in-progress → completed
- Versioning: v1.0, v1.1, etc.
- Track des modifications

**Tracking** (`TRACKING.md`)
- Vue d'ensemble de toutes les specs
- Timeline et dépendances
- Metrics et health check
- Sprint planning

**Workflows** (`workflows/*.md`)
- Procédures step-by-step
- Assignation de maestros
- Critères de complétude
- Rollback plans

### Avantages

✅ **Traçabilité complète** : Chaque spec a son histoire  
✅ **Versioning** : Évolution des spécifications trackée  
✅ **Dépendances claires** : Voir ce qui bloque quoi  
✅ **Documentation** : Chaque décision documentée  
✅ **Reproducibilité** : Workflows standard réutilisables  

---

## 🤖 Maestros (Rôles IA)

### Disponibles

| Role | Phase | Expertise | Prompt |
|------|-------|-----------|--------|
| Architect | Conception | Architecture, design patterns | `core/architect.md` |
| Analyst | Conception | Requirements, planning | `core/analyst.md` |
| Backend Dev | Dev | TypeScript, APIs, databases | `dev/prompts/implement-feature-backend.md` |
| Frontend Dev | Dev | React, TypeScript, UI | `dev/prompts/implement-feature-frontend.md` |
| QA Tester | Test | Testing, automation | `test/prompts/write-unit-tests.md` |
| Reviewer | Test | Code quality, security | `qa/reviewer.md` |
| DevOps | Deploy | Docker, CI/CD, monitoring | `deploy/maestros/devops.md` |

### Utilisation

Chaque maestro a un prompt personnalisé avec :
- Vue d'ensemble du rôle
- Stack technologique
- Tâche à accomplir
- Conventions à respecter
- Critères d'acceptation

```bash
# Exemple: Assigner un backend dev
cat concerto-config/dev/prompts/implement-feature-backend.md
# Utiliser le contenu pour briefer l'IA
```

---

## 📅 Timeline Type (3 Semaines)

```
Semaine 1  : Conception + Frontend Architecture
Semaine 2  : Backend APIs + Integration
Semaine 3  : Testing + Deployment
```

Voir `concerto-config/spec/TRACKING.md` pour le timeline détaillé du projet.

---

## 🔄 Conventions

### Format des Specs

```markdown
---
id: "SPEC-001"
title: "Feature Title"
phase: "dev"
status: "approved"
version: "1.0"
created: "2026-04-18"
owner: "Role Name"
priority: "high"
related: ["SPEC-002"]
---

# Spécification : Feature Title

## Description
...

## Critères d'Acceptation
- [ ] Criterion 1
- [ ] Criterion 2

## Notes
...
```

### Format des Commits

```
[PHASE] action: short message

[dev] feat: implement JWT authentication
[test] test: add unit tests for auth
[deploy] chore: update docker config
```

### Format des Prompts

```markdown
---
role: "Backend Developer"
phase: "dev"
action: "implement-feature"
version: "1.0"
triggers: ["feature-request"]
---

# Prompt: Title
...
```

---

## 📈 Metrics

- **Velocity** : Specs complétées par iteration
- **Coverage** : % de code couvert par tests
- **Health** : 🟢 On track, 🟡 At risk, 🔴 Blocked

Voir `concerto-config/spec/TRACKING.md` pour les metrics en temps réel.

---

## 🚀 Prochaines Étapes

1. ✅ Framework fondation configurée
2. ⏳ SPEC-001: Dev Page Frontend (In Progress)
3. ⏳ SPEC-010/011/012: Backend APIs
4. ⏳ SPEC-002/003: Test & Deploy Pages
5. ⏳ Testing & Deployment
6. ⏳ Production Release v1.0

---

## 📚 Resources

- **Guide d'utilisation** : `docs/USAGE.md`
- **Configuration** : `concerto-config/base/CONFIG.md`
- **Tracking** : `concerto-config/spec/TRACKING.md`
- **Workflows** : `workflows/*.md`
- **Dev rules** : `ai-dev-rules/dev-rules.md`

---

## ✍️ Revision

- **v1.0** (2026-04-18) : Foundation complete + Spec Kit integration
- **Next** : Implementation phase starts

---

*Last updated: 2026-04-18*
*Maintained by: Architecture Team*
