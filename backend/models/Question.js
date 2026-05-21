const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  letter: { type: String, required: true }, // A, B, C, D, E
  text: { type: String, required: true }
});

const questionSchema = new mongoose.Schema({
  courseId: { type: String, required: true }, // matches course.id
  text: { type: String, required: true },
  options: [optionSchema],
  correctAnswers: [{ type: String }], // array of correct option texts
  explanation: { type: String, default: '' }
});

module.exports = mongoose.model('Question', questionSchema);