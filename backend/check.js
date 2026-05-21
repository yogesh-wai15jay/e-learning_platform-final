require('dotenv').config();
const connectDB = require('./config/db');
const Assignment = require('./models/Assignment');

const check = async () => {
  await connectDB();
  const now = new Date();
  const assignments = await Assignment.find({}).lean();
  console.log('All assignments:', assignments.map(a => ({
    id: a._id,
    deadlineDate: a.deadlineDate,
    completed: a.completed,
    reminderSent: a.reminderSent,
    assignedAt: a.assignedAt
  })));
  console.log('Current time:', now);
  process.exit(0);
};
check();