const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Student = require('../models/Student');
const { auth, adminAuth } = require('../middleware/auth');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// @route   GET /api/students
// @desc    Get all students with filters
// @access  Private (Admin/Faculty)
router.get('/', auth, async (req, res) => {
  try {
    const { 
      search, 
      stream, 
      batch, 
      section, 
      status, 
      page = 1, 
      limit = 10 
    } = req.query;

    let filter = {};
    let userFilter = { role: 'student' };

    if (search) {
      userFilter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'profile.studentId': { $regex: search, $options: 'i' } }
      ];
    }

    if (stream) filter.branch = stream;
    if (batch) filter.batch = batch;
    if (section) filter.section = section;
    if (status) userFilter.status = status;

    const students = await Student.find(filter)
      .populate({
        path: 'userId',
        match: userFilter,
        select: '-password'
      })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const validStudents = students.filter(student => student.userId);

    const total = await Student.countDocuments(filter);

    res.json({
      students: validStudents,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/students
// @desc    Create new student
// @access  Private (Admin)
router.post('/', [auth, adminAuth], [
  body('name').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('studentId').notEmpty(),
  body('batch').notEmpty(),
  body('branch').notEmpty(),
  body('section').notEmpty(),
 body('year').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, studentId, batch, branch, section, year, enrollmentDate } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Student with this email already exists' });
    }

    // Check if student ID already exists
    const existingStudent = await Student.findOne({ registrationNumber: studentId });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student with this ID already exists' });
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);

    // Create user account
    const user = new User({
      name,
      email,
      password: tempPassword,
      role: 'student',
      profile: {
        studentId,
        batch,
        branch,
        section,
        year,
        enrollmentDate: enrollmentDate || new Date()
      }
    });

    await user.save();

    try {
      // Create student record
      const student = new Student({
        userId: user._id,
        registrationNumber: studentId,
        batch,
        branch,
        section,
        year,
        enrollmentDate: enrollmentDate || new Date()
      });

      await student.save();

      res.status(201).json({
        message: 'Student created successfully',
        student: {
          id: student._id,
          name: user.name,
          email: user.email,
          studentId: student.registrationNumber,
          batch: student.batch,
          branch: student.branch,
          section: student.section,
          year: student.year,
          tempPassword
        }
      });
    } catch (studentError) {
      // If student creation fails, delete the user to avoid orphaned user
      await User.findByIdAndDelete(user._id);
      console.error('Create student error:', studentError);
      res.status(500).json({ message: 'Server error' });
    }
  } catch (error) {
    console.error('Create student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/students/bulk-upload
// @desc    Bulk upload students
// @access  Private (Admin)
router.post('/bulk-upload', [auth, adminAuth], upload.single('file'), async (req, res) => {
  try {
    const { batch, branch, section } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const results = {
      totalRecords: 0,
      accountsCreated: 0,
      duplicatesFound: 0,
      errors: 0,
      studentData: [],
      duplicatesList: []
    };

    const students = [];
    
    // Read CSV file
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => {
        students.push(data);
      })
      .on('end', async () => {
        results.totalRecords = students.length;

        for (const studentData of students) {
          let user = null;
          try {
            const { name, email, studentId, mobile } = studentData;
            
            // Check for duplicates
            const existingUser = await User.findOne({ email });
            const existingStudent = await Student.findOne({ registrationNumber: studentId });
            
            if (existingUser || existingStudent) {
              results.duplicatesFound++;
              results.duplicatesList.push(email);
              continue;
            }

            // Generate temporary password
            const tempPassword = Math.random().toString(36).slice(-8);

            // Create user
            user = new User({
              name,
              email,
              password: tempPassword,
              role: 'student',
              profile: {
                studentId,
                batch,
                branch,
                section,
                phone: mobile
              }
            });

            await user.save();

            try {
              // Create student record
              const student = new Student({
                userId: user._id,
                registrationNumber: studentId,
                batch,
                branch,
                section,
                year: '1st Year'
              });

              await student.save();

              results.accountsCreated++;
              results.studentData.push({
                name,
                email,
                studentId,
                branch,
                mobile,
                tempPassword
              });
            } catch (studentError) {
              // If student creation fails, delete the user
              await User.findByIdAndDelete(user._id);
              console.error('Error creating student record:', studentError);
              results.errors++;
            }
          } catch (error) {
            // If user creation fails, nothing to clean up
            console.error('Error creating user:', error);
            results.errors++;
          }
        }

        // Clean up uploaded file
        fs.unlinkSync(req.file.path);

        res.json(results);
      });

  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/students/:id
// @desc    Update student
// @access  Private (Admin)
router.put('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const { name, email, batch, branch, section, year, status } = req.body;
    
    const student = await Student.findById(req.params.id).populate('userId');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Update user data
    if (name) student.userId.name = name;
    if (email) student.userId.email = email;
    if (status) student.userId.status = status;
    
    await student.userId.save();

    // Update student data
    if (batch) student.batch = batch;
    if (branch) student.branch = branch;
    if (section) student.section = section;
    if (year) student.year = year;
    
    await student.save();

    res.json({ message: 'Student updated successfully' });
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/students/:id
// @desc    Delete student
// @access  Private (Admin)
router.delete('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Delete user account
    await User.findByIdAndDelete(student.userId);
    
    // Delete student record
    await Student.findByIdAndDelete(req.params.id);

    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/students/:id/report
// @desc    Get student participation report
// @access  Private
router.get('/:id/report', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('userId', '-password')
      .populate('testResults.testId')
      .populate('courses.courseId');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Calculate performance metrics
    const performanceMetrics = {
      modulesAccessed: student.courses.length,
      totalExams: student.testResults.length,
      practiceSessions: student.testResults.filter(r => r.status === 'completed').length,
      attendancePercentage: student.performance?.attendance || 0,
      timeSpentHours: 142, // This would be calculated from actual data
      avgScore: student.performance?.gpa || 0
    };

    res.json({
      student: {
        id: student._id,
        name: student.userId.name,
        email: student.userId.email,
        registrationId: student.registrationNumber,
        batch: student.batch,
        branch: student.branch,
        section: student.section,
        year: student.year,
        enrollmentDate: student.enrollmentDate
      },
      performanceMetrics,
      testResults: student.testResults,
      courses: student.courses
    });
  } catch (error) {
    console.error('Get student report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
