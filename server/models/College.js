const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  adminUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  settings: {
    allowSelfRegistration: {
      type: Boolean,
      default: false
    },
    maxStudents: {
      type: Number,
      default: 10000
    },
    maxFaculty: {
      type: Number,
      default: 500
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('College', collegeSchema);