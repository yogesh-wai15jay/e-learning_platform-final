const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: String, required: true },
  courseTitle: { type: String, required: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assignedAt: { type: Date, default: Date.now },
  deadlineDays: { type: Number, default: 0 },
  deadlineHours: { type: Number, default: 0 },
  deadlineDate: { type: Date, required: true },     // <-- must exist
  completed: { type: Boolean, default: false },
  reminderSent: { type: Boolean, default: false }
});

module.exports = mongoose.model('Assignment', assignmentSchema);