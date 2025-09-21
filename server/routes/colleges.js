const express = require('express');
const { body, validationResult } = require('express-validator');
const College = require('../models/College');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');
const { sendInvitationEmail } = require('../utils/emailService');
const crypto = require('crypto');

const router = express.Router();

// @route   GET /api/colleges
// @desc    Get all colleges (Admin only)
// @access  Private (Admin)
router.get('/', [auth, adminAuth], async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;

    let filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status && status !== 'all') {
      filter.isActive = status === 'active';
    }

    const colleges = await College.find(filter)
      .populate('adminUserId', 'name email status')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await College.countDocuments(filter);

    res.json({
      colleges,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get colleges error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/colleges
// @desc    Create new college with admin invitation (Admin only)
// @access  Private (Admin)
router.post('/', [auth, adminAuth], [
  body('name').notEmpty().trim(),
  body('code').notEmpty().trim().isLength({ min: 3, max: 10 }),
  body('email').isEmail().normalizeEmail(),
  body('adminName').notEmpty().trim(),
  body('adminEmail').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, code, email, phone, address, adminName, adminEmail } = req.body;

    // Check if college code or email already exists
    const existingCollege = await College.findOne({
      $or: [{ code: code.toUpperCase() }, { email }]
    });
    if (existingCollege) {
      return res.status(400).json({ message: 'College with this code or email already exists' });
    }

    // Check if admin email already exists
    const existingUser = await User.findOne({ email: adminEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Admin email already exists' });
    }

    // Generate invitation token
    const invitationToken = crypto.randomBytes(32).toString('hex');
    const invitationExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create college admin user (pending status)
    const adminUser = new User({
      name: adminName,
      email: adminEmail,
      role: 'college-admin',
      status: 'pending',
      invitationToken,
      invitationExpires
    });

    await adminUser.save();

    // Create college
    const college = new College({
      name,
      code: code.toUpperCase(),
      email,
      phone,
      address,
      adminUserId: adminUser._id
    });

    await college.save();

    // Update admin user with college ID
    adminUser.collegeId = college._id;
    await adminUser.save();

    // Send invitation email
    await sendInvitationEmail(adminEmail, adminName, invitationToken, 'college-admin', name);

    res.status(201).json({
      message: 'College created successfully. Invitation sent to admin.',
      college: {
        id: college._id,
        name: college.name,
        code: college.code,
        email: college.email,
        adminName,
        adminEmail
      }
    });
  } catch (error) {
    console.error('Create college error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/colleges/:id
// @desc    Update college (Admin only)
// @access  Private (Admin)
router.put('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const { name, email, phone, address, isActive } = req.body;
    
    const college = await College.findById(req.params.id);
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }

    // Update college fields
    if (name) college.name = name;
    if (email) college.email = email;
    if (phone) college.phone = phone;
    if (address) college.address = address;
    if (typeof isActive === 'boolean') college.isActive = isActive;

    await college.save();

    res.json({ message: 'College updated successfully' });
  } catch (error) {
    console.error('Update college error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/colleges/:id
// @desc    Delete college and all associated data (Admin only)
// @access  Private (Admin)
router.delete('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }

    // Delete all users associated with this college
    const users = await User.find({ collegeId: college._id });
    
    // Delete student and faculty records
    for (const user of users) {
      if (user.role === 'student') {
        await Student.deleteMany({ userId: user._id });
      } else if (user.role === 'faculty') {
        await Faculty.deleteMany({ userId: user._id });
      }
    }
    
    // Delete all users
    await User.deleteMany({ collegeId: college._id });
    
    // Delete the college
    await College.findByIdAndDelete(req.params.id);

    res.json({ message: 'College and all associated data deleted successfully' });
  } catch (error) {
    console.error('Delete college error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;