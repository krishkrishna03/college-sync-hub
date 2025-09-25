const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Create master admin if it doesn't exist
    await createMasterAdmin();
    
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const createMasterAdmin = async () => {
  try {
    const User = require('../models/User');
    
    const masterAdmin = await User.findOne({ role: 'master_admin' });
    
    if (!masterAdmin) {
      const newMasterAdmin = new User({
        name: 'Master Administrator',
        email: 'admin@academic.com',
        password: 'admin123',
        role: 'master_admin'
      });
      
      await newMasterAdmin.save();
      console.log('Master Admin created: admin@academic.com / admin123');
    }
  } catch (error) {
    console.error('Error creating master admin:', error);
  }
};

module.exports = connectDB;