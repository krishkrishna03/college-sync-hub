# Coding Round Quick Start Guide

## Prerequisites

- MongoDB running and connected
- Server running on port 5000
- Frontend running on port 5173

## Step-by-Step Testing

### 1. Start the Application

```bash
# Terminal 1 - Start server
cd server
npm run dev

# Terminal 2 - Start frontend
npm run dev
```

### 2. Login as Master Admin

- Email: `carelinkdesk@gmail.com`
- Password: `admin123`

### 3. Create a Coding Question

Navigate to Coding Questions Management and create a question:

**Sample Question: Two Sum**

```json
{
  "title": "Two Sum",
  "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
  "difficulty": "easy",
  "constraints": "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.",
  "input_format": "Line 1: Comma-separated array of integers\nLine 2: Target integer",
  "output_format": "Two space-separated indices (0-indexed)",
  "time_limit": 2000,
  "memory_limit": 256,
  "supported_languages": ["javascript"],
  "sample_input": "2,7,11,15\n9",
  "sample_output": "0 1",
  "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1].",
  "tags": ["array", "hash-table"]
}
```

**Test Cases:**

Sample Test Case (visible to students):
```json
{
  "input": "2,7,11,15\n9",
  "expected_output": "0 1",
  "is_sample": true,
  "weight": 25
}
```

Hidden Test Cases:
```json
[
  {
    "input": "3,2,4\n6",
    "expected_output": "1 2",
    "is_sample": false,
    "weight": 25
  },
  {
    "input": "3,3\n6",
    "expected_output": "0 1",
    "is_sample": false,
    "weight": 25
  },
  {
    "input": "1,5,3,7,9,2\n10",
    "expected_output": "0 4",
    "is_sample": false,
    "weight": 25
  }
]
```

### 4. Solution Code Template

Provide this to students:

```javascript
function solution(input) {
  // Parse input
  const lines = input.split('\n');
  const nums = lines[0].split(',').map(Number);
  const target = parseInt(lines[1]);

  // Your solution here
  // Example: Brute force approach
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) {
        return `${i} ${j}`;
      }
    }
  }

  return "";
}
```

### 5. Test as Student

1. Logout and login as a student (or create a student account)
2. Navigate to Practice Coding section
3. Select the "Two Sum" question
4. Write the solution code
5. Click "Run Code" to test with sample test cases
6. Click "Submit" to run against all test cases

### 6. Expected Results

**After Running:**
- Console shows: "All sample test cases passed!" (if correct)
- Test results show details for sample test case

**After Submitting:**
- Status: "accepted" (if all test cases pass)
- Score: 100 (if all test cases pass)
- Test Cases Passed: 4/4
- Submission saved to database
- Practice progress updated

## Sample Questions to Create

### Question 2: Reverse String

```javascript
{
  "title": "Reverse String",
  "description": "Write a function that reverses a string. The input string is given as a single line.",
  "difficulty": "easy",
  "sample_input": "hello",
  "sample_output": "olleh",
  "testCases": [
    { "input": "hello", "expected_output": "olleh", "is_sample": true, "weight": 50 },
    { "input": "world", "expected_output": "dlrow", "is_sample": false, "weight": 50 }
  ]
}
```

Solution:
```javascript
function solution(input) {
  return input.trim().split('').reverse().join('');
}
```

### Question 3: Fibonacci Number

```javascript
{
  "title": "Fibonacci Number",
  "description": "The Fibonacci numbers form a sequence where each number is the sum of the two preceding ones, starting from 0 and 1. Given n, calculate F(n).",
  "difficulty": "easy",
  "sample_input": "5",
  "sample_output": "5",
  "testCases": [
    { "input": "5", "expected_output": "5", "is_sample": true, "weight": 20 },
    { "input": "10", "expected_output": "55", "is_sample": false, "weight": 20 },
    { "input": "15", "expected_output": "610", "is_sample": false, "weight": 20 },
    { "input": "0", "expected_output": "0", "is_sample": false, "weight": 20 },
    { "input": "1", "expected_output": "1", "is_sample": false, "weight": 20 }
  ]
}
```

Solution:
```javascript
function solution(input) {
  const n = parseInt(input);
  if (n <= 1) return String(n);

  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    [a, b] = [b, a + b];
  }
  return String(b);
}
```

### Question 4: Valid Palindrome

```javascript
{
  "title": "Valid Palindrome",
  "description": "A phrase is a palindrome if it reads the same forward and backward (ignoring spaces, punctuation, and capitalization). Return 'true' if palindrome, 'false' otherwise.",
  "difficulty": "easy",
  "sample_input": "A man a plan a canal Panama",
  "sample_output": "true",
  "testCases": [
    { "input": "A man a plan a canal Panama", "expected_output": "true", "is_sample": true, "weight": 25 },
    { "input": "race a car", "expected_output": "false", "is_sample": false, "weight": 25 },
    { "input": "hello", "expected_output": "false", "is_sample": false, "weight": 25 },
    { "input": "Madam", "expected_output": "true", "is_sample": false, "weight": 25 }
  ]
}
```

Solution:
```javascript
function solution(input) {
  const cleaned = input.toLowerCase().replace(/[^a-z0-9]/g, '');
  return String(cleaned === cleaned.split('').reverse().join(''));
}
```

## Verifying Database Records

### Check Questions
```javascript
db.codingquestions.find({}).pretty()
```

### Check Test Cases
```javascript
db.codingtestcases.find({}).pretty()
```

### Check Submissions
```javascript
db.codingsubmissions.find({}).pretty()
```

### Check Practice Progress
```javascript
db.practicecodingprogresses.find({}).pretty()
```

## Troubleshooting

### Issue: Code doesn't execute
**Solution:** Check if isolated-vm is installed:
```bash
cd server
npm list isolated-vm
```

### Issue: Test cases not showing
**Solution:** Verify test cases were created:
```bash
# In MongoDB
db.codingtestcases.find({ question_id: ObjectId("...") })
```

### Issue: Submission not saved
**Solution:** Check server logs and MongoDB connection

### Issue: Wrong output format
**Solution:** Ensure function returns string or uses console.log

## API Testing with curl

### Create Question
```bash
curl -X POST http://localhost:5000/api/coding/questions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Test Question",
    "description": "Test description",
    "difficulty": "easy",
    "supported_languages": ["javascript"],
    "testCases": [
      {
        "input": "5",
        "expected_output": "5",
        "is_sample": true,
        "weight": 100
      }
    ]
  }'
```

### Run Code
```bash
curl -X POST http://localhost:5000/api/coding/run \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "questionId": "QUESTION_ID",
    "code": "function solution(input) { return input; }",
    "language": "javascript"
  }'
```

### Submit Code
```bash
curl -X POST http://localhost:5000/api/coding/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "questionId": "QUESTION_ID",
    "code": "function solution(input) { return input; }",
    "language": "javascript",
    "isPractice": true
  }'
```

## Success Criteria

1. ✅ Questions can be created and listed
2. ✅ Test cases are associated with questions
3. ✅ Code runs in isolated environment
4. ✅ Sample test cases execute correctly
5. ✅ Submissions are saved with results
6. ✅ Practice progress is tracked
7. ✅ Scores are calculated correctly
8. ✅ Hidden test cases remain hidden from students

## Next Steps

After successful testing:
1. Add more coding questions
2. Create coding sections in tests
3. Configure coding round for assessments
4. Test with multiple students
5. Review analytics and reports
6. Consider adding more languages (Python, Java, C++)

## Support

For issues or questions:
1. Check server logs: `npm run dev` output
2. Check MongoDB logs
3. Check browser console for frontend errors
4. Review MONGODB_CODING_ROUND.md for detailed documentation
