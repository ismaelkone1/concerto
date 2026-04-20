# CONCERTO Framework - Guide d'Utilisation

## Vue d'Ensemble

CONCERTO est un framework d'orchestration IA pour l'automatisation du développement logiciel. Il permet de structurer le travail en phases (Conception, Dev, Test, Deploy) et d'assigner des "Maestros" (rôles IA) à chaque étape.

## Structure des Projets

```
concerto/
├── concerto-config/          # Configuration du projet
│   ├── base/                 # Configuration universelle
│   ├── dev/                  # Configuration phase développement
│   ├── test/                 # Configuration phase test
│   ├── deploy/               # Configuration phase déploiement
│   └── spec/                 # Spécifications du projet (Style Spec Kit)
├── maestros/                 # Rôles IA disponibles
├── workflows/                # Workflows prédéfinis
├── engine/                   # Moteur d'orchestration
└── README.md
```

## Phases du Projet

### 1. **Conception** 🗺️
- **Objectif** : Définir l'architecture et la roadmap
- **Fichiers** : `ai-dev-rules/steps.md`
- **Maestros** : Architect, Analyst

### 2. **Développement** ⚡
- **Objectif** : Implémenter les fonctionnalités
- **Fichiers** : Code source, tests
- **Maestros** : Backend Developer, Frontend Developer
- **Config** : `concerto-config/dev/`

### 3. **Test** 🧪
- **Objectif** : Valider la qualité
- **Fichiers** : Tests unitaires, e2e, rapports
- **Maestros** : QA Tester, Reviewer
- **Config** : `concerto-config/test/`

### 4. **Déploiement** 🚀
- **Objectif** : Mettre en production
- **Fichiers** : Docker, configs de déploiement
- **Maestros** : DevOps, Deploy Validator
- **Config** : `concerto-config/deploy/`

## Format des Spécifications (Spec Kit Style)

Chaque spécification suit ce format :

```markdown
---
id: "SPEC-001"
title: "API REST pour authentication"
phase: "dev"
status: "in-progress"      # draft, approved, in-progress, completed
version: "1.0"
created: "2026-04-18"
modified: "2026-04-18"
owner: "Backend Developer"
related: ["SPEC-002", "SPEC-003"]
---

# Spécification : API REST pour authentication

## Description
Détail de ce qui doit être fait...

## Critères d'Acceptation
- [ ] Endpoint POST /login
- [ ] Endpoint POST /logout
- [ ] Validation JWT

## Implémentation
...

## Tests
...

## Notes
...
```

## Utilisation Quotidienne

### Créer une Nouvelle Spécification

```bash
# 1. Créer le fichier
cat > concerto-config/spec/SPEC-001-api-auth.md << 'EOF'
---
id: "SPEC-001"
title: "API REST pour authentication"
phase: "dev"
status: "draft"
version: "1.0"
created: "2026-04-18"
owner: "Backend Developer"
---

# Spécification : API REST pour authentication

## Description
Implémenter un système d'authentication JWT...

## Critères d'Acceptation
- [ ] Endpoint POST /login
- [ ] Endpoint POST /logout
- [ ] Validation JWT

EOF

# 2. Approver la spécification (passer status à "approved")

# 3. Assigner à un Maestro

# 4. Démarrer l'implémentation (passer status à "in-progress")

# 5. Une fois terminé (passer status à "completed")
```

### Lancer un Workflow

```bash
# Workflow : Nouvelle Fonctionnalité
./engine/run workflow feature-workflow \
  --spec SPEC-001 \
  --maestro backend-developer

# Workflow : Bug Fix
./engine/run workflow bug-fix-workflow \
  --bug BUG-042 \
  --maestro qa-tester
```

### Vérifier l'Avancement

```bash
# Voir tous les sprints
cat ai-dev-rules/steps.md

# Voir l'état du projet (Dashboard)
# Accéder à http://localhost:3000
```

## Structure des Prompts

Les prompts réutilisables sont stockés avec un frontmatter YAML :

```markdown
---
role: "Backend Developer"
phase: "dev"
action: "implement-feature"
version: "1.0"
triggers: ["feature-request", "sprint-start"]
templates: ["typescript", "api", "database"]
---

# Prompt : Implémenter une Fonctionnalité Backend

## Contexte
Tu es un développeur backend expert avec 10 ans d'expérience...

## Tâche
Implémente la fonctionnalité suivante basée sur la spécification:
...
```

## Conventions

### Nommage des Fichiers
- Specs: `SPEC-XXX-nom-court.md`
- Prompts: `{action}-{role}.md`
- Workflows: `{type}-workflow.md`

### Format des Commits
```
[PHASE] Action court message

Phase: conception, dev, test, deploy
Action: feat, fix, refactor, docs, test
```

Exemple:
```
[dev] feat: implement JWT authentication
[test] test: add unit tests for auth endpoints
[deploy] chore: update docker configuration
```

### Status des Spécifications
- `draft` : Brouillon, en cours de définition
- `approved` : Approuvé par le lead
- `in-progress` : Actuellement implémenté
- `completed` : Terminé et validé
- `blocked` : Bloqué par une dépendance

## Bonnes Pratiques

1. **Traçabilité** : Chaque spécification a un ID unique (SPEC-XXX)
2. **Versioning** : Tracker les versions des spécifications
3. **Dépendances** : Lister les spécifications liées
4. **Documentation** : Commenter les décisions importantes
5. **Révision** : Approuver avant de commencer l'implémentation

## Support

- 📖 Docs : `docs/STRUCTURE.md` pour l'architecture détaillée
- 🔧 Étendre : `docs/EXTENDING.md` pour ajouter des phases/maestros
- 💬 Questions : Consulter les workflows existants dans `workflows/`
