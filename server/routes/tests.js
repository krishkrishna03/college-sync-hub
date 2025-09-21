const express = require('express');
const { body, validationResult } = require('express-validator');
const Test = require('../models/Test');
const Student = require('../models/Student');
const { auth, adminAuth, facultyAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/tests/assigned
// @desc    Get tests assigned to specific student or college
// @access  Private
router.get('/assigned', auth, async (req, res) => {
  try {
    const { studentId, collegeId, batch, branch, section } = req.query;
    
    let filter = { isActive: true };
    
    if (studentId) {
      // Get student details to find their batch/branch/section
      const student = await Student.findById(studentId);
      if (student) {
        filter.$or = [
          { 'assignedTo.batches': student.batch },
          { 'assignedTo.branches': student.branch },
          { 'assignedTo.sections': student.section }
        ];
      }
    } else if (batch || branch || section) {
      filter.$or = [];
      if (batch) filter.$or.push({ 'assignedTo.batches': batch });
      if (branch) filter.$or.push({ 'assignedTo.branches': branch });
      if (section) filter.$or.push({ 'assignedTo.sections': section });
    }

    const tests = await Test.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ tests });
  } catch (error) {
    console.error('Get assigned tests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tests/college/:collegeId
// @desc    Get tests available for a specific college
// @access  Private (Faculty/College Admin)
router.get('/college/:collegeId', auth, async (req, res) => {
  try {
    const { collegeId } = req.params;
    
    // Verify user has access to this college
    if (req.user.role !== 'admin' && req.user.collegeId.toString() !== collegeId) {
      return res.status(403).json({ message: 'Access denied to this college' });
    }

    const tests = await Test.find({ isActive: true })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({ tests });
  } catch (error) {
    console.error('Get college tests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tests
// @desc    Get all tests with filters
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { category, subject, difficulty, status, collegeId, batch, branch, section, page = 1, limit = 10 } = req.query;

    let filter = {};
    
    // Role-based filtering
    if (req.user.role === 'faculty' || req.user.role === 'college-admin') {
      // Faculty and college admins see tests for their college
      const students = await Student.find()
        .populate('userId', 'collegeId')
        .where('userId.collegeId').equals(req.user.collegeId);
      
      const collegeBatches = [...new Set(students.map(s => s.batch))];
      const collegeBranches = [...new Set(students.map(s => s.branch))];
      const collegeSections = [...new Set(students.map(s => s.section))];
      
      filter.$or = [
        { 'assignedTo.batches': { $in: collegeBatches } },
        { 'assignedTo.branches': { $in: collegeBranches } },
        { 'assignedTo.sections': { $in: collegeSections } },
        { 'assignedTo.batches': { $exists: false, $eq: [] } } // Unassigned tests
      ];
    }
    
    if (category) filter.category = category;
    if (subject) filter.subject = subject;
    if (difficulty) filter.difficulty = difficulty;
    if (batch) filter['assignedTo.batches'] = batch;
    if (branch) filter['assignedTo.branches'] = branch;
    if (section) filter['assignedTo.sections'] = section;
    
    if (status) {
      if (status === 'assigned') {
        filter['assignedTo.batches'] = { $exists: true, $ne: [] };
      } else if (status === 'not-assigned') {
        filter['assignedTo.batches'] = { $exists: false };
      }
    }

    const tests = await Test.find(filter)
      .populate('createdBy', 'name email')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Test.countDocuments(filter);

    res.json({
      tests,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get tests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/tests
// @desc    Create new test
// @access  Private (Admin/Faculty)
router.post('/', [auth, facultyAuth], [
  body('title').notEmpty().trim(),
  body('category').isIn(['practice', 'assessment', 'mock', 'company-specific']),
  body('subject').isIn(['arithmetic', 'reasoning', 'verbal', 'technical', 'coding', 'lsrw']),
  body('difficulty').isIn(['easy', 'medium', 'hard']),
  body('duration').isNumeric(),
  body('totalQuestions').isNumeric()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      category,
      subject,
      difficulty,
      duration,
      totalQuestions,
      questions,
      company,
      cutoffMarks,
      instructions
    } = req.body;

    // Generate unique test code
    const testCode = `${subject.toUpperCase().slice(0, 3)}${Date.now().toString().slice(-6)}`;

    const test = new Test({
      title,
      description,
      testCode,
      category,
      subject,
      difficulty,
      duration,
      totalQuestions,
      questions: questions || [],
      company,
      cutoffMarks: cutoffMarks || 0,
      instructions,
      createdBy: req.user._id
    });

    await test.save();

    res.status(201).json({
      message: 'Test created successfully',
      test
    });
  } catch (error) {
    console.error('Create test error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/tests/:id/assign
// @desc    Assign test to batches/branches/sections
// @access  Private (Admin/Faculty)
router.put('/:id/assign', [auth, facultyAuth], async (req, res) => {
  try {
    const { batches, branches, sections } = req.body;
    
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    test.assignedTo = {
      batches: batches || [],
      branches: branches || [],
      sections: sections || []
    };

    await test.save();

    res.json({ message: 'Test assigned successfully' });
  } catch (error) {
    console.error('Assign test error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/tests/:id/results
// @desc    Get test results
// @access  Private
router.get('/:id/results', auth, async (req, res) => {
  try {
    const { batch, section } = req.query;
    
    const test = await Test.findById(req.params.id)
      .populate({
        path: 'results.studentId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      });

    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    let results = test.results;

    // Filter results based on batch and section if provided
    if (batch && batch !== 'all') {
      results = results.filter(result => 
        result.studentId && result.studentId.batch === batch
      );
    }

    if (section && section !== 'all') {
      results = results.filter(result => 
        result.studentId && result.studentId.section === section
      );
    }

    res.json({
      test: {
        id: test._id,
        title: test.title,
        testCode: test.testCode,
        category: test.category,
        cutoffMarks: test.cutoffMarks
      },
      results: results.map(result => ({
        id: result._id,
        student: {
          name: result.studentId?.userId?.name || 'Unknown',
          registrationNumber: result.studentId?.registrationNumber || 'Unknown',
          batch: result.studentId?.batch || 'Unknown',
          branch: result.studentId?.branch || 'Unknown',
          section: result.studentId?.section || 'Unknown'
        },
        score: result.score,
        accuracy: result.accuracy,
        timeTaken: result.timeTaken,
        status: result.status,
        submittedAt: result.submittedAt
      }))
    });
  } catch (error) {
    console.error('Get test results error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/tests/:id/submit
// @desc    Submit test answers
// @access  Private (Student)
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const { answers, timeTaken } = req.body;
    
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Calculate score and accuracy
    let correctAnswers = 0;
    const processedAnswers = answers.map((answer, index) => {
      const question = test.questions[index];
      const isCorrect = question && question.correctAnswer === answer.selectedAnswer;
      if (isCorrect) correctAnswers++;
      
      return {
        questionIndex: index,
        selectedAnswer: answer.selectedAnswer,
        isCorrect,
        timeTaken: answer.timeTaken || 0
      };
    });

    const score = (correctAnswers / test.totalQuestions) * 100;
    const accuracy = (correctAnswers / answers.length) * 100;

    // Add result to test
    test.results.push({
      studentId: student._id,
      score,
      accuracy,
      timeTaken,
      answers: processedAnswers,
      status: 'completed',
      startTime: new Date(Date.now() - timeTaken * 1000),
      endTime: new Date(),
      submittedAt: new Date()
    });

    await test.save();

    // Update student's test results
    student.testResults.push({
      testId: test._id,
      score,
      accuracy,
      timeTaken,
      status: 'completed'
    });

    await student.save();

    res.json({
      message: 'Test submitted successfully',
      result: {
        score,
        accuracy,
        correctAnswers,
        totalQuestions: test.totalQuestions,
        passed: score >= test.cutoffMarks
      }
    });
  } catch (error) {
    console.error('Submit test error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/tests/:id
// @desc    Delete test
// @access  Private (Admin)
router.delete('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const test = await Test.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ message: 'Test not found' });
    }

    await Test.findByIdAndDelete(req.params.id);
    res.json({ message: 'Test deleted successfully' });
  } catch (error) {
    console.error('Delete test error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;