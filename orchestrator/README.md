# PadelWin Orchestrator

Ce service automatise le workflow de développement IA pour PadelWin : lecture des sous-sprints, création de fichiers de cadrage, génération de code en mode TDD, exécution de tests, proposition de push et suivi CI/CD.

## Lancement Rapide

Depuis la racine du repo PadelWin :

```bash
cd .orchestrator
npm install  # Si pas déjà fait
npm run dev  # Lance l'orchestrateur en mode développement
```

Pour un run en production (après build) :

```bash
cd .orchestrator
npm run build
npm run start
```

Pour un dry-run (test de génération sans exécution) :

```bash
cd .orchestrator
npm run dry-run
```

## Objectif

L’orchestrateur te donne le contrôle total : tu peux lancer la structure IA, tester la génération, puis basculer vers un vrai run complet quand tu es prêt.

## Prérequis

- Node.js 20+ ou équivalent compatible avec `npm`
- `npm install` déjà exécuté dans `.orchestrator`
- Accès à l’API Mimo avec `AI_API_KEY`
- Webhooks Discord configurés
- Repo Git initialisé avec accès à la remote
- GitHub token si tu veux déclencher un workflow Actions

## Installation

Depuis la racine du repo :

```bash
cd .orchestrator
npm install
```

## Configuration

1. Copier l’exemple :

```bash
cd .orchestrator
cp .env.example .env
```

2. Remplir les valeurs dans `.env` :

- `AI_API_KEY` : clé Mimo
- `DISCORD_WEBHOOK_URL_STATUS` : notifications de statut
- `DISCORD_WEBHOOK_URL_QUESTIONS` : questions / clarifications
- `DISCORD_WEBHOOK_URL_CICD` : résultats CI/CD
- `GIT_REMOTE` : remote Git, par exemple `origin`
- `GIT_DEFAULT_BRANCH` : branche principale, par exemple `main`
- `GITHUB_TOKEN` : token GitHub pour déclencher workflow (optionnel)
- `GITHUB_REPO` : `owner/repo`
- `GITHUB_WORKFLOW` : nom du workflow GitHub Actions (optionnel)

> Si `DISCORD_WEBHOOK_URL_STATUS` n’est pas défini, `DISCORD_WEBHOOK_URL` est utilisé en fallback.

## Variables d’environnement

- `AI_API_KEY` : clé API pour l’appel au backend Mimo
- `DISCORD_WEBHOOK_URL_STATUS` : channel principal pour les statuts et alertes
- `DISCORD_WEBHOOK_URL_QUESTIONS` : channel pour poser des questions / clarifications
- `DISCORD_WEBHOOK_URL_CICD` : channel pour les résultats CI/CD
- `GIT_REMOTE` : remote Git à utiliser
- `GIT_DEFAULT_BRANCH` : branche de base pour les merges éventuels
- `GITHUB_TOKEN` : token GitHub si tu veux déclencher un workflow
- `GITHUB_REPO` : repo GitHub cible pour l’action
- `GITHUB_WORKFLOW` : nom ou ID du workflow GitHub Actions
- `DRY_RUN` : `true` pour simuler uniquement le prompt IA sans tests ni Git

## Commandes utiles

### 1. Lancer en développement

```bash
cd .orchestrator
npm run dev
```

Ce mode exécute la boucle complète de l’orchestrateur :

- lecture du sous-sprint actif
- construction du prompt IA
- appel Mimo
- exécution des tests
- commit / push / workflow GitHub
- notification Discord

### 2. Dry-run de structure IA

Pour tester seulement la génération de prompt et la réponse IA sans rien modifier :

```bash
cd .orchestrator
npm run dry-run
```

ou via la variable d’environnement :

```bash
cd .orchestrator
DRY_RUN=true npx ts-node src/index.ts
```

### 3. Construire le code compilé

```bash
cd .orchestrator
npm run build
```

### 4. Vérifier manuellement Discord

```bash
cd .orchestrator
source .env
curl -H "Content-Type: application/json" \
  -d '{"content":":ping_pong: test ping depuis PadelWin orchestrator"}' \
  "$DISCORD_WEBHOOK_URL_STATUS"
```

## Workflow de l’orchestrateur

1. `SprintManager` cherche le sous-sprint actif dans `ai-dev-rules/steps.md`
2. Il génère ou met à jour le fichier de détail de sprint `ai-dev-rules/<sous-sprint>.md`
3. `PromptBuilder` crée le prompt IA en utilisant `dev-rules.md`
4. `MimoClient` envoie le prompt à l’API Mimo
5. `TestRunner` exécute les tests unitaires et les tests curl
6. `GitManager` crée une branche, commit et pousse les changements
7. `GitManager` déclenche le workflow GitHub si configuré
8. `DiscordNotifier` envoie les notifications nécessaires

## Comment tout piloter toi-même

- `npm run dry-run` : vérifier la structure IA sans impact
- `npm run dev` : lancer un run complet
- `npm run build` : compiler le TypeScript
- modifier `ai-dev-rules/steps.md` pour changer le sous-sprint actif
- si besoin, édite `ai-dev-rules/dev-rules.md` pour ajuster les règles de l’IA
- utilise `source .env` pour charger les variables dans ton shell

## Dépannage rapide

- `steps.md introuvable` : vérifie que tu exécutes depuis `.orchestrator` et que `ai-dev-rules/steps.md` existe à la racine du repo
- `DISCORD_WEBHOOK_URL_STATUS` manquant : remplis `.env` ou ajoute `DISCORD_WEBHOOK_URL`
- `AI_API_KEY` manquant : renseigne la clé Mimo
- `npm run dev` bloque avant git : active d’abord `dry-run` pour valider

## Architecture du code

- `src/index.ts` : boucle principale
- `src/mimoClient.ts` : wrapper Mimo OpenAI-compatible
- `src/sprintManager.ts` : lecture des sous-sprints et génération des fiches `.md`
- `src/promptBuilder.ts` : construction de prompts Mimo respectant `dev-rules.md`
- `src/testRunner.ts` : exécution des tests unitaires et des tests curl
- `src/gitManager.ts` : gestion Git
- `src/discordNotifier.ts` : notifications et confirmations Discord
- `src/langfuseTracker.ts` : trace des appels IA (optionnel)
