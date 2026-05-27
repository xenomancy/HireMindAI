import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import axios from 'axios';
import {
  MessageSquare,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Brain,
  Video,
  FileText,
} from 'lucide-react';

export default function InterviewPrep() {
  const { user, refreshUserUsage, setIsPremiumModalOpen } = useContext(AuthContext);
  const navigate = useNavigate();

  const [role, setRole] = useState('');
  const [difficulty, setDifficulty] = useState('Mid');
  const [companyStyle, setCompanyStyle] = useState('Standard');
  const [selectedResumeId, setSelectedResumeId] = useState('');
  
  const [resumes, setResumes] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchSetupData = async () => {
    try {
      // Fetch user's resumes
      const resumeRes = await axios.get('/api/resume/history');
      if (resumeRes.data.success) {
        // Unique resumes by id
        const reps = resumeRes.data.reports;
        const uniqueResumes = [];
        const seenIds = new Set();
        
        reps.forEach(r => {
          if (r.resume && !seenIds.has(r.resume._id)) {
            seenIds.add(r.resume._id);
            uniqueResumes.push(r.resume);
          }
        });
        setResumes(uniqueResumes);
        if (uniqueResumes.length > 0) {
          setSelectedResumeId(uniqueResumes[0]._id);
        }
      }

      // Fetch past interviews
      const historyRes = await axios.get('/api/interview/history');
      if (historyRes.data.success) {
        setHistory(historyRes.data.sessions);
      }
    } catch (e) {
      console.warn("Could not fetch interview setup details:", e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSetupData();
  }, []);

  const validateJobRole = (inputRole) => {
    const trimmed = inputRole.trim();
    if (!trimmed) {
      return { isValid: false, message: 'Please specify target job role.' };
    }

    const words = trimmed.toLowerCase().split(/[\s/\-_,]+/);
    const standardTechWords = [
      'engineer', 'developer', 'frontend', 'backend', 'fullstack', 'designer', 
      'manager', 'administrator', 'analyst', 'architect', 'consultant', 
      'specialist', 'scientist', 'software', 'product', 'project', 'security', 
      'cloud', 'devops', 'system', 'database'
    ];

    const getLevenshteinDistance = (a, b) => {
      const tmp = [];
      for (let i = 0; i <= a.length; i++) tmp[i] = [i];
      for (let j = 0; j <= b.length; j++) tmp[0][j] = j;
      for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
          tmp[i][j] = Math.min(
            tmp[i - 1][j] + 1,
            tmp[i][j - 1] + 1,
            tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
          );
        }
      }
      return tmp[a.length][b.length];
    };

    const typosFound = [];
    words.forEach(word => {
      if (standardTechWords.includes(word)) return;

      let closestWord = '';
      let minDistance = Infinity;

      standardTechWords.forEach(std => {
        const dist = getLevenshteinDistance(word, std);
        if (dist < minDistance) {
          minDistance = dist;
          closestWord = std;
        }
      });

      let threshold = 0;
      if (word.length >= 4 && word.length <= 5) threshold = 1;
      else if (word.length >= 6 && word.length <= 7) threshold = 2;
      else if (word.length >= 8) threshold = 3;

      if (minDistance > 0 && minDistance <= threshold) {
        typosFound.push({ original: word, correction: closestWord });
      }
    });

    if (typosFound.length > 0) {
      const suggestions = typosFound.map(t => `"${t.correction}" instead of "${t.original}"`).join(', ');
      return {
        isValid: false,
        message: `It seems you have a spelling mistake in your job role. Did you mean: ${suggestions}? Please correct it.`
      };
    }

    const commonValidShorts = ['ai', 'ml', 'qa', 'it', 'hr', 'ui', 'ux', 'db', 'go', 'c', 'js', 'py', 'ts', 'qt'];
    for (let word of words) {
      if (word.length < 3 && !commonValidShorts.includes(word) && !/^\d+$/.test(word)) {
        return {
          isValid: false,
          message: `Job role input "${word}" is too short. Please provide a valid engineering role title.`
        };
      }
      if (/(.)\1{3,}/.test(word) || (word.length >= 8 && !/[aeiouy]/i.test(word))) {
        return {
          isValid: false,
          message: `Target job role appears to contain invalid or misspelled words ("${word}"). Please correct it.`
        };
      }
    }

    return { isValid: true };
  };

  const handleStartInterview = async (e) => {
    e.preventDefault();
    
    const validation = validateJobRole(role);
    if (!validation.isValid) {
      setErrorMsg(validation.message);
      return;
    }

    // Free Tier Usage Limit Check
    if (user && user.plan === 'free' && user.usage.interviewsConducted >= 3) {
      setErrorMsg("Free plan usage limits reached (Max 3 Interviews). Upgrade to Premium to unlock unlimited live interactive interviews!");
      setIsPremiumModalOpen(true);
      return;
    }

    setStarting(true);
    setErrorMsg('');

    try {
      const response = await axios.post('/api/interview/generate', {
        role,
        difficulty,
        companyStyle,
        resumeId: selectedResumeId || null,
      }, { timeout: 15000 });

      if (response.data.success) {
        const session = response.data.interview;
        await refreshUserUsage();
        navigate(`/interview/session/${session._id}`);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error generating interview questions.');
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-left">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-brand-text md:text-3xl">
          AI Mock Interview Generator
        </h1>
        <p className="text-xs text-brand-gray font-light">
          Simulate timed, high-stakes conversational evaluations customized to specific companies and roles.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Setup Configurator (Left) */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-brand-border/60 bg-white p-6 shadow-premium space-y-4">
            <div className="flex gap-2 items-center text-brand-text mb-1">
              <Brain className="h-5 w-5 text-brand-peach stroke-[1.5]" />
              <h3 className="font-heading text-sm font-semibold">Customize Mock Session</h3>
            </div>

            {errorMsg && (
              <div className="rounded-xl border border-red-200/50 bg-red-50/50 p-3 text-xs font-medium text-red-800">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleStartInterview} className="space-y-4 font-light">
              {/* Job Role */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-brand-gray uppercase tracking-wider">Target Job Role</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Frontend Engineer"
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full rounded-xl border border-brand-border bg-white py-2.5 px-3.5 text-xs text-brand-text outline-none transition-all placeholder:text-brand-gray/40 focus:border-brand-peach/80 focus:ring-1 focus:ring-brand-peach/40"
                />
              </div>

              {/* Difficulty & Company Grid */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-brand-gray uppercase tracking-wider">Seniority</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full rounded-xl border border-brand-border bg-white py-2.5 px-3.5 text-xs text-brand-text outline-none transition-all focus:border-brand-peach/80"
                  >
                    <option value="Entry">Entry Level</option>
                    <option value="Mid">Mid Level</option>
                    <option value="Senior">Senior Level</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold text-brand-gray uppercase tracking-wider">Company Style</label>
                  <select
                    value={companyStyle}
                    onChange={(e) => setCompanyStyle(e.target.value)}
                    className="w-full rounded-xl border border-brand-border bg-white py-2.5 px-3.5 text-xs text-brand-text outline-none transition-all focus:border-brand-peach/80"
                  >
                    <option value="General">General / Standard</option>
                    <option value="Google">Google (Algorithms)</option>
                    <option value="Stripe">Stripe (Integrations)</option>
                    <option value="Notion">Notion (Product Focus)</option>
                  </select>
                </div>
              </div>

              {/* Select Resume */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-brand-gray uppercase tracking-wider">Align with CV Projects</label>
                {resumes.length === 0 ? (
                  <div className="text-[10px] text-brand-gray border border-brand-border rounded-xl p-2.5 bg-brand-warmBg/20">
                    No resumes uploaded. Mock questions will follow standard templates. Upload in the ATS tab to personalize!
                  </div>
                ) : (
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="w-full rounded-xl border border-brand-border bg-white py-2.5 px-3.5 text-xs text-brand-text outline-none transition-all focus:border-brand-peach/80"
                  >
                    {resumes.map(res => (
                      <option key={res._id} value={res._id}>
                        {res.fileName} (Parsed: {new Date(res.createdAt).toLocaleDateString()})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <button
                type="submit"
                disabled={starting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-text py-3 text-xs font-semibold text-white shadow-premium hover:bg-brand-text/90 transition-all active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {starting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    Initialize Mock Simulation
                    <ChevronRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Historical scorecards (Right) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-brand-border/60 bg-white p-6 shadow-premium space-y-4">
            <h3 className="font-heading text-sm font-semibold text-brand-text">Past Scorecards</h3>

            {loading ? (
              <div className="space-y-2 py-4">
                <div className="h-4 w-full animate-pulse rounded bg-brand-border/40"></div>
                <div className="h-4 w-5/6 animate-pulse rounded bg-brand-border/40"></div>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center text-xs text-brand-gray py-12 font-light space-y-4">
                <div className="flex justify-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-warmBg text-brand-gray">
                    <Video className="h-5 w-5" />
                  </div>
                </div>
                <div>No past interviews completed yet. Customize a session on the left to begin.</div>
              </div>
            ) : (
              <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
                {history.map((session) => (
                  <div
                    key={session._id}
                    onClick={() => navigate(`/interview/session/${session._id}`)}
                    className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-brand-border/60 bg-white shadow-subtle cursor-pointer hover:border-brand-peach transition-all active:scale-[0.99]"
                  >
                    <div className="flex gap-3 items-center">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-peach/10 text-brand-text">
                        <MessageSquare className="h-4.5 w-4.5 stroke-[1.5]" />
                      </div>
                      <div className="text-left max-w-xs">
                        <div className="text-xs font-semibold text-brand-text truncate">{session.role} ({session.difficulty})</div>
                        <div className="text-[10px] text-brand-gray font-light">
                          Style: {session.companyStyle} • {new Date(session.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {session.status === 'in-progress' ? (
                        <span className="rounded-full bg-brand-peach/15 px-2.5 py-1 text-[10px] font-semibold text-amber-800 uppercase tracking-wide">
                          In Progress
                        </span>
                      ) : (
                        <div className="text-right">
                          <div className="text-[10px] font-semibold text-brand-gray uppercase">Overall Grade</div>
                          <div className="font-heading text-sm font-bold text-brand-text">
                            {session.overallScores?.overall || 70}%
                          </div>
                        </div>
                      )}
                      <ChevronRight className="h-4.5 w-4.5 text-brand-gray" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
