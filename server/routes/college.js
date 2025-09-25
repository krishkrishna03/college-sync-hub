const express = require('express');
const User = require('../models/User');
const College = require('../models/College');
const { auth, authorize, collegeAccess } = require('../middleware/auth');
const emailService = require('../utils/emailService');
const PasswordGenerator = require('../utils/passwordGenerator');
const { body, validationResult } = require('express-validator');

const router = express.Router();

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
    const emailSent = await emailService.sendLoginCredentials(
      email,
      name,
      password,
      role,
      college.name
    );

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
      emailSent
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Server error' });
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

module.exports = router;