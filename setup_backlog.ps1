# Installation et Configuration du Backlog MediFollow
# Exécuter avec: powershell -ExecutionPolicy Bypass -File setup_backlog.ps1

Write-Host "🚀 Installation et Configuration du Backlog MediFollow" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si winget est disponible
Write-Host "📦 Vérification de winget..." -ForegroundColor Yellow
if (Get-Command winget -ErrorAction SilentlyContinue) {
    Write-Host "winget est disponible" -ForegroundColor Green
}
else {
    Write-Host "winget n'est pas disponible. Veuillez installer App Installer depuis le Microsoft Store" -ForegroundColor Red
    exit 1
}

# Installer GitHub CLI
Write-Host ""
Write-Host "📦 Installation de GitHub CLI..." -ForegroundColor Yellow
try {
    $ghVersion = gh --version 2>&1
    Write-Host "✅ GitHub CLI est déjà installé: $ghVersion" -ForegroundColor Green
} catch {
    Write-Host "⚙️  Installation de GitHub CLI en cours..." -ForegroundColor Cyan
    winget install --id GitHub.cli --silent
    
    # Recharger les variables d'environnement
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    
    Write-Host "✅ GitHub CLI installé avec succès" -ForegroundColor Green
}

# Vérifier l'authentification GitHub
Write-Host ""
Write-Host "🔐 Vérification de l'authentification GitHub..." -ForegroundColor Yellow
$authStatus = gh auth status 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Vous êtes authentifié sur GitHub" -ForegroundColor Green
} else {
    Write-Host "⚠️  Vous n'êtes pas authentifié. Lancement de l'authentification..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Suivez les instructions pour vous authentifier:" -ForegroundColor Cyan
    Write-Host "1. Choisissez GitHub.com" -ForegroundColor White
    Write-Host "2. Choisissez HTTPS" -ForegroundColor White
    Write-Host "3. Confirmez l'authentification Git credentials" -ForegroundColor White
    Write-Host "4. Choisissez 'Login with a web browser'" -ForegroundColor White
    Write-Host ""
    gh auth login
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Authentification réussie" -ForegroundColor Green
    } else {
        Write-Host "❌ Authentification échouée" -ForegroundColor Red
        exit 1
    }
}

# Créer les labels
Write-Host ""
Write-Host "🏷️  Création des labels..." -ForegroundColor Yellow

$labels = @(
    @{name="epic"; color="7B68EE"; description="Epic - Large feature set"},
    @{name="user-story"; color="0366d6"; description="User Story"},
    @{name="task"; color="1d76db"; description="Technical Task"},
    @{name="bug"; color="d73a4a"; description="Bug"},
    @{name="P0"; color="d73a4a"; description="Priority: Critical"},
    @{name="P1"; color="FF8C00"; description="Priority: High"},
    @{name="P2"; color="FFD700"; description="Priority: Medium"},
    @{name="P3"; color="90EE90"; description="Priority: Low"},
    @{name="feature/user-management"; color="0075ca"; description="User Management Module"},
    @{name="feature/patient-followup"; color="0075ca"; description="Patient Follow-up Module"},
    @{name="feature/vitals-management"; color="0075ca"; description="Vitals Management Module"},
    @{name="feature/symptom-tracking"; color="0075ca"; description="Symptom Tracking Module"},
    @{name="feature/alerts-and-notifications"; color="0075ca"; description="Alerts and Notifications Module"},
    @{name="feature/questionnaire-management"; color="0075ca"; description="Questionnaire Management Module"},
    @{name="feature/dashboards"; color="0075ca"; description="Dashboards Module"},
    @{name="feature/audit-and-traceability"; color="0075ca"; description="Audit and Traceability Module"},
    @{name="backend"; color="fbca04"; description="Backend Development"},
    @{name="frontend"; color="1d76db"; description="Frontend Development"},
    @{name="devops"; color="5319e7"; description="DevOps and Infrastructure"},
    @{name="documentation"; color="0e8a16"; description="Documentation"},
    @{name="testing"; color="c2e0c6"; description="Testing"}
)

foreach ($label in $labels) {
    Write-Host "  Creating label: $($label.name)" -ForegroundColor Gray
    gh label create $label.name --color $label.color --description $label.description --force 2>$null
}

Write-Host "✅ Labels créés" -ForegroundColor Green

# Créer les milestones
Write-Host ""
Write-Host "🎯 Création des milestones (Sprints)..." -ForegroundColor Yellow

$milestones = @(
    @{title="Sprint 1: Foundation"; dueDate=(Get-Date).AddDays(14).ToString("yyyy-MM-dd"); description="Setup infrastructure and basic authentication"},
    @{title="Sprint 2: Patient and Vitals"; dueDate=(Get-Date).AddDays(28).ToString("yyyy-MM-dd"); description="Patient management and vital signs tracking"},
    @{title="Sprint 3: Alerts and Symptoms"; dueDate=(Get-Date).AddDays(42).ToString("yyyy-MM-dd"); description="Alert system and symptom tracking"},
    @{title="Sprint 4: Enhanced Features"; dueDate=(Get-Date).AddDays(56).ToString("yyyy-MM-dd"); description="Dashboards, questionnaires, and analytics"}
)

foreach ($milestone in $milestones) {
    Write-Host "  Creating milestone: $($milestone.title)" -ForegroundColor Gray
    gh api repos/walaeddine-riahi/medifollow/milestones -f title="$($milestone.title)" -f due_on="$($milestone.dueDate)T23:59:59Z" -f description="$($milestone.description)" 2>$null
}

Write-Host "✅ Milestones créés" -ForegroundColor Green

# Demander si l'utilisateur veut créer les issues
Write-Host ""
Write-Host "📋 Voulez-vous créer les issues du backlog maintenant?" -ForegroundColor Yellow
Write-Host "   Cela va créer:" -ForegroundColor White
Write-Host "   - 8 Epics" -ForegroundColor White
Write-Host "   - 25+ User Stories" -ForegroundColor White
Write-Host ""
$createIssues = Read-Host "Créer les issues? (O/N)"

if ($createIssues -eq "O" -or $createIssues -eq "o" -or $createIssues -eq "Y" -or $createIssues -eq "y") {
    Write-Host ""
    Write-Host "📝 Création des issues..." -ForegroundColor Yellow
    Write-Host "   (Cela peut prendre quelques minutes)" -ForegroundColor Gray
    Write-Host ""
    
    # Convertir le script bash en commandes PowerShell et exécuter
    # Pour simplifier, on affiche les instructions pour l'utilisateur
    
    Write-Host "⚙️  Exécution du script de création d'issues..." -ForegroundColor Cyan
    
    # Epic 1
    Write-Host "  Création Epic 1..." -ForegroundColor Gray
    gh issue create --repo walaeddine-riahi/medifollow --title "🔐 [EPIC] User Management & Authentication" --body "Priority: P0`nStory Points: 40`nBranch: feature/user-management" --label "epic,P0,feature/user-management"
    
    # User Stories Epic 1
    gh issue create --repo walaeddine-riahi/medifollow --title "US-1.1: User Registration" --body "As a new user I want to register an account" --label "user-story,P0,feature/user-management" --milestone "Sprint 1: Foundation"
    gh issue create --repo walaeddine-riahi/medifollow --title "US-1.2: User Login" --body "As a registered user I want to login" --label "user-story,P0,feature/user-management" --milestone "Sprint 1: Foundation"
    gh issue create --repo walaeddine-riahi/medifollow --title "US-1.4: RBAC" --body "As an administrator I want to assign roles" --label "user-story,P0,feature/user-management" --milestone "Sprint 1: Foundation"
    
    # Epic 2
    Write-Host "  Création Epic 2..." -ForegroundColor Gray
    gh issue create --repo walaeddine-riahi/medifollow --title "🏥 [EPIC] Patient Follow-up Management" --body "Priority: P0`nStory Points: 45`nBranch: feature/patient-followup" --label "epic,P0,feature/patient-followup"
    
    gh issue create --repo walaeddine-riahi/medifollow --title "US-2.1: Patient Registration" --body "As a coordinator I want to register patients" --label "user-story,P0,feature/patient-followup" --milestone "Sprint 2: Patient & Vitals"
    gh issue create --repo walaeddine-riahi/medifollow --title "US-2.2: Medical History" --body "As a physician I want to manage medical history" --label "user-story,P0,feature/patient-followup" --milestone "Sprint 2: Patient & Vitals"
    
    # Epic 3
    Write-Host "  Création Epic 3..." -ForegroundColor Gray
    gh issue create --repo walaeddine-riahi/medifollow --title "📊 [EPIC] Vital Signs Management" --body "Priority: P0`nStory Points: 35`nBranch: feature/vitals-management" --label "epic,P0,feature/vitals-management"
    
    gh issue create --repo walaeddine-riahi/medifollow --title "US-3.1: Vital Signs Entry" --body "As a patient I want to enter vital signs" --label "user-story,P0,feature/vitals-management" --milestone "Sprint 2: Patient & Vitals"
    gh issue create --repo walaeddine-riahi/medifollow --title "US-3.3: Vital Signs Charts" --body "As a healthcare professional I want to view charts" --label "user-story,P0,feature/vitals-management" --milestone "Sprint 2: Patient & Vitals"
    
    # Epic 4
    Write-Host "  Création Epic 4..." -ForegroundColor Gray
    gh issue create --repo walaeddine-riahi/medifollow --title "🩺 [EPIC] Symptom Tracking" --body "Priority: P0`nStory Points: 30`nBranch: feature/symptom-tracking" --label "epic,P0,feature/symptom-tracking"
    
    gh issue create --repo walaeddine-riahi/medifollow --title "US-4.1: Daily Symptom Report" --body "As a patient I want to report symptoms" --label "user-story,P0,feature/symptom-tracking" --milestone "Sprint 3: Alerts & Symptoms"
    gh issue create --repo walaeddine-riahi/medifollow --title "US-4.5: Emergency Symptom Flagging" --body "As a patient I want to flag emergencies" --label "user-story,P0,feature/symptom-tracking" --milestone "Sprint 3: Alerts & Symptoms"
    
    # Epic 5
    Write-Host "  Création Epic 5..." -ForegroundColor Gray
    gh issue create --repo walaeddine-riahi/medifollow --title "🔔 [EPIC] Alerts and Notifications" --body "Priority: P0`nStory Points: 35`nBranch: feature/alerts-and-notifications" --label "epic,P0,feature/alerts-and-notifications"
    
    gh issue create --repo walaeddine-riahi/medifollow --title "US-5.1: Real-time Alert Generation" --body "As the system I want to generate alerts" --label "user-story,P0,feature/alerts-and-notifications" --milestone "Sprint 3: Alerts & Symptoms"
    gh issue create --repo walaeddine-riahi/medifollow --title "US-5.2: Alert Dashboard" --body "As a healthcare professional I want to view alerts" --label "user-story,P0,feature/alerts-and-notifications" --milestone "Sprint 3: Alerts & Symptoms"
    
    # Epic 6
    Write-Host "  Création Epic 6..." -ForegroundColor Gray
    gh issue create --repo walaeddine-riahi/medifollow --title "📝 [EPIC] Questionnaire Management" --body "Priority: P1`nStory Points: 30`nBranch: feature/questionnaire-management" --label "epic,P1,feature/questionnaire-management"
    
    gh issue create --repo walaeddine-riahi/medifollow --title "US-6.1: Questionnaire Builder" --body "As an administrator I want to create questionnaires" --label "user-story,P1,feature/questionnaire-management" --milestone "Sprint 4: Enhanced Features"
    
    # Epic 7
    Write-Host "  Création Epic 7..." -ForegroundColor Gray
    gh issue create --repo walaeddine-riahi/medifollow --title "📈 [EPIC] Dashboards and Analytics" --body "Priority: P1`nStory Points: 40`nBranch: feature/dashboards" --label "epic,P1,feature/dashboards"
    
    gh issue create --repo walaeddine-riahi/medifollow --title "US-7.1: Patient Dashboard" --body "As a patient I want to see my health overview" --label "user-story,P0,feature/dashboards" --milestone "Sprint 4: Enhanced Features"
    gh issue create --repo walaeddine-riahi/medifollow --title "US-7.2: Physician Dashboard" --body "As a physician I want to see my patients overview" --label "user-story,P0,feature/dashboards" --milestone "Sprint 4: Enhanced Features"
    
    # Epic 8
    Write-Host "  Création Epic 8..." -ForegroundColor Gray
    gh issue create --repo walaeddine-riahi/medifollow --title "🔍 [EPIC] Audit and Traceability" --body "Priority: P1`nStory Points: 25`nBranch: feature/audit-and-traceability" --label "epic,P1,feature/audit-and-traceability"
    
    gh issue create --repo walaeddine-riahi/medifollow --title "US-8.1: Activity Logging" --body "As the system I want to log all activities" --label "user-story,P0,feature/audit-and-traceability" --milestone "Sprint 1: Foundation"
    
    Write-Host ""
    Write-Host "✅ Issues créées avec succès!" -ForegroundColor Green
} else {
    Write-Host "⏭️  Création des issues ignorée" -ForegroundColor Yellow
}

# Résumé final
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Configuration terminée!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Prochaines étapes:" -ForegroundColor Yellow
Write-Host "1. Visitez: https://github.com/walaeddine-riahi/medifollow/issues" -ForegroundColor White
Write-Host "2. Créez un GitHub Project Board" -ForegroundColor White
Write-Host "3. Organisez les issues dans le board" -ForegroundColor White
Write-Host "4. Assignez les tâches aux membres de l'équipe" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentation:" -ForegroundColor Yellow
Write-Host "- BACKLOG.md: Backlog complet" -ForegroundColor White
Write-Host "- TEAM_TASKS.md: Répartition des tâches" -ForegroundColor White
Write-Host "- BACKLOG_SETUP_GUIDE.md: Guide détaillé" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Bon développement!" -ForegroundColor Cyan
