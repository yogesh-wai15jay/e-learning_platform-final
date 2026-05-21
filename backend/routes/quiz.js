const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');
const Question = require('../models/Question');
const Assignment = require('../models/Assignment');
const { sendAcknowledgementEmail, sendQuizFailEmail } = require('../utils/emailService');
const router = express.Router();

// Helper: check if two dates are within 2 hours
const isWithin2Hours = (date1, date2) => {
  const diffMs = Math.abs(date1 - date2);
  const hours = diffMs / (1000 * 60 * 60);
  return hours < 2;
};

// Count how many attempts have been made in the last 48 hours
function countAttemptsLast2Days(attempts, topicId) {
  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
  return attempts.filter(a => a.topicId === topicId && new Date(a.attemptDate) > twoDaysAgo).length;
}

// Fisher-Yates shuffle
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Shuffle only the texts, keep letters fixed
function shuffleOptionTexts(options) {
  const sorted = [...options].sort((a, b) => a.letter.localeCompare(b.letter));
  const texts = sorted.map(opt => opt.text);
  for (let i = texts.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [texts[i], texts[j]] = [texts[j], texts[i]];
  }
  return sorted.map((opt, idx) => ({
    letter: opt.letter,
    text: texts[idx]
  }));
}

// Get quiz data from database
async function getQuizData(topicId) {
  const course = await Course.findOne({ id: topicId });
  if (!course) return null;
  const questions = await Question.find({ courseId: topicId }).sort({ id: 1 });
  if (questions.length === 0) return null;
  return {
    questions: questions,
    topicName: course.title,
    passingRatio: course.passingRatio || 70,
    course: course   // <-- add this
  };
}

// GET /:topicId – return shuffled questions and options
router.get('/:topicId', auth, async (req, res) => {
  try {
    const { topicId } = req.params;
    const quizData = await getQuizData(topicId);
    if (!quizData) {
      return res.status(404).json({ message: 'Quiz not available for this topic' });
    }

    const user = await User.findById(req.user.userId);
    let progress = user.topicsProgress.get(quizData.topicName) || { 
      completed: false, 
      lastQuizAttemptDate: null, 
      passed: false 
    };
    if (progress.completed) {
      return res.status(400).json({ message: 'Topic already completed. Cannot retake quiz.' });
    }

    const attemptsLast2Days = countAttemptsLast2Days(user.quizAttempts, topicId);
if (attemptsLast2Days >= 3) {
  const oldestRelevant = user.quizAttempts
    .filter(a => a.topicId === topicId)
    .sort((a, b) => b.attemptDate - a.attemptDate)[0];
  const remainingHours = Math.ceil((48 - (Date.now() - new Date(oldestRelevant.attemptDate)) / (1000 * 60 * 60)));
  return res.status(400).json({
    message: `You have made 3 quiz attempts in the last 48 hours. Please wait ${remainingHours} hour(s) before trying again.`
  });
}

    // Prevent retry within 2 hours after failing
const now = new Date();

if (
  progress.lastQuizAttemptDate &&
  !progress.passed &&
  isWithin2Hours(progress.lastQuizAttemptDate, now)
) {
  return res.status(400).json({
    message: 'You failed the quiz recently. Please wait 2 hours before trying again.'
  });
}

// ========== NEW: time requirement ==========
    // Time requirement: at least 3 minutes (180 seconds) per module
//const totalModules = quizData.course.subtopics?.length || 0;
//if (totalModules > 0) {
  //const moduleProgress = user.moduleProgress.get(topicId);
  //if (!moduleProgress || !moduleProgress.timeSpent) {
    //return res.status(400).json({ message: 'You must spend at least 3 minutes on each module before taking the quiz. No time data recorded yet.' });
  //}
  //const timeSpent = moduleProgress.timeSpent;
//console.log(`[DEBUG] Course: ${topicId}, totalModules: ${totalModules}, timeSpent:`, timeSpent);

//for (let i = 0; i < totalModules; i++) {
  //const seconds = timeSpent[i] || 0;
  //console.log(`  Module ${i+1}: ${seconds} seconds`);
  //if (seconds < 180) {
    //return res.status(400).json({
      //message: `You need to spend at least 3 minutes on module ${i+1}. You have spent ${Math.floor(seconds/60)} minute(s).`
    //});
  //}
//}}
    // ========== end of time requirement ==========


    // Shuffle questions
    const shuffledQuestions = shuffleArray([...quizData.questions]);
    const finalQuestions = shuffledQuestions.map(q => ({
      id: q._id,
      text: q.text,
      options: shuffleOptionTexts(q.options),
      correctAnswers: q.correctAnswers,
      explanation: q.explanation
    }));

    res.json({ questions: finalQuestions, passingRatio: quizData.passingRatio });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /:topicId/submit – evaluate and record attempt
router.post('/:topicId/submit', auth, async (req, res) => {
  try {
    const { topicId } = req.params;
    const { answers } = req.body; // answers is an array of { questionId, selectedOptions }
    const quizData = await getQuizData(topicId);
    if (!quizData) return res.status(404).json({ message: 'Quiz not available' });

    const user = await User.findById(req.user.userId);
    let progress = user.topicsProgress.get(quizData.topicName) || { 
      completed: false, 
      lastQuizAttemptDate: null, 
      passed: false 
    };
    if (progress.completed) return res.status(400).json({ message: 'Topic already completed' });

    const now = new Date();

    const attemptsLast2Days = countAttemptsLast2Days(user.quizAttempts, topicId);
if (attemptsLast2Days >= 3) {
  const oldestRelevant = user.quizAttempts
    .filter(a => a.topicId === topicId)
    .sort((a, b) => b.attemptDate - a.attemptDate)[0];
  const remainingHours = Math.ceil((48 - (Date.now() - new Date(oldestRelevant.attemptDate)) / (1000 * 60 * 60)));
  return res.status(400).json({
    message: `You have made 3 quiz attempts in the last 48 hours. Please wait ${remainingHours} hour(s) before trying again.`
  });
}

    // Cooldown only if there was a failed attempt within 2 hours
    if (progress.lastQuizAttemptDate && !progress.passed && isWithin2Hours(progress.lastQuizAttemptDate, now)) {
      return res.status(400).json({ 
        message: 'You failed the quiz recently. Please wait 2 hours before trying again.' 
      });
    }

    // Create a map from questionId to the original question object
    const questionMap = {};
    quizData.questions.forEach(q => { questionMap[q._id.toString()] = q; });

    // Calculate score and build results in the order of the answers array
    let correctCount = 0;
    const results = [];
    for (let i = 0; i < answers.length; i++) {
      const { questionId, selectedOptions } = answers[i];
      const question = questionMap[questionId];
      if (!question) continue;
      const userAnswer = selectedOptions || [];
      const isCorrect = userAnswer.length === question.correctAnswers.length &&
        userAnswer.every(a => question.correctAnswers.includes(a));
      if (isCorrect) correctCount++;
      results.push({
        questionId: question._id,
        questionText: question.text,
        userAnswers: userAnswer,
        correctAnswers: question.correctAnswers,
        isCorrect,
        explanation: question.explanation
      });
    }

    const totalQuestions = quizData.questions.length;
    const requiredCorrect = Math.ceil(totalQuestions * (quizData.passingRatio / 100));
    const passed = correctCount >= requiredCorrect;

    progress = {
      completed: passed ? true : progress.completed,
      lastQuizAttemptDate: passed ? null : now,
      passed: passed
    };
    user.topicsProgress.set(quizData.topicName, progress);

    user.quizAttempts.push({
      topicId: topicId,
      topicName: quizData.topicName,
      attemptDate: now,
      score: correctCount,
      totalQuestions: quizData.questions.length,
      passed: passed
    });

    await user.save();

    const attemptsRemaining = 3 - (attemptsLast2Days + 1);
    
    if (passed) {
  // Fetch author's name from the course.createdBy reference
  let authorName = '';
  if (quizData.course.createdBy) {
    const author = await User.findById(quizData.course.createdBy);
    if (author) authorName = author.name;
  }
  // Send acknowledgement email with certificate
  sendAcknowledgementEmail(user.name, user.email, quizData.course, correctCount, totalQuestions, authorName)
    .catch(err => console.error('Failed to send acknowledgement email:', err));

    // Mark assignment as completed
    await Assignment.updateOne(
    { user: user._id, courseId: topicId },
    { $set: { completed: true } }
  );
} else {
      sendQuizFailEmail(user.name, user.email, quizData.topicName, correctCount, quizData.questions.length, attemptsRemaining)
        .catch(err => console.error('Failed to send fail email:', err));
    }

    res.json({
      correctCount,
      totalQuestions: quizData.questions.length,
      passed,
      results,
      message: passed ? 'Congratulations! You passed the quiz.' : `You did not pass. You have ${attemptsRemaining} attempt(s) left. Please wait 2 hours before retrying.`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;