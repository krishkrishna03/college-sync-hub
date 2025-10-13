const express = require('express');
const multer = require('multer');
const path = require('path');
const Test = require('../models/Test');
const TestAssignment = require('../models/TestAssignment');
const TestAttempt = require('../models/TestAttempt');
const College = require('../models/College');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const emailService = require('../utils/emailService');
const PDFExtractor = require('../utils/pdfExtractor');
const FileExtractor = require('../utils/fileExtractor');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Configure multer for file uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

const fileUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/json', 'text/csv', 'application/vnd.ms-excel'];
    if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only JSON and CSV files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Create test (Master Admin only)
router.post('/', auth, authorize('master_admin'), [
  body('testName').trim().isLength({ min: 3 }).withMessage('Test name must be at least 3 characters'),
  body('testDescription').trim().isLength({ min: 10 }).withMessage('Test description must be at least 10 characters'),
  body('subject').isIn(['Verbal', 'Reasoning', 'Technical', 'Arithmetic', 'Communication']).withMessage('Invalid subject'),
  body('testType').optional().isIn(['Assessment', 'Practice', 'Assignment', 'Mock Test', 'Specific Company Test']).withMessage('Invalid test type'),
  body('topics').optional().isArray().withMessage('Topics must be an array'),
  body('difficulty').optional().isIn(['Easy', 'Medium', 'Hard']).withMessage('Invalid difficulty'),
  body('numberOfQuestions').isInt({ min: 1, max: 100 }).withMessage('Number of questions must be between 1 and 100'),
  body('marksPerQuestion').isInt({ min: 1, max: 10 }).withMessage('Marks per question must be between 1 and 10'),
  body('duration').isInt({ min: 5, max: 300 }).withMessage('Duration must be between 5 and 300 minutes'),
  body('startDateTime').isISO8601().withMessage('Invalid start date format'),
  body('endDateTime').isISO8601().withMessage('Invalid end date format'),
  body('questions').isArray({ min: 1 }).withMessage('At least one question is required')
], async (req, res) => {
  try {
    console.log('Received test creation request');
    console.log('Request body keys:', Object.keys(req.body));
    console.log('Test name:', req.body.testName);
    console.log('Questions count:', req.body.questions?.length);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', JSON.stringify(errors.array(), null, 2));
      return res.status(400).json({
        error: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      testName,
      testDescription,
      subject,
      testType = 'Assessment',
      companyName,
      topics = [],
      difficulty = 'Medium',
      numberOfQuestions,
      marksPerQuestion,
      duration,
      startDateTime,
      endDateTime,
      questions
    } = req.body;

    // Validate companyName for Specific Company Test
    if (testType === 'Specific Company Test' && (!companyName || !companyName.trim())) {
      return res.status(400).json({
        error: 'Company name is required for Specific Company tests'
      });
    }

    // Validate questions
    if (questions.length !== numberOfQuestions) {
      console.log('Question count mismatch:', questions.length, 'vs', numberOfQuestions);
      return res.status(400).json({ 
        error: `Number of questions (${questions.length}) must match the specified count (${numberOfQuestions})` 
      });
    }

    // Validate each question
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      if (!question.questionText || !question.options || !question.correctAnswer) {
        console.log('Question validation failed at index:', i, question);
        return res.status(400).json({ 
          error: `Question ${i + 1} is incomplete` 
        });
      }
      
      if (!question.options.A || !question.options.B || !question.options.C || !question.options.D) {
        console.log('Question options validation failed at index:', i, question.options);
        return res.status(400).json({ 
          error: `Question ${i + 1} must have all four options (A, B, C, D)` 
        });
      }
      
      if (!['A', 'B', 'C', 'D'].includes(question.correctAnswer)) {
        console.log('Correct answer validation failed at index:', i, question.correctAnswer);
        return res.status(400).json({ 
          error: `Question ${i + 1} must have a valid correct answer (A, B, C, or D)` 
        });
      }

      // Add marks to each question
      question.marks = marksPerQuestion;
    }

    console.log('Creating test with validated data');
    console.log('Start DateTime received:', startDateTime);
    console.log('End DateTime received:', endDateTime);

    const test = new Test({
      testName,
      testDescription,
      subject,
      testType,
      companyName: companyName || null,
      topics,
      difficulty,
      numberOfQuestions,
      marksPerQuestion,
      duration,
      startDateTime: new Date(startDateTime),
      endDateTime: new Date(endDateTime),
      questions,
      createdBy: req.user._id
    });

    await test.save();
    console.log('Test created successfully:', test._id);

    res.status(201).json({
      message: 'Test created successfully',
      test: {
        id: test._id,
        testName: test.testName,
        testType: test.testType,
        companyName: test.companyName,
        subject: test.subject,
        topics: test.topics,
        difficulty: test.difficulty,
        numberOfQuestions: test.numberOfQuestions,
        totalMarks: test.totalMarks,
        duration: test.duration,
        startDateTime: test.startDateTime,
        endDateTime: test.endDateTime,
        createdAt: test.createdAt
      }
    });

  } catch (error) {
    console.error('Create test error:', error.message, error.stack);
    res.status(500).json({ error: 'Server error' });
  }
});

// Extract questions from PDF
router.post('/extract-pdf', auth, authorize('master_admin'), upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'PDF file is required' });
    }

    console.log('Processing PDF file:', req.file.originalname, 'Size:', req.file.size);

    const questions = await PDFExtractor.extractMCQs(req.file.buffer);
    
    if (questions.length === 0) {
      return res.status(400).json({ 
        error: 'No valid MCQ questions found in the PDF. Please ensure your PDF contains:\n• Numbered questions (1., 2., etc.)\n• Options labeled A), B), C), D)\n• Clear answer indicators (Answer: A, Correct: B, etc.)' 
      });
    }

    console.log('Successfully extracted questions:', questions.length);

    res.json({
      message: `Successfully extracted ${questions.length} questions`,
      questions: questions.map(q => ({
        ...q,
        marks: 1 // Default marks, can be changed later
      }))
    });

  } catch (error) {
    console.error('PDF extraction error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to process PDF. Please ensure the PDF is not corrupted and contains readable text.' 
    });
  }
});

// Generate sample questions
router.get('/sample-questions/:subject', auth, authorize('master_admin'), async (req, res) => {
  try {
    const { subject } = req.params;
    const count = parseInt(req.query.count) || 5;

    const questions = PDFExtractor.generateSampleQuestions(count, subject);

    res.json({
      message: `Generated ${questions.length} sample questions for ${subject}`,
      questions: questions.map(q => ({
        ...q,
        marks: 1
      }))
    });

  } catch (error) {
    console.error('Sample questions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Extract questions from JSON/CSV file
router.post('/extract-file', auth, authorize('master_admin'), fileUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'File is required' });
    }

    const fileExtension = path.extname(req.file.originalname).toLowerCase();

    let questions = [];

    if (fileExtension === '.json') {
      questions = await FileExtractor.extractFromJSON(req.file.buffer);
    } else if (fileExtension === '.csv') {
      questions = await FileExtractor.extractFromCSV(req.file.buffer);
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    res.json({
      message: `Successfully extracted ${questions.length} questions from ${fileExtension.toUpperCase()} file`,
      questions: questions.map(q => ({
        ...q,
        marks: 1
      }))
    });

  } catch (error) {
    console.error('File extraction error:', error);
    res.status(500).json({
      error: error.message || 'Failed to extract questions from file',
      details: error.toString()
    });
  }
});

// Get all tests (Master Admin only)
router.get('/', auth, authorize('master_admin'), async (req, res) => {
  try {
    const { testType, subject } = req.query;
    
    let query = { isActive: true };
    
    if (testType && testType !== 'all') {
      query.testType = testType;
    }
    
    if (subject && subject !== 'all') {
      query.subject = subject;
    }
    
    const tests = await Test.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(tests);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get test by ID with questions (Master Admin only)
router.get('/:id', auth, authorize('master_admin'), async (req, res) => {
  try {
    const test = await Test.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    res.json(test);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Assign test to college (Master Admin only)
router.post('/:id/assign-college', auth, authorize('master_admin'), [
  body('collegeIds').isArray({ min: 1 })
], async (req, res) => {
  try {
    const { collegeIds } = req.body;
    const testId = req.params.id;

    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    const colleges = await College.find({ _id: { $in: collegeIds }, isActive: true });
    if (colleges.length !== collegeIds.length) {
      return res.status(400).json({ error: 'Some colleges not found or inactive' });
    }

    const assignments = [];
    for (const college of colleges) {
      // Check if already assigned
      const existingAssignment = await TestAssignment.findOne({
        testId,
        collegeId: college._id,
        isActive: true
      });

      if (!existingAssignment) {
        const assignment = new TestAssignment({
          testId,
          collegeId: college._id,
          assignedBy: req.user._id,
          assignedTo: 'college'
        });

        await assignment.save();
        assignments.push(assignment);

        // Send email notification
        const collegeAdmin = await User.findById(college.adminId);
        if (collegeAdmin) {
          await emailService.sendTestAssignmentNotification(
            collegeAdmin.email,
            collegeAdmin.name,
            test.testName,
            college.name,
            test.startDateTime,
            test.endDateTime
          );
        }
      }
    }

    res.json({
      message: `Test assigned to ${assignments.length} colleges successfully`,
      assignments: assignments.length
    });

  } catch (error) {
    console.error('Assign test error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get colleges assigned to a specific test (Master Admin)
router.get('/:id/assigned-colleges', auth, authorize('master_admin'), async (req, res) => {
  try {
    const testId = req.params.id;

    const assignments = await TestAssignment.find({
      testId: testId,
      assignedTo: 'college',
      isActive: true
    })
    .populate('collegeId', 'name code email')
    .select('collegeId status assignedAt');

    res.json(assignments);
  } catch (error) {
    console.error('Get test assigned colleges error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all tests with assignment status for college (College Admin and Faculty)
router.get('/college/all-tests', auth, authorize('college_admin', 'faculty'), async (req, res) => {
  try {
    const { testType, subject } = req.query;

    let query = {};
    if (testType && testType !== 'all') {
      query.testType = testType;
    }
    if (subject && subject !== 'all') {
      query.subject = subject;
    }

    const allTests = await Test.find(query).sort({ createdAt: -1 });

    const assignments = await TestAssignment.find({
      collegeId: req.user.collegeId,
      assignedTo: 'college',
      isActive: true
    }).select('testId status assignedAt assignedBy').populate('assignedBy', 'name email');

    const assignmentMap = new Map();
    assignments.forEach(assignment => {
      if (assignment.testId) {
        assignmentMap.set(assignment.testId.toString(), {
          status: assignment.status,
          assignedAt: assignment.assignedAt,
          assignedBy: assignment.assignedBy,
          assignmentId: assignment._id
        });
      }
    });

    const testsWithStatus = allTests.map(test => {
      const assignment = assignmentMap.get(test._id.toString());
      return {
        ...test.toObject(),
        assignmentStatus: assignment ? assignment.status : 'not_assigned',
        assignedAt: assignment ? assignment.assignedAt : null,
        assignedBy: assignment ? assignment.assignedBy : null,
        assignmentId: assignment ? assignment.assignmentId : null
      };
    });

    res.json(testsWithStatus);
  } catch (error) {
    console.error('Get all tests for college error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get assigned tests for college (College Admin and Faculty)
router.get('/college/assigned', auth, authorize('college_admin', 'faculty'), async (req, res) => {
  try {
    const { testType, subject } = req.query;

    const assignments = await TestAssignment.find({
      collegeId: req.user.collegeId,
      assignedTo: 'college',
      isActive: true
    })
    .populate('testId')
    .populate('assignedBy', 'name email')
    .sort({ createdAt: -1 });

    // Filter out assignments where testId is null (test was deleted)
    let filteredAssignments = assignments.filter(assignment => assignment.testId !== null);

    if (testType && testType !== 'all') {
      filteredAssignments = filteredAssignments.filter(assignment =>
        assignment.testId && assignment.testId.testType === testType
      );
    }

    if (subject && subject !== 'all') {
      filteredAssignments = filteredAssignments.filter(assignment =>
        assignment.testId && assignment.testId.subject === subject
      );
    }

    res.json(filteredAssignments);
  } catch (error) {
    console.error('Get assigned tests error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Accept/Reject test assignment (College Admin)
router.put('/assignment/:id/status', auth, authorize('college_admin'), [
  body('status').isIn(['accepted', 'rejected'])
], async (req, res) => {
  try {
    const { status } = req.body;
    const assignment = await TestAssignment.findOne({
      _id: req.params.id,
      collegeId: req.user.collegeId
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    assignment.status = status;
    if (status === 'accepted') {
      assignment.acceptedAt = new Date();
    } else {
      assignment.rejectedAt = new Date();
    }

    await assignment.save();

    res.json({
      message: `Test assignment ${status} successfully`,
      assignment
    });

  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Assign test to students (College Admin)
router.post('/assignment/:id/assign-students', auth, authorize('college_admin'), [
  body('branches').optional().isArray(),
  body('batches').optional().isArray(),
  body('sections').optional().isArray(),
  body('specificStudents').optional().isArray()
], async (req, res) => {
  try {
    const { branches, batches, sections, specificStudents } = req.body;
    const assignmentId = req.params.id;

    const assignment = await TestAssignment.findOne({
      _id: assignmentId,
      collegeId: req.user.collegeId,
      status: 'accepted'
    }).populate('testId');

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found or not accepted' });
    }

    // Build student query
    let studentQuery = {
      collegeId: req.user.collegeId,
      role: 'student',
      isActive: true
    };

    if (branches && branches.length > 0) {
      studentQuery.branch = { $in: branches };
    }
    if (batches && batches.length > 0) {
      studentQuery.batch = { $in: batches };
    }
    if (sections && sections.length > 0) {
      studentQuery.section = { $in: sections };
    }
    if (specificStudents && specificStudents.length > 0) {
      studentQuery._id = { $in: specificStudents };
    }

    const students = await User.find(studentQuery);

    if (students.length === 0) {
      return res.status(400).json({ error: 'No students found matching the criteria' });
    }

    // Create student assignments
    const studentAssignments = [];
    for (const student of students) {
      const studentAssignment = new TestAssignment({
        testId: assignment.testId._id,
        collegeId: req.user.collegeId,
        assignedBy: req.user._id,
        assignedTo: 'students',
        studentFilters: {
          specificStudents: [student._id]
        },
        status: 'accepted' // Students don't need to accept
      });

      await studentAssignment.save();
      studentAssignments.push(studentAssignment);

      // Send email notification to student
      await emailService.sendTestAssignmentToStudent(
        student.email,
        student.name,
        assignment.testId.testName,
        assignment.testId.startDateTime,
        assignment.testId.endDateTime,
        assignment.testId.duration
      );
    }

    res.json({
      message: `Test assigned to ${students.length} students successfully`,
      studentsAssigned: students.length
    });

  } catch (error) {
    console.error('Assign to students error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get assigned tests for student
router.get('/student/assigned', auth, authorize('student'), async (req, res) => {
  try {
    const { testType, subject } = req.query;
    
    const assignments = await TestAssignment.find({
      'studentFilters.specificStudents': req.user._id,
      assignedTo: 'students',
      status: 'accepted',
      isActive: true
    })
    .populate('testId')
    .sort({ createdAt: -1 });

    // Check if student has already attempted each test
    const testsWithAttempts = await Promise.all(
      assignments.map(async (assignment) => {
        const attempt = await TestAttempt.findOne({
          testId: assignment.testId._id,
          studentId: req.user._id
        });

        return {
          ...assignment.toObject(),
          hasAttempted: !!attempt,
          attempt: attempt
        };
      })
    );

    // Filter by test type and subject if provided
    let filteredTests = testsWithAttempts;
    
    if (testType && testType !== 'all') {
      filteredTests = filteredTests.filter(test => 
        test.testId.testType === testType
      );
    }
    
    if (subject && subject !== 'all') {
      filteredTests = filteredTests.filter(test => 
        test.testId.subject === subject
      );
    }
    res.json(filteredTests);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Start test (Student)
router.post('/:id/start', auth, authorize('student'), async (req, res) => {
  try {
    const testId = req.params.id;
    
    // Check if test is assigned to student
    const assignment = await TestAssignment.findOne({
      testId,
      'studentFilters.specificStudents': req.user._id,
      status: 'accepted',
      isActive: true
    });

    if (!assignment) {
      return res.status(403).json({ error: 'Test not assigned to you' });
    }

    // Check if already attempted
    const existingAttempt = await TestAttempt.findOne({
      testId,
      studentId: req.user._id
    });

    if (existingAttempt) {
      return res.status(400).json({ error: 'Test already attempted' });
    }

    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    // Check if test is currently active
    const now = new Date();
    if (now < test.startDateTime) {
      return res.status(400).json({ error: 'Test has not started yet' });
    }
    if (now > test.endDateTime) {
      return res.status(400).json({ error: 'Test has ended' });
    }

    // Return test questions (include correctAnswer for Practice tests only)
    const testForStudent = {
      _id: test._id,
      testName: test.testName,
      testDescription: test.testDescription,
      subject: test.subject,
      testType: test.testType,
      numberOfQuestions: test.numberOfQuestions,
      marksPerQuestion: test.marksPerQuestion,
      totalMarks: test.totalMarks,
      duration: test.duration,
      startDateTime: test.startDateTime,
      endDateTime: test.endDateTime,
      questions: test.questions.map(q => {
        const questionData = {
          _id: q._id,
          questionText: q.questionText,
          options: q.options,
          marks: q.marks
        };

        // Include correct answer for Practice tests
        if (test.testType === 'Practice') {
          questionData.correctAnswer = q.correctAnswer;
        }

        return questionData;
      })
    };

    res.json({
      message: 'Test started successfully',
      test: testForStudent,
      startTime: now
    });

  } catch (error) {
    console.error('Start test error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit test (Student)
router.post('/:id/submit', auth, authorize('student'), [
  body('answers').isArray({ min: 1 }),
  body('startTime').isISO8601(),
  body('timeSpent').isInt({ min: 1 }),
  body('violations').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const { answers, startTime, timeSpent, violations = 0 } = req.body;
    const testId = req.params.id;

    // Verify test assignment
    const assignment = await TestAssignment.findOne({
      testId,
      'studentFilters.specificStudents': req.user._id,
      status: 'accepted',
      isActive: true
    });

    if (!assignment) {
      return res.status(403).json({ error: 'Test not assigned to you' });
    }

    // Check if already attempted
    const existingAttempt = await TestAttempt.findOne({
      testId,
      studentId: req.user._id
    });

    if (existingAttempt) {
      return res.status(400).json({ error: 'Test already submitted' });
    }

    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    // Validate answers
    if (answers.length !== test.numberOfQuestions) {
      return res.status(400).json({ error: 'All questions must be answered' });
    }

    // Calculate results
    const processedAnswers = [];
    for (let i = 0; i < answers.length; i++) {
      const answer = answers[i];
      const question = test.questions.find(q => q._id.toString() === answer.questionId);
      
      if (!question) {
        return res.status(400).json({ error: `Invalid question ID: ${answer.questionId}` });
      }

      const isCorrect = question.correctAnswer === answer.selectedAnswer;
      const marksObtained = isCorrect ? question.marks : 0;

      processedAnswers.push({
        questionId: question._id,
        selectedAnswer: answer.selectedAnswer,
        isCorrect,
        marksObtained,
        timeSpent: answer.timeSpent || 0
      });
    }

    // Determine status based on violations
    let status = 'completed';
    if (violations >= 3) {
      status = 'auto-submitted-violations';
    }

    // Create test attempt
    const testAttempt = new TestAttempt({
      testId,
      studentId: req.user._id,
      collegeId: req.user.collegeId,
      startTime: new Date(startTime),
      endTime: new Date(),
      timeSpent,
      answers: processedAnswers,
      totalMarks: test.totalMarks,
      violations,
      status
    });

    await testAttempt.save();

    // Return results based on test type
    const responseData = {
      message: 'Test submitted successfully',
      testType: test.testType,
      results: {
        totalMarks: testAttempt.totalMarks,
        marksObtained: testAttempt.marksObtained,
        percentage: testAttempt.percentage,
        correctAnswers: testAttempt.correctAnswers,
        incorrectAnswers: testAttempt.incorrectAnswers,
        timeSpent: testAttempt.timeSpent,
        submittedAt: testAttempt.createdAt
      }
    };

    // For Practice tests, include immediate feedback
    if (test.testType === 'Practice') {
      responseData.instantFeedback = processedAnswers.map((answer, index) => ({
        questionId: answer.questionId,
        question: test.questions[index],
        selectedAnswer: answer.selectedAnswer,
        correctAnswer: test.questions[index].correctAnswer,
        isCorrect: answer.isCorrect,
        explanation: `The correct answer is ${test.questions[index].correctAnswer}: ${test.questions[index].options[test.questions[index].correctAnswer]}`
      }));
    }

    res.json(responseData);

  } catch (error) {
    console.error('Submit test error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get test results for student
router.get('/:id/results', auth, authorize('student'), async (req, res) => {
  try {
    const testId = req.params.id;
    
    const attempt = await TestAttempt.findOne({
      testId,
      studentId: req.user._id
    }).populate('testId', 'testName subject totalMarks questions');

    if (!attempt) {
      return res.status(404).json({ error: 'Test attempt not found' });
    }

    // Include correct answers for review
    const detailedResults = {
      ...attempt.toObject(),
      questionAnalysis: attempt.testId.questions.map(question => {
        const studentAnswer = attempt.answers.find(a => 
          a.questionId.toString() === question._id.toString()
        );
        
        return {
          questionText: question.questionText,
          options: question.options,
          correctAnswer: question.correctAnswer,
          studentAnswer: studentAnswer?.selectedAnswer,
          isCorrect: studentAnswer?.isCorrect,
          marksObtained: studentAnswer?.marksObtained,
          marks: question.marks
        };
      })
    };

    res.json(detailedResults);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update test (Master Admin only)
router.put('/:id', auth, authorize('master_admin'), [
  body('testName').trim().isLength({ min: 3 }),
  body('testDescription').trim().isLength({ min: 10 }),
  body('subject').isIn(['Verbal', 'Reasoning', 'Technical', 'Arithmetic', 'Communication']),
  body('testType').optional().isIn(['Assessment', 'Practice', 'Assignment', 'Mock Test', 'Specific Company Test']),
  body('numberOfQuestions').isInt({ min: 1, max: 100 }),
  body('marksPerQuestion').isInt({ min: 1, max: 10 }),
  body('duration').isInt({ min: 5, max: 300 }),
  body('startDateTime').isISO8601(),
  body('endDateTime').isISO8601(),
  body('questions').isArray({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const testId = req.params.id;
    const updateData = req.body;

    // Validate questions count
    if (updateData.questions.length !== updateData.numberOfQuestions) {
      return res.status(400).json({ 
        error: `Number of questions (${updateData.questions.length}) must match the specified count (${updateData.numberOfQuestions})` 
      });
    }

    // Add marks to each question
    updateData.questions.forEach(question => {
      question.marks = updateData.marksPerQuestion;
    });

    const test = await Test.findByIdAndUpdate(
      testId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    res.json({
      message: 'Test updated successfully',
      test
    });

  } catch (error) {
    console.error('Update test error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete test (Master Admin only)
router.delete('/:id', auth, authorize('master_admin'), async (req, res) => {
  try {
    const testId = req.params.id;

    // Check if test has attempts
    const attemptCount = await TestAttempt.countDocuments({ testId });
    if (attemptCount > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete test with existing attempts. Test has been taken by students.' 
      });
    }

    // Check if test has assignments
    const assignmentCount = await TestAssignment.countDocuments({ testId });
    if (assignmentCount > 0) {
      // Delete assignments first
      await TestAssignment.deleteMany({ testId });
    }

    const test = await Test.findByIdAndDelete(testId);
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    res.json({ message: 'Test deleted successfully' });

  } catch (error) {
    console.error('Delete test error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get student test reports (Student)
router.get('/student/reports', auth, authorize('student'), async (req, res) => {
  try {
    const { testType, subject } = req.query;

    let query = {
      studentId: req.user._id,
      status: 'completed'
    };

    const attempts = await TestAttempt.find(query)
      .populate({
        path: 'testId',
        select: 'testName testType subject totalMarks difficulty companyName questions'
      })
      .sort({ createdAt: -1 });

    let filteredAttempts = attempts;

    if (testType && testType !== 'all') {
      filteredAttempts = filteredAttempts.filter(attempt =>
        attempt.testId && attempt.testId.testType === testType
      );
    }

    if (subject && subject !== 'all') {
      filteredAttempts = filteredAttempts.filter(attempt =>
        attempt.testId && attempt.testId.subject === subject
      );
    }

    const reports = filteredAttempts.map(attempt => ({
      _id: attempt._id,
      testId: {
        testName: attempt.testId?.testName || 'Unknown Test',
        testType: attempt.testId?.testType || 'Unknown',
        subject: attempt.testId?.subject || 'Unknown',
        companyName: attempt.testId?.companyName,
        difficulty: attempt.testId?.difficulty,
        totalMarks: attempt.totalMarks,
        questions: attempt.testId?.questions || []
      },
      studentId: {
        name: req.user.name,
        email: req.user.email,
        batch: req.user.batch,
        branch: req.user.branch,
        section: req.user.section
      },
      testName: attempt.testId?.testName || 'Unknown Test',
      testType: attempt.testId?.testType || 'Unknown',
      subject: attempt.testId?.subject || 'Unknown',
      companyName: attempt.testId?.companyName,
      difficulty: attempt.testId?.difficulty,
      totalMarks: attempt.totalMarks,
      marksObtained: attempt.marksObtained,
      percentage: attempt.percentage,
      correctAnswers: attempt.correctAnswers,
      incorrectAnswers: attempt.incorrectAnswers,
      timeSpent: attempt.timeSpent,
      status: attempt.percentage >= 40 ? 'Pass' : 'Fail',
      completedAt: attempt.createdAt,
      startTime: attempt.startTime,
      endTime: attempt.endTime,
      createdAt: attempt.createdAt,
      questionAnalysis: attempt.testId?.questions?.map((question, index) => {
        const studentAnswer = attempt.answers.find(a =>
          a.questionId.toString() === question._id.toString()
        );

        return {
          questionText: question.questionText,
          options: question.options,
          correctAnswer: question.correctAnswer,
          studentAnswer: studentAnswer?.selectedAnswer || 'Not answered',
          isCorrect: studentAnswer?.isCorrect || false,
          marksObtained: studentAnswer?.marksObtained || 0,
          marks: question.marks
        };
      }) || []
    }));

    res.json(reports);
  } catch (error) {
    console.error('Get student reports error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all students test reports (Faculty and College Admin)
router.get('/faculty/student-reports', auth, authorize('faculty', 'college_admin'), async (req, res) => {
  try {
    const { testType, subject, studentName, batch, branch, section } = req.query;

    let userQuery = {
      collegeId: req.user.collegeId,
      role: 'student',
      isActive: true
    };

    if (batch) userQuery.batch = batch;
    if (branch) userQuery.branch = branch;
    if (section) userQuery.section = section;
    if (studentName) {
      userQuery.name = { $regex: studentName, $options: 'i' };
    }

    const students = await User.find(userQuery).select('_id name email batch branch section');

    if (students.length === 0) {
      return res.json([]);
    }

    const studentIds = students.map(s => s._id);

    const attempts = await TestAttempt.find({
      studentId: { $in: studentIds },
      status: 'completed'
    })
    .populate({
      path: 'testId',
      select: 'testName testType subject totalMarks difficulty companyName'
    })
    .populate({
      path: 'studentId',
      select: 'name email batch branch section'
    })
    .sort({ createdAt: -1 });

    let filteredAttempts = attempts;

    if (testType && testType !== 'all') {
      filteredAttempts = filteredAttempts.filter(attempt =>
        attempt.testId && attempt.testId.testType === testType
      );
    }

    if (subject && subject !== 'all') {
      filteredAttempts = filteredAttempts.filter(attempt =>
        attempt.testId && attempt.testId.subject === subject
      );
    }

    const reports = filteredAttempts.map(attempt => ({
      _id: attempt._id,
      studentName: attempt.studentId?.name || 'Unknown',
      studentEmail: attempt.studentId?.email || 'Unknown',
      batch: attempt.studentId?.batch,
      branch: attempt.studentId?.branch,
      section: attempt.studentId?.section,
      testName: attempt.testId?.testName || 'Unknown Test',
      testType: attempt.testId?.testType || 'Unknown',
      subject: attempt.testId?.subject || 'Unknown',
      companyName: attempt.testId?.companyName,
      difficulty: attempt.testId?.difficulty,
      totalMarks: attempt.totalMarks,
      marksObtained: attempt.marksObtained,
      percentage: attempt.percentage,
      correctAnswers: attempt.correctAnswers,
      incorrectAnswers: attempt.incorrectAnswers,
      timeSpent: attempt.timeSpent,
      status: attempt.percentage >= 40 ? 'Pass' : 'Fail',
      completedAt: attempt.createdAt,
      startTime: attempt.startTime,
      endTime: attempt.endTime
    }));

    res.json(reports);
  } catch (error) {
    console.error('Get faculty student reports error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;