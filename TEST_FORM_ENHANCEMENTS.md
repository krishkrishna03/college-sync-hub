# Test Form with Sections - Backend Integration & Upload Features

## Overview

The TestFormWithSections component has been fully connected to the backend and enhanced with file upload and question editing capabilities.

## Features Implemented

### 1. Backend Integration

The TestFormWithSections component is now fully integrated with the backend:

- **API Connection**: All test creation operations go through the backend API
- **Test Creation Endpoint**: `POST /api/tests`
- **Validation**: Server-side validation for all test data
- **Section Support**: Full support for multi-section tests
- **Source Tracking**: Tests track their source (manual, JSON, CSV)

### 2. JSON/CSV File Upload for Questions

Master admins can now upload questions using JSON or CSV files:

#### For Multi-Section Tests:
- Each section has an "Upload JSON/CSV" button
- Questions are uploaded specifically to the selected section
- Automatic slot management (only adds questions up to section limit)
- Instant feedback on upload success

#### For Regular Tests:
- Upload button in the main questions section
- Questions are added to the test
- Respects the configured question limit

#### Features:
- **Supported Formats**: JSON and CSV
- **File Size Limit**: 5 MB
- **Processing**: Server-side extraction and validation
- **Loading States**: Visual feedback during upload
- **Error Handling**: Clear error messages for invalid files

### 3. Question Edit Feature

Every question (uploaded or manually added) can be edited:

#### Edit Modal:
- Click the edit icon (pencil) on any question
- Modal overlay with edit form
- Edit all aspects of the question:
  - Question text
  - All four options (A, B, C, D)
  - Correct answer
- Save or cancel changes

#### Edit Features:
- Works for both sectioned and non-sectioned tests
- Preserves marks configuration
- Real-time validation
- User-friendly interface

### 4. Enhanced Question Management

#### Visual Improvements:
- Edit button (pencil icon) on each question
- Delete button (trash icon) on each question
- Color-coded correct answers (green background)
- Question numbering
- Clean card layout

#### Functionality:
- Add questions manually
- Upload questions from files
- Edit existing questions
- Delete questions
- Progress tracking (X/Y questions added)

## File Format Examples

### JSON Format:
```json
[
  {
    "questionText": "What is React?",
    "options": {
      "A": "A database",
      "B": "A JavaScript library",
      "C": "A programming language",
      "D": "An operating system"
    },
    "correctAnswer": "B"
  }
]
```

### CSV Format:
```csv
question,optionA,optionB,optionC,optionD,correctAnswer
What is React?,A database,A JavaScript library,A programming language,An operating system,B
```

## Backend API Endpoints Used

### Test Creation
- **POST** `/api/tests`
- Creates a new test with all sections and questions
- Validates data on the server
- Returns created test details

### File Upload
- **POST** `/api/tests/extract-file`
- Extracts questions from JSON/CSV files
- Validates question format
- Returns array of question objects

## Validation Rules

### Test Level:
- Test name required (min 3 characters)
- Description required (min 10 characters)
- Start date must be before end date
- Company name required for "Specific Company Test"

### Section Level (for multi-section tests):
- At least one section required
- Section name required
- Each section must have exact number of questions configured
- Duration and marks properly configured

### Question Level:
- Question text required
- All four options (A, B, C, D) required
- Correct answer must be A, B, C, or D
- Marks assigned automatically

## User Workflow

### Creating a Multi-Section Test:

1. Fill in test information (name, description, dates)
2. Select test type (Assessment, Mock Test, or Specific Company Test)
3. System automatically enables sections
4. Add sections using "Add Section" button
5. Configure each section (name, duration, questions, marks)
6. For each section:
   - Click "Add Questions"
   - Either:
     - Upload JSON/CSV file with questions
     - Manually add questions one by one
   - Edit questions if needed
   - Delete questions if needed
7. System validates all sections are complete
8. Click "Create Test" to save

### Editing Questions:

1. Locate the question to edit
2. Click the pencil icon (Edit button)
3. Edit modal opens with current values
4. Modify any field:
   - Question text
   - Options A, B, C, D
   - Correct answer
5. Click "Save Changes" to apply
6. Or click "Cancel" to discard

## Technical Implementation

### Component State:
```typescript
- editingQuestionIndex: Tracks which question is being edited
- editingQuestion: Holds the question data during editing
- uploadingSectionIndex: Tracks which section is uploading
- fileUploadLoading: Shows loading state during upload
```

### Key Functions:
- `handleFileUploadToSection()`: Uploads file to specific section
- `handleEditQuestion()`: Opens edit modal for a question
- `handleSaveEditedQuestion()`: Saves edited question
- `handleCancelEdit()`: Cancels editing
- `validateEditedQuestion()`: Validates edited question data

### API Service Methods:
- `apiService.createTest()`: Creates test
- `apiService.extractQuestionsFromFile()`: Uploads and extracts questions

## Error Handling

### Upload Errors:
- Invalid file format
- Missing required fields
- Invalid answer values
- File size exceeded
- Network errors

### Validation Errors:
- Incomplete questions
- Missing sections
- Question count mismatch
- Date validation errors

### User Feedback:
- Alert messages for errors
- Loading spinners during processing
- Success messages after operations
- Inline validation errors

## Benefits

1. **Efficiency**: Bulk upload questions instead of manual entry
2. **Flexibility**: Support for both JSON and CSV formats
3. **Edit Capability**: Fix mistakes without recreating questions
4. **Section-Specific**: Upload different questions to different sections
5. **Validation**: Server-side validation ensures data integrity
6. **User-Friendly**: Clear UI with visual feedback

## Sample Files

Sample files are available in the project root:
- `sample-questions.json`: Example JSON format
- `sample-questions.csv`: Example CSV format

## Documentation

Comprehensive documentation available in:
- `QUESTION_UPLOAD_FORMAT.md`: Detailed file format guide

## Testing Checklist

- [x] Create test with manual questions
- [x] Upload JSON file for questions
- [x] Upload CSV file for questions
- [x] Edit uploaded questions
- [x] Edit manually added questions
- [x] Delete questions
- [x] Multi-section test creation
- [x] Upload questions to different sections
- [x] Validation of required fields
- [x] Error handling for invalid files
- [x] Backend integration
- [x] Build successfully completes

## Future Enhancements (Optional)

1. Bulk edit multiple questions
2. Question preview before upload
3. Template download buttons
4. Question bank/library
5. Import from external sources
6. Question duplication detection
7. Export questions to file
8. Question search and filter
