const express = require('express');
const { body, validationResult } = require('express-validator');
const Batch = require('../models/Batch');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/batches
// @desc    Get all batches
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const batches = await Batch.find({ isActive: true }).sort({ year: -1 });
    res.json({ batches });
  } catch (error) {
    console.error('Get batches error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/batches
// @desc    Create new batch
// @access  Private (Admin)
router.post('/', [auth, adminAuth], [
  body('year').notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { year } = req.body;

    // Check if batch already exists
    const existingBatch = await Batch.findOne({ year });
    if (existingBatch) {
      return res.status(400).json({ message: 'Batch year already exists' });
    }

    const batch = new Batch({
      year,
      branches: [],
      academicYear: `${year}-${parseInt(year) + 1}`
    });

    await batch.save();

    res.status(201).json({
      message: 'Batch created successfully',
      batch
    });
  } catch (error) {
    console.error('Create batch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/batches/:id/branches
// @desc    Add branch to batch
// @access  Private (Admin)
router.post('/:id/branches', [auth, adminAuth], [
  body('name').notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, sections } = req.body;
    
    const batch = await Batch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    // Check if branch already exists in this batch
    const existingBranch = batch.branches.find(branch => branch.name === name);
    if (existingBranch) {
      return res.status(400).json({ message: 'Branch already exists in this batch' });
    }

    batch.branches.push({
      name,
      sections: sections || [],
      totalStudents: 0
    });

    await batch.save();

    res.json({ message: 'Branch added successfully' });
  } catch (error) {
    console.error('Add branch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/batches/:batchId/branches/:branchId
// @desc    Update branch
// @access  Private (Admin)
router.put('/:batchId/branches/:branchId', [auth, adminAuth], async (req, res) => {
  try {
    const { name } = req.body;
    
    const batch = await Batch.findById(req.params.batchId);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    const branch = batch.branches.id(req.params.branchId);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    if (name) branch.name = name;
    
    await batch.save();

    res.json({ message: 'Branch updated successfully' });
  } catch (error) {
    console.error('Update branch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/batches/:batchId/branches/:branchId
// @desc    Delete branch
// @access  Private (Admin)
router.delete('/:batchId/branches/:branchId', [auth, adminAuth], async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.batchId);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    batch.branches.id(req.params.branchId).remove();
    await batch.save();

    res.json({ message: 'Branch deleted successfully' });
  } catch (error) {
    console.error('Delete branch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/batches/:id
// @desc    Delete batch
// @access  Private (Admin)
router.delete('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    await Batch.findByIdAndDelete(req.params.id);
    res.json({ message: 'Batch deleted successfully' });
  } catch (error) {
    console.error('Delete batch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;