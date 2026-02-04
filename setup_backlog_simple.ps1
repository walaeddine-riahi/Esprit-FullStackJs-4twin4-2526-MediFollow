# Installation et Configuration du Backlog MediFollow - Version Simplifiée
# Exécuter avec: powershell -ExecutionPolicy Bypass -File setup_backlog_simple.ps1

Write-Host "=================================" -ForegroundColor Cyan
Write-Host "MediFollow - Configuration Backlog" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Installer GitHub CLI si nécessaire
Write-Host "Etape 1: Installation de GitHub CLI" -ForegroundColor Yellow
Write-Host "Veuillez installer GitHub CLI manuellement si ce n'est pas déjà fait:" -ForegroundColor White
Write-Host "  winget install --id GitHub.cli" -ForegroundColor Gray
Write-Host ""
Read-Host "Appuyez sur Entrée après l'installation ou si déjà installé"

# Authentification
Write-Host ""
Write-Host "Etape 2: Authentification GitHub" -ForegroundColor Yellow
Write-Host "Si vous n'êtes pas authentifié, exécutez:" -ForegroundColor White
Write-Host "  gh auth login" -ForegroundColor Gray
Write-Host ""
Read-Host "Appuyez sur Entrée après l'authentification"

# Créer les labels
Write-Host ""
Write-Host "Etape 3: Création des labels" -ForegroundColor Yellow

gh label create "epic" --color "7B68EE" --description "Epic - Large feature set" --force 2>$null
gh label create "user-story" --color "0366d6" --description "User Story" --force 2>$null
gh label create "task" --color "1d76db" --description "Technical Task" --force 2>$null
gh label create "bug" --color "d73a4a" --description "Bug" --force 2>$null
gh label create "P0" --color "d73a4a" --description "Priority: Critical" --force 2>$null
gh label create "P1" --color "FF8C00" --description "Priority: High" --force 2>$null
gh label create "P2" --color "FFD700" --description "Priority: Medium" --force 2>$null
gh label create "P3" --color "90EE90" --description "Priority: Low" --force 2>$null
gh label create "feature/user-management" --color "0075ca" --description "User Management Module" --force 2>$null
gh label create "feature/patient-followup" --color "0075ca" --description "Patient Follow-up Module" --force 2>$null
gh label create "feature/vitals-management" --color "0075ca" --description "Vitals Management Module" --force 2>$null
gh label create "feature/symptom-tracking" --color "0075ca" --description "Symptom Tracking Module" --force 2>$null
gh label create "feature/alerts-and-notifications" --color "0075ca" --description "Alerts Module" --force 2>$null
gh label create "feature/questionnaire-management" --color "0075ca" --description="Questionnaire Module" --force 2>$null
gh label create "feature/dashboards" --color "0075ca" --description "Dashboards Module" --force 2>$null
gh label create "feature/audit-and-traceability" --color "0075ca" --description "Audit Module" --force 2>$null
gh label create "backend" --color "fbca04" --description "Backend Development" --force 2>$null
gh label create "frontend" --color "1d76db" --description "Frontend Development" --force 2>$null
gh label create "devops" --color "5319e7" --description "DevOps" --force 2>$null

Write-Host "Labels créés!" -ForegroundColor Green

# Créer les milestones
Write-Host ""
Write-Host "Etape 4: Création des milestones" -ForegroundColor Yellow

$date1 = (Get-Date).AddDays(14).ToString("yyyy-MM-ddT23:59:59Z")
$date2 = (Get-Date).AddDays(28).ToString("yyyy-MM-ddT23:59:59Z")
$date3 = (Get-Date).AddDays(42).ToString("yyyy-MM-ddT23:59:59Z")
$date4 = (Get-Date).AddDays(56).ToString("yyyy-MM-ddT23:59:59Z")

gh api repos/walaeddine-riahi/medifollow/milestones -f title="Sprint 1: Foundation" -f due_on=$date1 -f description="Setup and authentication" 2>$null
gh api repos/walaeddine-riahi/medifollow/milestones -f title="Sprint 2: Patient and Vitals" -f due_on=$date2 -f description="Patient and vitals management" 2>$null
gh api repos/walaeddine-riahi/medifollow/milestones -f title="Sprint 3: Alerts and Symptoms" -f due_on=$date3 -f description="Alerts and symptoms" 2>$null
gh api repos/walaeddine-riahi/medifollow/milestones -f title="Sprint 4: Enhanced Features" -f due_on=$date4 -f description="Dashboards and more" 2>$null

Write-Host "Milestones créés!" -ForegroundColor Green

# Créer les issues
Write-Host ""
Write-Host "Etape 5: Création des issues" -ForegroundColor Yellow
$response = Read-Host "Voulez-vous créer les issues maintenant? (O/N)"

if ($response -eq "O" -or $response -eq "o") {
    Write-Host "Création en cours..." -ForegroundColor Cyan
    
    # Epic 1
    gh issue create --title "[EPIC] User Management" --body "Priority: P0, Story Points: 40, Branch: feature/user-management" --label "epic,P0,feature/user-management"
    gh issue create --title "US-1.1: User Registration" --body "As a user I want to register" --label "user-story,P0,feature/user-management" --milestone "Sprint 1: Foundation"
    gh issue create --title "US-1.2: User Login" --body "As a user I want to login" --label "user-story,P0,feature/user-management" --milestone "Sprint 1: Foundation"
    gh issue create --title "US-1.4: RBAC" --body "As an admin I want role-based access control" --label "user-story,P0,feature/user-management" --milestone "Sprint 1: Foundation"
    
    # Epic 2
    gh issue create --title "[EPIC] Patient Management" --body "Priority: P0, Story Points: 45, Branch: feature/patient-followup" --label "epic,P0,feature/patient-followup"
    gh issue create --title "US-2.1: Patient Registration" --body "As a coordinator I want to register patients" --label "user-story,P0,feature/patient-followup" --milestone "Sprint 2: Patient and Vitals"
    gh issue create --title "US-2.2: Medical History" --body "As a physician I want to manage history" --label "user-story,P0,feature/patient-followup" --milestone "Sprint 2: Patient and Vitals"
    
    # Epic 3
    gh issue create --title "[EPIC] Vital Signs" --body "Priority: P0, Story Points: 35, Branch: feature/vitals-management" --label "epic,P0,feature/vitals-management"
    gh issue create --title "US-3.1: Vital Signs Entry" --body "As a patient I want to enter vitals" --label "user-story,P0,feature/vitals-management" --milestone "Sprint 2: Patient and Vitals"
    gh issue create --title "US-3.3: Charts" --body "As a professional I want to see charts" --label "user-story,P0,feature/vitals-management" --milestone "Sprint 2: Patient and Vitals"
    
    # Epic 4
    gh issue create --title "[EPIC] Symptom Tracking" --body "Priority: P0, Story Points: 30, Branch: feature/symptom-tracking" --label "epic,P0,feature/symptom-tracking"
    gh issue create --title "US-4.1: Daily Symptoms" --body "As a patient I want to report symptoms" --label "user-story,P0,feature/symptom-tracking" --milestone "Sprint 3: Alerts and Symptoms"
    gh issue create --title "US-4.5: Emergency Flagging" --body "As a patient I want to flag emergencies" --label "user-story,P0,feature/symptom-tracking" --milestone "Sprint 3: Alerts and Symptoms"
    
    # Epic 5
    gh issue create --title "[EPIC] Alerts System" --body "Priority: P0, Story Points: 35, Branch: feature/alerts-and-notifications" --label "epic,P0,feature/alerts-and-notifications"
    gh issue create --title "US-5.1: Alert Generation" --body "As the system I want to generate alerts" --label "user-story,P0,feature/alerts-and-notifications" --milestone "Sprint 3: Alerts and Symptoms"
    gh issue create --title "US-5.2: Alert Dashboard" --body "As a professional I want to see alerts" --label "user-story,P0,feature/alerts-and-notifications" --milestone "Sprint 3: Alerts and Symptoms"
    
    # Epic 6
    gh issue create --title "[EPIC] Questionnaires" --body "Priority: P1, Story Points: 30, Branch: feature/questionnaire-management" --label "epic,P1,feature/questionnaire-management"
    gh issue create --title "US-6.1: Form Builder" --body "As an admin I want to create forms" --label "user-story,P1,feature/questionnaire-management" --milestone "Sprint 4: Enhanced Features"
    
    # Epic 7
    gh issue create --title "[EPIC] Dashboards" --body "Priority: P1, Story Points: 40, Branch: feature/dashboards" --label "epic,P1,feature/dashboards"
    gh issue create --title "US-7.1: Patient Dashboard" --body "As a patient I want to see my status" --label "user-story,P0,feature/dashboards" --milestone "Sprint 4: Enhanced Features"
    gh issue create --title "US-7.2: Physician Dashboard" --body "As a physician I want to see my patients" --label "user-story,P0,feature/dashboards" --milestone "Sprint 4: Enhanced Features"
    
    # Epic 8
    gh issue create --title "[EPIC] Audit and Logs" --body "Priority: P1, Story Points: 25, Branch: feature/audit-and-traceability" --label "epic,P1,feature/audit-and-traceability"
    gh issue create --title "US-8.1: Activity Logging" --body "As the system I want to log activities" --label "user-story,P0,feature/audit-and-traceability" --milestone "Sprint 1: Foundation"
    
    Write-Host "Issues créées avec succès!" -ForegroundColor Green
}

Write-Host ""
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "Configuration terminée!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Visitez: https://github.com/walaeddine-riahi/medifollow/issues" -ForegroundColor White
Write-Host ""
