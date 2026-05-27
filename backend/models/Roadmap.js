const mongoose = require('mongoose');

const RoadmapSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  dreamCompany: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  experienceLevel: {
    type: String,
  },
  roleAlignmentScore: {
    type: Number,
    default: 0,
  },
  roadmapConfidence: {
    type: Number,
    default: 0,
  },
  confidenceScore: {
    type: Number,
    default: 0,
  },
  validatedCompany: {
    type: Boolean,
    default: false,
  },
  inputQualityScore: {
    type: Number,
    default: 0,
  },
  detectedWeakAreas: [String],
  detectedStrongAreas: [String],
  missingSkills: [String],
  priorityRoadmap: [
    {
      skill: String,
      reason: String,
      importance: String,
      timeline: String,
      difficulty: String,
    }
  ],
  companySpecificFocus: [String],
  interviewFocusedImprovements: [String],
  atsFocusedImprovements: [String],
  hallucinationCheckPassed: {
    type: Boolean,
    default: true,
  },
  overallPreparationLevel: {
    type: String,
  },
  currentSkills: [String],
  strongAreas: [String],
  weakAreas: [String],
  highPrioritySkills: [String],
  plan: [
    {
      week: Number,
      focus: String,
      topics: [String],
      tasks: [String],
      reason: String,
    }
  ],
  projectRecommendations: [
    {
      name: String,
      description: String,
      technologies: [String],
      measurableImpact: String,
    }
  ],
  resumeImprovements: [String],
  interviewPreparationPlan: [String],
  estimatedPreparationTime: String,
  priorityOrder: [String],
  finalCareerStrategy: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Roadmap', RoadmapSchema);
