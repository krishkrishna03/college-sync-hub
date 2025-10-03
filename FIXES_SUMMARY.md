# PDF Upload Issue Fixes

## Issues Fixed

### 1. ERR_CONNECTION_REFUSED
**Root Cause**: Missing `uploads/` directory on the server
**Solution**: Created `/server/uploads/` directory with `.gitkeep` file

### 2. `apiService is not defined`
**Root Cause**: Missing import statement in `TestForm.tsx`
**Solution**: Added `import apiService from '../../services/api';` at line 4

### 3. `Cannot read property 'length' of undefined`
**Root Cause**: Missing validation for empty/invalid responses from backend
**Solution**: Added comprehensive checks:
- Validate response structure before accessing `.questions`
- Check if `questions` array exists and is valid
- Show user-friendly error messages for empty responses

## Backend Endpoints (Already Working)

### PDF Upload
- **Endpoint**: `POST /api/tests/extract-pdf`
- **Port**: 5000
- **Auth**: Bearer token required
- **File Type**: PDF (max 10MB)
- **Response**: JSON with extracted questions array

### JSON/CSV Upload
- **Endpoint**: `POST /api/tests/extract-file`
- **Port**: 5000
- **Auth**: Bearer token required
- **File Types**: JSON, CSV (max 5MB)
- **Response**: JSON with extracted questions array

## Changes Made

### Frontend (`src/components/Test/TestForm.tsx`)
1. Added missing `apiService` import
2. Enhanced `handleFileUpload` with:
   - Response validation
   - Empty array checks
   - Better error messages
3. Enhanced `handlePDFUpload` with:
   - Response structure validation
   - Empty array checks
   - User-friendly error messages

### Backend (`server/`)
1. Created `uploads/` directory for file storage
2. Added `.gitkeep` to ensure directory is tracked by git

## Testing

Build completed successfully:
- ✓ No TypeScript errors
- ✓ No compilation errors
- ✓ All imports resolved correctly
- ✓ Bundle size: 412.56 kB

## How to Use

1. Start backend server: `cd server && npm start` (runs on port 5000)
2. Start frontend: `npm run dev` (runs on port 5173)
3. Upload PDF/JSON/CSV files through the Test Form
4. Files are validated and processed on the server
5. Extracted questions appear in the form

## Error Handling

The application now handles:
- Invalid file types
- Empty responses
- Network errors
- Malformed data
- Missing authentication
- File size limits
