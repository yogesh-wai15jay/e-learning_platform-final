require('dotenv').config();
const connectDB = require('../config/db');
const Course = require('../models/Course');

const addPassingRatio = async () => {
  await connectDB();
  const result = await Course.updateMany(
    { passingRatio: { $exists: false } },
    { $set: { passingRatio: 70 } }
  );
  console.log(`Updated ${result.modifiedCount} courses with default passingRatio (70).`);
  process.exit(0);
};

addPassingRatio();