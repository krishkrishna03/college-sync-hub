# Quick Reference: Question Upload & Edit Feature

## For Master Admin Users

### How to Upload Questions from JSON/CSV

#### Step 1: Prepare Your File

**JSON Format:**
```json
[
  {
    "questionText": "Your question here?",
    "options": {
      "A": "First option",
      "B": "Second option",
      "C": "Third option",
      "D": "Fourth option"
    },
    "correctAnswer": "A"
  }
]
```

**CSV Format:**
```csv
question,optionA,optionB,optionC,optionD,correctAnswer
Your question here?,First option,Second option,Third option,Fourth option,A
```

#### Step 2: Upload to Test

**For Multi-Section Tests:**
1. Create/configure your sections first
2. Click "Add Questions" on the section you want to populate
3. Click the green "Upload JSON/CSV" button
4. Select your file
5. Questions automatically added to that section

**For Regular Tests:**
1. In the Questions section of the form
2. Click the green "Upload JSON/CSV" button (next to "Add Question")
3. Select your file
4. Questions automatically added to the test

### How to Edit Questions

1. **Locate the Question**: Find the question you want to edit
2. **Click Edit Icon**: Click the blue pencil icon next to the question
3. **Edit in Modal**:
   - Modify question text
   - Change any options (A, B, C, D)
   - Update correct answer
4. **Save Changes**: Click "Save Changes" button
5. **Or Cancel**: Click "Cancel" to discard edits

### How to Delete Questions

- Click the red trash icon next to any question
- Question is immediately removed
- Frees up a slot for a new question

## Key Features

✅ **Upload Support**: JSON and CSV files
✅ **Section-Specific**: Upload to individual sections
✅ **Edit Anytime**: Modify questions after upload
✅ **Delete Anytime**: Remove unwanted questions
✅ **Validation**: Automatic validation of format
✅ **Smart Limits**: Only adds questions up to configured limit
✅ **Visual Feedback**: Loading states and success messages

## File Requirements

- **Maximum Size**: 5 MB
- **Required Fields**: Question text, all 4 options, correct answer
- **Correct Answer**: Must be A, B, C, or D
- **Format**: Valid JSON or CSV

## Common Use Cases

### Case 1: Creating Assessment with 3 Sections
1. Create test, select "Assessment" type
2. Add 3 sections (Quantitative, Verbal, Reasoning)
3. Upload different JSON files to each section
4. Edit any questions if needed
5. Create test

### Case 2: Creating Practice Test
1. Create test, select "Practice" type
2. Choose subject (e.g., Technical)
3. Upload JSON/CSV with questions
4. Review and edit questions
5. Create test

### Case 3: Mix Upload and Manual Entry
1. Upload bulk questions from file
2. Manually add a few custom questions
3. Edit uploaded questions to refine them
4. Create test

## Troubleshooting

**Problem**: "No valid questions found"
**Solution**: Check your file format matches examples above

**Problem**: "Section already has maximum questions"
**Solution**: Delete some questions or increase section question count

**Problem**: "Invalid correct answer"
**Solution**: Ensure correct answer is exactly A, B, C, or D

**Problem**: File upload doesn't respond
**Solution**: Check file size (must be under 5 MB)

## Sample Files

Use these sample files as templates:
- `sample-questions.json` - In project root
- `sample-questions.csv` - In project root

## Full Documentation

For detailed documentation, see:
- `QUESTION_UPLOAD_FORMAT.md` - Complete format guide
- `TEST_FORM_ENHANCEMENTS.md` - Technical implementation details
