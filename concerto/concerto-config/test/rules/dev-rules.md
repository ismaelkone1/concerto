# 🤖 Concerto — Règles de Développement IA (Version Générique)

## 🎯 Objectif

Garantir un développement :

* déterministe
* testable
* scalable
* maintenable

L'IA doit produire du code **production-ready dès le premier passage**.

---

# 🏗 Architecture Obligatoire

## Clean Architecture (STRICT)

Chaque feature doit respecter :

* **Domain**

  * logique métier pure
  * aucune dépendance externe
  * immuable si possible

* **Application**

  * orchestration (use cases)
  * dépend uniquement du Domain

* **Infrastructure**

  * DB, API, frameworks
  * implémente interfaces

❌ INTERDIT :

* logique métier dans Controller
* accès DB dans Domain
* dépendance circulaire

# 🧩 Architecture Modulaire

* Adaptable selon le projet : Monolith, Microservices, ou Serverless.
* Exemples :
  * `client` → Application Frontend (React, Vue, etc.)
  * `server/auth-service` → authentification (JWT, OAuth)
  * `server/core-service` → logique métier principale
  * `server/integration-service` → APIs externes

Communication :

* Authentification sécurisée (JWT, API Keys)
* Validation dans chaque service

---

# 📝 Conventions de Nommage (STRICT)

## PHP

* Classes : PascalCase
* Méthodes : camelCase
* Variables : camelCase
* Constantes : UPPER_SNAKE_CASE

## DB

* snake_case
* migrations Doctrine obligatoires

## API

* kebab-case
* JSON strict

---

# 🔐 Sécurité

* JWT obligatoire (LexikJWT)
* validation input systématique
* sanitation des données
* jamais de SQL brut (Doctrine only)

---

# ⚙️ Performance

* requêtes optimisées (index, joins limités)
* cache Redis si lecture fréquente
* éviter N+1 queries

---

# 🧪 Pipeline de Développement (OBLIGATOIRE)

## Étape 1 — Compréhension

Lire :

* sprint file
* code existant
* patterns similaires

Créer fichier détail : Pour chaque sous-sprint, générer un `.md` associé (ex: `sprint-2.3-elo.md`) détaillant tâches précises, inputs/outputs, edge cases, plan TDD.

Poser questions si ambigu : Si clarifications nécessaires (ex: "K-factor Elo ?"), envoyer webhook Discord avec questions. Attendre réponses avant codage.

---

## Étape 2 — Définition stricte

Avant de coder, définir :

* inputs (types, contraintes)
* outputs (JSON exact)
* règles métier
* edge cases

---

## Étape 3 — TDD STRICT

### 0. Préparation structurelle
*   **Dossiers** : Créer les dossiers nécessaires via `mkdir -p`.
*   **Stubs** : Créer les classes vides (namespace et signature des méthodes) AVANT d'écrire le test, pour éviter les erreurs `Class not found`.

### 1. Écrire tests unitaires (RED)
*   **Standards PHPUnit 12+** : 
    *   Utiliser `#[DataProvider('name')]` au lieu des annotations.
    *   Data Providers DOIVENT être `static`.
    *   Import : `use PHPUnit\Framework\Attributes\DataProvider;`.
*   cas nominaux
*   cas erreurs
*   edge cases

### 2. Implémenter (GREEN)

* code minimal
* aucune sur-ingénierie

### 3. Refactor

* lisibilité
* respect conventions

---

## Étape 4 — Tests d’intégration

Via curl :

* vérifier status codes
* vérifier JSON
* vérifier erreurs

---

## Étape 5 — Validation

Checklist :

* PHPUnit OK (>80%)
* PHPStan OK
* ESLint OK
* Docker build OK

---

## Étape 6 — Proposition

Toujours fournir :

* liste fichiers modifiés
* résumé clair
* résultats tests

---

# 🧠 Règles de Décision IA

## Priorités

1. Code qui fonctionne
2. Code testé
3. Code propre

---

## En cas d’incertitude

❌ NE PAS deviner
✅ demander ou utiliser standard reconnu

---

## Retry

* max 2 tentatives
* sinon escalade humain

---

# ⚠️ Edge Cases (OBLIGATOIRE)

Toujours gérer :

* valeurs nulles
* valeurs extrêmes
* concurrence
* données incohérentes

---

# 🚫 Interdictions

* modifier architecture
* ajouter lib sans validation
* skip tests
* commit cassé
* logique métier dans controllers

---

# 🧬 Definition of Done

Une feature est terminée si :

* tests unitaires OK
* tests curl OK
* code conforme conventions
* edge cases couverts
* validé humainement

---

# 🧠 Philosophie

> "Simple, testé, fonctionnel > complexe et théorique"

---

Mis à jour : 7 Avril 2026
