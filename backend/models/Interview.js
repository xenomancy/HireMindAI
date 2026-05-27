const mongoose = require('mongoose');

const InterviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  resume: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
  },
  role: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['Entry', 'Mid', 'Senior'],
    default: 'Mid',
  },
  companyStyle: {
    type: String,
    default: 'Standard',
  },
  questions: [
    {
      question: String,
      type: { type: String, default: 'Technical' },
      expectedTopics: { type: [String], default: [] },
      difficulty: { type: String, default: 'Mid' },
      userAnswer: { type: String, default: '' },
      evaluation: {
        score: { type: Number, default: 0 },
        communicationFeedback: String,
        confidenceFeedback: String,
        technicalFeedback: String,
        technicalAccuracy: { type: Number, default: 0 },
        communicationClarity: { type: Number, default: 0 },
        problemSolving: { type: Number, default: 0 },
        realWorldKnowledge: { type: Number, default: 0 },
        isAnswerValid: { type: Boolean, default: true },
        followUpQuestions: { type: [String], default: [] }
      },
    }
  ],
  overallScores: {
    technical: { type: Number, default: 0 },
    communication: { type: Number, default: 0 },
    confidence: { type: Number, default: 0 },
    overall: { type: Number, default: 0 },
    
    // Enterprise 6-dimensional matrices
    technicalAccuracy: { type: Number, default: 0 },
    communicationClarity: { type: Number, default: 0 },
    problemSolving: { type: Number, default: 0 },
    realWorldKnowledge: { type: Number, default: 0 },
  },
  feedbackSummary: {
    type: String,
    default: '',
  },
  improvementSuggestions: [String],
  recommendations: {
    type: [String],
    default: [],
  },
  hiringProbability: {
    type: String,
    default: 'Moderate',
  },
  
  // Anti-cheating visibility log statistics
  suspiciousActivityCount: {
    type: Number,
    default: 0,
  },
  cheatingDetected: {
    type: Boolean,
    default: false,
  },
  interviewIntegrityScore: {
    type: Number,
    default: 100,
  },
  cheatingLogs: [
    {
      timestamp: { type: Date, default: Date.now },
      activityType: { type: String, required: true },
      description: { type: String, required: true }
    }
  ],
  status: {
    type: String,
    enum: ['in-progress', 'completed'],
    default: 'in-progress',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Interview', InterviewSchema);
