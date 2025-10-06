const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const College = require('../models/College');
const PendingEmail = require('../models/PendingEmail');
const { auth, authorize, collegeAccess } = require('../middleware/auth');
const emailService = require('../utils/emailService');
const PasswordGenerator = require('../utils/passwordGenerator');
const { body, validationResult } = require('express-validator');
const logger = require('../middleware/logger');

const router = express.Router();

// Configure multer for Excel uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/excel/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = /xlsx|xls/;
    const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());

    // Excel MIME types
    const allowedMimeTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'application/octet-stream' // Generic binary (sometimes used for Excel files)
    ];

    const mimetypeValid = allowedMimeTypes.includes(file.mimetype);

    if (extname && mimetypeValid) {
      return cb(null, true);
    } else if (extname) {
      // If extension is correct but mimetype doesn't match, allow it anyway
      return cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) are allowed'));
    }
  }
});

// Create faculty or student (College Admin only)
router.post('/users', auth, authorize('college_admin'), [
  body('name').trim().isLength({ min: 2 }),
  body('email').isEmail().normalizeEmail(),
  body('role').isIn(['faculty', 'student']),
  body('idNumber').trim().isLength({ min: 1 }),
  body('branch').trim().isLength({ min: 1 }),
  body('batch').trim().isLength({ min: 1 }),
  body('section').trim().isLength({ min: 1 }),
  body('phoneNumber').optional().isMobilePhone()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, role, idNumber, branch, batch, section, phoneNumber } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Check if ID number already exists in the same college
    const existingId = await User.findOne({
      idNumber,
      collegeId: req.user.collegeId,
      isActive: true
    });

    if (existingId) {
      return res.status(400).json({ error: 'ID number already exists in this college' });
    }

    // Generate password
    const password = PasswordGenerator.generateSimple(8);

    // Create user
    const user = new User({
      name,
      email,
      password,
      role,
      collegeId: req.user.collegeId,
      idNumber,
      branch,
      batch,
      section,
      phoneNumber
    });

    await user.save();

    // Update college statistics
    const college = await College.findById(req.user.collegeId);
    await college.updateStats();

    // Send credentials via email
    const emailResult = await emailService.sendLoginCredentials(
      email,
      name,
      password,
      role,
      college.name
    );

    if (!emailResult.success) {
      await PendingEmail.create({
        type: 'login_credentials',
        recipientEmail: email,
        recipientName: name,
        userId: user._id,
        data: {
          email,
          password,
          role,
          collegeName: college.name
        },
        status: 'failed',
        attempts: 1,
        lastAttemptAt: new Date(),
        error: emailResult.error || 'Email sending failed'
      });
    }

    res.status(201).json({
      message: `${role} created successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        idNumber: user.idNumber,
        branch: user.branch,
        batch: user.batch,
        section: user.section,
        phoneNumber: user.phoneNumber,
        createdAt: user.createdAt
      },
      emailSent: emailResult.success
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Bulk create users via Excel upload (College Admin only)
router.post('/users/bulk-upload', auth, authorize('college_admin'), upload.single('excel'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Excel file is required' });
    }

    const { role } = req.body;
    if (!['faculty', 'student'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role specified' });
    }

    logger.info('Processing bulk upload', { 
      filename: req.file.filename, 
      role, 
      collegeId: req.user.collegeId 
    });

    // Read Excel file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      fs.unlinkSync(req.file.path); // Clean up file
      return res.status(400).json({ error: 'Excel file is empty' });
    }

    const results = {
      total: data.length,
      successful: 0,
      failed: 0,
      errors: []
    };

    const college = await College.findById(req.user.collegeId);
    const createdUsers = [];

    // Step 1: Validate all rows first
    const validRows = [];
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2;

      const validationResult = validateExcelRow(row, role, rowNumber);
      if (!validationResult.isValid) {
        results.failed++;
        results.errors.push(...validationResult.errors);
        continue;
      }

      validRows.push({ row, rowNumber });
    }

    // Step 2: Batch check for existing users (all at once)
    const emails = validRows.map(v => v.row.Email?.toLowerCase()).filter(Boolean);
    const idNumbers = validRows.map(v => v.row[role === 'student' ? 'Roll Number' : 'Faculty ID']).filter(Boolean);

    const existingUsers = await User.find({
      $or: [
        { email: { $in: emails } },
        { idNumber: { $in: idNumbers }, collegeId: req.user.collegeId }
      ]
    }).select('email idNumber');

    // Create a Set for quick lookup
    const existingEmails = new Set(existingUsers.map(u => u.email));
    const existingIds = new Set(existingUsers.map(u => u.idNumber));

    // Step 3: Prepare user data and filter out duplicates
    const bcrypt = require('bcryptjs');
    const usersToCreate = [];

    for (const { row, rowNumber } of validRows) {
      const email = row.Email?.toLowerCase();
      const idNumber = row[role === 'student' ? 'Roll Number' : 'Faculty ID'];

      if (existingEmails.has(email) || existingIds.has(idNumber)) {
        results.failed++;
        results.errors.push({
          row: rowNumber,
          field: 'Email/ID',
          message: 'User with this email or ID already exists'
        });
        continue;
      }

      // Generate password (plain text, will hash in bulk later)
      const password = PasswordGenerator.generateSimple(8);

      const userData = {
        name: row.Name,
        email: email,
        plainPassword: password, // Store plain password temporarily
        role,
        collegeId: req.user.collegeId,
        idNumber: idNumber,
        branch: row.Branch,
        batch: row.Batch || '',
        section: row.Section || '',
        phoneNumber: row.Phone || ''
      };

      usersToCreate.push({ userData, password, rowNumber });
    }

    // Step 3.5: Hash all passwords in parallel (much faster than sequential)
    const salt = await bcrypt.genSalt(10);
    const hashPromises = usersToCreate.map(async (item) => {
      item.userData.password = await bcrypt.hash(item.userData.plainPassword, salt);
      delete item.userData.plainPassword;
    });
    await Promise.all(hashPromises);

    // Step 4: Create users using insertMany for better performance
    try {
      // Prepare all user documents
      const userDocuments = usersToCreate.map(({ userData }) => userData);

      // Use insertMany which is much faster than individual saves
      // Set ordered: false to continue inserting even if some fail
      const insertResult = await User.insertMany(userDocuments, {
        ordered: false,
        rawResult: true
      });

      // Get the inserted users to match with passwords for email sending
      const insertedUserIds = insertResult.insertedIds
        ? Object.values(insertResult.insertedIds)
        : insertResult.map(u => u._id);

      const insertedUsers = await User.find({
        _id: { $in: insertedUserIds }
      }).select('_id email name role');

      // Match inserted users with their passwords for email
      for (let i = 0; i < usersToCreate.length; i++) {
        const { userData, password } = usersToCreate[i];
        const insertedUser = insertedUsers.find(u => u.email === userData.email);

        if (insertedUser) {
          createdUsers.push({ user: insertedUser, password });
          results.successful++;
        }
      }

    } catch (error) {
      // If insertMany fails partially, some documents might still be inserted
      if (error.writeErrors) {
        results.successful += error.insertedDocs?.length || 0;
        results.failed += error.writeErrors.length;

        error.writeErrors.forEach((writeError, index) => {
          results.errors.push({
            row: usersToCreate[writeError.index]?.rowNumber || index + 2,
            field: 'General',
            message: writeError.errmsg || 'Failed to create user'
          });
        });

        // Add successfully inserted users to createdUsers for email
        if (error.insertedDocs) {
          error.insertedDocs.forEach((doc, index) => {
            const matchingItem = usersToCreate[index];
            if (matchingItem) {
              createdUsers.push({ user: doc, password: matchingItem.password });
            }
          });
        }
      } else {
        // Complete failure
        logger.errorLog(error, { context: 'Bulk Upload Insert Many' });
        usersToCreate.forEach(({ rowNumber }) => {
          results.failed++;
          results.errors.push({
            row: rowNumber,
            field: 'General',
            message: 'Failed to create user'
          });
        });
      }
    }

    // Update college statistics
    await college.updateStats();

    // Send emails asynchronously
    sendBulkCredentialEmails(createdUsers, college.name);

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    logger.info('Bulk upload completed', { 
      total: results.total, 
      successful: results.successful, 
      failed: results.failed 
    });

    res.json({
      message: 'Bulk upload completed',
      results
    });

  } catch (error) {
    // Clean up file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    logger.errorLog(error, { context: 'Bulk Upload' });
    res.status(500).json({ error: 'Server error during bulk upload' });
  }
});

// Download sample Excel template
router.get('/users/sample-template/:role', auth, authorize('college_admin'), (req, res) => {
  try {
    const { role } = req.params;
    
    if (!['faculty', 'student'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const sampleData = role === 'faculty' ? [
      {
        'Name': 'John Doe',
        'Faculty ID': 'FAC001',
        'Branch': 'Computer Science',
        'Batch': '2023-24',
        'Section': 'A',
        'Email': 'john.doe@example.com',
        'Phone': '+1234567890'
      }
    ] : [
      {
        'Name': 'Jane Smith',
        'Roll Number': 'CS2023001',
        'Branch': 'Computer Science',
        'Batch': '2023-27',
        'Section': 'A',
        'Email': 'jane.smith@example.com',
        'Phone': '+1234567890'
      }
    ];

    const worksheet = xlsx.utils.json_to_sheet(sampleData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, `${role}_template`);

    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', `attachment; filename=${role}_template.xlsx`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);

  } catch (error) {
    logger.errorLog(error, { context: 'Sample Template Download' });
    res.status(500).json({ error: 'Failed to generate template' });
  }
});

// Get all faculty/students for college (College Admin only)
router.get('/users/:role', auth, authorize('college_admin'), async (req, res) => {
  try {
    const { role } = req.params;
    
    if (!['faculty', 'student'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const users = await User.find({
      collegeId: req.user.collegeId,
      role,
      isActive: true
    })
    .select('-password')
    .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get college dashboard data
router.get('/dashboard', auth, authorize('college_admin', 'faculty', 'student'), collegeAccess, async (req, res) => {
  try {
    let dashboardData = {};

    if (req.user.role === 'college_admin') {
      const facultyCount = await User.countDocuments({
        collegeId: req.user.collegeId,
        role: 'faculty',
        isActive: true
      });

      const studentCount = await User.countDocuments({
        collegeId: req.user.collegeId,
        role: 'student',
        isActive: true
      });

      const recentUsers = await User.find({
        collegeId: req.user.collegeId,
        role: { $in: ['faculty', 'student'] }
      })
      .select('name email role hasLoggedIn lastLogin createdAt')
      .sort({ createdAt: -1 })
      .limit(10);

      const loginStats = await User.aggregate([
        {
          $match: {
            collegeId: req.user.collegeId,
            role: { $in: ['faculty', 'student'] }
          }
        },
        {
          $group: {
            _id: '$hasLoggedIn',
            count: { $sum: 1 }
          }
        }
      ]);

      dashboardData = {
        totalFaculty: facultyCount,
        totalStudents: studentCount,
        recentUsers,
        loginStats: {
          hasLoggedIn: loginStats.find(stat => stat._id === true)?.count || 0,
          neverLoggedIn: loginStats.find(stat => stat._id === false)?.count || 0
        }
      };
    } else {
      // For faculty and students
      const collegeInfo = await College.findById(req.user.collegeId)
        .select('name code address');

      const colleagues = await User.find({
        collegeId: req.user.collegeId,
        role: req.user.role,
        _id: { $ne: req.user._id },
        isActive: true
      })
      .select('name email branch batch section')
      .limit(20);

      dashboardData = {
        college: collegeInfo,
        colleagues
      };
    }

    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user (College Admin only)
router.put('/users/:userId', auth, authorize('college_admin'), [
  body('name').optional().trim().isLength({ min: 2 }),
  body('branch').optional().trim(),
  body('batch').optional().trim(),
  body('section').optional().trim(),
  body('phoneNumber').optional().isMobilePhone()
], async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findOne({
      _id: userId,
      collegeId: req.user.collegeId
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updates = {};
    const allowedFields = ['name', 'branch', 'batch', 'section', 'phoneNumber'];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Toggle user status (College Admin only)
router.put('/users/:userId/toggle-status', auth, authorize('college_admin'), async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({
      _id: userId,
      collegeId: req.user.collegeId
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    // Update college statistics
    const college = await College.findById(req.user.collegeId);
    await college.updateStats();

    res.json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: user.isActive
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user (College Admin only)
router.delete('/users/:userId', auth, authorize('college_admin'), async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({
      _id: userId,
      collegeId: req.user.collegeId
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deletion of college admin
    if (user.role === 'college_admin') {
      return res.status(403).json({ error: 'Cannot delete college admin' });
    }

    await User.findByIdAndDelete(userId);

    // Update college statistics
    const college = await College.findById(req.user.collegeId);
    await college.updateStats();

    res.json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    logger.errorLog(error, { context: 'Delete User' });
    res.status(500).json({ error: 'Server error' });
  }
});

// Get hierarchical student data (College Admin and Faculty)
router.get('/hierarchy', auth, authorize('college_admin', 'faculty'), async (req, res) => {
  try {
    // Build query based on user role
    let studentQuery = {
      collegeId: req.user.collegeId,
      role: 'student',
      isActive: true
    };

    // Faculty can only see students from their branch
    if (req.user.role === 'faculty') {
      studentQuery.branch = req.user.branch;
    }

    const students = await User.find(studentQuery)
      .select('name email idNumber branch batch section phoneNumber hasLoggedIn lastLogin createdAt');

    // Group students by batch -> branch -> section
    const hierarchy = {};

    students.forEach(student => {
      const batch = student.batch || 'Unknown';
      const branch = student.branch || 'Unknown';
      const section = student.section || 'Unknown';

      if (!hierarchy[batch]) {
        hierarchy[batch] = {};
      }
      if (!hierarchy[batch][branch]) {
        hierarchy[batch][branch] = {};
      }
      if (!hierarchy[batch][branch][section]) {
        hierarchy[batch][branch][section] = [];
      }

      hierarchy[batch][branch][section].push(student);
    });

    // Calculate counts
    const summary = {
      totalStudents: students.length,
      totalBatches: Object.keys(hierarchy).length,
      totalBranches: new Set(students.map(s => s.branch)).size,
      totalSections: new Set(students.map(s => `${s.batch}-${s.branch}-${s.section}`)).size
    };

    res.json({
      hierarchy,
      summary,
      students
    });

  } catch (error) {
    console.error('Get hierarchy error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get students by filters (batch, branch, section)
router.get('/students/filtered', auth, authorize('college_admin', 'faculty'), async (req, res) => {
  try {
    const { batch, branch, section } = req.query;

    let query = {
      collegeId: req.user.collegeId,
      role: 'student',
      isActive: true
    };

    // Faculty can only see students from their branch
    if (req.user.role === 'faculty') {
      query.branch = req.user.branch;
    } else if (branch && branch !== 'all') {
      query.branch = branch;
    }

    if (batch && batch !== 'all') query.batch = batch;
    if (section && section !== 'all') query.section = section;

    const students = await User.find(query)
      .select('name email idNumber branch batch section phoneNumber hasLoggedIn lastLogin createdAt')
      .sort({ batch: 1, branch: 1, section: 1, name: 1 });

    res.json(students);

  } catch (error) {
    console.error('Get filtered students error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper function to validate Excel row data
function validateExcelRow(row, role, rowNumber) {
  const errors = [];
  const requiredFields = role === 'faculty' 
    ? ['Name', 'Faculty ID', 'Branch', 'Email']
    : ['Name', 'Roll Number', 'Branch', 'Batch', 'Section', 'Email'];

  // Check required fields
  requiredFields.forEach(field => {
    if (!row[field] || String(row[field]).trim() === '') {
      errors.push({
        row: rowNumber,
        field,
        message: `${field} is required`
      });
    }
  });

  // Validate email format
  if (row.Email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.Email)) {
    errors.push({
      row: rowNumber,
      field: 'Email',
      message: 'Invalid email format'
    });
  }

  // Validate phone number format (if provided)
  if (row.Phone && !/^[+]?[\d\s\-\(\)]{10,}$/.test(row.Phone)) {
    errors.push({
      row: rowNumber,
      field: 'Phone',
      message: 'Invalid phone number format'
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Get unique branches for college
router.get('/branches', auth, authorize('college_admin', 'faculty'), async (req, res) => {
  try {
    const branches = await User.distinct('branch', {
      collegeId: req.user.collegeId,
      role: 'student',
      isActive: true,
      branch: { $ne: null, $ne: '' }
    });

    res.json(branches.sort());
  } catch (error) {
    logger.errorLog(error, { context: 'Get Branches' });
    res.status(500).json({ error: 'Server error' });
  }
});

// Get unique batches for college
router.get('/batches', auth, authorize('college_admin', 'faculty'), async (req, res) => {
  try {
    const batches = await User.distinct('batch', {
      collegeId: req.user.collegeId,
      role: 'student',
      isActive: true,
      batch: { $ne: null, $ne: '' }
    });

    res.json(batches.sort());
  } catch (error) {
    logger.errorLog(error, { context: 'Get Batches' });
    res.status(500).json({ error: 'Server error' });
  }
});

// Get unique sections for college
router.get('/sections', auth, authorize('college_admin', 'faculty'), async (req, res) => {
  try {
    const sections = await User.distinct('section', {
      collegeId: req.user.collegeId,
      role: 'student',
      isActive: true,
      section: { $ne: null, $ne: '' }
    });

    res.json(sections.sort());
  } catch (error) {
    logger.errorLog(error, { context: 'Get Sections' });
    res.status(500).json({ error: 'Server error' });
  }
});

// Get students based on filters
router.get('/students', auth, authorize('college_admin', 'faculty'), async (req, res) => {
  try {
    const { branch, batch, section, search } = req.query;

    let query = {
      collegeId: req.user.collegeId,
      role: 'student',
      isActive: true
    };

    if (branch) query.branch = branch;
    if (batch) query.batch = batch;
    if (section) query.section = section;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { idNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await User.find(query)
      .select('_id name email idNumber branch batch section')
      .sort({ name: 1 });

    res.json(students);
  } catch (error) {
    logger.errorLog(error, { context: 'Get Students' });
    res.status(500).json({ error: 'Server error' });
  }
});

// Get test report for college
router.get('/tests/:testId/report', auth, authorize('college_admin', 'faculty'), async (req, res) => {
  try {
    const { testId } = req.params;
    const TestAttempt = require('../models/TestAttempt');
    const Test = require('../models/Test');
    const TestAssignment = require('../models/TestAssignment');

    // Get test details
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }

    // Get test assignment for this college
    const assignment = await TestAssignment.findOne({
      testId,
      collegeId: req.user.collegeId,
      isActive: true
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Test not assigned to your college' });
    }

    // Get all student assignments
    const studentAssignments = await TestAssignment.find({
      testId,
      collegeId: req.user.collegeId,
      assignedTo: 'students',
      isActive: true
    });

    // Get unique student IDs
    const studentIds = studentAssignments.flatMap(sa =>
      sa.studentFilters.specificStudents || []
    );

    // Get student details
    const students = await User.find({
      _id: { $in: studentIds }
    }).select('_id name email idNumber branch batch section');

    // Get all attempts
    const attempts = await TestAttempt.find({
      testId,
      studentId: { $in: studentIds }
    }).populate('studentId', 'name email idNumber branch batch section');

    // Calculate statistics
    const totalAssigned = students.length;
    const totalCompleted = attempts.length;
    const completionRate = totalAssigned > 0 ? (totalCompleted / totalAssigned * 100).toFixed(2) : 0;

    const scores = attempts.map(a => a.marksObtained);
    const averageScore = scores.length > 0
      ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)
      : 0;
    const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
    const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;

    const passPercentage = test.totalMarks > 0 ? (test.totalMarks * 0.4) : 0;
    const passedStudents = attempts.filter(a => a.marksObtained >= passPercentage).length;
    const passRate = totalCompleted > 0 ? (passedStudents / totalCompleted * 100).toFixed(2) : 0;

    // Student-wise results
    const studentResults = students.map(student => {
      const attempt = attempts.find(a => a.studentId._id.toString() === student._id.toString());

      return {
        studentId: student._id,
        name: student.name,
        email: student.email,
        idNumber: student.idNumber,
        branch: student.branch,
        batch: student.batch,
        section: student.section,
        status: attempt ? 'Completed' : 'Not Attempted',
        marksObtained: attempt ? attempt.marksObtained : 0,
        totalMarks: test.totalMarks,
        percentage: attempt ? attempt.percentage : 0,
        timeSpent: attempt ? attempt.timeSpent : 0,
        submittedAt: attempt ? attempt.createdAt : null
      };
    });

    res.json({
      test: {
        _id: test._id,
        testName: test.testName,
        subject: test.subject,
        testType: test.testType,
        difficulty: test.difficulty,
        totalMarks: test.totalMarks,
        numberOfQuestions: test.numberOfQuestions,
        duration: test.duration
      },
      statistics: {
        totalAssigned,
        totalCompleted,
        completionRate: parseFloat(completionRate),
        averageScore: parseFloat(averageScore),
        highestScore,
        lowestScore,
        passRate: parseFloat(passRate),
        passedStudents
      },
      students: studentResults
    });

  } catch (error) {
    logger.errorLog(error, { context: 'Get Test Report' });
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper function to send bulk credential emails
async function sendBulkCredentialEmails(createdUsers, collegeName) {
  try {
    let emailsSent = 0;
    
    for (const { user, password } of createdUsers) {
      try {
        const emailSent = await emailService.sendLoginCredentials(
          user.email,
          user.name,
          password,
          user.role,
          collegeName
        );
        
        if (emailSent) {
          emailsSent++;
        }
      } catch (error) {
        logger.errorLog(error, { 
          context: 'Bulk Email Send', 
          userId: user._id, 
          email: user.email 
        });
      }
    }

    logger.info('Bulk credential emails sent', { 
      total: createdUsers.length, 
      successful: emailsSent 
    });

  } catch (error) {
    logger.errorLog(error, { context: 'Bulk Email Send Process' });
  }
}

module.exports = router;