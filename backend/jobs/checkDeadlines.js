const cron = require('node-cron');
const Assignment = require('../models/Assignment');
const User = require('../models/User');
const { sendReminderEmail, sendAuthorReminderNotification } = require('../utils/emailService');

const checkDeadlines = async () => {
  console.log('Running deadline check job at', new Date().toISOString());
  const now = new Date();
  const expired = await Assignment.find({
    deadlineDate: { $lt: now },
    completed: false,
    reminderSent: false
  }).populate('user assignedBy');

  console.log(`Found ${expired.length} expired assignments`);

  for (const assign of expired) {
    const user = assign.user;
    const author = assign.assignedBy;
    if (!user || !user.email) {
      console.log(`Skipping assignment ${assign._id}: user not found`);
      continue;
    }

    try {
      await sendReminderEmail(user.name, user.email, assign.courseTitle, assign.deadlineDate);
      console.log(`Reminder sent to ${user.email} for ${assign.courseTitle}`);
    } catch (err) {
      console.error(`Failed to send reminder to ${user.email}:`, err.message);
    }

    if (author && author.email) {
      try {
        await sendAuthorReminderNotification(author.name, author.email, user.name, assign.courseTitle);
        console.log(`Author notified: ${author.email}`);
      } catch (err) {
        console.error(`Failed to notify author ${author.email}:`, err.message);
      }
    }

    assign.reminderSent = true;
    await assign.save();
  }
};

// For testing: run every minute. Change to '0 9 * * *' for production daily at 9 AM
cron.schedule('* * * * *', checkDeadlines);

module.exports = checkDeadlines;