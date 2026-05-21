const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');        // <-- add this
const Department = require('../models/Department');
const router = express.Router();

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users (non‑admin) – now includes both 'user' and 'author'
router.get('/users', auth, isAdmin, async (req, res) => {
  try {
    const users = await User.find({ role: { $in: ['user', 'author'] } }, '-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get quiz attempts and acknowledged topics for a specific user
router.get('/users/:userId/attempts', auth, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('quizAttempts name email acknowledgedTopics');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      name: user.name,
      email: user.email,
      attempts: user.quizAttempts,
      acknowledgedTopics: user.acknowledgedTopics || []
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


// Promote a user to author (only if they are currently a regular user)
router.post('/users/:userId/promote-to-author', auth, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role !== 'user') {
      return res.status(400).json({ message: 'Only regular users can be promoted to author.' });
    }
    user.role = 'author';
    await user.save();

    // Send promotion email to the user (do not await to avoid delaying response)
    const { sendPromotionToAuthorEmail } = require('../utils/emailService');
    sendPromotionToAuthorEmail(user.name, user.email).catch(err => console.error('Promotion email failed:', err));

    res.json({ message: `User ${user.name} is now an author.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Demote an author back to regular user
router.post('/users/:userId/demote-to-user', auth, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role !== 'author') {
      return res.status(400).json({ message: 'Only authors can be demoted to user.' });
    }
    user.role = 'user';
    await user.save();
    res.json({ message: `User ${user.name} is now a regular user.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Send acknowledgement email with certificate (only once per topic)
router.post('/users/:userId/acknowledge/:topicId', auth, isAdmin, async (req, res) => {
  try {
    const { userId, topicId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.acknowledgedTopics && user.acknowledgedTopics.includes(topicId)) {
      return res.status(400).json({ message: 'Acknowledgement already sent for this topic.' });
    }

    // Find the latest passed attempt
    const passedAttempts = user.quizAttempts.filter(a => a.topicId === topicId && a.passed === true);
    if (passedAttempts.length === 0) {
      return res.status(400).json({ message: 'No passed attempt found for this topic' });
    }
    const latest = passedAttempts.sort((a, b) => b.attemptDate - a.attemptDate)[0];

    // Fetch the course to get its title and author
    const course = await Course.findOne({ id: topicId });
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Fetch author name if course has a creator
    let authorName = '';
    if (course.createdBy) {
      const author = await User.findById(course.createdBy);
      if (author) authorName = author.name;
    }

    const { sendBadgeEmail } = require('../utils/emailService');
    await sendBadgeEmail(user.name, user.email, course.title);

    if (!user.acknowledgedTopics) user.acknowledgedTopics = [];
    user.acknowledgedTopics.push(topicId);
    await user.save();

    res.json({ message: 'Acknowledgement email sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a user
router.delete('/users/:userId', auth, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId === req.user.userId) {
      return res.status(400).json({ message: 'You cannot delete your own account.' });
    }
    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/assign-department', auth, isAdmin, async (req, res) => {
  try {
    const { userIds, departments } = req.body;
    if (!userIds || userIds.length === 0) return res.status(400).json({ message: 'No users selected' });
    if (!departments || departments.length === 0) return res.status(400).json({ message: 'No departments selected' });

    // Validate that all departments exist in the Department collection
    const existingDepts = await Department.find({ name: { $in: departments } }).lean();
    const existingNames = existingDepts.map(d => d.name);
    const invalid = departments.filter(d => !existingNames.includes(d));
    if (invalid.length) {
      return res.status(400).json({ message: `Invalid departments: ${invalid.join(', ')}` });
    }

    // Add each department to each user (using $addToSet to avoid duplicates)
    await User.updateMany(
      { _id: { $in: userIds } },
      { $addToSet: { departments: { $each: departments } } }
    );

    res.json({ message: `Departments added to ${userIds.length} user(s)` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/departments', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (user.role !== 'admin' && user.role !== 'author') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const departments = await Department.find().sort({ name: 1 });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/departments', auth, isAdmin, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Department name is required' });
    }
    const cleanName = name.trim();
    const existing = await Department.findOne({ name: cleanName });
    if (existing) {
      return res.status(400).json({ message: 'Department already exists' });
    }
    const dept = new Department({ name: cleanName });
    await dept.save();
    res.status(201).json(dept);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/users/:userId/departments', auth, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { department } = req.body;
    if (!department) return res.status(400).json({ message: 'Department name required' });

    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { departments: department } },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: `Department '${department}' removed from user`, departments: user.departments });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/departments/:deptId', auth, isAdmin, async (req, res) => {
  try {
    const { deptId } = req.params;
    const department = await Department.findById(deptId);
    if (!department) {
      return res.status(404).json({ message: 'Department not found' });
    }
    const deptName = department.name;
    // Remove the department from all users
    await User.updateMany(
      { departments: deptName },
      { $pull: { departments: deptName } }
    );
    // Delete the department itself
    await Department.findByIdAndDelete(deptId);
    res.json({ message: `Department "${deptName}" deleted and removed from all users` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;