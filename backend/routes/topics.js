const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');
const router = express.Router();

// Get all topics (courses) with user progress
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const courses = await Course.find({ showOnDashboard: true, deleted: { $ne: true } });
    const topics = await Promise.all(courses.map(async (course) => {
      const topicProgress = user.topicsProgress.get(course.title) || { completed: false, lastQuizAttemptDate: null, passed: false };
      const moduleProg = user.moduleProgress?.get(course.id);
      const completedModules = moduleProg?.completedModules?.length || 0;
      const totalModules = course.subtopics ? course.subtopics.length : 0;
      return {
        name: course.title,
        id: course.id,
        estimatedTime: course.estimatedTime,
        contentAvailable: course.contentAvailable,
        progress: topicProgress,
        completedModules,
        totalModules
      };
    }));
    res.json(topics);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single topic details
router.get('/:topicId', auth, async (req, res) => {
  try {
    const course = await Course.findOne({ id: req.params.topicId, deleted: { $ne: true } });
    if (!course) return res.status(404).json({ message: 'Topic not found' });
    const user = await User.findById(req.user.userId);
    const progress = user.topicsProgress.get(course.title) || { completed: false, lastQuizAttemptDate: null, passed: false };
    res.json({ ...course.toObject(), progress });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Save module progress
router.post('/:topicId/progress', auth, async (req, res) => {
  try {
    const { topicId } = req.params;
    const { completedModules, currentModuleIndex } = req.body;
    const user = await User.findById(req.user.userId);
    const course = await Course.findOne({ id: topicId });
    if (!course) return res.status(404).json({ message: 'Topic not found' });
    if (!user.moduleProgress) user.moduleProgress = new Map();
    user.moduleProgress.set(topicId, {
      topicId,
      completedModules: completedModules || [],
      lastModuleIndex: currentModuleIndex || 0
    });
    await user.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Record time spent on a module
router.post('/:topicId/time-spent', auth, async (req, res) => {
  try {
    const { topicId } = req.params;
    const { moduleIndex, seconds } = req.body;
    if (moduleIndex === undefined || seconds === undefined || seconds <= 0) {
      return res.status(400).json({ message: 'Invalid time data' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const course = await Course.findOne({ id: topicId });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const totalModules = course.subtopics?.length || 0;

    let progress = user.moduleProgress.get(topicId);
    if (!progress) {
      progress = {
        topicId,
        completedModules: [],
        lastModuleIndex: 0,
        timeSpent: new Array(totalModules).fill(0)
      };
      user.moduleProgress.set(topicId, progress);
    }

    // Ensure timeSpent is an array and has correct length
    if (!Array.isArray(progress.timeSpent)) {
      progress.timeSpent = new Array(totalModules).fill(0);
    }
    while (progress.timeSpent.length < totalModules) {
      progress.timeSpent.push(0);
    }
    if (progress.timeSpent.length > totalModules) {
      progress.timeSpent = progress.timeSpent.slice(0, totalModules);
    }

    // Add seconds to the specific module
    progress.timeSpent[moduleIndex] = (progress.timeSpent[moduleIndex] || 0) + seconds;
    user.moduleProgress.set(topicId, progress);
    await user.save();

    res.json({ message: 'Time recorded' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/topics/:topicId/progress
router.get('/:topicId/progress', auth, async (req, res) => {
  try {
    const { topicId } = req.params;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Get the course to know total modules
    const course = await Course.findOne({ id: topicId });
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const totalModules = course.subtopics?.length || 0;

    let progress = user.moduleProgress.get(topicId);
    if (!progress) {
      // No progress at all – return default values
      return res.json({
        lastModuleIndex: 0,
        completedModules: [],
        timeSpent: new Array(totalModules).fill(0)
      });
    }

    // Ensure timeSpent exists and has the right length
    let timeSpent = progress.timeSpent || [];
    while (timeSpent.length < totalModules) timeSpent.push(0);
    if (timeSpent.length > totalModules) timeSpent = timeSpent.slice(0, totalModules);

    res.json({
      lastModuleIndex: progress.lastModuleIndex || 0,
      completedModules: progress.completedModules || [],
      timeSpent: progress.timeSpent || [],
      videoWatchedPercent: progress.videoWatchedPercent || [],
      videoPlayedSeconds: progress.videoPlayedSeconds || []
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update video watched percentage for a specific module
router.post('/:topicId/video-progress', auth, async (req, res) => {
  try {
    const { topicId } = req.params;
    const { moduleIndex, percent } = req.body; // percent: 0‑100
    if (moduleIndex === undefined || percent === undefined) {
      return res.status(400).json({ message: 'Invalid data' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let progress = user.moduleProgress.get(topicId);
    if (!progress) {
      const course = await Course.findOne({ id: topicId });
      if (!course) return res.status(404).json({ message: 'Course not found' });
      const totalModules = course.subtopics?.length || 0;
      progress = {
        topicId,
        completedModules: [],
        lastModuleIndex: 0,
        timeSpent: new Array(totalModules).fill(0),
        videoWatchedPercent: new Array(totalModules).fill(0)
      };
      user.moduleProgress.set(topicId, progress);
    }

    // Ensure videoWatchedPercent array exists and has sufficient length
    if (!Array.isArray(progress.videoWatchedPercent)) {
      progress.videoWatchedPercent = [];
    }
    while (progress.videoWatchedPercent.length <= moduleIndex) {
      progress.videoWatchedPercent.push(0);
    }

    // Update only if new percent is higher
    const currentMax = progress.videoWatchedPercent[moduleIndex] || 0;
    if (percent > currentMax) {
      progress.videoWatchedPercent[moduleIndex] = Math.min(percent, 100);
      user.moduleProgress.set(topicId, progress);
      await user.save();
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update cumulative video play time (seconds actually watched)
router.post('/:topicId/video-play-time', auth, async (req, res) => {
  try {
    const { topicId } = req.params;
    const { moduleIndex, seconds } = req.body; // seconds = additional cumulative play time
    if (moduleIndex === undefined || seconds === undefined || seconds <= 0) {
      return res.status(400).json({ message: 'Invalid data' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    let progress = user.moduleProgress.get(topicId);
    if (!progress) {
      const course = await Course.findOne({ id: topicId });
      if (!course) return res.status(404).json({ message: 'Course not found' });
      const totalModules = course.subtopics?.length || 0;
      progress = {
        topicId,
        completedModules: [],
        lastModuleIndex: 0,
        timeSpent: new Array(totalModules).fill(0),
        videoWatchedPercent: new Array(totalModules).fill(0),
        videoPlayedSeconds: new Array(totalModules).fill(0) // new field
      };
      user.moduleProgress.set(topicId, progress);
    }

    if (!Array.isArray(progress.videoPlayedSeconds)) {
      progress.videoPlayedSeconds = [];
    }
    while (progress.videoPlayedSeconds.length <= moduleIndex) {
      progress.videoPlayedSeconds.push(0);
    }

    progress.videoPlayedSeconds[moduleIndex] += seconds;
    user.moduleProgress.set(topicId, progress);
    await user.save();

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;