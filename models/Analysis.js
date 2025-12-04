const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  resumeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true
  },
  resumeTitle: {
    type: String,
    required: true
  },
  jobDescription: {
    type: String,
    default: null
  },
  jobDescriptionTitle: {
    type: String,
    default: null
  },
  matchScore: {
    type: Number,
    default: null,
    min: 0,
    max: 100
  },
  overallSummary: {
    type: String,
    default: null
  },
  strengths: {
    type: [String],
    default: []
  },
  weaknesses: {
    type: [String],
    default: []
  },
  missingSkills: {
    type: [String],
    default: []
  },
  sectionFeedback: {
    summary: {
      type: String,
      default: null
    },
    experience: {
      type: String,
      default: null
    },
    skills: {
      type: String,
      default: null
    },
    projects: {
      type: String,
      default: null
    }
  },
  suggestions: {
    type: [String],
    default: []
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Analysis', analysisSchema);

