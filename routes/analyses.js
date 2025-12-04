const express = require('express');
const Analysis = require('../models/Analysis');
const Resume = require('../models/Resume');
const auth = require('../middleware/auth');
const { analyzeResume } = require('../services/aiService');

const router = express.Router();

// Create new analysis
router.post('/', auth, async (req, res) => {
  try {
    const { resumeId, jobDescription, jobDescriptionTitle } = req.body;

    if (!resumeId) {
      return res.status(400).json({ message: 'Resume ID is required' });
    }

    // Verify resume belongs to user
    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    // Perform AI analysis
    const aiAnalysis = await analyzeResume(resume.content, jobDescription || null);

    // Create analysis record
    const analysis = new Analysis({
      userId: req.user._id,
      resumeId: resume._id,
      resumeTitle: resume.title,
      jobDescription: jobDescription || null,
      jobDescriptionTitle: jobDescriptionTitle || null,
      matchScore: aiAnalysis.matchScore,
      overallSummary: aiAnalysis.overallSummary,
      strengths: aiAnalysis.strengths,
      weaknesses: aiAnalysis.weaknesses,
      missingSkills: aiAnalysis.missingSkills,
      sectionFeedback: aiAnalysis.sectionFeedback,
      suggestions: aiAnalysis.suggestions
    });

    await analysis.save();

    res.status(201).json({
      message: 'Analysis completed successfully',
      analysis
    });
  } catch (error) {
    console.error('Create analysis error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all analyses for user
router.get('/', auth, async (req, res) => {
  try {
    const analyses = await Analysis.find({ userId: req.user._id })
      .select('resumeTitle jobDescriptionTitle matchScore createdAt updatedAt')
      .sort({ createdAt: -1 });

    res.json({ analyses });
  } catch (error) {
    console.error('Get analyses error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single analysis
router.get('/:id', auth, async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    res.json({ analysis });
  } catch (error) {
    console.error('Get analysis error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete analysis
router.delete('/:id', auth, async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found' });
    }

    await Analysis.deleteOne({ _id: analysis._id });

    res.json({ message: 'Analysis deleted successfully' });
  } catch (error) {
    console.error('Delete analysis error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

