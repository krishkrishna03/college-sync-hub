# Proctored Exam System Implementation

A comprehensive exam interface similar to TCS CodeVita, Infosys HackWithInfy, and other MNC online assessment platforms.

## Features Implemented

### 1. Test Instructions Screen
- Professional instructions page shown before test starts
- Displays test details: duration, questions, marks
- Company branding support for company-specific tests
- Customizable instructions stored in database
- Clear proctoring warnings
- Cancel and Start Test buttons

### 2. Fullscreen Mode
- Automatically enters fullscreen when test starts
- Prevents user from exiting fullscreen during test
- Re-enters fullscreen if user attempts to exit
- Counts as violation if fullscreen is exited

### 3. Tab Switching Detection & Prevention
- Monitors browser visibility changes
- Detects window blur events
- Tracks tab switches and window minimization
- Violation counter displayed prominently
- Maximum 3 violations allowed
- Auto-submits test after 3 violations

### 4. Proctoring Features
- Real-time violation tracking
- Warning messages on violation detection
- Visual feedback with animated warnings
- Violations recorded in database
- Status field indicates if test was auto-submitted due to violations

### 5. Enhanced Navigation Controls

#### Mark for Review & Next
- Marks current question for review
- Automatically moves to next question
- Yellow highlight in question palette

#### Save & Next
- Saves current answer
- Moves to next question
- Disabled on last question

#### Clear Response
- Removes selected answer for current question
- Updates question status
- Only enabled when answer is selected

### 6. Question Palette
- Color-coded question status:
  - Blue: Current question
  - Green: Answered
  - Red: Visited but not answered
  - Yellow: Marked for review
  - Gray: Not visited
- Click any question to navigate directly
- Real-time status counters showing:
  - Answered count
  - Not answered count
  - Marked for review count
  - Not visited count

### 7. Clean Test UI
- Sidebar and navbar hidden during test
- Full-screen distraction-free interface
- Timer prominently displayed with color coding:
  - Green: More than 10 minutes remaining
  - Orange: 5-10 minutes remaining
  - Red: Less than 5 minutes remaining
- Progress bar showing test completion
- Question counter

### 8. Auto-Submit Features
- Time expiry: Auto-submits when timer reaches zero
- Violation limit: Auto-submits after 3 violations
- Proper status tracking for different submission types

## Database Schema Updates

### TestAttempt Model
Added new fields:
```javascript
violations: {
  type: Number,
  default: 0,
  min: 0
}

status: {
  type: String,
  enum: ['completed', 'timeout', 'submitted', 'auto-submitted-violations'],
  default: 'completed'
}
```

### Test Model
Added instructions field:
```javascript
instructions: [{
  type: String,
  trim: true
}]
```

## API Updates

### Submit Test Endpoint
Now accepts violations parameter:
```javascript
POST /api/tests/:id/submit
{
  answers: [],
  startTime: string,
  timeSpent: number,
  violations: number // New field
}
```

## Component Structure

### ProctoredTestInterface.tsx
Main exam interface component with:
- Instructions screen
- Fullscreen management
- Violation detection
- Question navigation
- Answer selection
- Auto-submit logic
- Confirmation dialogs

## User Experience Flow

1. Student clicks "Start Test" on assigned test
2. Instructions screen appears with:
   - Test details
   - Rules and guidelines
   - Proctoring warnings
3. Student clicks "I Understand, Start Test"
4. Browser enters fullscreen mode
5. Test interface loads with:
   - Timer starts counting down
   - Question palette on right
   - Question content in center
   - Navigation controls at bottom
6. Student answers questions using:
   - Save & Next: Save and continue
   - Mark for Review & Next: Flag for later review
   - Clear Response: Remove current answer
   - Direct navigation: Click question numbers
7. System monitors for violations:
   - Tab switches detected
   - Warning shown with current violation count
   - Test auto-submits at 3 violations
8. Student submits test:
   - Summary shown with answered/unanswered counts
   - Confirmation required
   - Cannot change answers after submission
9. Fullscreen exits after submission
10. Results displayed based on test type

## Configuration

### Default Instructions
System provides default instructions if custom ones not specified:
- Proctoring notice
- Tab switching warning
- Violation limits
- Internet connection requirement
- Fullscreen notice
- Navigation instructions

### Violation Limit
Currently set to 3 violations maximum. Can be configured in:
```typescript
const MAX_VIOLATIONS = 3;
```

## Color Scheme

- Primary: Blue (#2563eb)
- Success: Green (#16a34a)
- Warning: Yellow (#eab308)
- Danger: Red (#dc2626)
- Neutral: Gray shades

## Testing Recommendations

1. Test fullscreen behavior across browsers
2. Verify tab switch detection works reliably
3. Test auto-submit on violations
4. Test auto-submit on timer expiry
5. Verify question navigation works correctly
6. Test mark for review functionality
7. Test clear response button
8. Verify violations are stored in database
9. Test with different test types (Assessment, Practice, etc.)
10. Test on different screen sizes

## Browser Compatibility

- Chrome: Full support
- Firefox: Full support
- Safari: Full support
- Edge: Full support

Note: Fullscreen API requires user gesture to activate.

## Security Features

1. Violation tracking prevents cheating
2. Auto-submit on suspicious activity
3. All violations logged in database
4. Timer cannot be manipulated client-side
5. Test submission verified server-side
6. Fullscreen exit detected and prevented

## Future Enhancements

Potential improvements:
1. Webcam monitoring
2. Screen recording
3. AI-based cheating detection
4. Multiple display detection
5. Browser extension blocking
6. Copy-paste prevention
7. Right-click disabling
8. Keyboard shortcut blocking
9. IP address tracking
10. Device fingerprinting
