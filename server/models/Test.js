const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  testCode: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    enum: ['practice', 'assessment', 'mock', 'company-specific'],
    required: true
  },
  subject: {
    type: String,
    enum: ['arithmetic', 'reasoning', 'verbal', 'technical', 'coding', 'lsrw'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  questions: [{
    questionText: String,
    options: [String],
    correctAnswer: String,
    explanation: String,
    marks: {
      type: Number,
      default: 1
    }
  }],
  assignedTo: {
    batches: [String],
    branches: [String],
    sections: [String]
  },
  company: String, // for company-specific tests
  cutoffMarks: {
    type: Number,
    default: 0
  },
  instructions: String,
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scheduledDate: Date,
  results: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    score: Number,
    accuracy: Number,
    timeTaken: Number,
    answers: [{
      questionIndex: Number,
      selectedAnswer: String,
      isCorrect: Boolean,
      timeTaken: Number
    }],
    status: {
      type: String,
      enum: ['completed', 'in-progress', 'not-started'],
      default: 'not-started'
    },
    startTime: Date,
    endTime: Date,
    submittedAt: Date
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Test', testSchema);