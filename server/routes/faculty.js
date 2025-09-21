const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Faculty = require('../models/Faculty');
const { auth, adminAuth } = require('../middleware/auth');
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// @route   GET /api/faculty
// @desc    Get all faculty members
// @access  Private (Admin)
router.get('/', [auth, adminAuth], async (req, res) => {
  try {
    const { search, department, status, page = 1, limit = 10 } = req.query;

    let userFilter = { role: 'faculty' };
    
    if (search) {
      userFilter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status && status !== 'all') {
      userFilter.status = status;
    }

    const faculty = await Faculty.find()
      .populate({
        path: 'userId',
        match: userFilter,
        select: '-password'
      })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    // Filter out faculty where userId is null
    const validFaculty = faculty.filter(f => f.userId);

    const total = await Faculty.countDocuments();

    res.json({
      faculty: validFaculty,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get faculty error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/faculty
// @desc    Create new faculty member
// @access  Private (College Admin)
router.post('/', [auth, collegeAuth], [
  body('name').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('facultyId').notEmpty(),
  body('department').notEmpty(),
  body('designation').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, facultyId, department, designation, mobile, qualification, experience } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Faculty with this email already exists' });
    }

    // Check if faculty ID already exists
    const existingFaculty = await Faculty.findOne({ facultyId });
    if (existingFaculty) {
      return res.status(400).json({ message: 'Faculty with this ID already exists' });
    }

    // Generate invitation token
    const invitationToken = crypto.randomBytes(32).toString('hex');
    const invitationExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create user account
    const user = new User({
      name,
      email,
      role: 'faculty',
      collegeId: req.user.collegeId,
      status: 'pending',
      invitationToken,
      invitationExpires,
      profile: {
        phone: mobile,
        department,
        designation,
        employeeId: facultyId
      }
    });

    await user.save();

    // Create faculty record
    const faculty = new Faculty({
      userId: user._id,
      facultyId,
      department,
      designation,
      qualification,
      experience: parseInt(experience) || 0
    });

    await faculty.save();

    // Send invitation email
    const college = await College.findById(req.user.collegeId);
    await sendInvitationEmail(email, name, invitationToken, 'faculty', college.name);

    res.status(201).json({
      message: 'Faculty invitation sent successfully',
      faculty: {
        id: faculty._id,
        name: user.name,
        email: user.email,
        facultyId: faculty.facultyId,
        department: faculty.department,
        designation: faculty.designation,
        status: 'pending'
      }
    });
  } catch (error) {
    console.error('Create faculty error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/faculty/bulk-upload
// @desc    Bulk upload faculty
// @access  Private (Admin)
router.post('/bulk-upload', [auth, adminAuth], upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const results = {
      totalRecords: 0,
      accountsCreated: 0,
      duplicatesFound: 0,
      errors: 0,
      facultyData: []
    };

    const facultyList = [];
    
    // Read CSV file
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => {
        facultyList.push(data);
      })
      .on('end', async () => {
        results.totalRecords = facultyList.length;

        for (const facultyData of facultyList) {
          try {
            const { name, email, facultyId, mobile, branch } = facultyData;
            
            // Check for duplicates
            const existingUser = await User.findOne({ email });
            const existingFaculty = await Faculty.findOne({ facultyId });
            
            if (existingUser || existingFaculty) {
              results.duplicatesFound++;
              results.duplicatesList = results.duplicatesList || [];
              results.duplicatesList.push(email);
              continue;
            }

            // Generate temporary password
            const tempPassword = Math.random().toString(36).slice(-8);

            // Create user
            const user = new User({
              name,
              email,
              password: tempPassword,
              role: 'faculty',
              profile: {
                phone: mobile,
                department: branch,
                employeeId: facultyId
              }
            });

            await user.save();

            // Create faculty record
            const faculty = new Faculty({
              userId: user._id,
              facultyId,
              department: branch,
              designation: 'Faculty' // Default designation
            });

            await faculty.save();

            results.accountsCreated++;
            results.facultyData.push({
              name,
              email,
              facultyId,
              branch,
              mobile,
              tempPassword
            });

          } catch (error) {
            console.error('Error creating faculty:', error);
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

// @route   PUT /api/faculty/:id
// @desc    Update faculty member
// @access  Private (Admin)
router.put('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const { name, email, department, designation, mobile, status } = req.body;
    
    const faculty = await Faculty.findById(req.params.id).populate('userId');
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    // Update user data
    if (name) faculty.userId.name = name;
    if (email) faculty.userId.email = email;
    if (mobile) faculty.userId.profile.phone = mobile;
    if (status) faculty.userId.status = status;
    
    await faculty.userId.save();

    // Update faculty data
    if (department) faculty.department = department;
    if (designation) faculty.designation = designation;
    
    await faculty.save();

    res.json({ message: 'Faculty updated successfully' });
  } catch (error) {
    console.error('Update faculty error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/faculty/:id/assign-task
// @desc    Assign task to faculty
// @access  Private (Admin)
router.post('/:id/assign-task', [auth, adminAuth], async (req, res) => {
  try {
    const { title, description, batches, branches, sections, dueDate } = req.body;
    
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    faculty.tasks.push({
      title,
      description,
      assignedBy: req.user._id,
      dueDate: new Date(dueDate),
      status: 'pending'
    });

    await faculty.save();

    res.json({ message: 'Task assigned successfully' });
  } catch (error) {
    console.error('Assign task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/faculty/:id
// @desc    Delete faculty member
// @access  Private (Admin)
router.delete('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({ message: 'Faculty not found' });
    }

    // Delete user account
    await User.findByIdAndDelete(faculty.userId);
    
    // Delete faculty record
    await Faculty.findByIdAndDelete(req.params.id);

    res.json({ message: 'Faculty deleted successfully' });
  } catch (error) {
    console.error('Delete faculty error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;