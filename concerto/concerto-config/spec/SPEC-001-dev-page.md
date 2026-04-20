---
id: "SPEC-001"
title: "Dashboard Frontend - Page Développement"
phase: "dev"
status: "in-progress"
version: "1.0"
created: "2026-04-18"
modified: "2026-04-18"
owner: "Frontend Developer"
priority: "high"
related: ["SPEC-002"]
---

# Spécification : Dashboard Frontend - Page Développement

## Description
Créer une page dédiée à la phase Développement dans le dashboard Concerto. Cette page affichera l'état du Git, les pipelines en cours, les changements de code, et permettra de lancer des actions de développement.

## Objectifs
- Afficher l'état Git en temps réel (branche, changements, commits)
- Visualiser l'avancement des pipelines de développement
- Afficher les logs de compilation/exécution
- Permettre de lancer des actions (commit, push, run tests)

## Spécifications Techniques

### Layout
```
┌─────────────────────────────────────────────────────────────┐
│ TopBar: CONCEPTION | DEV (active) | TEST | DEPLOY | SECURITY│
├──────────────────────────────────────────────────────────────┤
││ Maestro Rail  │ ┌─── Page Développement ─────────────────┐ │
││               │ │ ┌─ Git Status ─────────────────────────┐ │
││               │ │ │ • Branche: feature/xxx               │ │
││ • BE-Dev      │ │ │ • Modifications: 5 fichiers          │ │
││ • BE-QA       │ │ │ • Changes                            │ │
││ • FE-Dev      │ │ │   M src/app.ts                       │ │
││ • FE-Verif    │ │ │   A tests/app.test.ts                │ │
││               │ │ │ • Actions: [Commit] [Push] [Pull]   │ │
││ Pipeline:     │ │ └──────────────────────────────────────┘ │
││ ▓▓░░ Analyse  │ │ ┌─ Tasks / Pipelines ──────────────────┐ │
││ ░░░░ Génerat. │ │ │ ▶ Running: Unit Tests                │ │
││ ░░░░ Validat. │ │ │   ₌₌₌₌▶ 73% (src/**, tests/**)      │ │
││                │ │ │ ✓ Completed: Lint Check             │ │
││                │ │ │ ○ Queued: Build Artifacts           │ │
││                │ │ └──────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────┤
│ Console: [21:35 AM] Task running... [21:36 AM] Completed   │
└──────────────────────────────────────────────────────────────┘
```

### Composants

#### 1. Git Status Card
**Affiche** :
- Branche active (git branch)
- Statut des fichiers modifiés
- Derniers commits (max 5)

**Actions** :
- Bouton "Commit": Ouvre dialog avec message de commit
- Bouton "Push": Pousse les changements
- Bouton "Pull": Récupère les changements

**Format des fichiers** :
```
M = Modified (jaune)
A = Added (vert)
D = Deleted (rouge)
? = Untracked (gris)
```

#### 2. Pipeline / Task Runner
**Affiche** :
- Liste des tâches possibles
- État d'exécution en temps réel
- Progression avec barre

**Actions possibles** :
- Run Unit Tests
- Run E2E Tests
- Build Project
- Lint Check
- Debug (attach debugger)

**États** :
- `running`: En cours avec couleur bleu + animation
- `completed`: Terminé, couleur verte
- `failed`: Échoué, couleur rouge
- `queued`: En attente, couleur gris

#### 3. Recent Changes / Diff Viewer
**Affiche** :
- Fichiers modifiés récemment
- Ligne de modification (+/- lignes)
- Auteur et date du changement

#### 4. Console / Logs
**Affiche** :
- Logs en temps réel via WebSocket/EventSource
- Filtrage par niveau (info, warning, error)
- Scroll au dernier message
- Clic sur ligne = copier

### Critères d'Acceptation
- [ ] Récupère l'état Git via API `/api/git`
- [ ] Affiche les branches, commits, changements
- [ ] Bouttons Commit / Push / Pull fonctionnels
- [ ] Pipeline visuel avec states (running, completed, failed)
- [ ] Actions possibles (run tests, build, lint)
- [ ] Console affiche les logs en temps réel
- [ ] Design cohérent avec le rest du dashboard
- [ ] Responsive sur mobile/tablet/desktop
- [ ] Tests unitaires 80%+ couverture
- [ ] Pas d'emojis (icônes Lucide seulement)

### Données API Requises
```typescript
// GET /api/git
{
  branch: string,
  changes: Array<{ flag: string, file: string }>,
  commits: Array<{ hash: string, msg: string, author: string, date: string }>
}

// GET /api/tasks (à créer)
{
  running: Array<{ id, name, progress }>,
  completed: Array<{ id, name, duration }>,
  failed: Array<{ id, name, error }>
}

// WebSocket /ws/logs
{
  timestamp: string,
  level: 'info' | 'warn' | 'error',
  message: string
}
```

### Dépendances
- ✅ Component TopBar existant
- ✅ Component MaestroRail existant
- ✅ Component ConsolePanel existant
- ⚠️ API `/api/git` existante
- ❌ API `/api/tasks` à créer
- ❌ WebSocket `/ws/logs` à créer (option)

### Notes
- Considérer le refresh auto de l'état Git toutes les 5s
- Les actions (commit, push) doivent être confirmées
- Prévoir un toast/notification pour les succès/erreurs

---

## Liens Utiles
- Page conception existe: `/app/conception/page.tsx`
- TopBar peut être réutilisée
- Lucide icons: https://lucide.dev
- API backend: `engine/dashboard/server/server.js`

---

## Ressources
- Prompt associé: `concerto-config/dev/prompts/implement-feature-frontend.md`
- Design system: `engine/dashboard/client/src/app/globals.css`
- Exemples: `engine/dashboard/client/src/app/conception/page.tsx`
