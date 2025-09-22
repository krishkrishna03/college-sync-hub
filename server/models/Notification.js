const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  targetRole: {
    type: String,
    enum: ['all', 'college-admin', 'faculty', 'student'],
    required: true
  },
  targetColleges: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College'
  }],
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error'],
    default: 'info'
  },
  scheduledFor: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'scheduled'],
    default: 'draft'
  },
  readBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sentAt: Date,
  expiresAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);