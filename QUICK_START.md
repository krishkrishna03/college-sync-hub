# Quick Start Guide - New Features

## Installation

### 1. Install New Dependencies
```bash
cd server
npm install csv-parser
cd ..
npm install
```

### 2. Configure Email (if not already done)
Create/update `server/.env`:
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 3. Build Frontend
```bash
npm run build
```

## Using New Features

### 1. Notification Tracking

**Access:**
- Master Admin Dashboard → Notifications → "View Tracking"

**Features:**
- View all sent notifications
- See read/unread counts
- Click any notification to see who read it
- Filter by read/unread status
- Search notifications

**Code Example:**
```tsx
import NotificationTracking from './components/Notifications/NotificationTracking';

<NotificationTracking />
```

### 2. Upload Questions via JSON

**Step 1:** Create JSON file following this format:
```json
[
  {
    "questionText": "Your question here?",
    "options": {
      "A": "Option A text",
      "B": "Option B text",
      "C": "Option C text",
      "D": "Option D text"
    },
    "correctAnswer": "B"
  }
]
```

**Step 2:** In Test Creation Form:
1. Click "Upload JSON/CSV" button
2. Select your JSON file
3. Questions are automatically added
4. Review and submit

### 3. Upload Questions via CSV

**Step 1:** Create CSV file:
```csv
question,optionA,optionB,optionC,optionD,correctAnswer
What is 2+2?,2,3,4,5,C
```

**Step 2:** Same upload process as JSON

### 4. Global Loading Screen

**In any component:**
```tsx
import { useLoading } from '../contexts/LoadingContext';

function MyComponent() {
  const { showLoading, hideLoading } = useLoading();

  const handleSubmit = async () => {
    showLoading('Creating test...');
    try {
      await apiService.createTest(data);
      // Success
    } finally {
      hideLoading();
    }
  };
}
```

### 5. Check Failed Emails

**Via MongoDB:**
```javascript
// Connect to your database
use academic_management;

// View all failed emails
db.pendingemails.find({ status: 'failed' });

// View by type
db.pendingemails.find({
  status: 'failed',
  type: 'login_credentials'
});
```

## Sample Files

Use the provided sample files for testing:

### `sample-questions.json`
Ready-to-use JSON format with 3 sample questions

### `sample-questions.csv`
Ready-to-use CSV format with 5 sample questions

## Common Issues

### Email Not Sending
**Check:**
1. `.env` file has correct credentials
2. Gmail account has "App Password" enabled
3. Check `pendingemails` collection for error details

### File Upload Fails
**Check:**
1. File format matches examples exactly
2. All required fields present
3. CorrectAnswer is A, B, C, or D (uppercase)
4. File size under 5MB

### Loader Not Appearing
**Check:**
1. LoadingProvider wraps your app in App.tsx
2. GlobalLoader component is rendered
3. Using useLoading() hook correctly

## API Endpoints

### Notification Tracking
```javascript
// Get all sent notifications
GET /api/notifications/sent-notifications?page=1&limit=20

// Get recipients for specific notification
GET /api/notifications/:notificationId/recipients?filter=read
```

### File Upload
```javascript
// Extract questions from file
POST /api/tests/extract-file
Body: FormData with 'file' field
```

## Testing Checklist

- [ ] Email sending works or logs to database
- [ ] Can upload JSON file with questions
- [ ] Can upload CSV file with questions
- [ ] Loading screen appears during operations
- [ ] Can view notification tracking
- [ ] Can see who read notifications
- [ ] Sample files work correctly

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### TypeScript Errors
```bash
# Check all new files are .tsx (not .ts)
find src -name "*.ts" | grep -v ".tsx"
```

### Module Not Found
```bash
# Ensure dependencies installed
cd server && npm install
cd .. && npm install
```

## Next Steps

1. Review CHANGELOG.md for detailed features
2. Test each feature using sample files
3. Configure email service properly
4. Integrate NotificationTracking in your dashboard
5. Add useLoading() to async operations

## Support Files

- **CHANGELOG.md** - Detailed feature documentation
- **IMPLEMENTATION_SUMMARY.md** - Technical implementation details
- **sample-questions.json** - Example JSON format
- **sample-questions.csv** - Example CSV format
- **README.md** - Original project documentation

## Quick Commands

```bash
# Start development
npm run full-dev

# Build only
npm run build

# Check server logs
cd server && npm run dev

# View database
mongosh academic_management
```
