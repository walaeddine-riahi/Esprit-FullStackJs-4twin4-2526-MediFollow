#!/bin/bash
# Script to create GitHub Issues from BACKLOG.md
# Usage: ./create_backlog_issues.sh

# Configuration
REPO="walaeddine-riahi/medifollow"

echo "🚀 Creating GitHub Issues for MediFollow Backlog..."
echo "Repository: $REPO"
echo ""

# Epic 1: User Management & Authentication
echo "📝 Creating Epic 1: User Management & Authentication..."

gh issue create \
  --repo "$REPO" \
  --title "🔐 [EPIC] User Management & Authentication" \
  --body "**Priority:** P0 - Critical
**Story Points:** 40
**Branch:** feature/user-management

## Epic Overview
Complete user authentication system with role-based access control, multi-factor authentication, and comprehensive user management features.

## User Stories
- US-1.1: User Registration (5 pts)
- US-1.2: User Login (3 pts)
- US-1.3: Multi-Factor Authentication (8 pts)
- US-1.4: Role-Based Access Control (8 pts)
- US-1.5: Password Reset (5 pts)
- US-1.6: User Profile Management (5 pts)
- US-1.7: User Deactivation/Deletion (6 pts)

## Technical Requirements
- JWT token implementation
- Bcrypt password hashing
- Redis session management
- Email verification system
- Permission matrix

## Dependencies
None - Foundation module" \
  --label "epic,P0,feature/user-management" \
  --assignee "ahmed"

gh issue create \
  --repo "$REPO" \
  --title "US-1.1: User Registration" \
  --body "**As a** new user
**I want to** register an account with my personal information
**So that** I can access the MediFollow platform

## Acceptance Criteria
- [ ] User can fill registration form with: name, email, password, role
- [ ] Email validation is implemented
- [ ] Password strength validation (min 8 chars, uppercase, lowercase, number, special char)
- [ ] User receives confirmation email
- [ ] Account activation via email link

**Priority:** P0
**Story Points:** 5
**Epic:** User Management & Authentication
**Assigned to:** Dev 1 - Ahmed" \
  --label "user-story,P0,feature/user-management,backend,frontend" \
  --assignee "ahmed"

gh issue create \
  --repo "$REPO" \
  --title "US-1.2: User Login" \
  --body "**As a** registered user
**I want to** login with my credentials
**So that** I can access my personalized dashboard

## Acceptance Criteria
- [ ] Login form with email and password
- [ ] JWT token generation on successful login
- [ ] Session management implemented
- [ ] \"Remember me\" functionality
- [ ] Error handling for invalid credentials
- [ ] Redirect to appropriate dashboard based on role

**Priority:** P0
**Story Points:** 3
**Dependencies:** US-1.1
**Assigned to:** Dev 1 - Ahmed, Dev 2 - Sarah" \
  --label "user-story,P0,feature/user-management,backend,frontend"

gh issue create \
  --repo "$REPO" \
  --title "US-1.3: Multi-Factor Authentication (MFA)" \
  --body "**As a** healthcare professional
**I want to** enable two-factor authentication
**So that** my account has enhanced security

## Acceptance Criteria
- [ ] MFA setup page with QR code generation
- [ ] Support for authenticator apps (Google Authenticator, Authy)
- [ ] Backup codes generation (10 codes)
- [ ] SMS-based 2FA as alternative
- [ ] MFA verification during login
- [ ] Option to disable MFA

**Priority:** P1
**Story Points:** 8
**Dependencies:** US-1.2
**Assigned to:** Dev 1 - Ahmed" \
  --label "user-story,P1,feature/user-management,backend"

gh issue create \
  --repo "$REPO" \
  --title "US-1.4: Role-Based Access Control (RBAC)" \
  --body "**As an** administrator
**I want to** assign different roles with specific permissions
**So that** users can only access features relevant to their role

## Acceptance Criteria
- [ ] Define roles: Admin, Physician, Nurse, Coordinator, Patient, Auditor
- [ ] Permission matrix implementation
- [ ] Middleware for route protection
- [ ] Role assignment interface for admins
- [ ] Role-based UI rendering
- [ ] Audit log for permission changes

**Priority:** P0
**Story Points:** 8
**Dependencies:** US-1.2
**Assigned to:** Dev 1 - Ahmed" \
  --label "user-story,P0,feature/user-management,backend"

gh issue create \
  --repo "$REPO" \
  --title "US-1.5: Password Reset" \
  --body "**As a** user
**I want to** reset my password if I forget it
**So that** I can regain access to my account

## Acceptance Criteria
- [ ] \"Forgot Password\" link on login page
- [ ] Email verification for password reset
- [ ] Secure token generation (expires in 1 hour)
- [ ] New password form with validation
- [ ] Email notification after successful reset
- [ ] Invalidate old sessions after reset

**Priority:** P0
**Story Points:** 5
**Dependencies:** US-1.1
**Assigned to:** Dev 3 - Karim, Dev 2 - Sarah" \
  --label "user-story,P0,feature/user-management,backend,frontend"

# Epic 2: Patient Follow-up Management
echo "📝 Creating Epic 2: Patient Follow-up Management..."

gh issue create \
  --repo "$REPO" \
  --title "🏥 [EPIC] Patient Follow-up Management" \
  --body "**Priority:** P0 - Critical
**Story Points:** 45
**Branch:** feature/patient-followup

## Epic Overview
Comprehensive patient registration, medical history tracking, treatment plan management, and patient monitoring workflow.

## User Stories
- US-2.1: Patient Registration (8 pts)
- US-2.2: Patient Medical History (8 pts)
- US-2.3: Treatment Plan Management (10 pts)
- US-2.4: Patient Search and Filtering (5 pts)
- US-2.5: Patient Assignment (6 pts)
- US-2.6: Patient Status Management (5 pts)
- US-2.7: Patient Notes and Comments (3 pts)

## Technical Requirements
- Patient database schema
- File upload for discharge summaries
- MRN generation system
- Search and filtering logic

## Dependencies
US-1.4 (RBAC)" \
  --label "epic,P0,feature/patient-followup"

gh issue create \
  --repo "$REPO" \
  --title "US-2.1: Patient Registration" \
  --body "**As a** coordinator
**I want to** register new patients in the system
**So that** they can be monitored after discharge

## Acceptance Criteria
- [ ] Patient registration form with demographics (name, DOB, gender, contact)
- [ ] Medical record number (MRN) generation
- [ ] Emergency contact information
- [ ] Insurance details
- [ ] Admission and discharge date tracking
- [ ] Upload discharge summary document

**Priority:** P0
**Story Points:** 8
**Dependencies:** US-1.4
**Assigned to:** Dev 3 - Karim, Dev 2 - Sarah" \
  --label "user-story,P0,feature/patient-followup,backend,frontend"

gh issue create \
  --repo "$REPO" \
  --title "US-2.2: Patient Medical History" \
  --body "**As a** physician
**I want to** view and update patient medical history
**So that** I have complete context for monitoring decisions

## Acceptance Criteria
- [ ] Medical history section: allergies, chronic conditions, medications
- [ ] Previous hospitalizations list
- [ ] Surgical history
- [ ] Family medical history
- [ ] Current medications with dosage
- [ ] Version control for history updates

**Priority:** P0
**Story Points:** 8
**Dependencies:** US-2.1
**Assigned to:** Dev 3 - Karim, Dev 2 - Sarah" \
  --label "user-story,P0,feature/patient-followup,backend,frontend"

# Epic 3: Vital Signs Management
echo "📝 Creating Epic 3: Vital Signs Management..."

gh issue create \
  --repo "$REPO" \
  --title "📊 [EPIC] Vital Signs Management" \
  --body "**Priority:** P0 - Critical
**Story Points:** 35
**Branch:** feature/vitals-management

## Epic Overview
Complete vital signs tracking system with manual entry, visualization, threshold configuration, and compliance monitoring.

## User Stories
- US-3.1: Manual Vital Signs Entry (5 pts)
- US-3.2: Vital Signs History View (5 pts)
- US-3.3: Vital Signs Visualization (8 pts)
- US-3.4: Threshold Configuration (6 pts)
- US-3.5: Bulk Vital Signs Import (8 pts)
- US-3.6: Missing Vital Signs Alerts (3 pts)

## Technical Requirements
- Time-series optimized schema
- Charting library integration
- Threshold detection engine
- Device integration support

## Dependencies
US-2.1 (Patient Registration)" \
  --label "epic,P0,feature/vitals-management"

gh issue create \
  --repo "$REPO" \
  --title "US-3.1: Manual Vital Signs Entry (Patient)" \
  --body "**As a** patient
**I want to** manually enter my vital signs
**So that** my healthcare team can monitor my condition

## Acceptance Criteria
- [ ] Form to enter: blood pressure, heart rate, temperature, weight, oxygen saturation
- [ ] Date/time picker (defaults to current time)
- [ ] Input validation (realistic ranges)
- [ ] Unit selection (metric/imperial)
- [ ] Optional notes field
- [ ] Confirmation screen after submission
- [ ] Reminder if not submitted in 24 hours

**Priority:** P0
**Story Points:** 5
**Dependencies:** US-2.1
**Assigned to:** Dev 3 - Karim, Dev 2 - Sarah" \
  --label "user-story,P0,feature/vitals-management,backend,frontend"

gh issue create \
  --repo "$REPO" \
  --title "US-3.3: Vital Signs Visualization (Charts)" \
  --body "**As a** healthcare professional
**I want to** view vital signs as charts and graphs
**So that** I can quickly identify trends and anomalies

## Acceptance Criteria
- [ ] Line charts for each vital sign over time
- [ ] Multi-vital comparison view
- [ ] Zoom and pan functionality
- [ ] Threshold lines showing normal ranges
- [ ] Interactive tooltips with exact values
- [ ] Date range selector (7 days, 30 days, 90 days, custom)
- [ ] Print/export chart as image

**Priority:** P0
**Story Points:** 8
**Dependencies:** US-3.1
**Assigned to:** Dev 2 - Sarah" \
  --label "user-story,P0,feature/vitals-management,frontend"

gh issue create \
  --repo "$REPO" \
  --title "US-3.4: Threshold Configuration" \
  --body "**As a** physician
**I want to** set custom threshold ranges for patient vitals
**So that** alerts are triggered appropriately for each patient

## Acceptance Criteria
- [ ] Configure min/max values per vital type per patient
- [ ] Use default ranges or customize
- [ ] Set severity levels (warning, critical)
- [ ] Apply thresholds to specific time periods
- [ ] Override default thresholds with clinical justification
- [ ] Threshold change history and audit

**Priority:** P0
**Story Points:** 6
**Dependencies:** US-3.1, US-2.3
**Assigned to:** Dev 3 - Karim, Dev 1 - Ahmed" \
  --label "user-story,P0,feature/vitals-management,backend"

# Epic 4: Symptom Tracking
echo "📝 Creating Epic 4: Symptom Tracking..."

gh issue create \
  --repo "$REPO" \
  --title "🩺 [EPIC] Symptom Tracking" \
  --body "**Priority:** P0 - Critical
**Story Points:** 30
**Branch:** feature/symptom-tracking

## Epic Overview
Daily symptom reporting system with timeline visualization, pattern analysis, and emergency symptom flagging.

## User Stories
- US-4.1: Daily Symptom Report (8 pts)
- US-4.2: Symptom History Timeline (5 pts)
- US-4.3: Symptom Analysis Dashboard (8 pts)
- US-4.4: Symptom Templates (5 pts)
- US-4.5: Emergency Symptom Flagging (4 pts)

## Technical Requirements
- Symptom database schema
- Media upload for visual symptoms
- Emergency notification system
- Pattern detection algorithms

## Dependencies
US-2.1 (Patient Registration)" \
  --label "epic,P0,feature/symptom-tracking"

gh issue create \
  --repo "$REPO" \
  --title "US-4.1: Daily Symptom Report" \
  --body "**As a** patient
**I want to** report my daily symptoms
**So that** my healthcare team knows how I'm feeling

## Acceptance Criteria
- [ ] Symptom checklist (pain, fatigue, nausea, shortness of breath, etc.)
- [ ] Severity scale (1-10 or mild/moderate/severe)
- [ ] Body location selector for pain
- [ ] Onset time and duration
- [ ] Triggering factors (optional)
- [ ] Photos/videos upload for visual symptoms
- [ ] Free-text notes section

**Priority:** P0
**Story Points:** 8
**Dependencies:** US-2.1
**Assigned to:** Dev 3 - Karim, Dev 2 - Sarah" \
  --label "user-story,P0,feature/symptom-tracking,backend,frontend"

gh issue create \
  --repo "$REPO" \
  --title "US-4.5: Emergency Symptom Flagging" \
  --body "**As a** patient
**I want to** flag critical symptoms that need immediate attention
**So that** I can get urgent help when needed

## Acceptance Criteria
- [ ] \"Report Emergency Symptom\" quick action button
- [ ] Pre-defined emergency symptoms (chest pain, severe bleeding, etc.)
- [ ] Immediate notification to on-call physician
- [ ] SMS/call escalation if no response in 5 minutes
- [ ] Emergency contact notification option
- [ ] GPS location sharing option
- [ ] Direct link to emergency services

**Priority:** P0
**Story Points:** 4
**Dependencies:** US-4.1
**Assigned to:** Dev 3 - Karim, Dev 4 - Fatima" \
  --label "user-story,P0,feature/symptom-tracking,backend,critical"

# Epic 5: Alerts and Notifications
echo "📝 Creating Epic 5: Alerts and Notifications..."

gh issue create \
  --repo "$REPO" \
  --title "🔔 [EPIC] Alerts and Notifications" \
  --body "**Priority:** P0 - Critical
**Story Points:** 35
**Branch:** feature/alerts-and-notifications

## Epic Overview
Real-time alert system with multi-channel notifications, escalation rules, and alert management dashboard.

## User Stories
- US-5.1: Real-time Alert Generation (10 pts)
- US-5.2: Alert Dashboard (6 pts)
- US-5.3: Multi-Channel Notifications (8 pts)
- US-5.4: Alert Acknowledgment and Resolution (4 pts)
- US-5.5: Alert Escalation Rules (7 pts)

## Technical Requirements
- WebSocket for real-time updates
- Email service integration
- SMS service (Twilio)
- Push notifications
- Message queue system

## Dependencies
US-3.4 (Thresholds), US-4.5 (Emergency Symptoms)" \
  --label "epic,P0,feature/alerts-and-notifications"

gh issue create \
  --repo "$REPO" \
  --title "US-5.1: Real-time Alert Generation" \
  --body "**As the** system
**I want to** automatically generate alerts based on threshold violations
**So that** healthcare professionals are notified of critical conditions

## Acceptance Criteria
- [ ] Detect vital signs exceeding thresholds
- [ ] Detect critical symptom reports
- [ ] Detect missed vital submissions
- [ ] Alert severity levels (info, warning, critical)
- [ ] Alert deduplication (don't repeat within time window)
- [ ] Alert aggregation for multiple violations
- [ ] Automatic escalation for unacknowledged critical alerts

**Priority:** P0
**Story Points:** 10
**Dependencies:** US-3.4, US-4.5
**Assigned to:** Dev 4 - Fatima" \
  --label "user-story,P0,feature/alerts-and-notifications,backend,critical"

gh issue create \
  --repo "$REPO" \
  --title "US-5.2: Alert Dashboard" \
  --body "**As a** healthcare professional
**I want to** view all active alerts in a centralized dashboard
**So that** I can prioritize my response

## Acceptance Criteria
- [ ] List of active alerts sorted by severity and time
- [ ] Filter by patient, type, severity
- [ ] Color-coded visual indicators
- [ ] Quick actions: acknowledge, dismiss, view details
- [ ] Alert counter badge in navigation
- [ ] Auto-refresh every 30 seconds
- [ ] Sound notification for critical alerts
- [ ] Export alerts log

**Priority:** P0
**Story Points:** 6
**Dependencies:** US-5.1
**Assigned to:** Dev 4 - Fatima, Dev 2 - Sarah" \
  --label "user-story,P0,feature/alerts-and-notifications,backend,frontend"

gh issue create \
  --repo "$REPO" \
  --title "US-5.3: Multi-Channel Notifications" \
  --body "**As a** healthcare professional
**I want to** receive notifications via multiple channels
**So that** I don't miss critical alerts

## Acceptance Criteria
- [ ] In-app notifications with toast messages
- [ ] Email notifications with priority flagging
- [ ] SMS notifications for critical alerts
- [ ] Push notifications to mobile device
- [ ] Configurable notification preferences per alert type
- [ ] Quiet hours setting (no non-critical notifications)
- [ ] Notification delivery confirmation

**Priority:** P0
**Story Points:** 8
**Dependencies:** US-5.1
**Assigned to:** Dev 4 - Fatima" \
  --label "user-story,P0,feature/alerts-and-notifications,backend"

# Epic 6: Questionnaire Management
echo "📝 Creating Epic 6: Questionnaire Management..."

gh issue create \
  --repo "$REPO" \
  --title "📝 [EPIC] Questionnaire Management" \
  --body "**Priority:** P1 - High
**Story Points:** 30
**Branch:** feature/questionnaire-management

## Epic Overview
Custom questionnaire builder, assignment system, patient completion interface, and results analysis.

## User Stories
- US-6.1: Questionnaire Builder (10 pts)
- US-6.2: Questionnaire Assignment (5 pts)
- US-6.3: Patient Questionnaire Completion (5 pts)
- US-6.4: Questionnaire Results Analysis (7 pts)
- US-6.5: Standard Questionnaire Library (3 pts)

## Technical Requirements
- Dynamic form builder
- Conditional logic engine
- Recurring schedule system
- Results aggregation

## Dependencies
US-1.4 (RBAC), US-2.1 (Patient Registration)" \
  --label "epic,P1,feature/questionnaire-management"

gh issue create \
  --repo "$REPO" \
  --title "US-6.1: Questionnaire Builder" \
  --body "**As an** administrator
**I want to** create custom questionnaires
**So that** I can collect specific information from patients

## Acceptance Criteria
- [ ] Drag-and-drop form builder interface
- [ ] Question types: text, number, multiple choice, checkbox, date, scale
- [ ] Conditional logic (show/hide questions based on answers)
- [ ] Required field validation
- [ ] Question branching/skip logic
- [ ] Rich text formatting for questions
- [ ] Preview mode before publishing
- [ ] Save as template

**Priority:** P1
**Story Points:** 10
**Dependencies:** US-1.4
**Assigned to:** Dev 1 - Ahmed, Dev 2 - Sarah" \
  --label "user-story,P1,feature/questionnaire-management,backend,frontend"

# Epic 7: Dashboards and Analytics
echo "📝 Creating Epic 7: Dashboards and Analytics..."

gh issue create \
  --repo "$REPO" \
  --title "📈 [EPIC] Dashboards and Analytics" \
  --body "**Priority:** P1 - High
**Story Points:** 40
**Branch:** feature/dashboards

## Epic Overview
Role-specific dashboards with real-time data, analytics, custom reports, and predictive insights.

## User Stories
- US-7.1: Patient Dashboard (6 pts)
- US-7.2: Physician Dashboard (8 pts)
- US-7.3: Administrator Dashboard (6 pts)
- US-7.4: Custom Report Builder (10 pts)
- US-7.5: Predictive Analytics (10 pts)

## Technical Requirements
- Real-time data aggregation
- Charting and visualization
- Report generation engine
- Machine learning models

## Dependencies
Multiple - requires core features complete" \
  --label "epic,P1,feature/dashboards"

gh issue create \
  --repo "$REPO" \
  --title "US-7.1: Patient Dashboard" \
  --body "**As a** patient
**I want to** see an overview of my health status
**So that** I can track my recovery progress

## Acceptance Criteria
- [ ] Welcome message with next scheduled tasks
- [ ] Recent vital signs summary with trend indicators
- [ ] Upcoming appointments
- [ ] Pending questionnaires count
- [ ] Medication schedule for today
- [ ] Recent communications from healthcare team
- [ ] Progress towards recovery goals

**Priority:** P0
**Story Points:** 6
**Dependencies:** US-3.1, US-4.1, US-6.3
**Assigned to:** Dev 2 - Sarah" \
  --label "user-story,P0,feature/dashboards,frontend"

gh issue create \
  --repo "$REPO" \
  --title "US-7.2: Physician Dashboard" \
  --body "**As a** physician
**I want to** see an overview of all my assigned patients
**So that** I can prioritize my daily tasks

## Acceptance Criteria
- [ ] Active alerts count and severity breakdown
- [ ] High-risk patients list
- [ ] Patients requiring attention (missed vitals, pending reviews)
- [ ] Today's scheduled consultations
- [ ] Recent vital sign trends for critical patients
- [ ] Statistics: total patients, readmission rate, compliance rate
- [ ] Quick actions: add note, send message, schedule appointment

**Priority:** P0
**Story Points:** 8
**Dependencies:** US-2.5, US-3.3, US-5.2
**Assigned to:** Dev 2 - Sarah, Dev 3 - Karim" \
  --label "user-story,P0,feature/dashboards,backend,frontend"

# Epic 8: Audit and Traceability
echo "📝 Creating Epic 8: Audit and Traceability..."

gh issue create \
  --repo "$REPO" \
  --title "🔍 [EPIC] Audit and Traceability" \
  --body "**Priority:** P1 - High
**Story Points:** 25
**Branch:** feature/audit-and-traceability

## Epic Overview
Complete activity logging, audit trail system, data access tracking, and system health monitoring.

## User Stories
- US-8.1: Activity Logging (8 pts)
- US-8.2: Audit Log Viewer (6 pts)
- US-8.3: Data Access Audit (6 pts)
- US-8.4: System Health Monitoring (5 pts)

## Technical Requirements
- Tamper-proof logging
- ELK Stack integration
- Compliance reporting
- Performance monitoring

## Dependencies
US-1.2 (Login), US-2.1 (Patient Registration)" \
  --label "epic,P1,feature/audit-and-traceability"

gh issue create \
  --repo "$REPO" \
  --title "US-8.1: Activity Logging" \
  --body "**As the** system
**I want to** log all user activities
**So that** there is complete traceability of actions

## Acceptance Criteria
- [ ] Log user logins/logouts with IP address
- [ ] Log all data modifications (create, update, delete)
- [ ] Log permission changes
- [ ] Log alert acknowledgments and resolutions
- [ ] Log data exports and report generation
- [ ] Store: timestamp, user, action, affected entity, old/new values
- [ ] Tamper-proof log storage

**Priority:** P0
**Story Points:** 8
**Dependencies:** US-1.2
**Assigned to:** Dev 5 - Youssef" \
  --label "user-story,P0,feature/audit-and-traceability,backend"

echo ""
echo "✅ All issues created successfully!"
echo "📊 Total: 8 Epics + 25 User Stories"
echo ""
echo "Next steps:"
echo "1. Visit: https://github.com/$REPO/issues"
echo "2. Organize issues in GitHub Projects"
echo "3. Create milestones for sprints"
echo "4. Assign team members"
