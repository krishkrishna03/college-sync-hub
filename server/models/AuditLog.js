const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true
  },
  details: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userEmail: String,
  userName: String,
  type: {
    type: String,
    enum: ['create', 'update', 'delete', 'login', 'logout', 'assign', 'submit'],
    required: true
  },
  entityType: {
    type: String,
    enum: ['college', 'user', 'exam', 'test', 'announcement', 'notification'],
    required: true
  },
  entityId: String,
  ipAddress: String,
  userAgent: String,
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for efficient querying
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);