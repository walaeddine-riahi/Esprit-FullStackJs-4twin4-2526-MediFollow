# Questionnaire System - Complete Implementation Guide

## Overview
A comprehensive questionnaire system for MediFollow that allows doctors to create, customize, and assign questionnaires to patients. Features AI-based question generation by medical specialty.

## Features

### For Doctors
✅ Create questionnaires with custom questions
✅ Select medical specialty (Cardiology, Neurology, etc.)
✅ AI-generate questions based on specialty
✅ Assign questionnaires to one or multiple patients
✅ Set due dates for questionnaire responses
✅ View patient responses in real-time
✅ Track completion status
✅ Export responses as reports
✅ Duplicate and reuse questionnaires

### For Patients
✅ View assigned questionnaires
✅ Fill out questionnaires with various question types
✅ See progress while completing
✅ Submit responses
✅ View completed questionnaires
✅ Track deadlines

## Database Models

### QuestionnaireTemplate
- **Purpose**: Stores questionnaire templates created by doctors
- **Key Fields**:
  - `id`: Unique identifier
  - `doctorId`: Doctor who created the template
  - `title`: Questionnaire title
  - `description`: Optional description
  - `specialty`: Medical specialty (enum)
  - `isAiGenerated`: Boolean flag for AI-generated content
  - `aiPrompt`: The prompt used for AI generation
  - `isPublished`: Whether available for use
  - `questions`: Array of QuestionnaireQuestion objects

### QuestionnaireQuestion
- **Purpose**: Individual questions within a template
- **Key Fields**:
  - `questionNumber`: Order in questionnaire
  - `questionText`: The actual question
  - `questionType`: Type of question (TEXT, RATING, etc.)
  - `helpText`: Additional guidance for patient
  - `options`: For multiple choice/checkbox questions
  - `isRequired`: Whether required
  - `minLength`, `maxLength`: Text validation
  - `minValue`, `maxValue`: Number validation

### QuestionnaireAssignment
- **Purpose**: Tracks patient assignments and their progress
- **Key Fields**:
  - `templateId`: Which questionnaire
  - `patientId`: Which patient
  - `status`: PENDING, IN_PROGRESS, COMPLETED, EXPIRED
  - `dueDate`: Optional deadline
  - `completedAt`: When patient submitted
  - `score`: Optional scoring

### QuestionnaireResponse
- **Purpose**: Stores individual patient answers
- **Key Fields**:
  - `assignmentId`: Which assignment
  - `questionId`: Which question
  - `responseText`: Text answer
  - `responseNumber`: Numeric answer
  - `responseJson`: Complex responses (arrays, objects)

## Question Types

### Supported Types
1. **TEXT** - Single line text input
2. **TEXTAREA** - Multi-line text editor
3. **NUMBER** - Numeric input with optional min/max
4. **RATING** - 1-10 scale
5. **YESNO** - Yes/No buttons
6. **MULTIPLE_CHOICE** - Dropdown selection
7. **CHECKBOX** - Multiple selections
8. **DATE** - Date picker
9. **TIME** - Time picker

## Medical Specialties

The system supports these specialties for AI question generation:

- CARDIOLOGY
- NEUROLOGY
- ORTHOPEDICS
- PULMONOLOGY
- GASTROENTEROLOGY
- ENDOCRINOLOGY
- RHEUMATOLOGY
- NEPHROLOGY
- HEMATOLOGY
- ONCOLOGY
- PSYCHIATRY
- DERMATOLOGY
- ENT (Ear, Nose, Throat)
- OPHTHALMOLOGY
- GENERAL_MEDICINE
- OTHER

## API Endpoints

### 1. Templates Management
```
GET /api/questionnaires/templates
- List doctor's questionnaire templates
- Query params: specialty (optional)
- Returns: Array of templates

POST /api/questionnaires/templates
- Create new template
- Body: {
    title: string,
    description?: string,
    specialty: string,
    questions: Question[],
    isAiGenerated?: boolean,
    aiPrompt?: string
  }
- Returns: Created template
```

### 2. Assignment Management
```
POST /api/questionnaires/assign
- Assign questionnaire to patient(s)
- Body: {
    templateId: string,
    patientIds: string[],
    dueDate?: date
  }
- Returns: { count: number }

GET /api/questionnaires/assign
- Get patient's assignments
- Query params: patientId, status (optional)
- Returns: Array of assignments
```

### 3. Patient Responses
```
POST /api/questionnaires/respond
- Submit patient responses
- Body: {
    assignmentId: string,
    responses: [{
      questionId: string,
      responseText?: string,
      responseNumber?: number,
      responseJson?: any
    }]
  }
- Returns: Updated assignment

GET /api/questionnaires/respond
- Get responses for an assignment
- Query params: assignmentId
- Returns: Array of responses
```

### 4. Response Viewing
```
GET /api/questionnaires/responses
- Get responses (doctor view)
- Query params: assignmentId OR (patientId + templateId)
- Returns: Assignment with responses
```

### 5. AI Question Generation
```
POST /api/questionnaires/generate-ai
- Generate questions with AI
- Body: {
    specialty: string,
    customPrompt?: string
  }
- Returns: {
    specialty: string,
    questions: Question[],
    aiGenerated: true
  }
```

## React Components

### CreateQuestionnaire
Used by doctors to create questionnaires.

```tsx
<CreateQuestionnaire onSuccess={() => refreshList()} />
```

**Features:**
- Manual question creation
- AI generation tab
- Preview before saving
- Support for all question types

### PatientQuestionnaire
Used by patients to fill out questionnaires.

```tsx
<PatientQuestionnaire 
  assignmentId="assignment-id"
  onSubmitSuccess={() => navigate("/dashboard")}
/>
```

**Features:**
- Progress tracking
- Required field validation
- All question types
- Save draft option

### DoctorQuestionnaireResponses
Used by doctors to review patient responses.

```tsx
<DoctorQuestionnaireResponses 
  templateId="template-id"
  patientId="patient-id"
/>
```

**Features:**
- View all responses
- Export functionality
- Status tracking
- Response filtering

### QuestionnaireManagement
Dashboard for doctors to manage all questionnaires.

```tsx
<QuestionnaireManagement />
```

**Features:**
- List all templates
- Create new
- Assign to patients
- Duplicate templates
- Delete templates
- Track assignments

## Implementation Steps

### 1. Update Database Schema
```bash
# Update schema.prisma with new models
# Then run:
npx prisma db push
```

### 2. Create Pages
Create these pages in your app directory:

```
/app/dashboard/questionnaires/page.tsx
/app/dashboard/questionnaires/[id]/page.tsx
/app/patient/questionnaires/page.tsx
```

### 3. Add Authentication Checks
All API endpoints require proper authentication. Session is automatically checked.

### 4. Test the Flow
1. **Create questionnaire** as doctor
2. **Generate with AI** for specific specialty
3. **Assign** to patient with due date
4. **Patient completes** questionnaire
5. **Doctor views** responses

## Example Usage

### Doctor Creating a Cardiology Questionnaire

```tsx
import CreateQuestionnaire from "@/components/CreateQuestionnaire";

export default function QuestionnairesList() {
  return (
    <div>
      <CreateQuestionnaire onSuccess={() => refreshList()} />
    </div>
  );
}
```

### Patient Responding to Questionnaire

```tsx
import PatientQuestionnaire from "@/components/PatientQuestionnaire";

export default function PatientQuestionnairePage({ params }) {
  return (
    <PatientQuestionnaire 
      assignmentId={params.assignmentId}
      onSubmitSuccess={() => navigate("/dashboard")}
    />
  );
}
```

### Doctor Viewing Responses

```tsx
import DoctorQuestionnaireResponses from "@/components/DoctorQuestionnaireResponses";

export default function ViewResponses({ params }) {
  return (
    <DoctorQuestionnaireResponses 
      templateId={params.templateId}
      patientId={params.patientId}
    />
  );
}
```

## AI Integration

Currently, the system uses template-based questions per specialty. To integrate with real AI:

### 1. OpenAI Integration
```typescript
import OpenAI from "openai";

async function generateQuestionsWithAI(specialty: string, customPrompt: string) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const prompt = `Generate 5-8 medical questionnaire questions for a patient with ${specialty} concerns. ${customPrompt}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  // Parse response into questions array
  return parseQuestionsFromResponse(response.choices[0].message.content);
}
```

### 2. Anthropic Claude Integration
```typescript
import Anthropic from "@anthropic-ai/sdk";

async function generateQuestionsWithAI(specialty: string, customPrompt: string) {
  const client = new Anthropic();

  const message = await client.messages.create({
    model: "claude-3-sonnet-20240229",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `Generate 5-8 medical questionnaire questions for ${specialty}. ${customPrompt}`
      }
    ],
  });

  return parseQuestionsFromResponse(message.content[0].text);
}
```

## Validation & Security

✅ **Role-based access control**: Only doctors can create templates
✅ **Patient privacy**: Patients only see/answer their own questionnaires
✅ **Data validation**: All inputs validated server-side
✅ **Authentication required**: All endpoints require valid session
✅ **Audit trail**: Creation/modification timestamps tracked

## Performance Optimizations

- Indexed queries on `patientId`, `templateId`, `status`
- Includes optimization in queries to avoid N+1
- Pagination ready (can be added to list endpoints)

## Future Enhancements

1. **Conditional Logic**: Show questions based on previous answers
2. **Question Banks**: Reusable question libraries
3. **Scoring System**: Automatic scoring for certain question types
4. **Analytics**: Dashboard showing completion rates, average scores
5. **Templates Sharing**: Doctors can share templates
6. **Question Explanations**: Detailed explanations for answers
7. **Mobile App**: React Native version
8. **Real-time Notifications**: Alert doctors when patients complete

## Troubleshooting

### "Failed to fetch templates"
- Check authentication: User must be doctor
- Check database connection
- Verify Prisma is properly initialized

### AI Generation Not Working
- Ensure `generateQuestionsWithAI` is properly implemented
- Check API keys for external services
- Verify specialty value is supported

### Responses Not Saving
- Ensure assignment belongs to patient
- Check all required fields are provided
- Verify question IDs match

## Support & Questions

For detailed documentation, refer to:
- Prisma Schema: `/prisma/schema.prisma`
- API Routes: `/app/api/questionnaires/`
- Components: `/components/` (CreateQuestionnaire, PatientQuestionnaire, etc.)
