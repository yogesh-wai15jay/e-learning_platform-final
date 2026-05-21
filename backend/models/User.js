const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const moduleProgressSchema = new mongoose.Schema({
  topicId: { type: String, required: true },
  completedModules: [{ type: Number }],
  lastModuleIndex: { type: Number, default: 0 },
  timeSpent: [{ type: Number, default: 0 }], // seconds spent per module index
  videoWatchedPercent: [{ type: Number, default: 0 }] // one entry per module
});

const quizAttemptSchema = new mongoose.Schema({
  topicId: { type: String, required: true },
  topicName: { type: String, required: true },
  attemptDate: { type: Date, default: Date.now },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
  passed: { type: Boolean, required: true }
});

const userSchema = new mongoose.Schema({
  // Add these fields inside the userSchema:
  resetPasswordOTP: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },

  assignedCourses: [{ type: String }],

  resetPasswordTempToken: { type: String, default: null },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'author'], default: 'user' },
  departments: {
  type: [String],
  default: []
  },
  topicsProgress: {
    type: Map,
    of: new mongoose.Schema({
      completed: { type: Boolean, default: false },
      lastQuizAttemptDate: { type: Date, default: null },
      passed: { type: Boolean, default: false }
    }),
    default: {}
  },
  moduleProgress: {
    type: Map,
    of: moduleProgressSchema,
    default: {}
  },
  quizAttempts: [quizAttemptSchema],
  acknowledgedTopics: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);