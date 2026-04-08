# Questionnaire Submission & Response Viewing - Testing Guide

## Overview

This guide walks you through testing the complete questionnaire workflow: assignment → submission → response viewing.

## Test Accounts

- **Patient Account**: arij.mhjb1@gmail.com / Test1234\*
- **Doctor Account**: arij@medifollow.health / Test1234\*

## Full End-to-End Test Flow

### Phase 1: Doctor Creates & Assigns Questionnaire ✅

1. **Log in as Doctor** (arij@medifollow.health)
   - Navigate to Dashboard
   - Click "Questionnaires" in sidebar

2. **Create a Test Questionnaire**
   - Click "Create New Questionnaire" button
   - Fill in details:
     - **Title**: "Patient Health Assessment"
     - **Description**: "Quick health check-up"
     - **Specialty**: "General Practice"
   - **Add Questions** (at least 3):
     - Q1: "How are you feeling today?" (Type: TEXT) - Required
     - Q2: "Rate your pain level" (Type: NUMBER, Min: 0, Max: 10) - Required
     - Q3: "Any additional comments?" (Type: TEXTAREA)
   - Click **Submit**
   - Verify: Success message + questionnaire appears in grid

3. **Assign to Patient**
   - In the questionnaire card, click **"Assign"** button
   - Search for patient: type "arij"
   - Select checkbox for patient (arij.mhjb1@gmail.com)
   - Set **Due Date**: 7 days from today
   - Click **"Assign Questionnaire"**
   - **Verify**: Success message + shows count assigned

4. **View in Assignments Table**
   - Click **"Assignments"** tab (should show count > 0)
   - Verify table shows:
     - Patient name: "Arij [Patient Last Name]"
     - Questionnaire: "Patient Health Assessment"
     - Assigned Date: Today's date
     - Due Date: Date set in step 3
     - Status: "PENDING"
     - Progress: "Pending"
     - Actions: "-" (disabled because not completed yet)

### Phase 2: Patient Completes & Submits Questionnaire ✅

1. **Log in as Patient** (arij.mhjb1@gmail.com)
   - Navigate to Dashboard
   - Click **"Questionnaires"** in sidebar
   - Should see assigned questionnaire listed with status "PENDING"

2. **Open Questionnaire**
   - Click on the questionnaire
   - Should display:
     - Title: "Patient Health Assessment"
     - Progress bar showing required questions
     - All 3 questions with input fields
     - "Save Draft" and "Submit Questionnaire" buttons

3. **Fill Out Responses**
   - Q1 (TEXT): Enter "I'm feeling good, just a bit tired"
   - Q2 (NUMBER): Enter "3"
   - Q3 (TEXTAREA): Enter "Everything seems normal"

4. **Submit Questionnaire**
   - Click **"Submit Questionnaire"** button
   - **CRITICAL TEST**: Should see green success card displaying:
     - ✅ Checkmark icon
     - "Questionnaire Submitted Successfully!"
     - "Your responses have been recorded and sent to your healthcare provider"
     - Shows "Total Questions: 3"
     - **NOT**: Just an alert box - should be a card with rich feedback

5. **Verify Status Changed**
   - Navigate back to Questionnaires page
   - Previous questionnaire should now show status: **COMPLETED** (green badge)
   - Progress: **100%**

### Phase 3: Doctor Views Patient Responses ✅ (NEW)

1. **Log in as Doctor** (arij@medifollow.health)
   - Navigate to Dashboard
   - Click **"Questionnaires"** in sidebar

2. **Switch to Assignments Tab**
   - Click **"Assignments"** tab
   - Should now show:
     - Status: **"COMPLETED"** (green badge)
     - Progress: **100%**
     - Actions: **"View"** button (enabled because status is COMPLETED)

3. **View Responses**
   - Click **"View"** button in Actions column
   - Modal should open showing:
     - **Header Section**:
       - Questionnaire Title: "Patient Health Assessment"
       - Patient Name: "Arij [Last Name]"
       - Status: "COMPLETED" (green badge)
       - Assigned Date: [Date shown]
       - Due Date: [Date shown]
       - Completed Date: [Today's date shown]
       - Total Questions: 3

     - **Question & Response Pairs**:
       - Q1: "How are you feeling today?"
         - Response: "I'm feeling good, just a bit tired"
       - Q2: "Rate your pain level"
         - Response: 3 (with visual styling)
       - Q3: "Any additional comments?"
         - Response: "Everything seems normal"

4. **Verify Response Display**
   - Responses should be displayed in readable format
   - Different response types should have appropriate styling:
     - TEXT/TEXTAREA: Plain text
     - NUMBER: Styled number display
     - RATING: Shows X / 5
     - YESNO: Badge with Yes/No
     - DATE: Formatted date
     - MULTIPLE_CHOICE/CHECKBOX: Array of badges

### Phase 4: Error Handling & Edge Cases

#### Test 4.1: Incomplete Submission

1. Patient starts filling questionnaire but leaves required fields empty
2. Click "Submit Questionnaire"
3. **Verify**: Alert shows "Please answer all required questions (X remaining)"
4. **Verify**: Form not submitted, user can continue filling

#### Test 4.2: Network Error Simulation

1. **(Optional)** Open browser DevTools (F12)
2. Set network condition to "Offline"
3. Patient tries to submit
4. **Verify**: Error message displays: "Failed to submit responses" or network error
5. Restore online connection
6. **Verify**: Patient can retry submission

#### Test 4.3: Multiple Questionnaires

1. Doctor creates a 2nd questionnaire
2. Assigns both questionnaires to same patient
3. Patient should see both in "Questionnaires" page with "PENDING" status
4. Patient completes and submits both
5. Doctor should see both in "Assignments" showing "COMPLETED"
6. Doctor can view responses for each independently

## Key Behaviors to Verify

### ✅ Patient-Side

- [ ] Questionnaires only show if assigned by doctor
- [ ] Required questions marked with red asterisk (\*)
- [ ] Progress bar updates as questions answered
- [ ] Cannot submit without all required fields
- [ ] Success card appears after submission (not just alert)
- [ ] Can view previously completed questionnaires (marked "COMPLETED")
- [ ] Cannot edit completed questionnaires

### ✅ Doctor-Side

- [ ] Patient search/filter works in assign dialog
- [ ] Multiple patients can be selected for batch assignment
- [ ] Due date is optional
- [ ] Assignments table shows all required columns
- [ ] Status updates automatically when patient submits
- [ ] "View" button only appears for COMPLETED assignments
- [ ] Response viewer shows all questions and answers correctly
- [ ] Can view multiple questionnaire responses from same patient

### ✅ API Layer

- [ ] `/api/questionnaires/respond` - POST returns 200 on success
- [ ] Assignment status changes to "COMPLETED" after submission
- [ ] Responses are persisted correctly with all field values
- [ ] Doctor access control prevents viewing other doctors' questionnaires
- [ ] Patient access control prevents viewing others' responses

## Common Issues & Solutions

### Issue: "Failed to fetch questionnaire" appears

**Solution**:

- Verify assignment exists in database
- Check that patient is assigned to this doctor via AccessGrant
- Confirm userId in JWT token matches patient record

### Issue: Submission shows error but no error message displayed

**Solution**:

- Open browser DevTools (F12) → Network tab
- Look for `/api/questionnaires/respond` call
- Check response status and body for actual error
- Check browser console for error logs

### Issue: Response shows but some fields are empty

**Solution**:

- Verify response was saved properly (check Network tab)
- Confirm question types match response rendering logic
- Check for optional vs required field handling

### Issue: Status not updating to COMPLETED

**Solution**:

- Verify API response: Check if status field is being updated
- Check patient selection in submit call
- Ensure assignment ID is correct

## UI/UX Verification Checklist

### Dark Mode

- [ ] All inputs visible in dark mode (text color shows)
- [ ] Cards/containers have proper contrast
- [ ] Status badges readable in dark/light
- [ ] Icons render clearly

### Responsive Design

- [ ] Works on mobile (viewport < 640px)
- [ ] Tablet view displays properly (640px - 1024px)
- [ ] Desktop full width (> 1024px)
- [ ] Tables scroll on small screens

### Loading States

- [ ] Shows spinner while fetching questions
- [ ] Shows disabled button while submitting
- [ ] Doesn't allow double-submission

## Performance Notes

- Questionnaire list loads < 2 seconds
- Assignment submission completes < 5 seconds
- Responses view loads < 2 seconds

---

## Summary of Changes Made

### New Components

1. **ResponseViewer.tsx** - Display patient responses to questionnaire
   - Shows formatted responses with proper styling per type
   - Includes assignment metadata (dates, status, progress)
   - Works for both doctor viewing and patient reviewing

### Updated Components

1. **QuestionnaireManagement.tsx**
   - Added "Actions" column to Assignments table
   - Added "View" button for COMPLETED assignments
   - Opens ResponseViewer in modal dialog
   - Added Response Viewer modal integration

2. **PatientQuestionnaire.tsx**
   - Enhanced error handling with error card display
   - Updated success feedback to show rich success card instead of alert
   - Added `submitted` state to track completion
   - Auto-redirect after 2 seconds on success
   - Better error message extraction from API

### New API Endpoints

1. **`/api/questionnaires/responses`** (GET)
   - Fetch responses for a specific assignment
   - Access control for doctor (questionnaire owner) or patient (assignment owner)
   - Returns enriched response data with question/answer pairs

### Updated API Endpoints

1. **`/api/questionnaires/respond`** (POST)
   - Enhanced error logging
   - Better optional field handling
   - Clears old responses before creating new
   - Unconditionally sets status to COMPLETED
   - Returns detailed error messages

---

## Next Steps (Optional Enhancements)

1. **Response Export** - Download responses as PDF
2. **Bulk Actions** - Select multiple completed assignments and export
3. **Response Comparison** - View all patients' responses side-by-side
4. **Conditional Logic** - Skip questions based on previous answers
5. **Response Editing** - Allow patients to edit responses within time window
6. **Notifications** - Email doctor when patient submits
7. **Response Analytics** - Charts/graphs of common responses
8. **Template Versioning** - Track questionnaire changes over time
