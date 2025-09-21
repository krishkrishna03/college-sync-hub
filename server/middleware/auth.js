const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId)
      .select('-password')
      .populate('collegeId', 'name code isActive');
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    if (user.status !== 'active') {
      return res.status(401).json({ message: 'Account is not active' });
    }

    // Check if college is active (for college-related users)
    if (user.role !== 'admin' && user.collegeId && !user.collegeId.isActive) {
      return res.status(401).json({ message: 'College account is inactive' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const adminAuth = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

const collegeAuth = (req, res, next) => {
  if (req.user.role !== 'college-admin' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'College admin or master admin access required' });
  }
  next();
};

const facultyAuth = (req, res, next) => {
  if (!['faculty', 'college-admin', 'admin'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Faculty, college admin or master admin access required' });
  }
  next();
};

const studentAuth = (req, res, next) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ message: 'Student access required' });
  }
  next();
};

// Middleware to ensure user belongs to the same college
const sameCollegeAuth = (req, res, next) => {
  if (req.user.role === 'admin') {
    return next(); // Master admin can access all colleges
  }
  
  // For college-specific operations, ensure user belongs to the college
  const collegeId = req.params.collegeId || req.body.collegeId || req.user.collegeId;
  
  if (req.user.collegeId && req.user.collegeId.toString() !== collegeId.toString()) {
    return res.status(403).json({ message: 'Access denied to this college' });
  }
  
  next();
};

module.exports = { auth, adminAuth, collegeAuth, facultyAuth, studentAuth, sameCollegeAuth };