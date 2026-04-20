---
title: "Project Tracking - Spec Kit Style"
version: "1.0"
lastUpdated: "2026-04-18"
---

# Tableau de Suivi du Projet

## Vue d'Ensemble

Ce fichier permet de tracker l'avancement de toutes les spécifications du projet en style "Spec Kit".

### Statuts
- 🔵 `draft` : Brouillon, en cours de définition
- 🟢 `approved` : Approuvé et prêt à commencer
- 🟡 `in-progress` : Actuellement en développement
- ✅ `completed` : Terminé et validé
- 🔴 `blocked` : Bloqué par une dépendance
- ⏸️ `on-hold` : En attente de priorité

---

## Spécifications Actives

### Frontend & UI

| ID | Titre | Phase | Status | Progress | Owner | Start | Due |
|---|---|---|---|---|---|---|---|
| SPEC-001 | Dev Page Frontend | dev | 🟡 in-progress | 0% | Frontend-Dev | 2026-04-18 | 2026-04-20 |
| SPEC-002 | Test Page Frontend | dev | 🟢 approved | 0% | Frontend-Dev | 2026-04-21 | 2026-04-23 |
| SPEC-003 | Deploy Page Frontend | dev | 🟢 approved | 0% | Frontend-Dev | 2026-04-24 | 2026-04-26 |

### Backend APIs

| ID | Titre | Phase | Status | Progress | Owner | Start | Due |
|---|---|---|---|---|---|---|---|
| SPEC-010 | API Task Runner | dev | 🔵 draft | 0% | Backend-Dev | 2026-04-19 | 2026-04-21 |
| SPEC-011 | API Commit/Push/Pull | dev | 🔵 draft | 0% | Backend-Dev | 2026-04-22 | 2026-04-24 |
| SPEC-012 | WebSocket Logs Stream | dev | 🔵 draft | 0% | Backend-Dev | 2026-04-22 | 2026-04-24 |

### Infrastructure & Test

| ID | Titre | Phase | Status | Progress | Owner | Start | Due |
|---|---|---|---|---|---|---|---|
| SPEC-020 | Unit Tests Frontend | test | 🔴 blocked | 0% | QA-Tester | - | - |
| SPEC-021 | E2E Dashboard | test | 🔴 blocked | 0% | QA-Tester | - | - |
| SPEC-030 | Docker Configuration | deploy | 🔵 draft | 0% | DevOps | 2026-04-25 | 2026-04-27 |

---

## Timeline Consolidated

```
Semaine 1  (Apr 18-20)  : SPEC-001 Dev Page
           (Apr 21-23)  : SPEC-002 Test Page + SPEC-010/011/012 APIs
           (Apr 24-26)  : SPEC-003 Deploy Page + Backend completion
           
Semaine 2  (Apr 28-30)  : SPEC-020 Unit Tests + SPEC-021 E2E
           
Semaine 3  (May 01-03)  : SPEC-030 Docker + Finalisations
           
           (May 04)     : 🚀 Production Release v1.0
```

---

## Dependencies

```
SPEC-001 ────────┐
SPEC-002 ────────┼───→ SPEC-020 (Tests depend on features)
SPEC-003 ────────┘

SPEC-010, 011, 012 ──→ SPEC-001, 002, 003 (APIs needed by UIs)

SPEC-020, 021  ──→ SPEC-030 (Tests before deploy)

SPEC-030 ──→ Production Release
```

### Bloqueurs Actuels
- ⏸️ SPEC-020, SPEC-021 : Attendant SPEC-001/002/003 et SPEC-010/011/012

---

## Metrics & Health

### Velocity
- **Planné cette iteration** : 5 specs
- **Complété dernière iteration** : 0 specs
- **Estimation** : 50-60h

### Risk Assessment

| Risk | Level | Mitigation |
|---|---|---|
| WebSocket complexité | Medium | Commencer simple avec EventSource |
| Frontend perf (dashb) | Low | Verifier LCP/CLS |
| API integration timing | Medium | APIs prêtes avant UI |
| QA timeline compressed | High | Commencer tests tôt (TDD) |

---

## Sprint Planning

### Sprint 1: Apr 18-20
> **Goal**: Frontend Dev Page + Foundation Complete

**Tasks**:
- [ ] SPEC-001: Dev Page Frontend (complete)
- [ ] SPEC-010: Task Runner API (draft)

**Team**:
- Frontend Developer (80% SPEC-001)
- Backend Developer (20% SPEC-010 API design)

**Deliverables**:
- ✅ Dev Page UI mockup + components
- ✅ Task API definition (OpenAPI spec)

---

### Sprint 2: Apr 21-23
> **Goal**: Test/Deploy Pages + Core APIs

**Tasks**:
- [ ] SPEC-002: Test Page Frontend
- [ ] SPEC-003: Deploy Page Frontend
- [ ] SPEC-010: Implement Task Runner API
- [ ] SPEC-011: Implement Git API
- [ ] SPEC-012: WebSocket Logs

**Team**:
- Frontend Developer (50% SPEC-002 + SPEC-003)
- Backend Developer (50% APIs)

**Deliverables**:
- ✅ All 3 frontend pages complete
- ✅ All 3 backend APIs working

---

### Sprint 3: Apr 24-Mayonnaise 1
> **Goal**: Testing & Deployment Infrastructure

**Tasks**:
- [ ] SPEC-020: Unit Tests (Frontend)
- [ ] SPEC-021: E2E Tests
- [ ] SPEC-030: Docker setup

**Team**:
- QA Tester (SPEC-020, 021)
- DevOps (SPEC-030)
- Frontend/Backend (support as needed)

**Deliverables**:
- ✅ 80%+ test coverage
- ✅ Docker working locally & prod-ready

---

## Version Tracking

### v0.9 (Current - Foundation)
- ✅ Project initialized
- ✅ Framework structure defined
- ✅ Workflows documented

### v1.0 (Target - Apr 30)
- 🎯 3 Frontend Pages complete
- 🎯 All Core APIs functional
- 🎯 80%+ test coverage
- 🎯 Docker deployment ready

### v1.1 (Future)
- Additional workflow optimization
- Performance optimizations
- Extended monitoring

---

## Update Log

### 2026-04-18 11:00 - Initial Setup
- Created Spec Kit tracking system
- Defined 3-week timeline
- Assigned teams

### 2026-04-18 12:30 - Added SPEC-001
- Dev Page specification defined
- Dependencies documented
- API requirements specified

---

## How to Update

1. **Starting a Spec**: Change `status` to `in-progress`
2. **Completing a Spec**: Change `status` to `completed`, update `Progress` to 100%
3. **Version Update**: Increment version number and add entry to Update Log
4. **Risk**: Add any new risks or blockers to Risk Assessment

---

## Review Cadence

- **Daily**: Check "in-progress" specs for blockers
- **Weekly**: Full team sync on timeline
- **Bi-weekly**: Retrospective & planning
- **Monthly**: Version release & metrics review
