# MongoDB-Based Coding Round Implementation

## Overview

The coding round feature has been successfully migrated from Supabase to MongoDB. This implementation provides a HackerRank-like coding environment with secure code execution, test case management, and progress tracking.

## Architecture

### Database Models

All coding round data is stored in MongoDB using Mongoose models:

#### 1. CodingQuestion
Stores coding problems with full details:
- `title` - Problem title
- `description` - Detailed problem statement
- `difficulty` - easy, medium, or hard
- `constraints` - Problem constraints
- `input_format` - Input format description
- `output_format` - Output format description
- `time_limit` - Execution time limit (ms)
- `memory_limit` - Memory limit (MB)
- `supported_languages` - Array of supported languages
- `sample_input/output` - Example test cases
- `explanation` - Sample explanation
- `tags` - Problem tags (arrays, dp, graphs, etc.)
- `created_by` - Reference to User who created it

#### 2. CodingTestCase
Stores test cases for each question:
- `question_id` - Reference to CodingQuestion
- `input` - Test case input
- `expected_output` - Expected output
- `is_sample` - Whether visible to students
- `weight` - Points for this test case

#### 3. TestCodingSection
Links coding questions to tests:
- `test_id` - Reference to Test
- `question_id` - Reference to CodingQuestion
- `points` - Points for this question
- `order_index` - Order in test

#### 4. CodingSubmission
Stores student submissions and results:
- `student_id` - Reference to User
- `question_id` - Reference to CodingQuestion
- `test_attempt_id` - Reference to TestAttempt (null for practice)
- `language` - Programming language used
- `code` - Submitted code
- `status` - pending, running, accepted, wrong_answer, runtime_error, time_limit_exceeded, compilation_error
- `test_cases_passed` - Number passed
- `total_test_cases` - Total test cases
- `score` - Points earned (0-100)
- `execution_time` - Average execution time
- `test_results` - Detailed results array
- `error_message` - Error details if any

#### 5. PracticeCodingProgress
Tracks student practice progress:
- `student_id` - Reference to User
- `question_id` - Reference to CodingQuestion
- `status` - attempted, solved, or bookmarked
- `best_score` - Highest score achieved
- `attempts` - Number of attempts
- `last_attempted_at` - Last attempt timestamp
- `solved_at` - When fully solved

## Code Execution

### Secure Sandbox with isolated-vm

The system uses `isolated-vm` for secure JavaScript code execution:

**Features:**
- Memory limit: 128MB per execution
- Timeout: 5000ms per test case
- Complete isolation from host environment
- Console.log support for debugging
- Support for both `solution()` and `main()` function patterns

**Supported Languages:**
- JavaScript (fully functional)
- Python (placeholder - requires additional setup)
- Java (placeholder - requires additional setup)
- C++ (placeholder - requires additional setup)

### Execution Flow

1. Student submits code
2. System fetches all test cases for the question
3. For each test case:
   - Create isolated VM instance
   - Set memory and timeout limits
   - Execute code with test case input
   - Compare output with expected output
   - Record execution time and result
4. Calculate score based on passed test cases and weights
5. Save submission to database
6. Update practice progress (if in practice mode)

## API Endpoints

### Question Management

**GET `/api/coding/questions`**
- Fetch all coding questions
- Returns questions with test case counts
- Requires authentication

**GET `/api/coding/questions/:id`**
- Fetch specific question with test cases
- Returns full question details
- Requires authentication

**POST `/api/coding/questions`**
- Create new coding question
- Body: question data + test cases array
- Master admin only
- Requires authentication

**PUT `/api/coding/questions/:id`**
- Update existing question
- Body: question data + test cases array
- Deletes old test cases and creates new ones
- Requires authentication

**DELETE `/api/coding/questions/:id`**
- Delete question and all related data
- Cascades to test cases, submissions, progress
- Requires authentication

### Code Execution

**POST `/api/coding/run`**
- Run code against sample test cases only
- Body: `{ questionId, code, language }`
- Returns output and test results
- No submission saved
- Requires authentication

**POST `/api/coding/submit`**
- Submit code for evaluation
- Body: `{ questionId, testAttemptId, code, language, isPractice }`
- Runs against all test cases (sample + hidden)
- Saves submission to database
- Updates practice progress if applicable
- Returns submission ID, status, and results
- Requires authentication

### Practice Mode

**GET `/api/coding/practice/questions`**
- Fetch all practice questions with progress
- Returns questions array and stats
- Shows solved/attempted status per question
- Requires authentication

**GET `/api/coding/submissions/:questionId`**
- Fetch last 10 submissions for a question
- Student can only see their own submissions
- Requires authentication

## Frontend Components

### CodingInterface
Main coding interface component:
- Displays question details
- Code editor with syntax highlighting
- Language selector
- Run and Submit buttons
- Test results display
- Output console

### CodeEditor
Monaco-based code editor:
- Syntax highlighting
- Auto-completion
- Multiple language support
- Customizable theme

### CodingQuestionForm
Admin interface for creating/editing questions:
- Question details form
- Test case management
- Language selection
- Tag management

### CodingQuestionsList
Admin view of all questions:
- Question listing with filters
- Edit/Delete actions
- Difficulty indicators

### PracticeCoding
Student practice interface:
- Browse all questions
- Filter by difficulty/status
- Progress statistics
- Direct link to solve questions

## Usage Examples

### Creating a Coding Question

```javascript
const questionData = {
  title: "Two Sum",
  description: "Given an array of integers and a target, return indices of two numbers that add up to target.",
  difficulty: "easy",
  constraints: "Array length: 2-1000, Numbers: -10^9 to 10^9",
  input_format: "Line 1: Array as comma-separated values\nLine 2: Target number",
  output_format: "Two space-separated indices",
  time_limit: 2000,
  memory_limit: 256,
  supported_languages: ["javascript", "python"],
  sample_input: "2,7,11,15\n9",
  sample_output: "0 1",
  explanation: "nums[0] + nums[1] = 2 + 7 = 9",
  tags: ["array", "hash-table"],
  testCases: [
    {
      input: "2,7,11,15\n9",
      expected_output: "0 1",
      is_sample: true,
      weight: 25
    },
    {
      input: "3,2,4\n6",
      expected_output: "1 2",
      is_sample: false,
      weight: 25
    }
  ]
};

// POST /api/coding/questions
```

### Student Solution Format

```javascript
// Option 1: solution function
function solution(input) {
  const lines = input.split('\n');
  const nums = lines[0].split(',').map(Number);
  const target = parseInt(lines[1]);

  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) {
        return `${i} ${j}`;
      }
    }
  }
}

// Option 2: main function
function main(input) {
  // Same logic
  return result;
}

// Option 3: console.log
const lines = input.split('\n');
// ... process input
console.log(result);
```

## Security Features

1. **Isolated Execution**: Code runs in completely isolated VM
2. **Resource Limits**: Memory and time constraints prevent abuse
3. **Input Sanitization**: All inputs validated before execution
4. **Hidden Test Cases**: Students only see sample test cases
5. **Authentication**: All endpoints require valid JWT token
6. **Data Validation**: Mongoose schemas validate all data

## Performance Optimizations

1. **Indexes**: All frequently queried fields have indexes
2. **Lean Queries**: Use `.lean()` for read-only operations
3. **Batch Operations**: Multiple test cases run in single transaction
4. **Caching**: Question data can be cached on frontend
5. **Async Execution**: Non-blocking code execution

## Integration with Tests

Coding questions can be added to any test type:
- Assessment tests
- Company-specific tests
- Mock tests
- Practice mode

To add coding section to a test:
1. Create coding questions
2. Use TestCodingSection model to link questions to test
3. Set points and order for each question
4. Students see coding section during test attempt

## Future Enhancements

1. **Multi-language Support**:
   - Add Python execution using child_process
   - Add Java compilation and execution
   - Add C++ compilation and execution

2. **Advanced Features**:
   - Code plagiarism detection
   - Complexity analysis
   - Multiple solution approaches
   - Editorial/hints system
   - Discussion forum per question

3. **Analytics**:
   - Success rate per question
   - Average solve time
   - Common mistakes analysis
   - Language preference stats

4. **UI Improvements**:
   - Split-screen view
   - Full-screen mode
   - Custom themes
   - Keyboard shortcuts
   - Code snippets library

## Troubleshooting

### Code Not Running
- Check if question has sample test cases
- Verify code syntax is correct
- Ensure function name is `solution` or `main`
- Check browser console for errors

### Submission Failing
- Verify all test cases exist
- Check database connection
- Review server logs for errors
- Ensure isolated-vm is properly installed

### Performance Issues
- Add more indexes if queries are slow
- Optimize test case count (5-10 per question ideal)
- Use lean queries for read operations
- Consider caching frequently accessed questions

## Installation

All dependencies are installed. To verify:

```bash
cd server
npm install isolated-vm mongoose express
```

## Testing

The system is ready to use. To test:

1. Start MongoDB instance
2. Start server: `npm run server`
3. Start frontend: `npm run dev`
4. Login as admin
5. Navigate to coding questions management
6. Create a test question
7. Login as student
8. Access practice mode
9. Solve the question

## Conclusion

The MongoDB-based coding round implementation provides a robust, secure, and scalable solution for conducting coding assessments. It works exactly like HackerRank with complete isolation, proper scoring, and comprehensive progress tracking.
