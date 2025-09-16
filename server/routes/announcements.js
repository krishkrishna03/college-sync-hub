const express = require('express');
const { body, validationResult } = require('express-validator');
const Announcement = require('../models/Announcement');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/announcements
// @desc    Get all announcements
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, targetAudience, page = 1, limit = 10 } = req.query;

    let filter = {};
    
    if (status && status !== 'all') filter.status = status;
    if (targetAudience && targetAudience !== 'all') filter.targetAudience = targetAudience;

    const announcements = await Announcement.find(filter)
      .populate('createdBy', 'name email')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Announcement.countDocuments(filter);

    res.json({
      announcements,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/announcements
// @desc    Create new announcement
// @access  Private (Admin)
router.post('/', [auth, adminAuth], [
  body('title').notEmpty().trim(),
  body('content').notEmpty().trim(),
  body('targetAudience').isIn(['all', 'students', 'faculty', 'specific']),
  body('scheduledFor').isISO8601()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      content,
      targetAudience,
      targetGroups,
      scheduledFor,
      priority,
      isDraft
    } = req.body;

    const announcement = new Announcement({
      title,
      content,
      targetAudience,
      targetGroups: targetGroups || {},
      scheduledFor: new Date(scheduledFor),
      priority: priority || 'medium',
      status: isDraft ? 'draft' : 'sent',
      createdBy: req.user._id
    });

    await announcement.save();

    res.status(201).json({
      message: 'Announcement created successfully',
      announcement
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/announcements/:id
// @desc    Update announcement
// @access  Private (Admin)
router.put('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        announcement[key] = req.body[key];
      }
    });

    await announcement.save();

    res.json({ message: 'Announcement updated successfully' });
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/announcements/:id
// @desc    Delete announcement
// @access  Private (Admin)
router.delete('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/announcements/:id/mark-read
// @desc    Mark announcement as read
// @access  Private
router.post('/:id/mark-read', auth, async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    // Check if already marked as read
    const alreadyRead = announcement.readBy.some(
      read => read.userId.toString() === req.user._id.toString()
    );

    if (!alreadyRead) {
      announcement.readBy.push({
        userId: req.user._id,
        readAt: new Date()
      });
      await announcement.save();
    }

    res.json({ message: 'Marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;