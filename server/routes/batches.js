const express = require('express');
const { body, validationResult } = require('express-validator');
const Batch = require('../models/Batch');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// ------------------------
// GET ALL BATCHES
// ------------------------
router.get('/', auth, async (req, res) => {
  try {
    const batches = await Batch.find().sort({ year: -1 });
    res.json({ batches });
  } catch (error) {
    console.error('Get batches error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ------------------------
// CREATE NEW BATCH
// ------------------------
router.post(
  '/',
  [auth, adminAuth, body('year').notEmpty().trim()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { year, academicYear, startDate, endDate } = req.body;
      const existingBatch = await Batch.findOne({ year });
      if (existingBatch) return res.status(400).json({ message: 'Batch year already exists' });

      const batch = new Batch({
        year,
        branches: [],
        academicYear: academicYear || `${year}-${parseInt(year) + 1}`,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : new Date(new Date().setFullYear(new Date().getFullYear() + 4)),
        isActive: true
      });

      await batch.save();
      res.status(201).json({ message: 'Batch created successfully', batch });
    } catch (error) {
      console.error('Create batch error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// ------------------------
// ADD BRANCH TO BATCH
// ------------------------
router.post(
  '/:id/branches',
  [auth, adminAuth, body('name').notEmpty().trim()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { name, sections } = req.body;
      const batch = await Batch.findById(req.params.id);
      if (!batch) return res.status(404).json({ message: 'Batch not found' });

      const existingBranch = batch.branches.find(branch => branch.name === name);
      if (existingBranch) return res.status(400).json({ message: 'Branch already exists in this batch' });

      // Create default sections if none provided
      const defaultSections = sections && sections.length > 0 ? sections : [
        { name: 'A', capacity: 60, currentStrength: 0 },
        { name: 'B', capacity: 60, currentStrength: 0 }
      ];
      batch.branches.push({
        name,
        sections: defaultSections,
        totalStudents: 0
      });

      await batch.save();
      const newBranch = batch.branches[batch.branches.length - 1];
      res.json({ 
        message: 'Branch added successfully', 
        branch: {
          id: newBranch._id,
          name: newBranch.name,
          sections: newBranch.sections,
          totalStudents: newBranch.totalStudents
        }
      });
    } catch (error) {
      console.error('Add branch error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// ------------------------
// UPDATE BRANCH (name, sections, totalStudents)
// ------------------------
router.put('/:batchId/branches/:branchId', [auth, adminAuth], async (req, res) => {
  try {
    const { name, sections, totalStudents } = req.body;

    const batch = await Batch.findById(req.params.batchId);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });

    const branch = batch.branches.id(req.params.branchId);
    if (!branch) return res.status(404).json({ message: 'Branch not found' });

    if (name) branch.name = name;
    if (sections) branch.sections = sections;
    if (totalStudents !== undefined) branch.totalStudents = totalStudents;

    await batch.save();
    res.json({ 
      message: 'Branch updated successfully', 
      branch: {
        id: branch._id,
        name: branch.name,
        sections: branch.sections,
        totalStudents: branch.totalStudents
      }
    });
  } catch (error) {
    console.error('Update branch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ------------------------
// ADD SECTION TO BRANCH
// ------------------------
router.post('/:batchId/branches/:branchId/sections', [auth, adminAuth], async (req, res) => {
  try {
    const { name, capacity } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Section name is required' });
    }

    const batch = await Batch.findById(req.params.batchId);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });

    const branch = batch.branches.id(req.params.branchId);
    if (!branch) return res.status(404).json({ message: 'Branch not found' });

    // Check if section already exists
    const existingSection = branch.sections.find(section => section.name === name);
    if (existingSection) {
      return res.status(400).json({ message: 'Section already exists in this branch' });
    }

    branch.sections.push({
      name,
      capacity: capacity || 60,
      currentStrength: 0
    });

    await batch.save();
    const newSection = branch.sections[branch.sections.length - 1];
    
    res.json({ 
      message: 'Section added successfully', 
      section: {
        id: newSection._id,
        name: newSection.name,
        capacity: newSection.capacity,
        currentStrength: newSection.currentStrength
      }
    });
  } catch (error) {
    console.error('Add section error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ------------------------
// ENROLL STUDENT IN SECTION
// ------------------------
router.post('/:batchId/branches/:branchId/enroll', [auth, adminAuth], async (req, res) => {
  try {
    const { studentName, sectionName } = req.body;

    const batch = await Batch.findById(req.params.batchId);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });

    const branch = batch.branches.id(req.params.branchId);
    if (!branch) return res.status(404).json({ message: 'Branch not found' });

    const section = branch.sections.find(s => s.name === sectionName);
    if (!section) return res.status(404).json({ message: 'Section not found' });

    // Check capacity
    if (section.currentStrength >= section.capacity) {
      return res.status(400).json({ message: 'Section is at full capacity' });
    }

    section.currentStrength += 1;
    branch.totalStudents += 1;

    await batch.save();
    res.json({ message: `Student ${studentName} enrolled in ${sectionName}`, branch });
  } catch (error) {
    console.error('Enroll student error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ------------------------
// DELETE BRANCH
// ------------------------
router.delete('/:batchId/branches/:branchId', [auth, adminAuth], async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.batchId);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });

    batch.branches.id(req.params.branchId).remove();
    await batch.save();

    res.json({ message: 'Branch deleted successfully' });
  } catch (error) {
    console.error('Delete branch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ------------------------
// DELETE BATCH
// ------------------------
router.delete('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ message: 'Batch not found' });

    await Batch.findByIdAndDelete(req.params.id);
    res.json({ message: 'Batch deleted successfully' });
  } catch (error) {
    console.error('Delete batch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;