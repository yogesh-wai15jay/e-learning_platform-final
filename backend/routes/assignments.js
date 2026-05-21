const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const { sendCourseAssignmentEmail } = require('../utils/emailService');
const router = express.Router();

// Middleware: only authors or admins can assign courses
const isAuthorOrAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (user.role !== 'author' && user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Only authors and admins can assign courses.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all regular users (role: 'user')
router.get('/users', auth, isAuthorOrAdmin, async (req, res) => {
  try {
    const users = await User.find( { 
        role: { $in: ['user', 'author'] },
        _id: { $ne: req.user.userId }   // exclude current user (admin/author)
      },
      'name email role departments');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all courses (with content available)
router.get('/courses', auth, isAuthorOrAdmin, async (req, res) => {
  try {
    const courses = await Course.find({ contentAvailable: true }, 'title id');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/assign', auth, isAuthorOrAdmin, async (req, res) => {
  try {
    const { userIds, courseIds, message, deadlineDays, deadlineHours } = req.body;

    if (!userIds || !courseIds || userIds.length === 0 || courseIds.length === 0) {
      return res.status(400).json({ message: 'Please select at least one user and one course' });
    }

    const days = parseInt(deadlineDays) || 0;
    const hours = parseInt(deadlineHours) || 0;
    if (days === 0 && hours === 0) {
      return res.status(400).json({ message: 'Please provide a deadline (days and/or hours)' });
    }

    const users = await User.find({ _id: { $in: userIds }, role: { $in: ['user', 'author'] } });
    const courses = await Course.find({ id: { $in: courseIds }, contentAvailable: true });

    const assignments = [];
    const now = new Date();
    const totalMs = (days * 24 * 60 * 60 * 1000) + (hours * 60 * 60 * 1000);
    const deadlineDate = new Date(now.getTime() + totalMs);

    for (const user of users) {
      for (const course of courses) {
        const existing = await Assignment.findOne({ user: user._id, courseId: course.id });
if (existing) {
  // Update existing assignment with new deadline
  existing.deadlineDays = days;
  existing.deadlineHours = hours;
  existing.deadlineDate = deadlineDate;
  existing.completed = false;          // Optionally reset completion status for re-assignment
  existing.reminderSent = false;
  await existing.save();
  console.log(`Updated assignment for user ${user.email}, course ${course.title}`);
} else {
  assignments.push({
    user: user._id,
    courseId: course.id,
    courseTitle: course.title,
    assignedBy: req.user.userId,
    deadlineDays: days,
    deadlineHours: hours,
    deadlineDate
  });
}
      }
    }

    if (assignments.length > 0) {
      await Assignment.insertMany(assignments);
    }

    // Send email with deadline info
    for (const user of users) {
      const courseTitles = courses.map(c => c.title).join(', ');
      let deadlineText = '';
      if (days > 0 && hours > 0) {
        deadlineText = `${days} day(s) and ${hours} hour(s)`;
      } else if (days > 0) {
        deadlineText = `${days} day(s)`;
      } else {
        deadlineText = `${hours} hour(s)`;
      }
      const deadlineMsg = `\n\nYou have ${deadlineText} to complete the course(s). Deadline: ${deadlineDate.toLocaleString()}`;
      await sendCourseAssignmentEmail(user.name, user.email, courseTitles, (message || '') + deadlineMsg);
    }

    res.json({ message: `Course(s) assigned successfully to ${users.length} user(s).` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get assigned courses for the logged-in user (from Assignment collection)
router.get('/my-assignments', auth, async (req, res) => {
  try {
    const assignments = await Assignment.find({ user: req.user.userId }).lean();
    if (!assignments.length) {
      return res.json([]);
    }
    const courseIds = assignments.map(a => a.courseId);
    const courses = await Course.find({ id: { $in: courseIds }, deleted: { $ne: true } });
    const topics = courses.map(course => ({
      name: course.title,
      id: course.id,
      estimatedTime: course.estimatedTime,
      contentAvailable: course.contentAvailable,
      progress: { completed: false }, // default; actual progress will be merged later
      completedModules: 0,
      totalModules: course.subtopics ? course.subtopics.length : 0
    }));
    res.json(topics);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;