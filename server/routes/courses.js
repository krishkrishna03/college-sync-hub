const express = require('express');
const { body, validationResult } = require('express-validator');
const Course = require('../models/Course');
const Student = require('../models/Student');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/courses
// @desc    Get all courses
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { category, level, search, page = 1, limit = 10 } = req.query;

    let filter = { isActive: true };
    
    if (category && category !== 'all') filter.category = category;
    if (level && level !== 'all') filter.level = level;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const courses = await Course.find(filter)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Course.countDocuments(filter);

    res.json({
      courses,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/courses
// @desc    Create new course
// @access  Private (Admin)
router.post('/', [auth, adminAuth], [
  body('title').notEmpty().trim(),
  body('category').notEmpty(),
  body('level').isIn(['beginner', 'intermediate', 'advanced'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const course = new Course(req.body);
    await course.save();

    res.status(201).json({
      message: 'Course created successfully',
      course
    });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/courses/:id
// @desc    Get course by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('enrolledStudents.studentId', 'registrationNumber userId')
      .populate({
        path: 'enrolledStudents.studentId',
        populate: {
          path: 'userId',
          select: 'name email'
        }
      });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/courses/:id/enroll
// @desc    Enroll student in course
// @access  Private (Student)
router.post('/:id/enroll', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check if already enrolled
    const alreadyEnrolled = course.enrolledStudents.some(
      enrollment => enrollment.studentId.toString() === student._id.toString()
    );

    if (alreadyEnrolled) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Enroll student
    course.enrolledStudents.push({
      studentId: student._id,
      enrolledDate: new Date(),
      status: 'enrolled'
    });

    await course.save();

    // Update student's courses
    student.courses.push({
      courseId: course._id,
      enrolledDate: new Date(),
      status: 'enrolled'
    });

    await student.save();

    res.json({ message: 'Enrolled successfully' });
  } catch (error) {
    console.error('Course enrollment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/courses/enrolled-students
// @desc    Get all enrolled students across courses
// @access  Private (Admin)
router.get('/enrolled-students', [auth, adminAuth], async (req, res) => {
  try {
    const { course, batch, branch, section } = req.query;

    let filter = {};
    if (course && course !== 'all') filter['courses.courseId'] = course;
    if (batch && batch !== 'all') filter.batch = batch;
    if (branch && branch !== 'all') filter.branch = branch;
    if (section && section !== 'all') filter.section = section;

    const students = await Student.find(filter)
      .populate('userId', 'name email status')
      .populate('courses.courseId', 'title category');

    const enrolledStudents = students.map(student => ({
      id: student._id,
      name: student.userId.name,
      email: student.userId.email,
      registrationId: student.registrationNumber,
      batch: student.batch,
      stream: student.branch,
      section: student.section,
      status: student.userId.status === 'active' ? 'enrolled' : 'not-enrolled',
      enrolledDate: student.enrollmentDate,
      courses: student.courses.map(course => ({
        title: course.courseId?.title || 'Unknown',
        category: course.courseId?.category || 'Unknown',
        progress: course.progress,
        status: course.status
      }))
    }));

    res.json({ students: enrolledStudents });
  } catch (error) {
    console.error('Get enrolled students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/courses/completion-rate
// @desc    Get course completion statistics
// @access  Private (Admin)
router.get('/completion-rate', [auth, adminAuth], async (req, res) => {
  try {
    const courses = await Course.find({ isActive: true });
    
    const completionStats = await Promise.all(
      courses.map(async (course) => {
        const totalEnrolled = course.enrolledStudents.length;
        const completed = course.enrolledStudents.filter(
          enrollment => enrollment.status === 'completed'
        ).length;
        
        const assignmentsCompleted = course.assignments.reduce((total, assignment) => {
          return total + assignment.submissions.length;
        }, 0);

        const completionRate = totalEnrolled > 0 ? (completed / totalEnrolled) * 100 : 0;
        const certificationRate = totalEnrolled > 0 ? (completed / totalEnrolled) * 100 : 0;

        return {
          id: course._id,
          courseName: course.title,
          totalEnrolled,
          assignmentsCompleted,
          studentsCertified: completed,
          completionRate: Math.round(completionRate * 10) / 10,
          certificationRate: Math.round(certificationRate * 10) / 10
        };
      })
    );

    // Calculate overall stats
    const overallStats = {
      totalEnrolled: completionStats.reduce((sum, stat) => sum + stat.totalEnrolled, 0),
      assignmentsCompleted: completionStats.reduce((sum, stat) => sum + stat.assignmentsCompleted, 0),
      studentsCertified: completionStats.reduce((sum, stat) => sum + stat.studentsCertified, 0)
    };

    overallStats.overallCompletion = overallStats.totalEnrolled > 0 
      ? Math.round((overallStats.assignmentsCompleted / overallStats.totalEnrolled) * 10) / 10 
      : 0;

    res.json({
      overallStats,
      courseCompletions: completionStats
    });
  } catch (error) {
    console.error('Get completion rate error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;