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

const sectionSchema = new mongoose.Schema({
  sectionName: {
    type: String,
    required: true,
    trim: true
  },
  sectionDuration: {
    type: Number,
    required: true,
    min: 1
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
  questions: [questionSchema]
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
    type: Number
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
  hasSections: {
    type: Boolean,
    default: false
  },
  sections: [sectionSchema],
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
  instructions: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Validate that questions count matches numberOfQuestions
testSchema.pre('save', function(next) {
  // For sectioned tests
  if (this.hasSections && this.sections && this.sections.length > 0) {
    // Validate each section
    let totalQuestionsInSections = 0;
    let totalDuration = 0;
    let calculatedTotalMarks = 0;

    for (const section of this.sections) {
      if (section.questions.length !== section.numberOfQuestions) {
        return next(new Error(`Section "${section.sectionName}" has ${section.questions.length} questions but expects ${section.numberOfQuestions}`));
      }
      totalQuestionsInSections += section.numberOfQuestions;
      totalDuration += section.sectionDuration;
      calculatedTotalMarks += section.numberOfQuestions * section.marksPerQuestion;
    }

    // Update test-level fields based on sections
    this.numberOfQuestions = totalQuestionsInSections;
    this.duration = totalDuration;
    this.totalMarks = calculatedTotalMarks;
  } else {
    // For non-sectioned tests
    if (this.questions.length !== this.numberOfQuestions) {
      return next(new Error(`Number of questions (${this.questions.length}) must match the specified count (${this.numberOfQuestions})`));
    }

    // Calculate total marks
    this.totalMarks = this.numberOfQuestions * this.marksPerQuestion;
  }

  // Validate start and end dates
  if (this.startDateTime >= this.endDateTime) {
    return next(new Error('End date must be after start date'));
  }

  next();
});

module.exports = mongoose.model('Test', testSchema);
