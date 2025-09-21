const express = require('express');
const { body, validationResult } = require('express-validator');
const Invitation = require('../models/Invitation');
const User = require('../models/User');
const College = require('../models/College');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const { auth } = require('../middleware/auth');
const { sendInvitationEmail } = require('../utils/emailService');
const crypto = require('crypto');

const router = express.Router();

// @route   POST /api/invitations/send
// @desc    Send invitation to user
// @access  Private (College Admin for faculty/students)
router.post('/send', auth, [
  body('email').isEmail().normalizeEmail(),
  body('role').isIn(['faculty', 'student']),
  body('userData').isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, role, userData } = req.body;

    // Check if user is college admin
    if (req.user.role !== 'college') {
      return res.status(403).json({ message: 'Only college admins can send invitations' });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Check if invitation already exists
    const existingInvitation = await Invitation.findOne({ 
      email, 
      status: 'pending',
      collegeId: req.user.collegeId 
    });
    if (existingInvitation) {
      return res.status(400).json({ message: 'Invitation already sent to this email' });
    }

    // Generate invitation token
    const token = crypto.randomBytes(32).toString('hex');

    // Create invitation
    const invitation = new Invitation({
      email,
      role,
      collegeId: req.user.collegeId,
      invitedBy: req.user._id,
      token,
      userData
    });

    await invitation.save();

    // Send invitation email
    const college = await College.findById(req.user.collegeId);
    await sendInvitationEmail(email, userData.name, token, role, college.name);

    res.status(201).json({
      message: 'Invitation sent successfully',
      invitationId: invitation._id
    });
  } catch (error) {
    console.error('Send invitation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/invitations/verify/:token
// @desc    Verify invitation token
// @access  Public
router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const invitation = await Invitation.findOne({ 
      token, 
      status: 'pending',
      expiresAt: { $gt: new Date() }
    }).populate('collegeId', 'name code');

    if (!invitation) {
      return res.status(404).json({ message: 'Invalid or expired invitation' });
    }

    res.json({
      invitation: {
        email: invitation.email,
        role: invitation.role,
        collegeName: invitation.collegeId.name,
        collegeCode: invitation.collegeId.code,
        userData: invitation.userData
      }
    });
  } catch (error) {
    console.error('Verify invitation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/invitations/accept/:token
// @desc    Accept invitation and create account
// @access  Public
router.post('/accept/:token', [
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token } = req.params;
    const { password } = req.body;

    const invitation = await Invitation.findOne({ 
      token, 
      status: 'pending',
      expiresAt: { $gt: new Date() }
    });

    if (!invitation) {
      return res.status(404).json({ message: 'Invalid or expired invitation' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: invitation.email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user account
    const user = new User({
      name: invitation.userData.name,
      email: invitation.email,
      password,
      role: invitation.role,
      collegeId: invitation.collegeId,
      profile: {
        ...invitation.userData
      }
    });

    await user.save();

    // Create role-specific record
    if (invitation.role === 'student') {
      const student = new Student({
        userId: user._id,
        registrationNumber: invitation.userData.studentId,
        batch: invitation.userData.batch,
        branch: invitation.userData.branch,
        section: invitation.userData.section,
        year: invitation.userData.year,
        enrollmentDate: new Date()
      });
      await student.save();
    } else if (invitation.role === 'faculty') {
      const faculty = new Faculty({
        userId: user._id,
        facultyId: invitation.userData.facultyId,
        department: invitation.userData.department,
        designation: invitation.userData.designation || 'Faculty'
      });
      await faculty.save();
    }

    // Mark invitation as accepted
    invitation.status = 'accepted';
    await invitation.save();

    res.json({
      message: 'Account created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/invitations/reject/:token
// @desc    Reject invitation
// @access  Public
router.post('/reject/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const invitation = await Invitation.findOne({ 
      token, 
      status: 'pending'
    });

    if (!invitation) {
      return res.status(404).json({ message: 'Invalid invitation' });
    }

    invitation.status = 'rejected';
    await invitation.save();

    res.json({ message: 'Invitation rejected' });
  } catch (error) {
    console.error('Reject invitation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;