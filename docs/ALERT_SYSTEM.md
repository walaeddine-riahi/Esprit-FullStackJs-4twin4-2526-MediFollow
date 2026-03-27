# Système d'Alertes Automatiques - MediFollow

## 📋 Vue d'ensemble

Le système d'alertes automatiques de MediFollow surveille en temps réel les signes vitaux des patients et déclenche des alertes lorsque des seuils critiques ou d'avertissement sont dépassés.

## 🎯 Fonctionnalités

### 1. Validation automatique des signes vitaux

À chaque soumission de mesure de signes vitaux, le système :
- ✅ Compare les valeurs aux seuils statiques définis
- ✅ Détermine le statut : **NORMAL**, **A_VERIFIER**, ou **CRITIQUE**
- ✅ Enregistre les règles déclenchées
- ✅ Crée automatiquement des alertes si nécessaire
- ✅ Notifie les médecins et coordinateurs

### 2. Seuils définis

Les seuils sont configurés dans [`constants/thresholds.ts`](constants/thresholds.ts) :

#### Température (°C)
- 🔴 **CRITIQUE BAS** : ≤ 35.0°C (Hypothermie sévère)
- 🟡 **AVERTISSEMENT BAS** : < 36.0°C (Hypothermie légère)
- ✅ **NORMAL** : 36.1 - 37.2°C
- 🟡 **AVERTISSEMENT HAUT** : > 38.5°C (Fièvre modérée)
- 🔴 **CRITIQUE HAUT** : ≥ 39.5°C (Fièvre sévère)

#### Pression Artérielle - Systolique (mmHg)
- 🔴 **CRITIQUE BAS** : ≤ 80
- 🟡 **AVERTISSEMENT BAS** : < 90
- ✅ **NORMAL** : 90 - 140
- 🟡 **AVERTISSEMENT HAUT** : > 160
- 🔴 **CRITIQUE HAUT** : ≥ 180

#### Pression Artérielle - Diastolique (mmHg)
- 🔴 **CRITIQUE BAS** : ≤ 40
- 🟡 **AVERTISSEMENT BAS** : < 60
- ✅ **NORMAL** : 60 - 90
- 🟡 **AVERTISSEMENT HAUT** : > 100
- 🔴 **CRITIQUE HAUT** : ≥ 120

#### Fréquence Cardiaque (bpm)
- 🔴 **CRITIQUE BAS** : ≤ 40 (Bradycardie sévère)
- 🟡 **AVERTISSEMENT BAS** : < 50
- ✅ **NORMAL** : 60 - 100
- 🟡 **AVERTISSEMENT HAUT** : > 110
- 🔴 **CRITIQUE HAUT** : ≥ 130 (Tachycardie sévère)

#### Saturation en Oxygène (%)
- 🔴 **CRITIQUE** : ≤ 88% (Hypoxémie sévère)
- 🟡 **AVERTISSEMENT** : < 92%
- ✅ **NORMAL** : 95 - 100%

#### Poids (kg)
- 🟡 **AVERTISSEMENT GAIN** : +2 kg en 2 semaines
- 🔴 **CRITIQUE GAIN** : +3 kg en 2 semaines
- 🟡 **AVERTISSEMENT PERTE** : -2 kg en 2 semaines
- 🔴 **CRITIQUE PERTE** : -3 kg en 2 semaines

## 🔄 Flux de traitement

```
Patient soumet signes vitaux
           ↓
 Validation des données (Zod)
           ↓
 Comparaison avec seuils statiques
           ↓
   Règles déclenchées ?
           ↓
    ┌─────┴─────┐
   NON         OUI
    ↓            ↓
 Status:    Status: A_VERIFIER
 NORMAL     ou CRITIQUE
    ↓            ↓
    └──→ Enregistrement ←──┘
              ↓
         Alerte créée ?
              ↓
            OUI
              ↓
    ┌─────────┴─────────┐
    ↓                   ↓
 Email envoyé    SMS (si CRITIQUE)
 Médecins        aux médecins
 + Coordinateurs
```

## 📁 Architecture des fichiers

### Configuration
- **`constants/thresholds.ts`** : Définition des seuils et messages d'alerte
  - Enums : `VitalStatus`, `AlertRuleType`
  - Constantes : `TEMPERATURE_THRESHOLDS`, `BLOOD_PRESSURE_THRESHOLDS`, etc.
  - Interfaces : `TriggeredRule`, `VitalValidationResult`

### Logique de validation
- **`lib/utils/vitalValidation.ts`** : Validation des signes vitaux
  - `validateVitalSigns()` : Compare les valeurs aux seuils
  - `generateAlertMessage()` : Génère le message d'alerte

### Actions serveur
- **`lib/actions/vital.actions.ts`** : Enregistrement des signes vitaux
  - `createVitalRecord()` : 
    1. Valide les données
    2. Récupère le poids précédent
    3. Valide contre les seuils
    4. Enregistre avec status + triggeredRules
    5. Crée l'alerte si nécessaire
    6. Envoie les notifications

### Service de notifications
- **`lib/services/notificationService.ts`** : Envoi des notifications
  - `sendAlertNotifications()` : Envoie email + SMS
  - `getNotificationRecipients()` : Récupère médecins/coordinateurs
  - `sendEmail()` : Via SendGrid ou Azure Communication Services
  - `sendSMS()` : Via Twilio (si critique)

### Base de données
- **`prisma/schema.prisma`** : Modèles Prisma mis à jour
  - `VitalRecord` : 
    - `status` : VitalStatus (NORMAL, A_VERIFIER, CRITIQUE)
    - `triggeredRules` : Json (array de TriggeredRule)
  - `Alert` :
    - `vitalRecordId` : Lien vers la mesure
    - `severity` : MEDIUM, HIGH, CRITICAL
    - `data` : triggeredRules + vitalValues

## 🚀 Utilisation

### Backend (Automatique)

Le système fonctionne automatiquement à chaque soumission de signes vitaux :

```typescript
// Dans createVitalRecord()
const validationResult = validateVitalSigns(vitalData, previousWeight);

// Le status est automatiquement déterminé
vitalData.status = validationResult.status; // NORMAL, A_VERIFIER, ou CRITIQUE

// Les règles déclenchées sont enregistrées
vitalData.triggeredRules = validationResult.triggeredRules;

// Alerte créée si anomalie détectée
if (validationResult.needsAlert) {
  await prisma.alert.create({...});
  await sendAlertNotifications(vitalRecord, validationResult);
}
```

### Frontend

Les patients soumettent normalement leurs signes vitaux via le formulaire dans l'historique :
- **Page** : `/dashboard/patient/history`
- **Composant** : Formulaire "Ajouter signes vitaux"

Les enregistrements s'affichent avec un indicateur de statut :
- 🟢 NORMAL : Badge vert
- 🟡 A_VERIFIER : Badge orange
- 🔴 CRITIQUE : Badge rouge

## 🔔 Notifications

### Email (Toujours envoyé)
- **Destinataires** : Tous les médecins et administrateurs actifs
- **Contenu** :
  - Patient concerné
  - Liste des anomalies détectées
  - Valeurs mesurées
  - Action recommandée
  - Lien vers le dossier patient

### SMS (Uniquement si CRITIQUE)
- **Destinataires** : Médecins avec numéro de téléphone configuré
- **Contenu** : Alerte courte avec première anomalie

### Configuration requise

Variables d'environnement dans `.env` :

```env
# Email (SendGrid)
SENDGRID_API_KEY="SG.xxxxx"
SENDGRID_FROM_EMAIL="noreply@medifollow.health"

# OU Email (Azure Communication Services)
AZURE_COMMUNICATION_CONNECTION_STRING="endpoint=https://..."
AZURE_COMMUNICATION_EMAIL_FROM="DoNotReply@xxxxx.azurecomm.net"

# SMS (Twilio) - Optionnel
TWILIO_ACCOUNT_SID="ACxxxxx"
TWILIO_AUTH_TOKEN="xxxxx"
TWILIO_PHONE_NUMBER="+1234567890"

# URL de l'application
NEXT_PUBLIC_APP_URL="http://localhost:3001"
```

## 🧪 Test

### Test manuel

1. Accéder à `/dashboard/patient/history`
2. Cliquer sur "Ajouter signes vitaux"
3. Soumettre des valeurs **normales** :
   - Température : 37.0°C
   - TA : 120/80
   - FC : 75 bpm
   - ✅ Status : NORMAL

4. Soumettre des valeurs **à vérifier** :
   - Température : 38.7°C (fièvre modérée)
   - ✅ Status : A_VERIFIER
   - ✅ Alerte créée avec severity MEDIUM
   - ✅ Email envoyé aux médecins

5. Soumettre des valeurs **critiques** :
   - Température : 40.0°C (fièvre sévère)
   - TA : 190/130 (hypertension critique)
   - ✅ Status : CRITIQUE
   - ✅ Alerte créée avec severity CRITICAL
   - ✅ Email + SMS envoyés

### Vérifier les alertes

- **Dashboard médecin** : `/dashboard/doctor`
- **Page alertes patient** : `/dashboard/patient/alerts`

## 📊 Base de données

### VitalRecord

```typescript
{
  id: "abc123",
  patientId: "patient123",
  temperature: 40.0,
  systolicBP: 190,
  diastolicBP: 130,
  status: "CRITIQUE",  // ← Nouveau champ
  triggeredRules: [    // ← Nouveau champ
    {
      rule: "TEMPERATURE_CRITIQUE_HAUTE",
      message: "Température critique haute (fièvre sévère)",
      value: 40.0,
      threshold: 39.5,
      severity: "CRITICAL"
    },
    {
      rule: "TENSION_SYSTOLIQUE_CRITIQUE_HAUTE",
      message: "Tension systolique critique haute (hypertension sévère)",
      value: 190,
      threshold: 180,
      severity: "CRITICAL"
    }
  ],
  recordedAt: "2026-03-04T14:30:00Z",
  createdAt: "2026-03-04T14:30:05Z"
}
```

### Alert

```typescript
{
  id: "alert123",
  patientId: "patient123",
  vitalRecordId: "abc123",  // ← Lien vers la mesure
  alertType: "VITAL",
  severity: "CRITICAL",     // MEDIUM, HIGH, or CRITICAL
  message: "Plusieurs anomalies détectées:\n\nCRITIQUE:\n- Température...",
  data: {
    triggeredRules: [...],
    vitalValues: {...}
  },
  status: "OPEN",
  createdAt: "2026-03-04T14:30:06Z"
}
```

## 🔧 Maintenance

### Modifier les seuils

Éditer [`constants/thresholds.ts`](constants/thresholds.ts) :

```typescript
export const TEMPERATURE_THRESHOLDS = {
  WARNING_HIGH: 38.5,  // Modifier cette valeur
  CRITICAL_HIGH: 39.5, // Modifier cette valeur
};
```

Pas besoin de régénérer Prisma, les changements sont immédiats.

### Ajouter un nouveau seuil

1. Ajouter dans `constants/thresholds.ts` :
   ```typescript
   export const NEW_VITAL_THRESHOLDS = {...};
   export enum AlertRuleType {
     // ...
     NEW_VITAL_WARNING = "NEW_VITAL_WARNING",
   }
   ```

2. Ajouter la validation dans `lib/utils/vitalValidation.ts` :
   ```typescript
   if (vitals.newVital !== undefined) {
     // Logique de validation
   }
   ```

3. Mettre à jour le schéma Prisma si nouveau champ :
   ```prisma
   model VitalRecord {
     // ...
     newVital Float?
   }
   ```

4. Régénérer Prisma : `npx prisma generate`

## 📈 Statistiques

Le système peut générer des statistiques sur :
- Nombre d'alertes par gravité
- Règles les plus fréquemment déclenchées
- Patients avec le plus d'alertes
- Temps de réponse moyen aux alertes

---

**Dernière mise à jour** : 4 mars 2026  
**Version** : 1.0.0  
**Auteur** : MediFollow Team
