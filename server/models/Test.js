const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true,
    trim: true
  },
  options: {
    A: { type: String, required: true, trim: true },
    B: { type: String, required: true, trim: true },
    C: { type: String, required: true, trim: true },
    D: { type: String, required: true, trim: true }
  },
  correctAnswer: {
    type: String,
    required: true,
    enum: ['A', 'B', 'C', 'D']
  },
  marks: {
    type: Number,
    required: true,
    min: 1
  }
}, { _id: true });

const testSchema = new mongoose.Schema({
  testName: {
    type: String,
    required: true,
    trim: true
  },
  testDescription: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    enum: ['Verbal', 'Reasoning', 'Technical', 'Arithmetic', 'Communication']
  },
  testType: {
    type: String,
    enum: ['Assessment', 'Practice', 'Assignment', 'Mock Test', 'Specific Company Test'],
    default: 'Assessment'
  },
  companyName: {
    type: String,
    trim: true,
    default: null
  },
  topics: [{
    type: String,
    trim: true
  }],
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  numberOfQuestions: {
    type: Number,
    required: true,
    min: 1
  },
  marksPerQuestion: {
    type: Number,
    required: true,
    min: 1
  },
  totalMarks: {
    type: Number,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true,
    min: 1
  },
  startDateTime: {
    type: Date,
    required: true
  },
  endDateTime: {
    type: Date,
    required: true
  },
  questions: [questionSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sourceType: {
    type: String,
    enum: ['manual', 'pdf', 'json', 'csv'],
    default: 'manual'
  },
  originalFileName: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Validate that questions count matches numberOfQuestions
testSchema.pre('save', function(next) {
  if (this.questions.length !== this.numberOfQuestions) {
    return next(new Error(`Number of questions (${this.questions.length}) must match the specified count (${this.numberOfQuestions})`));
  }
  
  // Calculate total marks
  this.totalMarks = this.numberOfQuestions * this.marksPerQuestion;
  
  // Validate start and end dates
  if (this.startDateTime >= this.endDateTime) {
    return next(new Error('End date must be after start date'));
  }
  
  next();
});

module.exports = mongoose.model('Test', testSchema);