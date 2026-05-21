const mongoose = require('mongoose');

const subtopicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  estimatedTime: { type: Number, required: true },
  content: { type: String, required: true },
  videoUrl: { type: String, default: '' },   // <-- new field: relative path to video file
  imageUrls: [{ type: String, default: [] }],   // multiple image file paths
  pdfUrls: [{ type: String, default: [] }]      // multiple PDF file paths
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, unique: true },
  id: { type: String, required: true, unique: true },
  estimatedTime: { type: Number, required: true },
  contentAvailable: { type: Boolean, default: true },
  showOnDashboard: { type: Boolean, default: true },
  subtopics: [subtopicSchema],
  placeholderContent: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // allow null for system courses
  passingRatio: { type: Number, default: 70, min: 0, max: 100 }, // NEW: passing percentage
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null }
});

module.exports = mongoose.model('Course', courseSchema);