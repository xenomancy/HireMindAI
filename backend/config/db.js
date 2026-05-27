const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const connUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hiremind';
    const conn = await mongoose.connect(connUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Do not exit process in production if we want to run fallback modes, but log clearly.
    console.log('Ensure MongoDB is running or MONGODB_URI is provided in .env');
  }
};

module.exports = connectDB;
