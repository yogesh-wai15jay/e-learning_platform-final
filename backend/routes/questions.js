const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');
const Question = require('../models/Question');
const router = express.Router();

// Middleware: check if user is author/admin and owns the course (or admin)
const canManageCourse = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    const course = await Course.findOne({ id: req.params.courseId });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    if (course.createdBy.toString() !== req.user.userId && user.role !== 'admin') {
      return res.status(403).json({ message: 'You can only manage questions for your own courses' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all questions for a course
router.get('/:courseId', auth, async (req, res) => {
  try {
    const questions = await Question.find({ courseId: req.params.courseId }).sort({ id: 1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk save questions (replace all existing)
router.post('/:courseId', auth, canManageCourse, async (req, res) => {
  try {
    const { questions } = req.body; // array of question objects
    const courseId = req.params.courseId;
    // Delete existing
    await Question.deleteMany({ courseId });
    // Insert new ones
    const newQuestions = questions.map((q, idx) => ({
      courseId,
      text: q.text,
      options: q.options,
      correctAnswers: q.correctAnswers,
      explanation: q.explanation || ''
    }));
    await Question.insertMany(newQuestions);
    res.json({ message: 'Questions saved successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;