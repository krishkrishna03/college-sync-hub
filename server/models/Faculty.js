const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  facultyId: {
    type: String,
    required: true,
    unique: true
  },
  department: {
    type: String,
    required: true
  },
  designation: {
    type: String,
    required: true
  },
  qualification: {
    type: String
  },
  experience: {
    type: Number // in years
  },
  specialization: [String],
  assignedBatches: [{
    batch: String,
    branch: String,
    section: String,
    subject: String
  }],
  assignedTests: [{
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test'
    },
    assignedDate: {
      type: Date,
      default: Date.now
    },
    batches: [String],
    branches: [String],
    sections: [String]
  }],
  tasks: [{
    title: String,
    description: String,
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    dueDate: Date,
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Faculty', facultySchema);