const express = require('express');
const { body, validationResult } = require('express-validator');
const Exam = require('../models/Exam');
const College = require('../models/College');
const AuditLog = require('../models/AuditLog');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/exams
// @desc    Get all exams with filters
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { testType, subject, difficultyLevel, page = 1, limit = 10 } = req.query;

    let filter = { isActive: true };
    if (testType && testType !== 'all') filter.testType = testType;
    if (subject && subject !== 'all') filter.subject = subject;
    if (difficultyLevel && difficultyLevel !== 'all') filter.difficultyLevel = difficultyLevel;

    const exams = await Exam.find(filter)
      .populate('createdBy', 'name email')
      .populate('assignedColleges.collegeId', 'name code')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Exam.countDocuments(filter);

    res.json({
      exams,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get exams error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/exams
// @desc    Create new exam (Master Admin only)
// @access  Private (Master Admin)
router.post('/', [auth, adminAuth], [
  body('title').notEmpty().trim(),
  body('testType').isIn(['Practice', 'Assessment', 'Mock Test', 'Company Specific']),
  body('subject').isIn(['Technical', 'Logical', 'Reasoning', 'Verbal', 'Coding', 'Other']),
  body('difficultyLevel').isIn(['Easy', 'Medium', 'Hard']),
  body('numberOfQuestions').isNumeric(),
  body('duration').isNumeric()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      description,
      testType,
      subject,
      skills,
      numberOfQuestions,
      difficultyLevel,
      duration,
      instructions,
      questions
    } = req.body;

    const exam = new Exam({
      title,
      description,
      testType,
      subject,
      skills: skills || [],
      numberOfQuestions,
      difficultyLevel,
      duration,
      instructions,
      questions: questions || [],
      createdBy: req.user._id
    });

    await exam.save();

    // Create audit log
    await AuditLog.create({
      action: 'Created new exam',
      details: `Exam "${title}" created with ${numberOfQuestions} questions`,
      user: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      type: 'create',
      entityType: 'exam',
      entityId: exam._id.toString()
    });

    res.status(201).json({
      message: 'Exam created successfully',
      exam
    });
  } catch (error) {
    console.error('Create exam error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/exams/:id
// @desc    Update exam
// @access  Private (Master Admin)
router.put('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        exam[key] = req.body[key];
      }
    });

    await exam.save();

    // Create audit log
    await AuditLog.create({
      action: 'Updated exam',
      details: `Exam "${exam.title}" was updated`,
      user: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      type: 'update',
      entityType: 'exam',
      entityId: exam._id.toString()
    });

    res.json({ message: 'Exam updated successfully' });
  } catch (error) {
    console.error('Update exam error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/exams/:id
// @desc    Delete exam
// @access  Private (Master Admin)
router.delete('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    await Exam.findByIdAndDelete(req.params.id);

    // Create audit log
    await AuditLog.create({
      action: 'Deleted exam',
      details: `Exam "${exam.title}" was deleted`,
      user: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      type: 'delete',
      entityType: 'exam',
      entityId: exam._id.toString()
    });

    res.json({ message: 'Exam deleted successfully' });
  } catch (error) {
    console.error('Delete exam error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/exams/:id/assign
// @desc    Assign exam to colleges
// @access  Private (Master Admin)
router.post('/:id/assign', [auth, adminAuth], async (req, res) => {
  try {
    const { collegeIds, batches, branches, sections, startDate, endDate, startTime, endTime } = req.body;
    
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Add assignments for each college
    for (const collegeId of collegeIds) {
      const existingAssignment = exam.assignedColleges.find(
        assignment => assignment.collegeId.toString() === collegeId
      );

      if (!existingAssignment) {
        exam.assignedColleges.push({
          collegeId,
          batches: batches || [],
          branches: branches || [],
          sections: sections || [],
          startDate: startDate ? new Date(startDate) : new Date(),
          endDate: endDate ? new Date(endDate) : new Date(),
          startTime: startTime || '',
          endTime: endTime || ''
        });
      }
    }

    await exam.save();

    // Create audit log
    await AuditLog.create({
      action: 'Assigned exam to colleges',
      details: `Exam "${exam.title}" assigned to ${collegeIds.length} college(s)`,
      user: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      type: 'assign',
      entityType: 'exam',
      entityId: exam._id.toString(),
      metadata: { collegeIds, batches, branches, sections }
    });

    res.json({ message: 'Exam assigned successfully' });
  } catch (error) {
    console.error('Assign exam error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/exams/:id/reports
// @desc    Get exam reports
// @access  Private
router.get('/:id/reports', auth, async (req, res) => {
  try {
    const { collegeId, batch, branch, section } = req.query;
    
    const exam = await Exam.findById(req.params.id)
      .populate({
        path: 'results.studentId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      })
      .populate('results.collegeId', 'name code');

    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    let results = exam.results;

    // Apply filters
    if (collegeId && collegeId !== 'all') {
      results = results.filter(result => 
        result.collegeId && result.collegeId._id.toString() === collegeId
      );
    }

    if (batch && batch !== 'all') {
      results = results.filter(result => 
        result.studentId && result.studentId.batch === batch
      );
    }

    if (branch && branch !== 'all') {
      results = results.filter(result => 
        result.studentId && result.studentId.branch === branch
      );
    }

    if (section && section !== 'all') {
      results = results.filter(result => 
        result.studentId && result.studentId.section === section
      );
    }

    res.json({
      exam: {
        id: exam._id,
        title: exam.title,
        testType: exam.testType,
        subject: exam.subject,
        totalQuestions: exam.numberOfQuestions,
        duration: exam.duration
      },
      results: results.map(result => ({
        id: result._id,
        student: {
          name: result.studentId?.userId?.name || 'Unknown',
          email: result.studentId?.userId?.email || 'Unknown',
          registrationNumber: result.studentId?.registrationNumber || 'Unknown',
          batch: result.studentId?.batch || 'Unknown',
          branch: result.studentId?.branch || 'Unknown',
          section: result.studentId?.section || 'Unknown'
        },
        college: {
          name: result.collegeId?.name || 'Unknown',
          code: result.collegeId?.code || 'Unknown'
        },
        score: result.score,
        accuracy: result.accuracy,
        timeTaken: result.timeTaken,
        status: result.status,
        submittedAt: result.submittedAt
      }))
    });
  } catch (error) {
    console.error('Get exam reports error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;