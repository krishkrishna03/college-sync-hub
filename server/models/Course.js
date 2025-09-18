const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  category: {
    type: String,
    required: true
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  duration: String, // e.g., "6 months"
  instructor: String,
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  enrolledStudents: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    enrolledDate: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['enrolled', 'completed', 'dropped'],
      default: 'enrolled'
    }
  }],
  modules: [{
    title: String,
    description: String,
    content: String,
    order: Number,
    isCompleted: {
      type: Boolean,
      default: false
    }
  }],
  assignments: [{
    title: String,
    description: String,
    dueDate: Date,
    maxMarks: Number,
    submissions: [{
      studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
      },
      submittedAt: Date,
      marks: Number,
      feedback: String
    }]
  }],
  registrationDeadline: Date,
  hasEnrollmentForm: {
    type: Boolean,
    default: false
  },
  formLink: String,
  attachedLinks: [String],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);