const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  year: {
    type: String,
    required: true,
    unique: true
  },
  branches: [{
    name: {
      type: String,
      required: true
    },
    sections: [{
      name: String,
      capacity: Number,
      currentStrength: {
        type: Number,
        default: 0
      }
    }],
    totalStudents: {
      type: Number,
      default: 0
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  academicYear: String,
  startDate: Date,
  endDate: Date
}, {
  timestamps: true
});

// Update totalStudents when sections change
batchSchema.pre('save', function(next) {
  this.branches.forEach(branch => {
    branch.totalStudents = branch.sections.reduce((total, section) => {
      return total + (section.currentStrength || 0);
    }, 0);
  });
  next();
});
module.exports = mongoose.model('Batch', batchSchema);