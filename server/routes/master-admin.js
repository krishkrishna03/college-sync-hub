const express = require('express');
const { auth, adminAuth } = require('../middleware/auth');
const AuditLog = require('../models/AuditLog');
const College = require('../models/College');
const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Exam = require('../models/Exam');

const router = express.Router();

// @route   GET /api/master-admin/dashboard
// @desc    Get master admin dashboard statistics
// @access  Private (Master Admin)
router.get('/dashboard', [auth, adminAuth], async (req, res) => {
  try {
    const totalColleges = await College.countDocuments();
    const totalStudents = await Student.countDocuments();
    const totalFaculty = await Faculty.countDocuments();
    const totalExams = await Exam.countDocuments();
    
    // Calculate active users (logged in within last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: thirtyDaysAgo }
    });

    // Calculate monthly growth
    const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newStudentsThisMonth = await Student.countDocuments({
      createdAt: { $gte: lastMonth }
    });
    const totalStudentsLastMonth = totalStudents - newStudentsThisMonth;
    const monthlyGrowth = totalStudentsLastMonth > 0 ? 
      ((newStudentsThisMonth / totalStudentsLastMonth) * 100).toFixed(1) : 0;

    res.json({
      totalColleges,
      totalStudents,
      totalFaculty,
      totalExams,
      activeUsers,
      monthlyGrowth: parseFloat(monthlyGrowth)
    });
  } catch (error) {
    console.error('Get master admin dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/master-admin/audit-logs
// @desc    Get audit logs with filters
// @access  Private (Master Admin)
router.get('/audit-logs', [auth, adminAuth], async (req, res) => {
  try {
    const { type, entityType, user, page = 1, limit = 50 } = req.query;

    let filter = {};
    if (type && type !== 'all') filter.type = type;
    if (entityType && entityType !== 'all') filter.entityType = entityType;
    if (user) filter.user = user;

    const logs = await AuditLog.find(filter)
      .populate('user', 'name email')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await AuditLog.countDocuments(filter);

    const formattedLogs = logs.map(log => ({
      id: log._id,
      action: log.action,
      details: log.details,
      user: log.user?.name || log.userName || 'Unknown',
      type: log.type,
      timestamp: log.createdAt.toLocaleString(),
      entityType: log.entityType
    }));

    res.json({
      logs: formattedLogs,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/master-admin/platform-stats
// @desc    Get detailed platform statistics
// @access  Private (Master Admin)
router.get('/platform-stats', [auth, adminAuth], async (req, res) => {
  try {
    // Get monthly data for charts
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const students = await Student.countDocuments({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      });
      const faculty = await Faculty.countDocuments({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      });
      const colleges = await College.countDocuments({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      });

      monthlyData.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        students,
        faculty,
        colleges
      });
    }

    // Get college status distribution
    const activeColleges = await College.countDocuments({ isActive: true });
    const inactiveColleges = await College.countDocuments({ isActive: false });
    const totalColleges = activeColleges + inactiveColleges;

    const statusDistribution = {
      active: totalColleges > 0 ? Math.round((activeColleges / totalColleges) * 100) : 0,
      inactive: totalColleges > 0 ? Math.round((inactiveColleges / totalColleges) * 100) : 0
    };

    res.json({
      monthlyData,
      statusDistribution
    });
  } catch (error) {
    console.error('Get platform stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;