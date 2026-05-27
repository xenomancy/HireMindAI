const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
  extractedText: {
    type: String,
    required: true,
  },
  parsedDetails: {
    skills: [String],
    experience: [mongoose.Schema.Types.Mixed],
    projects: [mongoose.Schema.Types.Mixed],
    education: [mongoose.Schema.Types.Mixed],
    summary: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Resume', ResumeSchema);
