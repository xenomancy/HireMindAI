const mongoose = require('mongoose');

const ATSReportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  resume: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true,
  },
  jobDescriptionText: {
    type: String,
    default: '',
  },
  jobTitle: {
    type: String,
    default: 'Generic Role',
  },
  // Scoring
  overallScore: {
    type: Number,
    required: true,
  },
  overallATSScore: {
    type: Number,
    default: 0,
  },
  sectionScores: {
    structure: { type: Number, default: 0 },
    keywords: { type: Number, default: 0 },
    impact: { type: Number, default: 0 },
    readability: { type: Number, default: 0 },
  },
  scoreBreakdown: {
    roleRelevance: { type: Number, default: 0 },
    keywordSemanticMatch: { type: Number, default: 0 },
    projectQuality: { type: Number, default: 0 },
    experienceImpact: { type: Number, default: 0 },
    formatting: { type: Number, default: 0 },
    skills: { type: Number, default: 0 },
    readability: { type: Number, default: 0 },
  },
  // Text analysis and arrays
  strengths: {
    type: [String],
    default: [],
  },
  weaknesses: {
    type: [String],
    default: [],
  },
  missingKeywords: {
    type: [String],
    default: [],
  },
  weakBulletPoints: {
    type: [String],
    default: [],
  },
  improvedBulletPoints: [
    {
      original: String,
      improved: String,
    }
  ],
  bulletPointImprovements: [
    {
      original: String,
      improved: String,
    }
  ],
  projectAnalysis: {
    type: mongoose.Schema.Types.Mixed,
    default: [],
  },
  formattingIssues: {
    type: [String],
    default: [],
  },
  formattingSuggestions: {
    type: [String],
    default: [],
  },
  recruiterRisks: {
    type: [String],
    default: [],
  },
  atsParsingRisks: {
    type: [String],
    default: [],
  },
  jobDescriptionMatch: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  priorityFixes: {
    high: { type: [String], default: [] },
    medium: { type: [String], default: [] },
    low: { type: [String], default: [] },
  },
  finalRecruiterSummary: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ATSReport', ATSReportSchema);
