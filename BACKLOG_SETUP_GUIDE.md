# 📊 Guide: Configuration du Backlog sur GitHub

## 🎯 Options pour Gérer le Backlog

### Option 1: GitHub Issues + Projects (Recommandé)
### Option 2: Script d'importation automatique
### Option 3: GitHub CLI manuel

---

## ✅ Option 1: GitHub Projects (Interface Web)

### Étape 1: Créer un Nouveau Projet

1. Allez sur votre repository: `https://github.com/walaeddine-riahi/medifollow`
2. Cliquez sur l'onglet **"Projects"**
3. Cliquez sur **"New project"**
4. Choisissez **"Board"** template
5. Nommez le projet: **"MediFollow - Product Backlog"**

### Étape 2: Configurer les Colonnes

Créez les colonnes suivantes:
- 📋 **Backlog** - Toutes les tâches à faire
- 🎯 **Sprint Ready** - Prêt pour le prochain sprint
- 🚧 **In Progress** - En cours de développement
- 👀 **In Review** - En revue de code
- ✅ **Done** - Terminé

### Étape 3: Créer les Épics (Manuellement)

Pour chaque épic du BACKLOG.md, créez une issue:

#### Epic 1: User Management
```
Titre: 🔐 [EPIC] User Management & Authentication
Labels: epic, P0, feature/user-management
Description:
- Priority: P0
- Story Points: 40
- Branch: feature/user-management
- User Stories: US-1.1 à US-1.7
```

#### Epic 2: Patient Follow-up
```
Titre: 🏥 [EPIC] Patient Follow-up Management
Labels: epic, P0, feature/patient-followup
Description:
- Priority: P0
- Story Points: 45
- Branch: feature/patient-followup
- User Stories: US-2.1 à US-2.7
```

Répétez pour les 8 épics.

### Étape 4: Créer les User Stories

Pour chaque User Story, créez une issue liée à son épic:

```
Titre: US-1.1: User Registration
Labels: user-story, P0, backend, frontend
Assignee: Dev 1 - Ahmed
Milestone: Sprint 1

Description:
**As a** new user
**I want to** register an account
**So that** I can access the platform

## Acceptance Criteria
- [ ] Critère 1
- [ ] Critère 2
...

**Story Points:** 5
**Epic:** #1 (référence à l'epic)
```

### Étape 5: Créer les Milestones

1. Allez dans **Issues → Milestones**
2. Créez les milestones pour chaque sprint:
   - Sprint 1: Foundation (Weeks 1-2)
   - Sprint 2: Patient & Vital Management (Weeks 3-4)
   - Sprint 3: Alerts & Symptoms (Weeks 5-6)
   - Sprint 4: Enhanced Features (Weeks 7-8)

---

## 🤖 Option 2: Script Automatique (GitHub CLI)

### Installation de GitHub CLI

```powershell
# Windows (avec winget)
winget install --id GitHub.cli

# Ou télécharger depuis: https://cli.github.com/
```

### Authentification

```bash
gh auth login
# Suivez les instructions
# Choisissez: GitHub.com → HTTPS → Oui (Git credentials) → Login with browser
```

### Exécution du Script

```bash
# Rendez le script exécutable
chmod +x create_backlog_issues.sh

# Exécutez le script
./create_backlog_issues.sh
```

Le script va créer automatiquement:
- 8 Issues pour les Épics
- 25+ Issues pour les User Stories principales
- Labels appropriés
- Assignations (si les utilisateurs existent)

---

## 🔧 Option 3: Commandes GitHub CLI Manuelles

### Créer un Épic

```bash
gh issue create \
  --repo walaeddine-riahi/medifollow \
  --title "🔐 [EPIC] User Management & Authentication" \
  --body "Priority: P0, Story Points: 40..." \
  --label "epic,P0,feature/user-management"
```

### Créer une User Story

```bash
gh issue create \
  --repo walaeddine-riahi/medifollow \
  --title "US-1.1: User Registration" \
  --body "As a user, I want to..." \
  --label "user-story,P0,backend,frontend" \
  --assignee "username" \
  --milestone "Sprint 1"
```

### Lister les Issues

```bash
gh issue list --repo walaeddine-riahi/medifollow
```

---

## 📝 Template d'Issue

Créez un template dans `.github/ISSUE_TEMPLATE/user_story.md`:

```markdown
---
name: User Story
about: Create a user story
title: 'US-X.X: '
labels: user-story
assignees: ''
---

## User Story
**As a** [role]  
**I want to** [action]  
**So that** [benefit]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Technical Details
- **Story Points:** 
- **Epic:** #
- **Priority:** 
- **Dependencies:** 

## Notes
<!-- Additional context -->
```

---

## 🏷️ Labels à Créer

Créez ces labels dans votre repo (Settings → Labels):

### Par Type
- `epic` 🟣 (Purple)
- `user-story` 🔵 (Blue)
- `task` 🟢 (Green)
- `bug` 🔴 (Red)

### Par Priorité
- `P0` 🔴 (Critical)
- `P1` 🟠 (High)
- `P2` 🟡 (Medium)
- `P3` 🟢 (Low)

### Par Module
- `feature/user-management`
- `feature/patient-followup`
- `feature/vitals-management`
- `feature/symptom-tracking`
- `feature/alerts-and-notifications`
- `feature/questionnaire-management`
- `feature/dashboards`
- `feature/audit-and-traceability`

### Par Type de Travail
- `backend`
- `frontend`
- `devops`
- `documentation`
- `testing`

---

## 📊 Configuration GitHub Projects v2

### Créer des Vues Personnalisées

#### Vue: Sprint Board
- Group by: Status
- Filter: Milestone = "Sprint 1"

#### Vue: By Epic
- Group by: Epic label
- Sort by: Priority

#### Vue: By Assignee
- Group by: Assignee
- Filter: Status != Done

#### Vue: Roadmap
- Layout: Roadmap
- Date field: Due date

### Champs Personnalisés

Ajoutez ces champs au projet:
- **Story Points** (Number)
- **Epic** (Single select)
- **Priority** (Single select: P0, P1, P2, P3)
- **Sprint** (Single select: Sprint 1-8)
- **Module** (Single select: features)

---

## 🔄 Workflow Recommandé

### 1. Sprint Planning
```bash
# Créer le milestone
gh issue list --milestone "Sprint 1" --state open

# Déplacer les issues vers "Sprint Ready"
gh issue edit <issue-number> --add-label "sprint-1"
```

### 2. Development
```bash
# Créer une branche
git checkout -b feature/user-management

# Lier les commits aux issues
git commit -m "feat: Add user registration form (#1)"
```

### 3. Code Review
```bash
# Créer une PR
gh pr create --title "US-1.1: User Registration" \
             --body "Closes #1"
```

### 4. Sprint Review
```bash
# Fermer toutes les issues terminées
gh issue close <issue-number> --comment "Completed in Sprint 1"
```

---

## 📈 Rapports et Métriques

### Voir le Burn-down

```bash
# Issues ouvertes vs fermées par milestone
gh issue list --milestone "Sprint 1" --json state | jq '.[] | .state' | sort | uniq -c
```

### Velocity

```bash
# Story points completés par sprint
# À calculer manuellement ou avec un script
```

---

## 🚀 Démarrage Rapide (5 minutes)

### Méthode Rapide

1. **Installer GitHub CLI**
   ```bash
   winget install --id GitHub.cli
   ```

2. **S'authentifier**
   ```bash
   gh auth login
   ```

3. **Créer les labels**
   ```bash
   gh label create "epic" --color "7B68EE"
   gh label create "user-story" --color "0366d6"
   gh label create "P0" --color "d73a4a"
   gh label create "P1" --color "FF8C00"
   ```

4. **Exécuter le script**
   ```bash
   bash create_backlog_issues.sh
   ```

5. **Créer le Project Board**
   - Aller sur GitHub → Projects → New Project
   - Ajouter toutes les issues créées

---

## 📞 Support

- GitHub CLI Docs: https://cli.github.com/manual/
- GitHub Projects: https://docs.github.com/en/issues/planning-and-tracking-with-projects
- Issues & Pull Requests: https://docs.github.com/en/issues

---

## ✅ Checklist de Configuration

- [ ] GitHub CLI installé et authentifié
- [ ] Labels créés dans le repository
- [ ] Project board créé
- [ ] Colonnes configurées
- [ ] Milestones créés pour les sprints
- [ ] Épics créés (8 issues)
- [ ] User stories créées (56 issues)
- [ ] Assignations faites
- [ ] Templates d'issue configurés
- [ ] Champs personnalisés ajoutés
- [ ] Vues personnalisées créées

---

**Dernière mise à jour:** 5 février 2026  
**Auteur:** Équipe MediFollow
