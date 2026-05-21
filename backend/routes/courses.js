const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');
const Question = require('../models/Question');
const { sendCourseCreatedEmail } = require('../utils/emailService');
const { sendCourseDeletedEmail } = require('../utils/emailService');
const router = express.Router();

// Middleware: allow only authors or admins
const isAuthorOrAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || (user.role !== 'author' && user.role !== 'admin')) {
      return res.status(403).json({ message: 'Access denied. Only authors and admins can manage courses.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all courses (public for any authenticated user)
router.get('/', auth, async (req, res) => {
  try {
    const courses = await Course.find({ deleted: { $ne: true } }).sort({ createdAt: -1 });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single course by ID (slug)
router.get('/:courseId', auth, async (req, res) => {
  try {
    const course = await Course.findOne({ id: req.params.courseId, deleted: { $ne: true } });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new course (author only)
router.post('/', auth, isAuthorOrAdmin, async (req, res) => {
  try {
    const { title, id, estimatedTime, subtopics, showOnDashboard, placeholderContent, passingRatio } = req.body;
    // Check uniqueness
    const existing = await Course.findOne({ $or: [{ id }, { title }] });
    if (existing) return res.status(400).json({ message: 'Course with this ID or title already exists' });
    const course = new Course({
      title,
      id,
      estimatedTime,
      contentAvailable: true,
      showOnDashboard: showOnDashboard !== undefined ? showOnDashboard : true,
      subtopics: subtopics || [],
      placeholderContent: placeholderContent || '',
      passingRatio: passingRatio || 70,
      createdBy: req.user.userId
    });
    await course.save();
    res.status(201).json(course);

    // Send email to the author
const author = await User.findById(req.user.userId);
sendCourseCreatedEmail(author.name, author.email, course.title, course.id, course.estimatedTime).catch(err => console.error('Failed to send course creation email:', err));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a course (only owner or admin)
router.put('/:courseId', auth, isAuthorOrAdmin, async (req, res) => {
  try {
    const { title, estimatedTime, subtopics, showOnDashboard, placeholderContent, passingRatio } = req.body;
    const course = await Course.findOne({ id: req.params.courseId });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    // Check ownership
    if (course.createdBy.toString() !== req.user.userId) {
      const user = await User.findById(req.user.userId);
      if (user.role !== 'admin') {
        return res.status(403).json({ message: 'You can only edit your own courses' });
      }
    }
    course.title = title || course.title;
    course.estimatedTime = estimatedTime || course.estimatedTime;
    course.subtopics = subtopics || course.subtopics;
    course.showOnDashboard = showOnDashboard !== undefined ? showOnDashboard : course.showOnDashboard;
    course.placeholderContent = placeholderContent || course.placeholderContent;
    course.passingRatio = passingRatio || course.passingRatio;
    course.updatedAt = Date.now();
    await course.save();
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a course (only owner or admin)
// Soft delete a course (only owner or admin)
router.delete('/:courseId', auth, isAuthorOrAdmin, async (req, res) => {
  try {
    const course = await Course.findOne({ id: req.params.courseId });
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check ownership
    if (course.createdBy.toString() !== req.user.userId) {
      const user = await User.findById(req.user.userId);
      if (user.role !== 'admin') {
        return res.status(403).json({ message: 'You can only delete your own courses' });
      }
    }

    // Soft delete: mark as deleted instead of removing from DB
    course.deleted = true;
    course.deletedAt = new Date();
    await course.save();

    // Send email to the author (fire and forget)
    const author = await User.findById(course.createdBy);
    if (author && author.email) {
      sendCourseDeletedEmail(author.name, author.email, course.title, course.id)
        .catch(err => console.error('Course deletion email failed:', err));
    }

    res.json({ message: 'Course moved to deleted list' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


// GET /api/courses/author/courses - Get author's own courses
router.get('/author/courses', auth, async (req, res) => {
  try {
    if (req.user.role !== 'author' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Author role required.' });
    }

    const { status } = req.query;
    let filter = { createdBy: req.user.userId };

    if (status === 'deleted') {
      filter.deleted = true;
    } else {
      // 'available' or any other value – show non-deleted courses
      filter.deleted = { $ne: true };
    }

    const courses = await Course.find(filter)
      .select('title id estimatedTime contentAvailable showOnDashboard createdAt updatedAt')
      .sort('-createdAt');

    res.json(courses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/courses/author/course/:id - Get full course details for author (with quiz answers & explanations)
router.get('/author/course/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'author' && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Find by MongoDB _id (use req.params.id as _id)
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check ownership (admin can view any)
    if (course.createdBy && course.createdBy.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'You do not own this course' });
    }

    // Fetch all questions for this course using course.id (the string identifier, e.g., "react-basics")
    const questions = await Question.find({ courseId: course.id });

    // Return course with its subtopics and full question details (including correctAnswers and explanation)
    const courseWithQuestions = {
      ...course.toObject(),
      questions: questions.map(q => ({
        _id: q._id,
        text: q.text,
        options: q.options,        // array of {letter, text}
        correctAnswers: q.correctAnswers,  // array of correct option texts
        explanation: q.explanation
      }))
    };

    res.json(courseWithQuestions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Restore a soft-deleted course
router.put('/:courseId/restore', auth, isAuthorOrAdmin, async (req, res) => {
  try {
    const course = await Course.findOne({ id: req.params.courseId });
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check ownership
    if (course.createdBy.toString() !== req.user.userId) {
      const user = await User.findById(req.user.userId);
      if (user.role !== 'admin') {
        return res.status(403).json({ message: 'You can only restore your own courses' });
      }
    }

    if (!course.deleted) {
      return res.status(400).json({ message: 'Course is not deleted' });
    }

    course.deleted = false;
    course.deletedAt = null;
    await course.save();

    res.json({ message: 'Course restored successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;