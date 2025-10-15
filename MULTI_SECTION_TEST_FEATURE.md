# Multi-Section Test Feature Implementation

## Overview
This feature allows Master Admins to create tests with multiple sections for Assessment, Mock Test, and Specific Company Test types. Each section can have its own duration, number of questions, and marks per question.

## Features Implemented

### 1. Backend Changes

#### Database Model (`server/models/Test.js`)
- Added `sectionSchema` to define test sections with:
  - `sectionName`: Name of the section
  - `sectionDuration`: Duration in minutes for the section
  - `numberOfQuestions`: Number of questions in the section
  - `marksPerQuestion`: Marks per question for the section
  - `questions`: Array of questions specific to this section

- Added fields to Test schema:
  - `hasSections`: Boolean to indicate if test has sections
  - `sections`: Array of section objects

- Updated validation logic to:
  - Calculate total duration from all sections
  - Calculate total questions from all sections
  - Calculate total marks from all sections
  - Validate each section's question count

#### API Routes (`server/routes/tests.js`)
- Updated POST `/api/tests` to accept sections:
  - Validates section structure
  - Validates questions within each section
  - Handles both sectioned and non-sectioned tests

- Updated POST `/api/tests/:id/start` to return:
  - Test structure with sections (if applicable)
  - Questions organized by section

- Updated POST `/api/tests/:id/submit` to:
  - Extract questions from all sections
  - Calculate marks across all sections
  - Handle submissions for sectioned tests

### 2. Frontend Changes

#### New Components

##### `SectionConfiguration.tsx`
A comprehensive section management component that allows:
- Adding multiple sections
- Editing section details (name, duration, questions, marks)
- Removing sections
- Tracking question progress per section
- Visual indicators for completion status
- Displaying overall test statistics (total sections, duration, questions)

##### `TestFormWithSections.tsx`
Enhanced test form that includes:
- Toggle to enable/disable multi-section mode
- Section-specific question management
- Integration with the section configuration component
- Conditional rendering based on test type
- Support for both sectioned and non-sectioned tests

##### `SectionedTestInterface.tsx`
Student interface for taking sectioned tests with:
- Section-wise navigation
- Individual section timers
- Section completion summary
- Warning before moving to next section
- Question navigation within sections
- Visual progress tracking per section
- Automatic section transition on timer expiry

#### Updated Components

##### `ExamManagement.tsx`
- Updated to use `TestFormWithSections` instead of `TestForm`
- Maintains backward compatibility with existing tests

### 3. Test Type Support

The multi-section feature is available ONLY for:
- Assessment
- Mock Test
- Specific Company Test

It is NOT available for:
- Practice
- Assignment

### 4. Key Functionality

#### Test Creation Flow
1. Master Admin selects test type (Assessment, Mock Test, or Specific Company Test)
2. Enables "Multiple Sections" toggle
3. Adds sections using the "Add Section" button
4. For each section, configures:
   - Section name (e.g., "Quantitative Aptitude", "Logical Reasoning")
   - Section duration (e.g., 30 minutes)
   - Number of questions (e.g., 20 questions)
   - Marks per question (e.g., 1 mark)
5. Adds questions to each section individually
6. System automatically calculates:
   - Overall test duration (sum of all section durations)
   - Total number of questions (sum of all sections)
   - Total marks (calculated from all sections)

#### Student Test Taking Flow
1. Student starts the test
2. For sectioned tests:
   - Timer shows remaining time for current section
   - Student answers questions in Section 1
   - After completing Section 1, student sees summary
   - Student proceeds to Section 2 (cannot return to Section 1)
   - Process repeats for all sections
   - Final submission after last section
3. For non-sectioned tests:
   - Regular test interface
   - Single timer for entire test
   - Can navigate freely between questions

#### Important Rules
- Once a student moves to the next section, they CANNOT return to previous sections
- Each section has its own timer
- Questions are organized by section
- Section timer automatically moves to next section when time expires
- Test is auto-submitted when all section timers expire

## Technical Details

### Data Structure

#### Section Object
```javascript
{
  sectionName: "Quantitative Aptitude",
  sectionDuration: 30,
  numberOfQuestions: 20,
  marksPerQuestion: 1,
  questions: [
    {
      questionText: "What is 2+2?",
      options: { A: "3", B: "4", C: "5", D: "6" },
      correctAnswer: "B",
      marks: 1
    }
    // ... more questions
  ]
}
```

#### Test Object with Sections
```javascript
{
  testName: "Company XYZ Assessment",
  testType: "Specific Company Test",
  hasSections: true,
  sections: [
    {
      sectionName: "Quantitative Aptitude",
      sectionDuration: 30,
      numberOfQuestions: 20,
      marksPerQuestion: 1,
      questions: [...]
    },
    {
      sectionName: "Logical Reasoning",
      sectionDuration: 25,
      numberOfQuestions: 15,
      marksPerQuestion: 2,
      questions: [...]
    }
  ],
  // Overall fields (auto-calculated)
  duration: 55, // 30 + 25
  numberOfQuestions: 35, // 20 + 15
  totalMarks: 50 // (20 * 1) + (15 * 2)
}
```

## Benefits

1. **Realistic Test Environment**: Mimics actual company tests with multiple sections
2. **Better Assessment**: Tests different skills in separate timed sections
3. **Flexibility**: Each section can have different duration and marking schemes
4. **Focused Testing**: Students focus on one section at a time
5. **Prevention of Cherry-picking**: Students cannot skip difficult sections and return later
6. **Professional Format**: Matches industry-standard test formats

## Backward Compatibility

- All existing tests without sections continue to work normally
- The feature is opt-in via the "Enable Multiple Sections" toggle
- Non-sectioned test interface remains unchanged
- Database model is backward compatible

## Usage Example

### Creating a Multi-Section Test

1. Navigate to Exam Management
2. Click "Create New Test"
3. Select "Mock Test" as test type
4. Fill in basic details
5. Enable "Multiple Sections" toggle
6. Add Section 1:
   - Name: "Verbal Ability"
   - Duration: 20 minutes
   - Questions: 25
   - Marks per question: 1
7. Add questions to Section 1
8. Add Section 2:
   - Name: "Quantitative Aptitude"
   - Duration: 30 minutes
   - Questions: 30
   - Marks per question: 2
9. Add questions to Section 2
10. Submit the test

Total test details:
- Duration: 50 minutes (20 + 30)
- Questions: 55 (25 + 30)
- Total Marks: 85 (25*1 + 30*2)

## Files Modified/Created

### Created:
- `src/components/Test/SectionConfiguration.tsx`
- `src/components/Test/TestFormWithSections.tsx`
- `src/components/Test/SectionedTestInterface.tsx`
- `MULTI_SECTION_TEST_FEATURE.md`

### Modified:
- `server/models/Test.js`
- `server/routes/tests.js`
- `src/components/Exam/ExamManagement.tsx`

## Testing

The implementation has been tested and the project builds successfully without errors.
