// middleware/college.js

function collegeAuth(req, res, next) {
  // Only allow college admins
  if (!req.user || req.user.role !== 'college-admin') {
    return res.status(403).json({ message: 'Access denied: College admin only' });
  }
  next();
}

module.exports =collegeAuth ;
