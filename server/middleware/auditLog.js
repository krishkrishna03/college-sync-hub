const AuditLog = require('../models/AuditLog');

// Middleware to create audit logs for important actions
const createAuditLog = (action, entityType) => {
  return async (req, res, next) => {
    // Store original res.json to intercept successful responses
    const originalJson = res.json;
    
    res.json = function(data) {
      // Only log successful operations (status < 400)
      if (res.statusCode < 400 && req.user) {
        // Extract entity ID from response or request
        let entityId = req.params.id || req.params.userId || req.params.collegeId;
        if (data && data.id) entityId = data.id;
        if (data && data._id) entityId = data._id;

        // Create audit log entry
        AuditLog.create({
          action,
          details: generateDetails(action, req, data),
          user: req.user._id,
          userName: req.user.name,
          userEmail: req.user.email,
          type: getActionType(action),
          entityType,
          entityId: entityId?.toString(),
          ipAddress: req.ip || req.connection.remoteAddress,
          userAgent: req.get('User-Agent'),
          metadata: {
            method: req.method,
            url: req.originalUrl,
            body: sanitizeBody(req.body)
          }
        }).catch(err => {
          console.error('Failed to create audit log:', err);
        });
      }
      
      // Call original res.json
      return originalJson.call(this, data);
    };
    
    next();
  };
};

// Generate human-readable details for audit log
const generateDetails = (action, req, data) => {
  const method = req.method;
  const entityName = req.body.name || req.body.title || req.body.email || 'item';
  
  switch (method) {
    case 'POST':
      return `Created ${entityName}`;
    case 'PUT':
    case 'PATCH':
      return `Updated ${entityName}`;
    case 'DELETE':
      return `Deleted ${entityName}`;
    default:
      return action;
  }
};

// Get action type based on HTTP method
const getActionType = (action) => {
  if (action.toLowerCase().includes('create') || action.toLowerCase().includes('add')) return 'create';
  if (action.toLowerCase().includes('update') || action.toLowerCase().includes('edit')) return 'update';
  if (action.toLowerCase().includes('delete') || action.toLowerCase().includes('remove')) return 'delete';
  if (action.toLowerCase().includes('assign')) return 'assign';
  if (action.toLowerCase().includes('login')) return 'login';
  if (action.toLowerCase().includes('logout')) return 'logout';
  return 'other';
};

// Remove sensitive data from request body
const sanitizeBody = (body) => {
  const sanitized = { ...body };
  delete sanitized.password;
  delete sanitized.token;
  delete sanitized.secret;
  return sanitized;
};

module.exports = { createAuditLog };