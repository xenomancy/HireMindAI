const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Resume = require('../models/Resume');
const ATSReport = require('../models/ATSReport');
const Interview = require('../models/Interview');
const User = require('../models/User');

// @desc    Get aggregated stats for dashboard
// @route   GET /api/analytics/stats
// @access  Private
router.get('/stats', protect, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    // Fetch lists
    const atsReports = await ATSReport.find({ user: userId }).sort({ createdAt: 1 });
    const interviews = await Interview.find({ user: userId }).sort({ createdAt: 1 });

    // Calculate averages
    const atsCount = atsReports.length;
    let avgATS = 0;
    if (atsCount > 0) {
      const sum = atsReports.reduce((acc, curr) => acc + curr.overallScore, 0);
      avgATS = Math.round(sum / atsCount);
    }

    const interviewCount = interviews.length;
    let avgInterview = 0;
    let avgTech = 0;
    let avgComm = 0;
    let avgConf = 0;

    const completedInterviews = interviews.filter(i => i.status === 'completed');
    const compCount = completedInterviews.length;

    if (compCount > 0) {
      const sumOverall = completedInterviews.reduce((acc, curr) => acc + curr.overallScores.overall, 0);
      const sumTech = completedInterviews.reduce((acc, curr) => acc + curr.overallScores.technical, 0);
      const sumComm = completedInterviews.reduce((acc, curr) => acc + curr.overallScores.communication, 0);
      const sumConf = completedInterviews.reduce((acc, curr) => acc + curr.overallScores.confidence, 0);

      avgInterview = Math.round(sumOverall / compCount);
      avgTech = Math.round(sumTech / compCount);
      avgComm = Math.round(sumComm / compCount);
      avgConf = Math.round(sumConf / compCount);
    }

    // Build timeline charts data
    const atsTrends = atsReports.map(rep => ({
      date: new Date(rep.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: rep.overallScore,
      job: rep.jobTitle,
    }));

    const interviewTrends = completedInterviews.map(int => ({
      date: new Date(int.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      overall: int.overallScores.overall,
      technical: int.overallScores.technical,
      communication: int.overallScores.communication,
      confidence: int.overallScores.confidence,
      role: int.role,
    }));

    // Extract compiled skills
    const resumes = await Resume.find({ user: userId });
    const allSkills = {};
    resumes.forEach(r => {
      if (r.parsedDetails && r.parsedDetails.skills) {
        r.parsedDetails.skills.forEach(s => {
          allSkills[s] = (allSkills[s] || 0) + 1;
        });
      }
    });

    const skillCloud = Object.keys(allSkills).map(k => ({
      name: k,
      value: allSkills[k]
    })).sort((a, b) => b.value - a.value).slice(0, 10);

    // Build default mock curves if dataset is empty to offer premium dashboard previews out of the box
    const finalAtsTrends = atsTrends.length > 0 ? atsTrends : [
      { date: 'May 10', score: 65, job: 'Front End' },
      { date: 'May 15', score: 72, job: 'React Developer' },
      { date: 'May 24', score: 85, job: 'Full Stack' },
    ];

    const finalIntTrends = interviewTrends.length > 0 ? interviewTrends : [
      { date: 'May 12', overall: 60, technical: 55, communication: 65, confidence: 60, role: 'Junior React Dev' },
      { date: 'May 18', overall: 74, technical: 70, communication: 78, confidence: 74, role: 'Software Engineer' },
      { date: 'May 25', overall: 84, technical: 82, communication: 86, confidence: 84, role: 'Full Stack' },
    ];

    const finalSkillCloud = skillCloud.length > 0 ? skillCloud : [
      { name: 'React.js', value: 4 },
      { name: 'Node.js', value: 3 },
      { name: 'JavaScript', value: 3 },
      { name: 'MongoDB', value: 2 },
      { name: 'Tailwind CSS', value: 2 },
      { name: 'Docker', value: 1 },
    ];

    res.json({
      success: true,
      stats: {
        plan: user.plan,
        usage: user.usage,
        totalResumes: atsCount,
        totalInterviews: interviewCount,
        completedInterviewsCount: compCount,
        avgATSScore: avgATS || 74,
        avgInterviewScore: avgInterview || 73,
        averages: {
          overall: avgInterview || 73,
          technical: avgTech || 69,
          communication: avgComm || 76,
          confidence: avgConf || 74,
        },
        atsTrends: finalAtsTrends,
        interviewTrends: finalIntTrends,
        topSkills: finalSkillCloud,
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
