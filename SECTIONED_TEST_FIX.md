# Sectioned Test Interface Fix for Student Dashboard

## Issue Identified

When a student started a sectioned test (Assessment, Mock Test, or Specific Company Test), the application crashed with the error:

```
TypeError: Cannot read properties of undefined (reading 'map')
at handleSubmit (ProctoredTestInterface.tsx:302:48)
```

### Root Cause

The `StudentDashboard` component was always using `ProctoredTestInterface` for all tests, regardless of whether they had sections or not.

**The Problem:**
- `ProctoredTestInterface` expects `test.questions` array
- Sectioned tests have `test.sections[]` with `questions` inside each section
- When trying to access `test.questions.map()` for a sectioned test, it was `undefined`

## Solution Applied

### Changes to StudentDashboard.tsx

**1. Added Import:**
```typescript
import SectionedTestInterface from '../../components/Test/SectionedTestInterface';
```

**2. Updated Test Rendering Logic:**
```typescript
if (activeTest && testStartTime) {
  // Use SectionedTestInterface for sectioned tests, ProctoredTestInterface for others
  const hasSections = activeTest.hasSections || (activeTest.sections && activeTest.sections.length > 0);

  console.log('Rendering test interface - hasSections:', hasSections);

  if (hasSections) {
    return (
      <SectionedTestInterface
        test={activeTest}
        onSubmit={handleSubmitTest}
        onExit={() => {
          setActiveTest(null);
          setTestStartTime(null);
        }}
      />
    );
  }

  return (
    <ProctoredTestInterface
      test={activeTest}
      onSubmit={handleSubmitTest}
      onExit={() => {
        setActiveTest(null);
        setTestStartTime(null);
      }}
    />
  );
}
```

## Test Structure Differences

### Non-Sectioned Tests (Practice, Assignment)
```typescript
{
  _id: string,
  testName: string,
  // ... other fields
  hasSections: false,
  questions: [
    { _id, questionText, options, correctAnswer, marks },
    // ... more questions
  ],
  numberOfQuestions: number,
  marksPerQuestion: number,
  duration: number
}
```

### Sectioned Tests (Assessment, Mock Test, Specific Company Test)
```typescript
{
  _id: string,
  testName: string,
  // ... other fields
  hasSections: true,
  sections: [
    {
      sectionName: string,
      sectionDuration: number,
      numberOfQuestions: number,
      marksPerQuestion: number,
      questions: [
        { _id, questionText, options, correctAnswer, marks },
        // ... questions for this section
      ]
    },
    // ... more sections
  ],
  numberOfQuestions: 0,  // Not used for sectioned tests
  marksPerQuestion: 0,   // Not used for sectioned tests
  duration: 0            // Not used for sectioned tests
}
```

## How It Works Now

1. **Student starts a test** → `handleStartTest()` is called
2. **API returns test data** with structure based on test type
3. **StudentDashboard checks** `hasSections` flag or presence of `sections` array
4. **Conditionally renders:**
   - `SectionedTestInterface` for sectioned tests (Assessment, Mock Test, Specific Company Test)
   - `ProctoredTestInterface` for non-sectioned tests (Practice, Assignment)

## Components Involved

### ProctoredTestInterface
- **File:** `src/components/Test/ProctoredTestInterface.tsx`
- **Used for:** Non-sectioned tests (Practice, Assignment)
- **Expects:** `test.questions` array
- **Features:**
  - Single continuous test
  - All questions accessible
  - Single timer for entire test

### SectionedTestInterface
- **File:** `src/components/Test/SectionedTestInterface.tsx`
- **Used for:** Sectioned tests (Assessment, Mock Test, Specific Company Test)
- **Expects:** `test.sections` array with questions in each section
- **Features:**
  - Multiple sections with separate timers
  - Section navigation
  - Questions organized by section
  - Auto-advance between sections when time expires

## Related Documentation

- `MULTI_SECTION_TEST_FEATURE.md` - Details about multi-section test implementation
- `PROCTORED_EXAM_SYSTEM.md` - Information about proctoring features
- `TEST_VALIDATION_FIXES.md` - Backend validation fixes for test creation

## Files Modified

1. `src/pages/dashboards/StudentDashboard.tsx` - Added conditional rendering logic
