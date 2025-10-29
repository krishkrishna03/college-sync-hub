# Question Upload Format Guide

This guide explains how to upload questions for tests using JSON or CSV files.

## JSON Format

### Structure

The JSON file must contain an array of question objects. Each question object must have:

- `questionText` (string): The question text
- `questionImageUrl` (string, optional): URL or base64 data URL for question image
- `options` (object): An object containing four options (A, B, C, D)
- `optionImages` (object, optional): An object containing image URLs for options (A, B, C, D)
- `correctAnswer` (string): The correct answer (must be 'A', 'B', 'C', or 'D')

### Example JSON File

```json
[
  {
    "questionText": "What is the capital of France?",
    "options": {
      "A": "London",
      "B": "Berlin",
      "C": "Paris",
      "D": "Madrid"
    },
    "correctAnswer": "C"
  },
  {
    "questionText": "Which programming language is known for its use in web development?",
    "options": {
      "A": "Python",
      "B": "JavaScript",
      "C": "C++",
      "D": "Java"
    },
    "correctAnswer": "B"
  },
  {
    "questionText": "Identify the pattern in the following sequence:",
    "questionImageUrl": "https://example.com/pattern.png",
    "options": {
      "A": "Pattern A",
      "B": "Pattern B",
      "C": "Pattern C",
      "D": "Pattern D"
    },
    "optionImages": {
      "A": "https://example.com/option-a.png",
      "B": "https://example.com/option-b.png",
      "C": "https://example.com/option-c.png",
      "D": "https://example.com/option-d.png"
    },
    "correctAnswer": "C"
  }
]
```

**Note on Images**: You can use:
- External URLs (e.g., `https://example.com/image.png`)
- Base64 data URLs (e.g., `data:image/png;base64,iVBORw0KGg...`)
- For base64 images, upload them via the test form UI first to get the data URL

## CSV Format

### Column Headers

The CSV file must have the following columns (in any order):

- `question` or `questionText` or `Question`: The question text
- `optionA` or `option_a` or `A` or `Option A`: Option A text
- `optionB` or `option_b` or `B` or `Option B`: Option B text
- `optionC` or `option_c` or `C` or `Option C`: Option C text
- `optionD` or `option_d` or `D` or `Option D`: Option D text
- `correctAnswer` or `correct_answer` or `answer` or `Answer`: The correct answer (A, B, C, or D)

### Example CSV File

```csv
question,optionA,optionB,optionC,optionD,correctAnswer
What is the capital of France?,London,Berlin,Paris,Madrid,C
Which programming language is known for its use in web development?,Python,JavaScript,C++,Java,B
What does HTML stand for?,Hyper Text Markup Language,High Tech Modern Language,Home Tool Markup Language,Hyperlinks and Text Markup Language,A
```

### Alternative CSV Headers

You can also use these alternative header names:

```csv
Question,Option A,Option B,Option C,Option D,Answer
What is the capital of France?,London,Berlin,Paris,Madrid,C
Which programming language is known for its use in web development?,Python,JavaScript,C++,Java,B
```

## Features

### For Multi-Section Tests

When uploading questions for multi-section tests:

1. Navigate to the section you want to add questions to
2. Click "Add Questions" on the section
3. Click "Upload JSON/CSV" button
4. Select your file
5. Questions will be automatically added to that specific section
6. The system will only add as many questions as available slots in the section

### For Regular Tests

For tests without sections:

1. In the "Questions" section of the test form
2. Click "Upload JSON/CSV" button
3. Select your file
4. Questions will be added to the test
5. The system will only add as many questions as remaining slots

### Edit Individual Questions

After uploading questions (whether from JSON/CSV or manually added):

1. Each question displays an "Edit" button (pencil icon)
2. Click the edit button to modify the question
3. You can change:
   - Question text
   - All four options (A, B, C, D)
   - Correct answer
4. Click "Save Changes" to apply your edits
5. Click "Cancel" to discard changes

### Delete Questions

- Each question has a "Delete" button (trash icon)
- Click it to remove the question from the test
- Deleted questions free up slots for new questions

## Validation Rules

1. **Required Fields**: All fields must be filled
2. **Options**: All four options (A, B, C, D) must be provided
3. **Correct Answer**: Must be one of: A, B, C, or D (case-insensitive in CSV)
4. **Question Limit**: Cannot exceed the configured number of questions
5. **Marks Assignment**: Marks are automatically assigned based on section/test configuration

## File Size Limits

- Maximum file size: 5 MB
- Recommended: Keep files under 1 MB for faster processing

## Tips for Best Results

1. **Test Small First**: Upload a small file (5-10 questions) to verify format
2. **Use Sample Files**: Check the `sample-questions.json` and `sample-questions.csv` files in the project root
3. **Clean Data**: Remove any special characters or formatting that might cause issues
4. **Review After Upload**: Always review uploaded questions before creating the test
5. **Edit If Needed**: Use the edit feature to fix any questions after upload

## Common Errors

### "Invalid question format at index X"
- Check that the question at position X has all required fields
- Ensure options object has all four keys: A, B, C, D

### "No valid questions found in CSV file"
- Verify CSV headers match the supported formats
- Check that all rows have complete data
- Ensure correct answer is A, B, C, or D

### "Section already has maximum questions"
- The section is full, cannot add more questions
- Either delete existing questions or increase section question count

### "Test already has maximum questions"
- The test is full, cannot add more questions
- Either delete existing questions or increase test question count

## Backend API Endpoint

The upload functionality uses the following API endpoint:
- **POST** `/api/tests/extract-file`
- Accepts: JSON and CSV files
- Authentication: Required (Master Admin only)
- Returns: Array of validated question objects

## Example Workflow

### Creating a Multi-Section Test with Uploads

1. Create test with basic information (name, description, dates)
2. Select test type that supports sections (Assessment, Mock Test, or Specific Company Test)
3. Add sections (e.g., "Quantitative", "Verbal", "Logical Reasoning")
4. For each section:
   - Click "Add Questions"
   - Upload a JSON/CSV file with questions for that section
   - Or manually add questions using the form
   - Edit any questions if needed
5. Verify all sections have required number of questions
6. Click "Create Test" to save

The system will validate everything and create the test with all sections and questions properly configured.
