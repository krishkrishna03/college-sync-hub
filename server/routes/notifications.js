const express = require('express');
const { body, validationResult } = require('express-validator');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get notifications for user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    let filter = {};
    
    // Filter by user role and college
    if (req.user.role === 'admin') {
      // Master admin sees all notifications they created
      filter.createdBy = req.user._id;
    } else {
      // Other users see notifications targeted to them
      filter.$or = [
        { targetRole: 'all' },
        { targetRole: req.user.role }
      ];
      
      if (req.user.collegeId) {
        filter.$and = [
          { $or: filter.$or },
          {
            $or: [
              { targetColleges: { $size: 0 } }, // No specific colleges targeted
              { targetColleges: req.user.collegeId }
            ]
          }
        ];
        delete filter.$or;
      }
    }

    if (status && status !== 'all') filter.status = status;

    const notifications = await Notification.find(filter)
      .populate('createdBy', 'name email')
      .populate('targetColleges', 'name code')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Notification.countDocuments(filter);

    res.json({
      notifications,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/notifications
// @desc    Create new notification (Master Admin only)
// @access  Private (Master Admin)
router.post('/', [auth, adminAuth], [
  body('title').notEmpty().trim(),
  body('message').notEmpty().trim(),
  body('targetRole').isIn(['all', 'college-admin', 'faculty', 'student'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      message,
      targetRole,
      targetColleges,
      priority,
      type,
      scheduledFor
    } = req.body;

    const notification = new Notification({
      title,
      message,
      targetRole,
      targetColleges: targetColleges || [],
      priority: priority || 'medium',
      type: type || 'info',
      scheduledFor: scheduledFor ? new Date(scheduledFor) : new Date(),
      status: 'sent',
      createdBy: req.user._id,
      sentAt: new Date()
    });

    await notification.save();

    // Create audit log
    await AuditLog.create({
      action: 'Created notification',
      details: `Notification "${title}" sent to ${targetRole}`,
      user: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      type: 'create',
      entityType: 'notification',
      entityId: notification._id.toString()
    });

    res.status(201).json({
      message: 'Notification created successfully',
      notification
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check if already marked as read
    const alreadyRead = notification.readBy.some(
      read => read.userId.toString() === req.user._id.toString()
    );

    if (!alreadyRead) {
      notification.readBy.push({
        userId: req.user._id,
        readAt: new Date()
      });
      await notification.save();
    }

    res.json({ message: 'Marked as read' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete notification
// @access  Private (Master Admin)
router.delete('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await Notification.findByIdAndDelete(req.params.id);

    // Create audit log
    await AuditLog.create({
      action: 'Deleted notification',
      details: `Notification "${notification.title}" was deleted`,
      user: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      type: 'delete',
      entityType: 'notification',
      entityId: notification._id.toString()
    });

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;