const express = require('express');
const multer = require('multer');
const path = require('path');
const Notification = require('../models/Notification');
const NotificationRecipient = require('../models/NotificationRecipient');
const User = require('../models/User');
const College = require('../models/College');
const { auth, authorize } = require('../middleware/auth');
const emailService = require('../utils/emailService');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/notifications/');
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
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, and documents are allowed'));
    }
  }
});

// Create notification (Master Admin and College Admin)
router.post('/', auth, authorize('master_admin', 'college_admin'), upload.single('attachment'), [
  body('title').trim().isLength({ min: 3, max: 200 }),
  body('message').trim().isLength({ min: 10, max: 2000 }),
  body('type').isIn(['general', 'urgent', 'announcement', 'reminder']),
  body('priority').isIn(['low', 'medium', 'high']),
  body('targetType').isIn(['colleges', 'faculty', 'students', 'specific'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      message,
      type,
      priority,
      targetType,
      targetColleges,
      targetUsers,
      filters,
      scheduledFor,
      expiresAt
    } = req.body;

    // Create notification
    const notification = new Notification({
      title,
      message,
      type,
      priority,
      createdBy: req.user._id,
      createdByRole: req.user.role,
      targetType,
      collegeId: req.user.role === 'college_admin' ? req.user.collegeId : null,
      targetColleges: targetColleges ? JSON.parse(targetColleges) : [],
      targetUsers: targetUsers ? JSON.parse(targetUsers) : [],
      filters: filters ? JSON.parse(filters) : {},
      scheduledFor: scheduledFor || Date.now(),
      expiresAt: expiresAt || null
    });

    // Handle file attachment
    if (req.file) {
      notification.attachment = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: req.file.path
      };
    }

    await notification.save();

    // Determine recipients based on target type and user role
    let recipients = [];

    if (req.user.role === 'master_admin') {
      recipients = await getMasterAdminRecipients(notification);
    } else if (req.user.role === 'college_admin') {
      recipients = await getCollegeAdminRecipients(notification, req.user.collegeId);
    }

    // Create recipient records
    const recipientRecords = recipients.map(recipient => ({
      notificationId: notification._id,
      recipientId: recipient._id,
      recipientRole: recipient.role,
      collegeId: recipient.collegeId
    }));

    if (recipientRecords.length > 0) {
      await NotificationRecipient.insertMany(recipientRecords);
    }

    // Update total recipients count
    notification.totalRecipients = recipients.length;
    await notification.save();

    // Send emails asynchronously
    sendNotificationEmails(notification, recipients);

    res.status(201).json({
      message: 'Notification created successfully',
      notification: {
        id: notification._id,
        title: notification.title,
        totalRecipients: recipients.length
      }
    });

  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get notifications for current user
router.get('/my-notifications', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const notifications = await NotificationRecipient.find({
      recipientId: req.user._id
    })
    .populate({
      path: 'notificationId',
      populate: {
        path: 'createdBy',
        select: 'name email role'
      }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    const totalCount = await NotificationRecipient.countDocuments({
      recipientId: req.user._id
    });

    const unreadCount = await NotificationRecipient.countDocuments({
      recipientId: req.user._id,
      isRead: false
    });

    res.json({
      notifications: notifications.map(nr => ({
        id: nr._id,
        notification: nr.notificationId,
        isRead: nr.isRead,
        readAt: nr.readAt,
        createdAt: nr.createdAt
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1
      },
      unreadCount
    });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notificationRecipient = await NotificationRecipient.findOne({
      _id: req.params.id,
      recipientId: req.user._id
    });

    if (!notificationRecipient) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (!notificationRecipient.isRead) {
      notificationRecipient.isRead = true;
      notificationRecipient.readAt = new Date();
      await notificationRecipient.save();
    }

    res.json({ message: 'Notification marked as read' });

  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark all notifications as read
router.put('/mark-all-read', auth, async (req, res) => {
  try {
    await NotificationRecipient.updateMany(
      { recipientId: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({ message: 'All notifications marked as read' });

  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get notification statistics (for admins)
router.get('/stats', auth, authorize('master_admin', 'college_admin'), async (req, res) => {
  try {
    const matchCondition = req.user.role === 'college_admin'
      ? { createdBy: req.user._id }
      : {};

    const notifications = await Notification.find(matchCondition);
    const notificationIds = notifications.map(n => n._id);

    const recipientStats = await NotificationRecipient.aggregate([
      { $match: { notificationId: { $in: notificationIds } } },
      {
        $group: {
          _id: null,
          totalRecipients: { $sum: 1 },
          totalRead: { $sum: { $cond: ['$isRead', 1, 0] } },
          totalUnread: { $sum: { $cond: ['$isRead', 0, 1] } }
        }
      }
    ]);

    const roleDistribution = await NotificationRecipient.aggregate([
      { $match: { notificationId: { $in: notificationIds } } },
      {
        $group: {
          _id: '$recipientRole',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityDistribution = await Notification.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    const recipientData = recipientStats[0] || { totalRecipients: 0, totalRead: 0, totalUnread: 0 };
    const readPercentage = recipientData.totalRecipients > 0
      ? (recipientData.totalRead / recipientData.totalRecipients) * 100
      : 0;

    const byRole = {
      colleges: roleDistribution.find(r => r._id === 'college_admin')?.count || 0,
      faculty: roleDistribution.find(r => r._id === 'faculty')?.count || 0,
      students: roleDistribution.find(r => r._id === 'student')?.count || 0
    };

    const byPriority = {
      high: priorityDistribution.find(p => p._id === 'high')?.count || 0,
      medium: priorityDistribution.find(p => p._id === 'medium')?.count || 0,
      low: priorityDistribution.find(p => p._id === 'low')?.count || 0
    };

    const recentActivity = await Notification.find(matchCondition)
      .select('_id title totalRecipients emailsSent createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalNotifications: notifications.length,
      totalRecipients: recipientData.totalRecipients,
      totalRead: recipientData.totalRead,
      totalUnread: recipientData.totalUnread,
      readPercentage,
      byRole,
      byPriority,
      recentActivity
    });

  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all sent notifications with tracking data (Master Admin)
router.get('/sent-notifications', auth, authorize('master_admin', 'college_admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const matchCondition = req.user.role === 'college_admin'
      ? { createdBy: req.user._id }
      : {};

    const notifications = await Notification.find(matchCondition)
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalCount = await Notification.countDocuments(matchCondition);

    const notificationsWithStats = await Promise.all(
      notifications.map(async (notification) => {
        const recipientStats = await NotificationRecipient.aggregate([
          { $match: { notificationId: notification._id } },
          {
            $group: {
              _id: null,
              totalRecipients: { $sum: 1 },
              totalRead: { $sum: { $cond: ['$isRead', 1, 0] } }
            }
          }
        ]);

        const stats = recipientStats[0] || { totalRecipients: 0, totalRead: 0 };

        return {
          id: notification._id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          priority: notification.priority,
          targetType: notification.targetType,
          totalRecipients: stats.totalRecipients,
          totalRead: stats.totalRead,
          totalUnread: stats.totalRecipients - stats.totalRead,
          readPercentage: stats.totalRecipients > 0 ? (stats.totalRead / stats.totalRecipients) * 100 : 0,
          emailsSent: notification.emailsSent || 0,
          createdBy: notification.createdBy,
          createdAt: notification.createdAt
        };
      })
    );

    res.json({
      notifications: notificationsWithStats,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get sent notifications error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get detailed notification recipients
router.get('/:notificationId/recipients', auth, authorize('master_admin', 'college_admin'), async (req, res) => {
  try {
    const { notificationId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const filter = req.query.filter;

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (req.user.role === 'college_admin' && notification.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const matchCondition = { notificationId: notification._id };
    if (filter === 'read') {
      matchCondition.isRead = true;
    } else if (filter === 'unread') {
      matchCondition.isRead = false;
    }

    const recipients = await NotificationRecipient.find(matchCondition)
      .populate('recipientId', 'name email role branch batch section')
      .sort({ isRead: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalCount = await NotificationRecipient.countDocuments(matchCondition);

    res.json({
      notification: {
        id: notification._id,
        title: notification.title,
        message: notification.message
      },
      recipients: recipients.map(r => ({
        id: r._id,
        user: r.recipientId,
        isRead: r.isRead,
        readAt: r.readAt,
        emailSent: r.emailSent,
        emailSentAt: r.emailSentAt,
        deliveryStatus: r.deliveryStatus
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get notification recipients error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper functions
async function getMasterAdminRecipients(notification) {
  let recipients = [];

  switch (notification.targetType) {
    case 'colleges':
      if (notification.targetColleges.length > 0) {
        recipients = await User.find({
          role: 'college_admin',
          collegeId: { $in: notification.targetColleges },
          isActive: true
        });
      } else {
        recipients = await User.find({
          role: 'college_admin',
          isActive: true
        });
      }
      break;

    case 'faculty':
      const facultyQuery = { role: 'faculty', isActive: true };
      if (notification.targetColleges.length > 0) {
        facultyQuery.collegeId = { $in: notification.targetColleges };
      }
      recipients = await User.find(facultyQuery);
      break;

    case 'students':
      const studentQuery = { role: 'student', isActive: true };
      if (notification.targetColleges.length > 0) {
        studentQuery.collegeId = { $in: notification.targetColleges };
      }
      recipients = await User.find(studentQuery);
      break;

    case 'specific':
      recipients = await User.find({
        _id: { $in: notification.targetUsers },
        isActive: true
      });
      break;
  }

  return recipients;
}

async function getCollegeAdminRecipients(notification, collegeId) {
  let recipients = [];
  const baseQuery = { collegeId, isActive: true };

  switch (notification.targetType) {
    case 'faculty':
      const facultyQuery = { ...baseQuery, role: 'faculty' };
      applyFilters(facultyQuery, notification.filters);
      recipients = await User.find(facultyQuery);
      break;

    case 'students':
      const studentQuery = { ...baseQuery, role: 'student' };
      applyFilters(studentQuery, notification.filters);
      recipients = await User.find(studentQuery);
      break;

    case 'specific':
      recipients = await User.find({
        _id: { $in: notification.targetUsers },
        collegeId,
        isActive: true
      });
      break;
  }

  return recipients;
}

function applyFilters(query, filters) {
  if (filters.branches && filters.branches.length > 0) {
    query.branch = { $in: filters.branches };
  }
  if (filters.batches && filters.batches.length > 0) {
    query.batch = { $in: filters.batches };
  }
  if (filters.sections && filters.sections.length > 0) {
    query.section = { $in: filters.sections };
  }
}

async function sendNotificationEmails(notification, recipients) {
  try {
    let emailsSent = 0;
    
    for (const recipient of recipients) {
      try {
        const emailSent = await emailService.sendNotificationEmail(
          recipient.email,
          recipient.name,
          notification.title,
          notification.message,
          notification.type,
          notification.priority
        );
        
        if (emailSent) {
          emailsSent++;
          // Update recipient record
          await NotificationRecipient.updateOne(
            { notificationId: notification._id, recipientId: recipient._id },
            { emailSent: true, emailSentAt: new Date() }
          );
        }
      } catch (error) {
        console.error(`Failed to send email to ${recipient.email}:`, error);
      }
    }

    // Update notification with emails sent count
    await Notification.updateOne(
      { _id: notification._id },
      { emailsSent }
    );

  } catch (error) {
    console.error('Send notification emails error:', error);
  }
}

module.exports = router;