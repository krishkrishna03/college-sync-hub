const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  registrationNumber: {
    type: String,
    required: true,
    unique: true
  },
  batch: {
    type: String,
    required: true
  },
  branch: {
    type: String,
    required: true
  },
  section: {
    type: String,
    required: true
  },
  year: {
    type: String,
    required: true
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  academicStatus: {
    type: String,
    enum: ['active', 'inactive', 'graduated', 'dropped'],
    default: 'active'
  },
  courses: [{
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    enrolledDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['enrolled', 'completed', 'dropped'],
      default: 'enrolled'
    },
    progress: {
      type: Number,
      default: 0
    }
  }],
  testResults: [{
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test'
    },
    score: Number,
    accuracy: Number,
    timeTaken: Number,
    status: {
      type: String,
      enum: ['completed', 'in-progress', 'not-started'],
      default: 'not-started'
    },
    attemptDate: {
      type: Date,
      default: Date.now
    }
  }],
  performance: {
    overallGrade: String,
    gpa: Number,
    attendance: Number,
    assignments: {
      completed: { type: Number, default: 0 },
      total: { type: Number, default: 0 }
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);