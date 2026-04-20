---
id: "WF-FEATURE"
title: "Workflow : Développer une Nouvelle Fonctionnalité"
version: "1.0"
created: "2026-04-18"
---

# Workflow : Nouvelle Fonctionnalité

## Objectif
Orchestrer le développement complet d'une nouvelle fonctionnalité du conception à la mise en production.

## Phases et Étapes

### Phase 1 : Conception 🗺️

**1.1 Créer la Spécification**
- Créer un fichier `concerto-config/spec/SPEC-XXX-{nom-court}.md`
- Remplir le frontmatter YAML (id, title, phase, status: draft)
- Documenter les critères d'acceptation
- Assigner un owner

**1.2 Approuver la Spécification**
- Architect review
- Passer le status à "approved"
- Ajouter les dépendances si nécessaire

**Maestros Assignés** :
- ✅ Architect
- ✅ Analyst

---

### Phase 2 : Développement ⚡

**2.1 Assigner au Backend Developer**
- Status: "in-progress"
- Créer une branche: `feature/spec-xxx-short-name`
- Utiliser le prompt: `concerto-config/dev/prompts/implement-feature-backend.md`

**2.2 Implémenter**
- Endpoints REST selon la spécification
- Logique métier
- Gestion des erreurs
- Documentation OpenAPI

**2.3 Assigner au Frontend Developer**
- Créer des composants UI
- Intégrer avec les endpoints
- Respecter le design system
- Tests unitaires

**Maestros Assignés** :
- ✅ Backend Developer
- ✅ Frontend Developer

**Critères de Complétude** :
- [ ] Tous les endpoints implémentés
- [ ] UI complète et responsine
- [ ] Tests unitaires passent
- [ ] ESLint et TypeScript sans errors
- [ ] Documentation à jour

---

### Phase 3 : Test & Validation 🧪

**3.1 Écrire les Tests**
- Tests unitaires: 80%+ couverture
- Tests d'intégration
- Tests e2e pour les workflows clés
- Utiliser: `concerto-config/test/prompts/write-unit-tests.md`

**3.2 Audit de Code**
- Code review pour la qualité
- Vérification des bonnes pratiques
- Security audit
- Performance review

**Maestros Assignés** :
- ✅ QA Tester
- ✅ Reviewer

**Critères de Complétude** :
- [ ] Tests unitaires: 80%+ couverture
- [ ] Tests e2e: workflows clés
- [ ] Code review approuvé
- [ ] 0 security issues
- [ ] Performance acceptable

---

### Phase 4 : Déploiement 🚀

**4.1 Préparer la Release**
- Update CHANGELOG
- Tag version (semver)
- Build artifacts

**4.2 Déployer en Staging**
- Vérifier en environnement de test
- Tests de fumée
- Vérifier les logs

**4.3 Déployer en Production**
- Blue-green deployment si possible
- Monitoring actif
- Rollback plan prêt

**Maestros Assignés** :
- ✅ DevOps
- ✅ Deploy Validator

**Critères de Complétude** :
- [ ] Déployé avec succès
- [ ] Monitored 24h
- [ ] 0 erreurs en prod
- [ ] Metrics normales

---

## Timeline Estimée

| Phase | Durée | Notes |
|-------|-------|-------|
| Conception | 2-4h | Dépend de la complexité |
| Backend Dev | 4-8h | Tests inclus |
| Frontend Dev | 4-8h | Component + intégration |
| Testing | 2-4h | Audit + écriture tests |
| Deployment | 1-2h | Staging + Production |
| **Total** | **13-26h** | ~2-3 jours |

---

## Checklist de Complétude

### Code
- [ ] Tous les endpoints/components
- [ ] Tests 80%+ couverture
- [ ] TypeScript no-errors
- [ ] ESLint passing
- [ ] Code formaté

### Documentation
- [ ] OpenAPI pour API
- [ ] README pour setup
- [ ] Inline comments pour logique complexe
- [ ] CHANGELOG updated

### Opérations
- [ ] Déployé en staging
- [ ] Déployé en production
- [ ] Monitored 24h
- [ ] 0 erreurs critiques

### Spec Kit
- [ ] SPEC marquée "completed"
- [ ] Version incrémentée
- [ ] Historique documenté
- [ ] Tests de régression

---

## Rollback Plan

Si des problèmes critiques surviennent :

1. **Identifier** l'issue
2. **Rollback** à la version précédente immédiatement
3. **Analyser** root cause
4. **Créer** BUG spec
5. **Fixer** selon priorité
6. **Re-tester**
7. **Re-déployer**

---

## Support et Escalade

- Architecture questions → Architect
- Test failures → QA Tester
- Deployment issues → DevOps
- Critical bugs → Escalate to Lead
