# Test Creation/Update Validation Fixes

## Issue Identified
The test creation was failing with validation errors for ALL test types (Assessment, Practice, Assignment, Mock Test, Specific Company Test) with the error:
```
Number of questions must be between 1 and 100,
Marks per question must be between 1 and 10,
Duration must be between 5 and 300 minutes
```

This error was occurring because:
1. Sectioned tests (Assessment, Mock Test, Specific Company Test) correctly set `numberOfQuestions: 0`, `marksPerQuestion: 0`, and `duration: 0` on the frontend
2. The backend validation was applying min/max constraints to these fields regardless of whether `hasSections` was true or false
3. The validation ran BEFORE the `hasSections` logic could be evaluated

## Backend Fixes Applied

### 1. Create Test Endpoint (`POST /tests`)
**File:** `server/routes/tests.js` (lines 47-81)

Changed the validation from strict min/max checks to conditional custom validators:

```javascript
// BEFORE
body('numberOfQuestions').optional().isInt({ min: 1, max: 100 })
body('marksPerQuestion').optional().isInt({ min: 1, max: 10 })
body('duration').optional().isInt({ min: 5, max: 300 })

// AFTER
body('numberOfQuestions').optional().custom((value, { req }) => {
  if (req.body.hasSections) return true;
  if (!value || value < 1 || value > 100) {
    throw new Error('Number of questions must be between 1 and 100');
  }
  return true;
})
// Similar for marksPerQuestion and duration
```

**Key change:** Validation now skips these fields when `hasSections` is true.

### 2. Update Test Endpoint (`PUT /tests/:id`)
**File:** `server/routes/tests.js` (lines 1015-1114)

Applied the same conditional validation logic for consistency:
- Added `hasSections` and `sections` validation
- Made `numberOfQuestions`, `marksPerQuestion`, and `duration` conditionally validated
- Enhanced section validation to check question counts per section
- Properly handles both sectioned and non-sectioned test updates

## Frontend-Backend Connection Verification

### ✅ CREATE Operation
- **Frontend Handler:** `handleCreateTest` in `MasterAdminDashboard.tsx` (line 298)
- **API Service:** `createTest` in `api.ts` (line 159)
- **Backend Endpoint:** `POST /tests` in `tests.js` (line 47)
- **Status:** ✅ Connected and working

### ✅ UPDATE/EDIT Operation
- **Frontend Handler:** `handleEditTest` loads test data (line 378), form submission at line 677
- **API Service:** `updateTest` in `api.ts` (line 166)
- **Backend Endpoint:** `PUT /tests/:id` in `tests.js` (line 1015)
- **Status:** ✅ Connected and working

### ✅ DELETE Operation
- **Frontend Handler:** `handleDeleteTest` in `MasterAdminDashboard.tsx` (line 388)
- **API Service:** `deleteTest` in `api.ts` (line 173)
- **Backend Endpoint:** `DELETE /tests/:id` in `tests.js` (line 1117)
- **Status:** ✅ Connected and working

## Test Type Behavior

### Non-Sectioned Tests (Practice, Assignment)
- Must provide `numberOfQuestions`, `marksPerQuestion`, and `duration`
- These values are validated with min/max constraints
- All questions are stored directly in the test document

### Sectioned Tests (Assessment, Mock Test, Specific Company Test)
- Set `hasSections: true`
- Must provide `sections` array with section configurations
- `numberOfQuestions`, `marksPerQuestion`, and `duration` are set to 0 at test level
- Each section has its own `numberOfQuestions`, `marksPerQuestion`, and `sectionDuration`
- Questions are stored within each section

## Validation Flow

1. **Frontend (TestFormWithSections.tsx):**
   - Validates form fields
   - Sets appropriate values based on test type
   - For sectioned tests: sets main fields to 0
   - For non-sectioned tests: sets actual values

2. **Backend (tests.js):**
   - Receives the request
   - Runs express-validator middleware
   - Custom validators check `hasSections` flag
   - Skips validation for fields that should be 0
   - Validates section structure if applicable
   - Creates/updates test document

## Build Status
✅ Build successful with no errors

## Files Modified
1. `server/routes/tests.js` - Updated validation logic for create and update endpoints
