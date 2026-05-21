require('dotenv').config();
const connectDB = require('./config/db');
const Assignment = require('./models/Assignment');

const check = async () => {
  await connectDB();
  const assignments = await Assignment.find().sort({ assignedAt: -1 }).limit(5).lean();
  console.log('Latest 5 assignments:');
  assignments.forEach(a => {
    console.log({
      id: a._id,
      assignedAt: a.assignedAt,
      deadlineDays: a.deadlineDays,
      deadlineHours: a.deadlineHours,
      deadlineDate: a.deadlineDate,
      completed: a.completed,
      reminderSent: a.reminderSent,
      courseTitle: a.courseTitle
    });
  });
  process.exit(0);
};
check();