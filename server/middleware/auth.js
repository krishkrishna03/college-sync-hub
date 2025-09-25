const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).populate('collegeId');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Access denied. Insufficient permissions.' 
      });
    }
    next();
  };
};

const collegeAccess = async (req, res, next) => {
  try {
    if (req.user.role === 'master_admin') {
      return next();
    }
    
    // For college admin, faculty, and students - check college access
    const requestedCollegeId = req.params.collegeId || req.body.collegeId;
    
    if (requestedCollegeId && requestedCollegeId !== req.user.collegeId?.toString()) {
      return res.status(403).json({ 
        error: 'Access denied. You can only access your college data.' 
      });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ error: 'Server error during authorization' });
  }
};

module.exports = { auth, authorize, collegeAccess };