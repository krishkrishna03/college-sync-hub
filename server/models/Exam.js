const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  testType: {
    type: String,
    enum: ['Practice', 'Assessment', 'Mock Test', 'Company Specific'],
    required: true
  },
  subject: {
    type: String,
    enum: ['Technical', 'Logical', 'Reasoning', 'Verbal', 'Coding', 'Other'],
    required: true
  },
  skills: [String],
  numberOfQuestions: {
    type: Number,
    required: true
  },
  difficultyLevel: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  instructions: String,
  questions: [{
    questionText: {
      type: String,
      required: true
    },
    options: [{
      type: String,
      required: true
    }],
    correctAnswer: {
      type: String,
      required: true
    },
    explanation: String,
    marks: {
      type: Number,
      default: 1
    }
  }],
  assignedColleges: [{
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College'
    },
    assignedDate: {
      type: Date,
      default: Date.now
    },
    batches: [String],
    branches: [String],
    sections: [String],
    startDate: Date,
    endDate: Date,
    startTime: String,
    endTime: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  results: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student'
    },
    collegeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College'
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
      enum: ['not-started', 'in-progress', 'completed'],
      default: 'not-started'
    },
    startTime: Date,
    endTime: Date,
    submittedAt: Date
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Exam', examSchema);