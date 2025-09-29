const express = require('express');
const User = require('../models/User');
const College = require('../models/College');
const { auth, authorize } = require('../middleware/auth');
const emailService = require('../utils/emailService');
const PasswordGenerator = require('../utils/passwordGenerator');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Create college (Master Admin only)
router.post('/colleges', auth, authorize('master_admin'), [
  body('name').trim().isLength({ min: 2 }),
  body('code').trim().isLength({ min: 2 }).toUpperCase(),
  body('email').isEmail().normalizeEmail(),
  body('address').trim().isLength({ min: 10 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, code, email, address } = req.body;

    // Check if college code or email already exists
    const existingCollege = await College.findOne({
      $or: [{ code }, { email }]
    });

    if (existingCollege) {
      return res.status(400).json({ 
        error: 'College code or email already exists' 
      });
    }

    // Create college
    const college = new College({ name, code, email, address });
    await college.save();

    // Generate password for college admin
    const password = PasswordGenerator.generateSimple(10);

    // Create college admin user
    const collegeAdmin = new User({
      name: `${name} Administrator`,
      email,
      password,
      role: 'college_admin',
      collegeId: college._id
    });

    await collegeAdmin.save();

    // Update college with admin ID
    college.adminId = collegeAdmin._id;
    await college.save();

    // Send credentials via email
    const emailSent = await emailService.sendLoginCredentials(
      email,
      collegeAdmin.name,
      password,
      'college_admin',
      name
    );

    res.status(201).json({
      message: 'College created successfully',
      college: {
        id: college._id,
        name: college.name,
        code: college.code,
        email: college.email,
        address: college.address,
        createdAt: college.createdAt
      },
      emailSent
    });

  } catch (error) {
    console.error('Create college error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all colleges (Master Admin only)
router.get('/colleges', auth, authorize('master_admin'), async (req, res) => {
  try {
    const colleges = await College.find()
      .populate('adminId', 'name email hasLoggedIn lastLogin')
      .sort({ createdAt: -1 });

    const collegesWithStats = await Promise.all(
      colleges.map(async (college) => {
        await college.updateStats();
        return {
          id: college._id,
          name: college.name,
          code: college.code,
          email: college.email,
          address: college.address,
          totalFaculty: college.totalFaculty,
          totalStudents: college.totalStudents,
          adminInfo: college.adminId ? {
            name: college.adminId.name,
            email: college.adminId.email,
            hasLoggedIn: college.adminId.hasLoggedIn,
            lastLogin: college.adminId.lastLogin
          } : null,
          createdAt: college.createdAt,
          isActive: college.isActive
        };
      })
    );

    res.json(collegesWithStats);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get college statistics (Master Admin only)
router.get('/stats', auth, authorize('master_admin'), async (req, res) => {
  try {
    const totalColleges = await College.countDocuments({ isActive: true });
    const totalFaculty = await User.countDocuments({ role: 'faculty', isActive: true });
    const totalStudents = await User.countDocuments({ role: 'student', isActive: true });
    
    const recentLogins = await User.find({
      role: { $in: ['college_admin', 'faculty', 'student'] },
      lastLogin: { $exists: true }
    })
    .populate('collegeId', 'name')
    .sort({ lastLogin: -1 })
    .limit(10)
    .select('name email role lastLogin collegeId');

    res.json({
      totalColleges,
      totalFaculty,
      totalStudents,
      recentLogins
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Toggle college status (Master Admin only)
router.put('/colleges/:id/toggle-status', auth, authorize('master_admin'), async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) {
      return res.status(404).json({ error: 'College not found' });
    }

    college.isActive = !college.isActive;
    await college.save();

    // Also toggle all users in this college
    await User.updateMany(
      { collegeId: college._id },
      { isActive: college.isActive }
    );

    res.json({ 
      message: `College ${college.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: college.isActive 
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});
// Update Master Admin email
router.put('/update-email', auth, authorize('master_admin'), [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // Check if email is already used by another user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email is already in use' });
    }

    // Update Master Admin
    const masterAdmin = await User.findOne({ role: 'master_admin' });
    if (!masterAdmin) {
      return res.status(404).json({ error: 'Master Admin not found' });
    }

    masterAdmin.email = email;
    await masterAdmin.save();

    res.json({ 
      message: 'Master Admin email updated successfully',
      email: masterAdmin.email
    });

  } catch (error) {
    console.error('Update Master Admin email error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;