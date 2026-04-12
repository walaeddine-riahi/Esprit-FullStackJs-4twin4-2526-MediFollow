# Testing Guide - Nurse & Coordinator Roles

## 🎯 Quick Start

### 1. Test User Credentials

**Admin:**
- Email: `admin@medifollow.health`
- Password: `Admin@123456`

**Nurse (if created via script):**
- Email: `nurse@medifollow.com`
- Password: `nurse123`

**Coordinator (if created via script):**
- Email: `coordinator@medifollow.com`
- Password: `coordinator123`

---

## 🧪 Testing Flow

### Phase 1: Admin Login & Nurse Management

1. **Login as Admin:**
   ```
   Navigate to: http://localhost:3000/login
   Email: admin@medifollow.health
   Password: Admin@123456
   ```

2. **Access Nurse Management:**
   ```
   After login, you should be at: /dashboard/admin
   Navigate to: /dashboard/admin/nurses
   ```

3. **Create a New Nurse:**
   - Click "Ajouter un infirmier"
   - Fill in the form:
     - Prénom: Sophie
     - Nom: Martin
     - Email: nurse.test@medifollow.com
     - Password: Nurse@123456
     - Téléphone: +33612345678
     - Département: Cardiologie
     - Équipe: Matin
   - Click "Créer"
   - You should see the new nurse in the list

4. **Edit a Nurse:**
   - Click the edit icon (pencil) on a nurse
   - Change department to "Pneumologie"
   - Click "Mettre à jour"
   - Verify changes are saved

5. **Assign Patients to Nurse:**
   - This functionality will be available in the nurse detail page
   - For now, patients can be assigned via the script

---

### Phase 2: Nurse Login & Dashboard

1. **Logout from Admin:**
   - Click your profile → Déconnexion

2. **Login as Nurse:**
   ```
   Navigate to: http://localhost:3000/login
   Email: nurse.test@medifollow.com (or nurse@medifollow.com)
   Password: Nurse@123456 (or nurse123)
   ```

3. **Verify Redirect:**
   - ✅ Should redirect to: `/dashboard/nurse`
   - ✅ Should see nurse dashboard with stats

4. **Test Dashboard Features:**
   
   **Main Dashboard (`/dashboard/nurse`):**
   - ✅ Stats cards showing assigned patients, patients needing data, active alerts
   - ✅ Quick action buttons work
   - ✅ Patients needing data entry list displays
   - ✅ Recent alerts list displays

   **Patients List (`/dashboard/nurse/patients`):**
   - ✅ See all assigned patients
   - ✅ Search by name/MRN works
   - ✅ Patient cards show active alerts count
   - ✅ Click patient card to view details

   **Patient Detail (`/dashboard/nurse/patients/[id]`):**
   - ✅ Patient information displays
   - ✅ Latest vital signs show
   - ✅ Entry history with "Entered by" tracking
   - ✅ Active alerts banner appears if alerts exist
   - ✅ "Entrer des données" button works

   **Data Entry Form (`/dashboard/nurse/enter-data`):**
   - ✅ Select assigned patient from dropdown
   - ✅ Enter vital signs:
     - Tension artérielle: 120/80
     - Fréquence cardiaque: 72
     - Température: 37.2
     - Saturation: 98
     - Poids: 70
   - ✅ Submit form
   - ✅ Success message appears
   - ✅ Verify entry appears in patient detail with "Infirmier(ère)" label

   **Alert Monitoring (`/dashboard/nurse/alerts`):**
   - ✅ View all alerts for assigned patients
   - ✅ Filter by severity (CRITICAL, HIGH, MEDIUM, LOW)
   - ✅ Filter by status (OPEN, ACKNOWLEDGED, RESOLVED)
   - ✅ Acknowledge an alert (changes status to ACKNOWLEDGED)
   - ✅ Verify nurse CANNOT resolve alerts (only doctors can)

---

### Phase 3: Coordinator Login & Dashboard

1. **Logout from Nurse:**
   - Click profile → Déconnexion

2. **Login as Coordinator:**
   ```
   Navigate to: http://localhost:3000/login
   Email: coordinator@medifollow.com
   Password: coordinator123
   ```

3. **Verify Redirect:**
   - ✅ Should redirect to: `/dashboard/coordinator`
   - ✅ Should see coordinator dashboard

4. **Test Dashboard Features:**
   
   **Main Dashboard (`/dashboard/coordinator`):**
   - ✅ Stats: Total patients, compliant today, non-compliant today
   - ✅ Quick action buttons work
   - ✅ Non-compliant patients list displays
   - ✅ Recent communications timeline

   **Compliance Monitoring (`/dashboard/coordinator/compliance`):**
   - ✅ Overview stats display
   - ✅ Search patients works
   - ✅ Filter by compliance status (COMPLIANT, PARTIAL, NON_COMPLIANT)
   - ✅ Patient cards show compliance details
   - ✅ "Send Reminder" button works for non-compliant patients
   - ✅ Click "Détails" to view patient compliance detail

   **Communication Center (`/dashboard/coordinator/communications`):**
   - ✅ Patient selection sidebar with search
   - ✅ Select a patient
   - ✅ Choose message type: REMINDER or GUIDANCE
   - ✅ Use a template or write custom message
   - ✅ Fill subject and message
   - ✅ Send message
   - ✅ Success message appears

   **Entry Verification (`/dashboard/coordinator/verify`):**
   - ✅ See incomplete vital entries from last 7 days
   - ✅ Stats show: incomplete entries, average completion rate
   - ✅ Search by patient name
   - ✅ Entry cards show:
     - Completion percentage
     - Present data fields (✓)
     - Missing data fields (✗)
     - Who entered the data
   - ✅ "Contact" button redirects to communications

---

### Phase 4: End-to-End Workflow

**Scenario: Nurse enters vitals → System creates alert → Coordinator follows up**

1. **As Nurse:**
   - Login as nurse
   - Go to "Entrer des données"
   - Select a patient
   - Enter abnormal vitals (e.g., BP: 180/120)
   - Submit
   - Navigate to alerts → See new CRITICAL alert

2. **As Coordinator:**
   - Login as coordinator
   - Go to compliance monitoring
   - See patient with new alert
   - Send reminder or guidance message

3. **As Admin:**
   - Login as admin
   - Go to nurse management
   - View nurse stats
   - Assign/unassign patients

---

## ✅ Key Verification Points

### Nurse Role Restrictions:
- ✅ Cannot access `/dashboard/doctor`
- ✅ Cannot access `/dashboard/admin`
- ✅ Cannot access `/dashboard/coordinator`
- ✅ Cannot resolve alerts (only acknowledge)
- ✅ Cannot message patients
- ✅ Can only see assigned patients

### Coordinator Role Restrictions:
- ✅ Cannot access `/dashboard/doctor`
- ✅ Cannot access `/dashboard/admin`
- ✅ Cannot access `/dashboard/nurse`
- ✅ Cannot enter vitals
- ✅ Cannot resolve alerts
- ✅ Can send messages to ANY patient

### Audit Trail:
- ✅ Every vital entry shows "Entered by" field
- ✅ Entries by nurse show "Infirmier(ère)" label
- ✅ Entries by patient show "Patient" label
- ✅ Entry history displays correctly in patient detail

---

## 🐛 Common Issues & Solutions

### Issue: Nurse login doesn't redirect
**Solution:** Clear browser cache, ensure login page has updated redirect logic

### Issue: "No assigned patients" for nurse
**Solution:** 
- Login as admin
- Go to nurse management
- Create patient assignments
- Or run the test user creation script

### Issue: Compliance status shows as "Unknown"
**Solution:** 
- Patient needs to have submitted vitals today
- Compliance records are calculated daily

### Issue: Cannot create nurse - "Email already exists"
**Solution:** 
- Use a different email
- Or delete the existing nurse first

---

## 📊 Expected Data Flow

```
1. Admin creates nurse account
2. Admin assigns patients to nurse
3. Nurse logs in → sees assigned patients
4. Nurse enters vitals for patient → tracked with nurse ID
5. System auto-creates alert if vitals abnormal
6. Coordinator monitors compliance
7. Coordinator sends reminder to non-compliant patient
8. Patient receives message in their dashboard
```

---

## 🎉 Success Criteria

All checkboxes above should be ✅ for a successful implementation test.

**Priority Tests:**
1. ✅ Nurse can login and sees nurse dashboard
2. ✅ Nurse can enter vitals with audit trail
3. ✅ Coordinator can login and sees coordinator dashboard
4. ✅ Coordinator can send messages to patients
5. ✅ Admin can create/edit/delete nurses
6. ✅ Role-based access control works (no unauthorized access)

---

## 📝 Notes

- All test credentials are for **development/demo only**
- Database should have at least 1-2 patients with existing data for meaningful tests
- Run `npx ts-node scripts/create-test-users.ts` to auto-create test users with patient assignments
- Check browser console for any errors
- Check server logs for database query issues

---

**Last Updated:** April 7, 2026  
**Status:** Ready for Testing
