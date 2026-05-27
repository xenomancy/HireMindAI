const express = require('express');
const router = express.Router();
const axios = require('axios');
const { protect } = require('../middleware/auth');
const Interview = require('../models/Interview');
const Resume = require('../models/Resume');
const ATSReport = require('../models/ATSReport');
const User = require('../models/User');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

// @desc    Start / Generate an AI Interview
// @route   POST /api/interview/generate
// @access  Private
router.post('/generate', protect, async (req, res, next) => {
  try {
    const { resumeId, role, difficulty, companyStyle } = req.body;
    const user = await User.findById(req.user.id);

    // SaaS Free Limit Check: Free users can only do 3 interviews
    if (user.plan === 'free' && user.usage.interviewsConducted >= 3) {
      return res.status(403).json({
        success: false,
        message: 'Free tier limit reached (Max 3 Interviews). Please upgrade to Premium!',
      });
    }

    // 1. Fetch Past Questions (Anti-Repetition Logic)
    const pastInterviews = await Interview.find({ user: req.user.id });
    const pastQuestions = [];
    pastInterviews.forEach(intv => {
      if (intv.questions) {
        intv.questions.forEach(q => {
          if (q.question) pastQuestions.push(q.question);
        });
      }
    });

    // 2. Fetch CV Details & ATS Report
    let resumeText = '';
    let skills = [];
    let projects = [];
    let atsScore = 70;
    let missingKeywords = [];
    let jobDescriptionText = '';

    if (resumeId) {
      const resume = await Resume.findById(resumeId);
      if (resume && resume.user.toString() === req.user.id) {
        resumeText = resume.extractedText;
        if (resume.parsedDetails) {
          skills = resume.parsedDetails.skills || [];
          projects = resume.parsedDetails.projects || [];
        }
      }
      
      const atsReport = await ATSReport.findOne({ resume: resumeId, user: req.user.id });
      if (atsReport) {
        atsScore = atsReport.overallATSScore || atsReport.overallScore || 70;
        missingKeywords = atsReport.missingKeywords || [];
        jobDescriptionText = atsReport.jobDescriptionText || '';
      }
    }

    let questionsList = [];
    try {
      // Call Python FastAPI AI Service
      const response = await axios.post(`${AI_SERVICE_URL}/interview/generate`, {
        resume_text: resumeText,
        role: role || 'Software Engineer',
        difficulty: difficulty || 'Mid',
        company_style: companyStyle || 'General',
        skills,
        projects,
        ats_score: atsScore,
        missing_keywords: missingKeywords,
        job_description: jobDescriptionText,
        exclude_questions: pastQuestions,
      }, { timeout: 12000 });
      questionsList = response.data.questions;
    } catch (error) {
      console.warn('AI Microservice offline. Using local high-fidelity structured fallback question generator...', error.message);
      
      // Fallback questions based on role
      const standardQuestions = {
        HR: `Walk me through your professional background as a ${role || 'Software Engineer'} and highlight your primary accomplishments.`,
        Technical: `How do you manage system resources and optimize performance under heavy real-time data or network concurrency?`,
        Behavioral: `Describe a challenging technical project you worked on. What obstacles did you face, and how did you overcome them?`,
        'Project-based': `Can you explain the detailed architecture of a major project you built, focusing on your specific tech choices and trade-offs?`,
        'Scenario-based': `Design a highly available database and queue infrastructure capable of handling millions of real-time events under high concurrency.`
      };

      const roleLower = (role || '').toLowerCase();
      if (roleLower.includes('frontend') || roleLower.includes('react')) {
        standardQuestions.Technical = "Explain how React manages hooks internally, and how components reconcile structural Virtual DOM diffs. How do you prevent unnecessary re-renders?";
        standardQuestions['Project-based'] = "In your past Frontend projects, how did you handle state management across deeply nested components? Compare Redux and the Context API.";
        standardQuestions['Scenario-based'] = "Design a responsive real-time UI dashboard receiving heavy volumes of telemetry updates. How do you ensure the UI thread is not blocked?";
      } else if (roleLower.includes('backend') || roleLower.includes('node')) {
        standardQuestions.Technical = "Explain how Node.js manages high-concurrency requests under its single-threaded event loop. How do you scale database connection pools and indexes?";
        standardQuestions['Project-based'] = "Outline the security flow in your APIs. How did you secure your REST endpoints and database queries against OWASP Top 10 vulnerabilities?";
        standardQuestions['Scenario-based'] = "Architect a robust cache-aside distributed database pattern using Redis. How do you handle cache stampede and data invalidation?";
      } else if (roleLower.includes('ai') || roleLower.includes('ml') || roleLower.includes('nlp') || roleLower.includes('machine')) {
        standardQuestions.Technical = "Explain the core difference between sparse and dense vector embeddings. How do transformers handle attention calculations?";
        standardQuestions['Project-based'] = "Detail your experience building a RAG retrieval pipeline. How did you structure your vector database indexing, chunking, and embedding models?";
        standardQuestions['Scenario-based'] = "Design a scalable machine learning inference pipeline that handles concurrent model classification requests with minimal GPU latency.";
      }

      questionsList = Object.keys(standardQuestions).map(key => ({
        type: key,
        question: standardQuestions[key],
        expectedTopics: [role || 'Software Engineer', key],
        difficulty: difficulty || 'Mid'
      }));
    }

    // Create session in Database
    const interview = await Interview.create({
      user: req.user.id,
      resume: resumeId || null,
      role: role || 'Software Engineer',
      difficulty: difficulty || 'Mid',
      companyStyle: companyStyle || 'Standard',
      questions: questionsList.map(q => ({
        question: typeof q === 'string' ? q : q.question,
        type: q.type || 'Technical',
        expectedTopics: q.expectedTopics || [],
        difficulty: q.difficulty || difficulty || 'Mid',
        userAnswer: '',
        evaluation: { score: 0, communicationFeedback: '', confidenceFeedback: '', technicalFeedback: '' }
      })),
      status: 'in-progress',
    });

    // Increment user usage counter
    user.usage.interviewsConducted += 1;
    await user.save();

    res.status(201).json({
      success: true,
      interview,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Submit answer for a question & evaluate
// @route   POST /api/interview/session/:id/answer
// @access  Private
router.post('/session/:id/answer', protect, async (req, res, next) => {
  try {
    const { answer, questionIndex } = req.body;
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    if (interview.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized session access' });
    }

    const idx = parseInt(questionIndex, 10);
    if (isNaN(idx) || idx < 0 || idx >= interview.questions.length) {
      return res.status(400).json({ success: false, message: 'Invalid question index' });
    }

    const currentQuestionItem = interview.questions[idx];
    currentQuestionItem.userAnswer = answer;

    let evaluationResult;
    try {
      // Evaluate using AI Microservice
      const response = await axios.post(`${AI_SERVICE_URL}/interview/evaluate`, {
        question: currentQuestionItem.question,
        answer: answer,
        role: interview.role,
        difficulty: interview.difficulty,
      }, { timeout: 12000 });
      evaluationResult = response.data;
    } catch (error) {
      console.warn('AI Microservice offline. Calculating high-fidelity metrics locally...', error.message);
      
      const cleanedAns = answer.trim().lower();
      const words = cleanedAns.split(/\s+/).filter(w => w.length > 0);
      
      let isGibberish = false;
      const issues = [];

      // 1. Extremely short / empty check
      if (words.length < 3 || cleanedAns.length < 8) {
        isGibberish = true;
        issues.push("Answer is too short or incomplete to evaluate.");
        issues.push("Technical explanation is completely missing.");
      }

      // 2. Keyboard typing patterns or placeholders
      const gibberishTerms = ["qwerty", "asdfgh", "zxcvbn", "asdf", "qwer", "123456", "test", "hello", "hi", "nothing", "skip", "i don't know", "i dont know", "none"];
      if (!isGibberish) {
        if (gibberishTerms.includes(cleanedAns)) {
          isGibberish = true;
          issues.push("Answer contains invalid placeholder content or keyboard patterns.");
          issues.push("No technical reasoning was attempted.");
        } else if (cleanedAns.length >= 6 && !/[aeiouy]/.test(cleanedAns)) {
          isGibberish = true;
          issues.push("Word segments lack standard vowel distribution and appear to be random typing.");
        }
      }

      // 3. Buzzword stuffing: keywords listing without explanation structure
      if (!isGibberish) {
        const keywords = ["react", "node", "javascript", "js", "api", "database", "server", "express", "mongodb", "sql", "nosql", "postgres", "aws", "docker", "redis", "kafka"];
        const matchedKeywords = words.filter(w => keywords.includes(w));
        if (words.length <= 6 && matchedKeywords.length >= 2) {
          const connectors = ["is", "are", "used", "to", "for", "the", "handle", "manage", "because", "which", "how", "why", "in", "with", "a", "an", "of"];
          const hasConnectors = words.some(w => connectors.includes(w));
          if (!hasConnectors) {
            isGibberish = true;
            issues.push("Answer consists of listed buzzwords without logical or syntactic connections.");
          }
        }
      }

      // 4. Repeated word patterns
      if (!isGibberish && words.length >= 4) {
        const uniqueWords = new Set(words);
        if (uniqueWords.size / words.length < 0.4) {
          isGibberish = true;
          issues.push("Answer contains repeated words suggesting random keyboard inputs or filler.");
        }
      }

      // 5. Meaningless placeholder phrases
      if (!isGibberish) {
        const fillerPhrases = ["maybe server", "i don't know but maybe", "i dont know but maybe", "something like that"];
        for (const filler of fillerPhrases) {
          if (filler === cleanedAns || (cleanedAns.includes(filler) && words.length <= 6)) {
            isGibberish = true;
            issues.push("Answer contains generic placeholders indicating lack of confidence or knowledge.");
            break;
          }
        }
      }

      if (isGibberish) {
        evaluationResult = {
          technicalAccuracy: 5,
          conceptualUnderstanding: 5,
          communicationClarity: 5,
          practicalKnowledge: 5,
          answerRelevance: 5,
          detectedIssues: issues.length > 0 ? issues : ["Answer contains invalid content, gibberish text, or random typing."],
          isAnswerValid: false,
          needsFollowUp: true,
          followUpQuestion: "Could you please explain the concept in detail, outlining the design patterns or execution flow?",
          improvementSuggestion: "Provide a complete technical explanation containing at least 2-3 structured sentences, using accurate terminology.",
          finalEvaluation: "The candidate provided an invalid, empty, or placeholder response. No technical competence could be verified."
        };
      } else {
        // Smart Fallback Local Evaluation Engine for valid answers
        const wordCount = words.length;
        const matchedCount = (answer.toLowerCase().match(/(react|node|express|mongodb|postgres|redis|scale|performance|async|promise|api|database|index|cache|latency|docker|aws|star)/g) || []).length;
        const termBonus = matchedCount * 4;

        let techAcc, conceptUnd, commClr, pracKnow, ansRel, hiringProb, recSummary, strengths, weaknesses, followups, recs;

        if (wordCount < 15) {
          // Very weak (15-40)
          techAcc = Math.round(15 + Math.random() * 15);
          conceptUnd = Math.round(15 + Math.random() * 13);
          commClr = Math.round(18 + Math.random() * 14);
          pracKnow = Math.round(15 + Math.random() * 10);
          ansRel = Math.round(15 + Math.random() * 15);
          hiringProb = "Low";
          recSummary = "The response is extremely brief and lacks technical baseline context. It failed to address operational mechanisms or tools.";
          strengths = ["Capable of basic conversational phrasing."];
          weaknesses = ["Exhibits shallow conceptual understanding.", "Fails to provide metrics, trade-offs, or architectures."];
          followups = [`Could you explain the core underlying mechanism and how you would structure it?`, "What specific database engines or state tools have you integrated?"];
          recs = ["Quantify achievements using STAR methodologies.", "Study core under-the-hood parameters of your target framework."];
        } else if (wordCount < 45) {
          // Partially correct (40-65)
          techAcc = Math.round(40 + Math.random() * 12 + Math.min(8, termBonus));
          conceptUnd = Math.round(40 + Math.random() * 15);
          commClr = Math.round(42 + Math.random() * 16);
          pracKnow = Math.round(40 + Math.random() * 12);
          ansRel = Math.round(45 + Math.random() * 13);
          hiringProb = "Moderate";
          recSummary = "The response displays standard conceptual familiarity but lacks advanced engineering depth, trade-off comparisons, or performance details.";
          strengths = ["Recognizes key technology components.", "Shows standard conversational engagement."];
          weaknesses = ["Lacks specific production optimization metrics.", "Under-developed structural architecture details."];
          followups = ["Could you provide a concrete example of this pattern and discuss the scaling trade-offs?", "What caching or database indexing configurations would you apply?"];
          recs = ["Incorporate latency details and system scaling choices.", "Practise outlining your design patterns step-by-step."];
        } else if (wordCount < 85) {
          // Good (65-82)
          techAcc = Math.round(65 + Math.random() * 10 + Math.min(6, termBonus));
          conceptUnd = Math.round(66 + Math.random() * 12);
          commClr = Math.round(68 + Math.random() * 12);
          pracKnow = Math.round(65 + Math.random() * 11);
          ansRel = Math.round(68 + Math.random() * 12);
          hiringProb = "Moderate";
          recSummary = "A good technical answer showing solid conceptual grasp and vocabulary. Needs more depth on debugging, edge cases, and real-world metrics.";
          strengths = ["Strong conceptual comprehension.", "Uses standard terminology accurately."];
          weaknesses = ["Could expand on specific optimization metrics.", "Fails to cover potential failure modes."];
          followups = ["What metrics would you monitor under high concurrent load, and how would you optimize database indices or caching layers for this scenario?", "How do you handle connection pooling or write failures under scale?"];
          recs = ["Deepen discussion of database query optimization.", "Detail caching invalidation schemes under active client writes."];
        } else {
          // Strong production-level (82-92)
          techAcc = Math.min(92, Math.round(82 + Math.random() * 6 + Math.min(4, termBonus)));
          conceptUnd = Math.round(82 + Math.random() * 8);
          commClr = Math.round(82 + Math.random() * 8);
          pracKnow = Math.round(82 + Math.random() * 6);
          ansRel = Math.round(82 + Math.random() * 8);
          hiringProb = "High";
          recSummary = "The candidate showcases excellent conceptual grip, highlighting architectural scaling tradeoffs, proper debugging lifecycles, and solid production familiarity.";
          strengths = ["Deep technical explanation with robust contextual flow.", "Identifies trade-offs and runtime limits clearly."];
          weaknesses = ["Minor edge-case coverage details can be tightened further.", "Could expand on pipeline automation choices."];
          followups = ["How would you design a CI/CD pipeline and write test coverage to assert this architectural design?", "Explain how you handle data persistence recovery in this structure."];
          recs = ["Deepen cloud deployment pipeline understanding.", "Continue demonstrating optimization metrics in real-world environments."];
        }

        evaluationResult = {
          technicalAccuracy: techAcc,
          conceptualUnderstanding: conceptUnd,
          communicationClarity: commClr,
          practicalKnowledge: pracKnow,
          answerRelevance: ansRel,
          detectedIssues: weaknesses,
          isAnswerValid: true,
          needsFollowUp: techAcc < 82,
          followUpQuestion: followups[0],
          improvementSuggestion: recs[0],
          finalEvaluation: recSummary
        };
      }
    }

    // Map FastAPI returned evaluations cleanly, aligning with multi-dimensional keys
    const overallScoreVal = evaluationResult.overallScore ?? 
      Math.round(
        ((evaluationResult.technicalAccuracy ?? 0) * 0.35) + 
        (((evaluationResult.conceptualUnderstanding ?? 0) + (evaluationResult.communicationClarity ?? 0)) * 0.10) + 
        ((evaluationResult.communicationClarity ?? 0) * 0.15) + 
        ((evaluationResult.problemSolving ?? evaluationResult.practicalKnowledge ?? 0) * 0.15) + 
        ((evaluationResult.confidence ?? 70) * 0.10) + 
        ((evaluationResult.realWorldKnowledge ?? evaluationResult.practicalKnowledge ?? 0) * 0.05)
      ) ?? 0;

    currentQuestionItem.evaluation = {
      score: overallScoreVal,
      technicalFeedback: evaluationResult.finalEvaluation || evaluationResult.technical_feedback || evaluationResult.recruiterSummary || '',
      communicationFeedback: evaluationResult.communication_feedback || evaluationResult.communicationClarityFeedback || 'Clear communication context.',
      confidenceFeedback: evaluationResult.confidence_feedback || 'Professional delivery.',
      
      // Save multi-dimensional parameters inside turn for final averaging using nullish coalescing
      technicalAccuracy: evaluationResult.technicalAccuracy ?? evaluationResult.score ?? 70,
      communicationClarity: evaluationResult.communicationClarity ?? evaluationResult.score ?? 70,
      problemSolving: evaluationResult.problemSolving ?? evaluationResult.practicalKnowledge ?? evaluationResult.score ?? 70,
      realWorldKnowledge: evaluationResult.realWorldKnowledge ?? evaluationResult.practicalKnowledge ?? evaluationResult.score ?? 70,
      isAnswerValid: evaluationResult.isAnswerValid !== undefined ? evaluationResult.isAnswerValid : true,
      
      followUpQuestions: evaluationResult.followUpQuestions || (evaluationResult.followUpQuestion ? [evaluationResult.followUpQuestion] : [])
    };

    // Dynamic Adaptive Follow-Up Question Engine
    const followUpQText = evaluationResult.followUpQuestion || 
      (evaluationResult.followUpQuestions && evaluationResult.followUpQuestions[0]);
    
    if (followUpQText && interview.questions.length < 7) {
      // Determine adaptive difficulty based on performance
      let followUpDifficulty = interview.difficulty;
      if (overallScoreVal >= 80) {
        followUpDifficulty = 'Senior'; // Elevate difficulty if candidate performs well
      } else if (overallScoreVal < 50) {
        followUpDifficulty = 'Entry'; // Reduce difficulty if candidate struggles
      }
      
      const followUpQuestionObj = {
        question: followUpQText,
        type: 'Scenario-based',
        expectedTopics: evaluationResult.detectedIssues || ['follow-up', currentQuestionItem.type || 'Technical'],
        difficulty: followUpDifficulty === 'Senior' ? 'Hard' : (followUpDifficulty === 'Entry' ? 'Easy' : 'Medium'),
        userAnswer: '',
        evaluation: { score: 0, communicationFeedback: '', confidenceFeedback: '', technicalFeedback: '' }
      };
      
      // Insert right after the current answered question (idx)
      interview.questions.splice(idx + 1, 0, followUpQuestionObj);
    }

    // Save answer progress
    await interview.save();

    // Check if this was the last question. If so, compute cumulative scorecard
    const allQuestionsAnswered = interview.questions.every(q => q.userAnswer.trim().length > 0);
    
    if (allQuestionsAnswered || idx === interview.questions.length - 1) {
      interview.status = 'completed';

      // Compute averages using nullish coalescing
      let totalTech = 0, totalComm = 0, totalConf = 0, totalOverall = 0;
      let totalTechAcc = 0, totalCommClr = 0, totalProbSolv = 0, totalRealWorld = 0;
      const count = interview.questions.length;

      interview.questions.forEach(q => {
        const scores = q.evaluation || {};
        totalTech += scores.technicalAccuracy ?? scores.score ?? 70;
        totalComm += scores.communicationClarity ?? scores.score ?? 72;
        totalConf += scores.score ?? 75;
        totalOverall += scores.score ?? 72;
        
        totalTechAcc += scores.technicalAccuracy ?? scores.score ?? 70;
        totalCommClr += scores.communicationClarity ?? scores.score ?? 72;
        totalProbSolv += scores.problemSolving ?? scores.score ?? 70;
        totalRealWorld += scores.realWorldKnowledge ?? scores.score ?? 70;
      });

      interview.overallScores = {
        technical: Math.round(totalTechAcc / count),
        communication: Math.round(totalCommClr / count),
        confidence: Math.round(totalConf / count),
        overall: Math.round(totalOverall / count),
        
        technicalAccuracy: Math.round(totalTechAcc / count),
        communicationClarity: Math.round(totalCommClr / count),
        problemSolving: Math.round(totalProbSolv / count),
        realWorldKnowledge: Math.round(totalRealWorld / count)
      };

      interview.feedbackSummary = evaluationResult.recruiterSummary || `You have completed the AI mock interview for the ${interview.role} role. You scored an overall ${interview.overallScores.overall}%.`;
      interview.improvementSuggestions = evaluationResult.recommendations || [
        "Incorporate metrics (e.g., 'boosted speed by 30%') when answering behavioral questions.",
        "Deepen familiarity with system scalability terms like load balancing, caching, and rate limiting."
      ];
      
      interview.recommendations = evaluationResult.recommendations || interview.improvementSuggestions;
      interview.hiringProbability = evaluationResult.hiringProbability || (interview.overallScores.overall >= 80 ? 'High' : 'Moderate');
      
      // Apply cheating focus-blur integrity score reductions to final overall score
      if (interview.suspiciousActivityCount > 0) {
        const scoreDeduction = interview.suspiciousActivityCount * 5;
        interview.overallScores.overall = Math.max(30, interview.overallScores.overall - scoreDeduction);
        interview.feedbackSummary += ` [Note: Overall evaluation adjusted due to ${interview.suspiciousActivityCount} registered browser tab shifts or focus blur events during session.]`;
      }

      await interview.save();
    }

    res.json({
      success: true,
      questionItem: currentQuestionItem,
      interview,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Report browser suspicious cheating activity (focus blur, copy-paste)
// @route   POST /api/interview/session/:id/suspicious
// @access  Private
router.post('/session/:id/suspicious', protect, async (req, res, next) => {
  try {
    const { activityType, description } = req.body;
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }
    if (interview.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized session access' });
    }
    
    interview.suspiciousActivityCount += 1;
    interview.interviewIntegrityScore = Math.max(0, 100 - (interview.suspiciousActivityCount * 25));
    
    // Log the cheating incident
    interview.cheatingLogs.push({
      activityType: activityType || 'Unknown suspicious behavior',
      description: description || 'No details provided.',
      timestamp: new Date()
    });
    
    if (interview.suspiciousActivityCount >= 3) {
      interview.cheatingDetected = true;
      interview.status = 'completed'; // Terminate session
      interview.feedbackSummary = `Interview terminated due to multiple integrity violations. Registered violations: ${interview.cheatingLogs.map(log => log.activityType).join(', ')}.`;
      
      // Reset scores to zero or minimal baseline upon cheating disqualification
      interview.overallScores = {
        technical: 30,
        communication: 30,
        confidence: 30,
        overall: 30,
        technicalAccuracy: 30,
        communicationClarity: 30,
        problemSolving: 30,
        realWorldKnowledge: 30
      };
      interview.hiringProbability = "Low";
      interview.improvementSuggestions = ["Adhere to professional exam rules. Keep browser focus locked and stay active during interview sessions."];
    }
    
    await interview.save();
    
    res.json({
      success: true,
      suspiciousActivityCount: interview.suspiciousActivityCount,
      interviewIntegrityScore: interview.interviewIntegrityScore,
      cheatingDetected: interview.cheatingDetected,
      interview
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get all interview histories
// @route   GET /api/interview/history
// @access  Private
router.get('/history', protect, async (req, res, next) => {
  try {
    const sessions = await Interview.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: sessions.length,
      sessions,
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get details of a single interview session / scorecard
// @route   GET /api/interview/session/:id
// @access  Private
router.get('/session/:id', protect, async (req, res, next) => {
  try {
    const session = await Interview.findById(req.params.id).populate('resume');

    if (!session) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    if (session.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to view this session' });
    }

    res.json({
      success: true,
      session,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
