# Changelog - Academic Management System Extensions

## Version 2.0 - Latest Features and Fixes

### 1. Email Service Improvements

#### Fixed Email Sending Errors
- **Problem**: Email timeout errors (`queryA ETIMEOUT smtp.gmail.com`)
- **Solution**:
  - Added retry logic with exponential backoff (3 attempts)
  - Configured connection timeouts and connection pooling
  - Enhanced error logging with detailed context

#### Fallback Email Tracking
- All failed email credentials are now stored in `PendingEmail` collection
- Database schema tracks:
  - Email type (login_credentials, notifications, etc.)
  - Recipient information
  - Failed attempts count
  - Error messages
- Admins can view and retry failed emails later

### 2. Notification Tracking System

#### New Backend Endpoints
- `GET /api/notifications/sent-notifications` - List all sent notifications with stats
- `GET /api/notifications/:notificationId/recipients` - View detailed recipient list
- Enhanced `NotificationRecipient` model with read tracking

#### New Frontend Components
- **NotificationTracking.tsx** - Complete notification analytics dashboard
  - View all sent notifications
  - Track read/unread status per recipient
  - Filter by read/unread
  - Search notifications
  - View detailed recipient lists
  - Real-time read rate percentage
  - Email delivery status

#### Features
- Track who viewed each notification
- Count total reads vs total recipients
- Filter by date, role, or read/unread status
- Visual progress bars for read rates
- Recipient-level tracking with timestamps

### 3. Tests & Exams UI Improvements

#### Enhanced Navigation
- Tab-based navigation system (already exists in TestTabs.tsx)
- Filter by:
  - **Test Type**: Assessment, Practice, Mock Test, Assignment, Specific Company Test
  - **Subject**: Verbal, Reasoning, Technical, Arithmetic, Communication
- Real-time test count badges
- Smooth transitions and animations

#### Test Card Display
- Test Name, Description
- Duration, Marks
- Status indicators (active/upcoming/completed)
- Subject and type badges
- Visual icons for each category

### 4. PDF Upload & Parsing Fixes

#### Fixes Applied
- **ReferenceError**: Fixed `apiService` import in TestForm.tsx
- **Enhanced PDF Parser**: Multiple parsing strategies for different PDF formats
  - Standard numbered format (1., 2., etc.)
  - Alternative question formats (Q1:, Question 1:)
  - Simple format detection
- **Better Error Messages**: Clear guidance on PDF formatting requirements
- **Multiple MCQ Extraction**: Fixed to extract ALL questions, not just one

#### PDF Format Guidelines
PDF files should follow this format:
```
1. Question text here?
A) Option A
B) Option B
C) Option C
D) Option D
Answer: B

2. Next question?
...
```

### 5. JSON/CSV Upload Support

#### New File Upload Endpoint
- `POST /api/tests/extract-file` - Extract questions from JSON/CSV files

#### JSON Format (sample-questions.json)
```json
[
  {
    "questionText": "What is the capital of France?",
    "options": {
      "A": "London",
      "B": "Paris",
      "C": "Berlin",
      "D": "Madrid"
    },
    "correctAnswer": "B"
  }
]
```

#### CSV Format (sample-questions.csv)
```csv
question,optionA,optionB,optionC,optionD,correctAnswer
What is the capital of France?,London,Paris,Berlin,Madrid,B
```

#### Features
- Automatic format detection
- Validation of all fields
- Bulk question import (up to 100 questions)
- Clear error messages for invalid formats
- Sample files provided in project root

### 6. Global Loading Screen

#### New Components
- **LoadingContext.tsx** - React Context for global loading state
- **GlobalLoader.tsx** - Beautiful animated loading screen
- **Loader3D.tsx** - Enhanced 3D animated loader with pulse effects

#### Usage
```tsx
import { useLoading } from '../contexts/LoadingContext';

const { showLoading, hideLoading } = useLoading();

// Show loader
showLoading('Creating test...');

// Hide loader
hideLoading();
```

#### Features
- Site-wide animated loading screen
- Displayed during:
  - Page navigation
  - Test creation
  - Bulk uploads
  - Report fetching
  - Any async operations
- Smooth fade-in/fade-out transitions
- Custom loading messages
- Backdrop blur effect
- 3D pulse animations

### 7. Technical Improvements

#### Backend
- Enhanced email service with retry logic
- New `PendingEmail` model for failed email tracking
- CSV parser integration (`csv-parser` package)
- JSON file extractor utility
- Improved notification tracking endpoints
- Better error handling and logging

#### Frontend
- Global loading context integration
- Enhanced API service methods
- Better error messages and user feedback
- Improved file upload handling
- Real-time notification tracking UI

#### Database
- New `PendingEmail` collection schema
- Enhanced `NotificationRecipient` tracking
- Indexed fields for performance

## Migration Notes

### New Dependencies
Backend (server/package.json):
```json
"csv-parser": "^3.0.0"
```

### Database Migrations
No manual migrations required. New collections will be created automatically:
- `pendingemails` - Stores failed email attempts

### Environment Variables
Ensure these are configured in `.env`:
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## API Changes

### New Endpoints
1. **GET** `/api/notifications/sent-notifications?page=1&limit=20`
   - Returns: List of sent notifications with read/unread stats

2. **GET** `/api/notifications/:notificationId/recipients?filter=read|unread`
   - Returns: Detailed recipient list for a notification

3. **POST** `/api/tests/extract-file`
   - Body: FormData with `file` field (JSON or CSV)
   - Returns: Extracted questions array

### Enhanced Endpoints
- Email service methods now return `{ success: boolean, error?: string }`
- Failed credentials automatically logged to database

## Usage Examples

### Creating Tests with File Upload
1. Click "Upload JSON/CSV" button in test creation form
2. Select a properly formatted JSON or CSV file
3. Questions are automatically extracted and added to the form
4. Review and submit the test

### Tracking Notifications
1. Navigate to Notifications section
2. Click "View Tracking" or use NotificationTracking component
3. See all sent notifications with read rates
4. Click any notification to view detailed recipient list
5. Filter by read/unread status

### Using Global Loader
```tsx
const Component = () => {
  const { showLoading, hideLoading } = useLoading();

  const handleSubmit = async () => {
    showLoading('Processing your request...');
    try {
      await apiService.createTest(data);
    } finally {
      hideLoading();
    }
  };
};
```

## Known Issues & Future Enhancements

### Current Limitations
- Email retry is automatic with 3 attempts only
- Manual retry of failed emails not yet implemented in UI
- PDF parsing works best with standardized formats

### Planned Enhancements
1. **Resend Failed Emails** - UI button in Master Admin dashboard
2. **Analytics Graph** - Visual notification reach statistics
3. **Upload Progress Bar** - Real-time progress for large files
4. **Batch Email Retry** - Retry all failed emails at once

## Testing

### Test Email Sending
1. Create a new user (college/faculty/student)
2. Check if email is sent
3. If failed, verify entry in `pendingemails` collection

### Test File Upload
1. Use provided `sample-questions.json` or `sample-questions.csv`
2. Upload in test creation form
3. Verify questions are extracted correctly

### Test Notification Tracking
1. Create and send a notification
2. View in notification tracking dashboard
3. Check recipient read status updates

## Support

For issues or questions about these new features:
1. Check this changelog
2. Review sample files (sample-questions.json, sample-questions.csv)
3. Check server logs for detailed error messages
4. Verify environment variables are configured correctly
