# CONCERTO Framework - Guide d'Extension

## Étendre le Framework

Ce guide explique comment ajouter de nouveaux maestros, workflows, phases, ou prompts au framework CONCERTO.

---

## 1. Ajouter un Nouveau Maestro

### Étapes

1. **Créer le répertoire**
   ```bash
   mkdir concerto-config/base/maestros/{nom-maestro}
   ```

2. **Créer le fichier maestro**
   ```bash
   cat > maestros/{category}/{nom-maestro}.md << 'EOF'
   ---
   id: "new-maestro"
   name: "New Maestro Name"
   phase: "dev"
   expertise: ["skill1", "skill2"]
   version: "1.0"
   created: "2026-04-18"
   ---

   # Maestro: New Maestro Name

   ## Profil
   ...expertise et expérience

   ## Responsabilités
   ...ce que fait ce maestro

   ## Outils & Stack
   ...technologies utilisées

   ## Success Criteria
   ...comment mesure-t-on le succès
   EOF
   ```

3. **Enregistrer dans la config**
   ```bash
   # Éditer concerto-config/base/CONFIG.md
   # Ajouter le maestro dans la section maestros
   ```

4. **Créer les prompts associés**
   ```bash
   # Créer des prompts réutilisables
   mkdir concerto-config/{phase}/prompts/{new-maestro}
   cat > concerto-config/{phase}/prompts/{new-maestro}/action-1.md << 'EOF'
   ---
   role: "New Maestro Name"
   phase: "{phase}"
   action: "action-1"
   ---
   # Prompt pour action-1
   ...
   EOF
   ```

5. **Ajouter à un workflow existant ou créer un nouveau**
   ```bash
   # Voir Section 2 pour créer un workflow
   ```

---

## 2. Ajouter un Nouveau Workflow

### Étapes

1. **Créer le fichier workflow**
   ```bash
   cat > workflows/{nom-workflow}.md << 'EOF'
   ---
   id: "WF-{NAME}"
   title: "Workflow: {Descriptive Title}"
   version: "1.0"
   created: "2026-04-18"
   ---

   # Workflow: {Descriptive Title}

   ## Objectif
   ...qu'est-ce que ce workflow accomplira

   ## Phases et Étapes
   
   ### Phase 1: {Phase Name}
   **1.1 Étape 1**
   ...description et actions

   **Maestros Assignés**:
   - ✅ Maestro 1
   - ✅ Maestro 2

   ### Phase 2: {Next Phase}
   ...

   ## Checklist de Complétude
   - [ ] Criterion 1
   - [ ] Criterion 2

   ## Timeline Estimée
   ...durée et jalons
   EOF
   ```

2. **Référencer le workflow dans les docs**
   ```bash
   # Ajouter une entrée dans docs/USAGE.md
   # Sous "Workflows Disponibles"
   ```

3. **Tester le workflow**
   ```bash
   # Parcourir chaque étape
   # Valider que les maestros assignés peuvent accomplir
   # Vérifier les dépendances entre étapes
   ```

---

## 3. Ajouter une Nouvelle Phase

### Étapes

1. **Ajouter la phase à CONFIG**
   ```bash
   # éditer concerto-config/base/CONFIG.md
   # Ajouter dans la section "phases:"
   - id: "new-phase"
     label: "New Phase Label"
     icon: "icon-lucide"
     order: 5
   ```

2. **Créer la structure de répertoires**
   ```bash
   mkdir -p concerto-config/new-phase/prompts
   mkdir -p engine/dashboard/client/src/app/new-phase
   ```

3. **Créer une page frontend pour la phase**
   ```bash
   cat > engine/dashboard/client/src/app/new-phase/page.tsx << 'EOF'
   'use client';

   import { useEffect, useState } from 'react';
   import { apiService } from '@/lib/api';

   export default function NewPhasePage() {
     const [data, setData] = useState(null);

     useEffect(() => {
       // Charger les data depuis l'API
       apiService.getNewPhaseData().then(setData);
     }, []);

     return (
       <div className="p-6">
         <h1>New Phase</h1>
         {/* Contenu spécifique à la phase */}
       </div>
     );
   }
   EOF
   ```

4. **Mettre à jour TopBar.tsx**
   ```tsx
   // ajouter à phases array:
   {
     id: 'new-phase',
     label: 'New Phase',
     icon: IconName,
     color: 'cyan' // ou autre couleur
   }
   ```

5. **Créer des prompts pour la phase**
   ```bash
   # Créer prompts pour maestros dans cette phase
   concerto-config/new-phase/prompts/{action-1}.md
   concerto-config/new-phase/prompts/{action-2}.md
   ```

6. **Ajouter des spécifications pour la phase**
   ```bash
   cat > concerto-config/spec/SPEC-XXX-new-phase-feature.md << 'EOF'
   ---
   id: "SPEC-XXX"
   title: "New Phase Implementation"
   phase: "new-phase"
   status: "draft"
   ...
   ---
   EOF
   ```

---

## 4. Ajouter des Prompts Réutilisables

### Structure des Prompts

```markdown
---
role: "Role Name"
phase: "phase"
action: "action-name"
version: "1.0"
triggers: ["trigger1", "trigger2"]
tools: ["tool1", "tool2"]
templates: ["template1"]
---

# Prompt: Title

## Contexte
...background info

## Tâche
...what needs to be done

## Critères d'Acceptation
- [ ] Criterion 1
- [ ] Criterion 2

## Ressources
...relevant files/docs

## Restrictions
...don'ts and limitations
```

### Où Placer les Prompts

- **Universels** : `concerto-config/base/prompts/{name}.md`
- **Phase-spécifiques** : `concerto-config/{phase}/prompts/{name}.md`
- **Maestro-spécifiques** : `concerto-config/{phase}/prompts/{maestro}/{action}.md`

### Exemple: Créer un Prompt Réutilisable

```bash
cat > concerto-config/dev/prompts/setup-database.md << 'EOF'
---
role: "Backend Developer"
phase: "dev"
action: "setup-database"
version: "1.0"
triggers: ["new-project", "schema-change"]
tools: ["postgres", "typeorm", "migrations"]
---

# Setup Database

## Intention
Configure une base de données produits...

## Étapes
1. Créer migrations
2. Exécuter migrations
3. Valider avec seeds
4. Vérifier avec tests

...

EOF
```

---

## 5. Ajouter une Spécification (Spec)

### Format Standard

```markdown
---
id: "SPEC-XXX"
title: "Feature Title"
phase: "dev"
status: "draft"
version: "1.0"
created: "2026-04-18"
modified: "2026-04-18"
owner: "Maestro Name"
priority: "high"
related: ["SPEC-YYY"]
---

# Spécification: Feature Title

## Description
...what is this feature

## Technical Requirements
...tech details

## Critères d'Acceptation
- [ ] AC1
- [ ] AC2
- [ ] AC3

## Dependencies
- ✅ SPEC-YYY (related features)
- ❌ API endpoint (todo)

## Resources
- Prompt: `concerto-config/dev/prompts/action.md`
- Related Code: `/path/to/code`

```

### Workflow Typique

```bash
# 1. Créer la spec en draft
cat > concerto-config/spec/SPEC-XXX-name.md << 'EOF'
... (contenu)
EOF

# 2. Approuver la spec
# - Éditer: changer status: draft → status: approved

# 3. Mettre à jour TRACKING.md
# - Ajouter ligne au tableau

# 4. Assigner à maestro
# - Référencer le prompt approprié

# 5. Mettre à jour status
# - draft → approved → in-progress → completed
```

---

## 6. Créer une Template d'Action

### Structure

```bash
mkdir -p concerto-config/{phase}/templates/{action-name}
```

**Files à inclure:**

```
{action-name}/
├── README.md           ← Explication de la template
├── prompt.md           ← Prompt réutilisable
├── checklist.md        ← Checklist step-by-step
├── examples/
│   └── example-1.md    ← Exemples concrets
└── validation.md       ← Comment valider
```

### Exemple: Template "API Endpoint"

```bash
cat > concerto-config/dev/templates/api-endpoint/README.md << 'EOF'
# Template: Créer un Endpoint API

Cette template guide la création d'un nouvel endpoint REST.

## Fichiers inclus
- `prompt.md` : Prompt pour le backend developer
- `checklist.md` : Étapes à suivre
- `examples/` : Exemples d'endpoints

## Utilisation
1. Copier cette template
2. Adapter le nom (POST users vs PUT users/:id)
3. Suivre le prompt.md
4. Utiliser la checklist
EOF
```

---

## 7. Modifier la Configuration de Base

### CONFIG.md - Ajouter une Nouvelle Action

```yaml
# Dans concerto-config/base/CONFIG.md, section "Actions Disponibles"

# New Phase
- `new-action` : Description courte de l'action
- `another-action` : Autre action disponible
```

### CONFIG.md - Ajouter un Nouveau Tool

```yaml
# Nouvelles dépendances, outils, ou libraires
tools:
  - name: "tool-name"
    version: "1.0"
    purpose: "what it does"
```

---

## 8. Best Practices

### ✅ Do's

- ✅ **Version tout** : Specs, prompts, workflows, maestros
- ✅ **Documenter les dépendances** : Que bloque quoi
- ✅ **Créer des exemples** : Facilitez la réutilisation
- ✅ **Garder les prompts réutilisables** : Pas de cas spécifiques
- ✅ **Tester les workflows** : Validate que c'est faisable
- ✅ **Maintenir TRACKING.md** : Source unique de vérité

### ❌ Don'ts

- ❌ **Ne pas modifier CONFIG.md à la légère** : C'est la référence
- ❌ **Ne pas créer de maestros dupliquants** : Fusionne les rôles similaires
- ❌ **Ne pas oublier le frontmatter YAML** : C'est critique pour le parsing
- ❌ **Ne pas hardcoder les spécifications** : Garde-les dynamiques
- ❌ **Ne pas laisser traîner les specs "on-hold"** : Explique le blocage

---

## 9. Validating Extensions

### Checklist Avant de Commiter

- [ ] Frontmatter YAML valide
- [ ] IDs uniques (pas de SPEC-XXX en doublon)
- [ ] Dépendances documentées
- [ ] Version incrémentée
- [ ] Liens cassés vérifiés
- [ ] Prompts testés avec un maestro
- [ ] Workflows testés start-to-finish
- [ ] TRACKING.md mis à jours
- [ ] Pas de secrets/credentials exposés

---

## 10. Exemple Complet: Ajouter une Phase "Security"

```bash
# 1. Ajouter la phase à CONFIG
# (éditer concerto-config/base/CONFIG.md)

# 2. Créer structure
mkdir -p concerto-config/security/prompts

# 3. Créer maestros
cat > maestros/security-lead.md << 'EOF'
---
id: "security-lead"
name: "Security Lead"
phase: "security"
expertise: ["security-analysis", "penetration-testing", "compliance"]
---
# ...
EOF

# 4. Créer prompts
cat > concerto-config/security/prompts/security-audit.md << 'EOF'
---
role: "Security Lead"
phase: "security"
action: "security-audit"
---
# ...
EOF

# 5. Créer page frontend
mkdir -p engine/dashboard/client/src/app/security
cat > engine/dashboard/client/src/app/security/page.tsx << 'EOF'
'use client';
export default function SecurityPage() {
  return <div>Security Page</div>;
}
EOF

# 6. Ajouter specs
cat > concerto-config/spec/SPEC-040-security-page.md << 'EOF'
---
id: "SPEC-040"
title: "Security Page Frontend"
phase: "security"
status: "draft"
---
# ...
EOF

# 7. Valider
# - Tous les fichiers créés
# - YAML frontmatter valides
# - Liens documentés
# - Dépendances claires

# 8. Commit!
```

---

## Questions Fréquentes

**Q: Comment dépublier (deprecate) une feature?**  
R: Créer un spec "SPEC-DEPRECATED-XXX" avec status "deprecated" et direction vers le remplacement.

**Q: Puis-je avoir plusieurs maestros pour une action?**  
R: Oui! Créer un workflow qui les orchestre ensemble.

**Q: Comment gérer les versions de spécifications?**  
R: SPEC-XXX est la v1. Pour v2, créer SPEC-XXX-v2 ou SPEC-YYY selon les changements.

**Q: Où mettre les prompts confidentiels?**  
R: Ne jamais les commit! Utiliser un système de secrets (env vars ou fichiers .gitignored).

---

## Support

Pour des questions sur l'extension du framework:
- Consulter `docs/STRUCTURE.md`
- Examiner les workflows existants
- Parcourir les spécifications approuvées
- Demander au team lead
