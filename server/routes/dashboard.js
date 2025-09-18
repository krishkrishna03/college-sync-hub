const express = require('express');
const User = require('../models/User');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Test = require('../models/Test');
const Announcement = require('../models/Announcement');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private (Admin)
router.get('/stats', [auth, adminAuth], async (req, res) => {
  try {
    // Get counts
    const totalStudents = await User.countDocuments({ role: 'student', status: 'active' });
    const facultyMembers = await User.countDocuments({ role: 'faculty', status: 'active' });
    const activeTests = await Test.countDocuments({ isActive: true });
    const totalAnnouncements = await Announcement.countDocuments();

    // Get recent activities (last 10)
    const recentStudents = await User.find({ role: 'student' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name createdAt');

    const recentTests = await Test.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title category createdAt');

    const recentAnnouncements = await Announcement.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title status createdAt');

    // Format recent activities
    const recentActivities = [
      ...recentStudents.map(student => ({
        action: 'New student enrolled',
        details: `${student.name} - Student`,
        time: getTimeAgo(student.createdAt),
        type: 'success'
      })),
      ...recentTests.map(test => ({
        action: 'Test created',
        details: `${test.title} - ${test.category}`,
        time: getTimeAgo(test.createdAt),
        type: 'info'
      })),
      ...recentAnnouncements.map(announcement => ({
        action: 'Announcement published',
        details: announcement.title,
        time: getTimeAgo(announcement.createdAt),
        type: 'warning'
      }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10);

    // Get upcoming tests (tests scheduled for today and tomorrow)
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const upcomingTests = await Test.find({
      scheduledDate: {
        $gte: today,
        $lte: tomorrow
      },
      isActive: true
    }).limit(5);

    res.json({
      stats: {
        totalStudents,
        facultyMembers,
        activeTests,
        announcements: totalAnnouncements
      },
      recentActivities,
      upcomingTests: upcomingTests.map(test => ({
        id: test._id,
        title: test.title,
        batch: test.assignedTo.batches.join(', '),
        date: test.scheduledDate,
        students: 0 // This would be calculated based on assigned batches
      }))
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to get time ago
function getTimeAgo(date) {
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} days ago`;
}

module.exports = router;