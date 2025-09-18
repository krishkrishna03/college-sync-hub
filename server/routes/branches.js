const express = require('express');
const Batch = require('../models/Batch');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/branches
// @desc    Get all branches across all batches
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { batchYear } = req.query;
    
    let filter = { isActive: true };
    if (batchYear && batchYear !== 'all') {
      filter.year = batchYear;
    }

    const batches = await Batch.find(filter);
    
    const branches = [];
    batches.forEach(batch => {
      batch.branches.forEach(branch => {
        branches.push({
          id: branch._id,
          batchYear: batch.year,
          branchName: branch.name,
          usersCount: branch.totalStudents,
          sections: branch.sections
        });
      });
    });

    res.json({ branches });
  } catch (error) {
    console.error('Get branches error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;