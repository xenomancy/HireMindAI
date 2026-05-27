import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../App';
import axios from 'axios';
import {
  Compass,
  ArrowRight,
  Sparkles,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  Bookmark,
  CheckSquare,
  Zap,
  FileText,
  UserCheck,
  Award,
  Briefcase,
  AlertCircle,
  ShieldCheck,
  Target,
  Clock,
  Brain
} from 'lucide-react';

export default function RoadmapGenerator() {
  const { user, refreshUserUsage } = useContext(AuthContext);

  const [dreamCompany, setDreamCompany] = useState('');
  const [role, setRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('intermediate');
  const [currentSkills, setCurrentSkills] = useState('');
  const [weakAreas, setWeakAreas] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  
  const [activeRoadmap, setActiveRoadmap] = useState(null);
  const [history, setHistory] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchHistory = async () => {
    try {
      const response = await axios.get('/api/roadmap/history');
      if (response.data.success) {
        setHistory(response.data.roadmaps);
      }
    } catch (e) {
      console.warn("Could not fetch roadmaps history:", e.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
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

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!dreamCompany.trim()) {
      setErrorMsg('Please specify your dream company.');
      return;
    }

    const validation = validateJobRole(role);
    if (!validation.isValid) {
      setErrorMsg(validation.message);
      return;
    }

    if (user && user.plan === 'free' && user.usage.roadmapsGenerated >= 2) {
      setErrorMsg("Free Plan limits reached (Max 2 Roadmaps). Click your plan badge in the sidebar to toggle Premium!");
      return;
    }

    setGenerating(true);
    setErrorMsg('');
    setActiveRoadmap(null);

    const skillsArray = currentSkills.split(',').map(s => s.trim()).filter(s => s.length > 0);
    const weakAreasArray = weakAreas.split(',').map(w => w.trim()).filter(w => w.length > 0);

    try {
      const response = await axios.post('/api/roadmap/generate', {
        dreamCompany,
        role,
        experienceLevel,
        currentSkills: skillsArray,
        weakAreas: weakAreasArray,
        jobDescription,
      }, { timeout: 20000 });

      if (response.data.success) {
        setActiveRoadmap(response.data.roadmap);
        setDreamCompany('');
        setRole('');
        setExperienceLevel('intermediate');
        setCurrentSkills('');
        setWeakAreas('');
        setJobDescription('');
        await fetchHistory();
        await refreshUserUsage();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error occurred while creating study calendar.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-left">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-brand-text md:text-3xl">
          FAANG-Style AI Career Roadmap Generator
        </h1>
        <p className="text-xs text-brand-gray font-light">
          Construct an actionable, weak-area-focused study schedule, recommended portfolio items, and ATS optimizations aligned with your dream tech destination.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (Inputs Configurator - lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl border border-brand-border/60 bg-white p-6 shadow-premium space-y-4">
            <div className="flex gap-2 items-center text-brand-text mb-1">
              <Compass className="h-5 w-5 text-brand-peach stroke-[1.5]" />
              <h3 className="font-heading text-sm font-semibold">Generate Study Plan</h3>
            </div>

            {errorMsg && (
              <div className="rounded-xl border border-red-200/50 bg-red-50/50 p-3 text-xs font-medium text-red-800">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleGenerate} className="space-y-4 font-light">
              {/* Target Tech Role */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-brand-gray uppercase tracking-wider">Target Tech Role</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior React Developer, System Architect"
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full rounded-xl border border-brand-border bg-white py-2.5 px-3.5 text-xs text-brand-text outline-none transition-all placeholder:text-brand-gray/40 focus:border-brand-peach/80"
                />
              </div>

              {/* Experience Level */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-brand-gray uppercase tracking-wider">Experience Level</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full rounded-xl border border-brand-border bg-white py-2.5 px-3.5 text-xs text-brand-text outline-none transition-all focus:border-brand-peach/80"
                >
                  <option value="beginner">Beginner (0 - 2 years)</option>
                  <option value="intermediate">Intermediate (2 - 5 years)</option>
                  <option value="experienced">Experienced (5+ years)</option>
                </select>
              </div>

              {/* Dream Company */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-brand-gray uppercase tracking-wider">Dream Company</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stripe, Google, Netflix"
                  value={dreamCompany}
                  onChange={(e) => {
                    setDreamCompany(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full rounded-xl border border-brand-border bg-white py-2.5 px-3.5 text-xs text-brand-text outline-none transition-all placeholder:text-brand-gray/40 focus:border-brand-peach/80"
                />
              </div>

              {/* Current Skills */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-brand-gray uppercase tracking-wider">Current Skills (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. JavaScript, React, CSS, Git"
                  value={currentSkills}
                  onChange={(e) => setCurrentSkills(e.target.value)}
                  className="w-full rounded-xl border border-brand-border bg-white py-2.5 px-3.5 text-xs text-brand-text outline-none transition-all placeholder:text-brand-gray/40 focus:border-brand-peach/80"
                />
              </div>

              {/* Weak Areas */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-brand-gray uppercase tracking-wider">Weak Gaps / Targets (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. System Design, Redis, Caching layers"
                  value={weakAreas}
                  onChange={(e) => setWeakAreas(e.target.value)}
                  className="w-full rounded-xl border border-brand-border bg-white py-2.5 px-3.5 text-xs text-brand-text outline-none transition-all placeholder:text-brand-gray/40 focus:border-brand-peach/80"
                />
              </div>

              {/* Job Description Textarea */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-brand-gray uppercase tracking-wider">Paste Job Description (Optional)</label>
                <textarea
                  rows="3"
                  placeholder="Paste specific job requirements here to map learning checkpoints straight to target benchmarks..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full rounded-xl border border-brand-border bg-white py-2.5 px-3.5 text-xs text-brand-text outline-none transition-all placeholder:text-brand-gray/40 focus:border-brand-peach/80 resize-none font-light leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={generating}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-text py-3 text-xs font-semibold text-white shadow-premium hover:bg-brand-text/90 transition-all active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    Build Custom Pathway
                    <ChevronRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* History Panel */}
          <div className="rounded-2xl border border-brand-border/60 bg-white p-6 shadow-premium space-y-4">
            <h3 className="font-heading text-sm font-semibold text-brand-text">Past Roadmaps</h3>

            {loadingHistory ? (
              <div className="space-y-2 py-4">
                <div className="h-4 w-full animate-pulse rounded bg-brand-border/40"></div>
                <div className="h-4 w-5/6 animate-pulse rounded bg-brand-border/40"></div>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center text-xs text-brand-gray py-6 font-light">
                No custom pathways created yet. Define targets above.
              </div>
            ) : (
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {history.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => setActiveRoadmap(item)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all hover:bg-brand-warmBg/25 active:scale-[0.99] ${
                      activeRoadmap?._id === item._id ? 'border-brand-peach bg-brand-peach/5' : 'border-brand-border/60'
                    }`}
                  >
                    <div className="flex gap-2.5 items-center truncate">
                      <Compass className="h-4.5 w-4.5 text-brand-peach shrink-0 stroke-[1.5]" />
                      <div className="truncate text-left">
                        <div className="text-xs font-semibold text-brand-text truncate">{item.role} @ {item.dreamCompany}</div>
                        <div className="text-[9px] text-brand-gray font-light">{new Date(item.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <span className="rounded-full bg-brand-green/20 px-2 py-0.5 text-[9px] font-semibold text-emerald-800 uppercase tracking-wide">
                      {item.estimatedPreparationTime || '4 Weeks'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Visual Calendar & Strategy - lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-6">
          {generating ? (
            <div className="rounded-2xl border border-brand-border/60 bg-white p-12 shadow-premium text-center space-y-6">
              <div className="flex justify-center">
                <div className="relative flex items-center justify-center">
                  <div className="h-16 w-16 animate-spin rounded-full border-4 border-brand-peach border-t-transparent"></div>
                  <Compass className="h-6 w-6 text-brand-green absolute animate-pulse" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-heading text-base font-semibold text-brand-text">Building FAANG-Style Study Pathway</h3>
                <p className="text-xs text-brand-gray max-w-xs mx-auto">Gemini is structuring strengths matrices, modern deployments projects, and resume advice plans...</p>
              </div>
            </div>
          ) : activeRoadmap ? (
            <div className="space-y-8 animate-fadeIn">
              
              {/* Executive Grounded Overview Panel */}
              <div className="rounded-3xl border border-brand-border/60 bg-gradient-to-br from-white via-brand-warmBg/5 to-white p-8 shadow-premium space-y-6 text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-peach/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-brand-green/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="rounded-full bg-brand-text/5 px-3 py-1 text-[10px] font-bold text-brand-text border border-brand-border/60 flex items-center gap-1.5 uppercase tracking-wider">
                        <Target className="h-3.5 w-3.5 text-brand-peach" />
                        Grounded Pathway
                      </span>
                      {activeRoadmap.hallucinationCheckPassed && (
                        <span className="rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-[10px] font-bold border border-emerald-200/60 flex items-center gap-1.5 uppercase tracking-wider animate-pulse">
                          <ShieldCheck className="h-3.5 w-3.5 text-brand-green" />
                          Evidence Validated
                        </span>
                      )}
                      <span className="rounded-full bg-brand-warmBg px-3 py-1 text-[10px] font-bold text-brand-text border border-brand-border/60 flex items-center gap-1.5 uppercase tracking-wider">
                        <Clock className="h-3.5 w-3.5 text-brand-peach" />
                        {activeRoadmap.estimatedPreparationTime || '4 Weeks'} Duration
                      </span>
                    </div>
                    <h2 className="font-heading text-xl md:text-2xl font-extrabold text-brand-text tracking-tight">
                      {activeRoadmap.role} <span className="text-brand-peach">@</span> {activeRoadmap.dreamCompany}
                    </h2>
                    <p className="text-xs text-brand-gray leading-relaxed font-light max-w-2xl">
                      {activeRoadmap.finalCareerStrategy || "Your personalized evidence-backed technical preparation program is fully optimized for hireability."}
                    </p>
                  </div>

                  {/* Circular/Semi-Circular SVG Gauges Dashboard */}
                  <div className="flex items-center gap-6 border-l border-brand-border/50 pl-6 shrink-0">
                    {/* Gauge 1: Role Alignment */}
                    <div className="flex flex-col items-center text-center space-y-1">
                      <div className="relative flex items-center justify-center">
                        {/* SVG Gauge */}
                        <svg className="w-16 h-16 transform -rotate-90">
                          <circle cx="32" cy="32" r="28" stroke="#f3f4f6" strokeWidth="5" fill="transparent" />
                          <circle cx="32" cy="32" r="28" stroke="#10b981" strokeWidth="5" fill="transparent"
                            strokeDasharray={175.9}
                            strokeDashoffset={175.9 - (175.9 * (activeRoadmap.roleAlignmentScore || 75)) / 100}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="absolute text-xs font-bold text-brand-text">
                          {activeRoadmap.roleAlignmentScore || 75}%
                        </span>
                      </div>
                      <span className="text-[9px] font-extrabold text-brand-gray uppercase tracking-wider">Role Alignment</span>
                    </div>

                    {/* Gauge 2: Roadmap Confidence */}
                    <div className="flex flex-col items-center text-center space-y-1">
                      <div className="relative flex items-center justify-center">
                        <svg className="w-16 h-16 transform -rotate-90">
                          <circle cx="32" cy="32" r="28" stroke="#f3f4f6" strokeWidth="5" fill="transparent" />
                          <circle cx="32" cy="32" r="28" stroke="#f97316" strokeWidth="5" fill="transparent"
                            strokeDasharray={175.9}
                            strokeDashoffset={175.9 - (175.9 * (activeRoadmap.roadmapConfidence || 85)) / 100}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="absolute text-xs font-bold text-brand-text">
                          {activeRoadmap.roadmapConfidence || 85}%
                        </span>
                      </div>
                      <span className="text-[9px] font-extrabold text-brand-gray uppercase tracking-wider">Confidence</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verified Strengths vs Study Gaps Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div className="rounded-2xl border border-brand-border/60 bg-white p-6 shadow-premium space-y-3 text-left">
                  <div className="flex items-center gap-2 font-bold text-xs text-brand-text border-b border-brand-border/40 pb-2.5">
                    <UserCheck className="h-4.5 w-4.5 text-brand-green shrink-0" />
                    <span>Identified Strong Domains</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {activeRoadmap.detectedStrongAreas && activeRoadmap.detectedStrongAreas.length > 0 ? (
                      activeRoadmap.detectedStrongAreas.map((item, idx) => (
                        <span key={idx} className="rounded-xl bg-emerald-50/60 text-emerald-700 border border-emerald-100/80 px-3 py-1 text-[11px] font-semibold">
                          {item}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-brand-gray italic font-light">No strong areas evaluated yet.</span>
                    )}
                  </div>
                </div>

                {/* Weak Gaps */}
                <div className="rounded-2xl border border-brand-border/60 bg-white p-6 shadow-premium space-y-3 text-left">
                  <div className="flex items-center gap-2 font-bold text-xs text-brand-text border-b border-brand-border/40 pb-2.5">
                    <AlertCircle className="h-4.5 w-4.5 text-amber-500 shrink-0" />
                    <span>Targeted Study Focus Gaps</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {activeRoadmap.detectedWeakAreas && activeRoadmap.detectedWeakAreas.length > 0 ? (
                      activeRoadmap.detectedWeakAreas.map((item, idx) => (
                        <span key={idx} className="rounded-xl bg-amber-50/60 text-amber-700 border border-amber-100/80 px-3 py-1 text-[11px] font-semibold">
                          {item}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-brand-gray italic font-light">No focus gaps identified.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Missing Skills and Job Description Checkpoints */}
              {activeRoadmap.missingSkills && activeRoadmap.missingSkills.length > 0 && (
                <div className="rounded-2xl border border-brand-border/60 bg-white p-6 shadow-premium space-y-3 text-left">
                  <div className="flex items-center gap-2 font-bold text-xs text-brand-text border-b border-brand-border/40 pb-2.5">
                    <Brain className="h-4.5 w-4.5 text-brand-peach shrink-0" />
                    <span>Missing Skills Required for Role & Target Job Description</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {activeRoadmap.missingSkills.map((skill, idx) => (
                      <span key={idx} className="rounded-xl bg-brand-warmBg text-brand-text border border-brand-border px-3 py-1 text-[11px] font-semibold">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Priority Roadmap Timeline */}
              <div className="space-y-6">
                <div className="border-b border-brand-border/40 pb-3 flex items-center justify-between">
                  <h3 className="font-heading text-sm font-semibold text-brand-text text-left">Priority Learning Pathway</h3>
                  <span className="text-[10px] text-brand-gray font-light">Ordered by Hireability Impact</span>
                </div>
                
                <div className="relative pl-6 border-l border-brand-border/80 ml-4 space-y-8 text-left">
                  {activeRoadmap.priorityRoadmap && activeRoadmap.priorityRoadmap.map((item, idx) => (
                    <div key={idx} className="relative group">
                      {/* Chronological Circle Indicator */}
                      <span className="absolute -left-[31px] top-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white border border-brand-border group-hover:border-brand-peach transition-all shadow-subtle">
                        <span className="h-2 w-2 rounded-full bg-brand-peach"></span>
                      </span>
                      
                      <div className="rounded-2xl border border-brand-border/60 bg-white p-6 shadow-subtle hover:shadow-premium transition-all space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brand-border/40 pb-2.5">
                          <div className="space-y-1">
                            <span className="text-[9px] font-semibold text-brand-peach uppercase tracking-wider block">Milestone {idx + 1}</span>
                            <h4 className="font-heading text-xs font-bold text-brand-text">{item.skill}</h4>
                          </div>
                          <div className="flex gap-2">
                            <span className="rounded-full bg-brand-warmBg/80 px-2.5 py-0.5 text-[9px] font-semibold text-brand-text border border-brand-border/40">
                              {item.timeline || '1 Week'}
                            </span>
                            <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-semibold ${
                              item.difficulty === 'Advanced'
                                ? 'bg-red-50 text-red-700 border border-red-200/50'
                                : item.difficulty === 'Intermediate'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200/50'
                                : 'bg-blue-50 text-blue-700 border border-blue-200/50'
                            }`}>
                              {item.difficulty || 'Intermediate'}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-xs text-brand-text font-light leading-relaxed">
                            <strong className="font-bold text-brand-text">Contextual Rationale:</strong> {item.reason}
                          </p>
                          <p className="text-xs text-brand-gray font-light leading-relaxed">
                            <strong className="font-semibold text-brand-text">Hiring & Interview Significance:</strong> {item.importance}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Target Company Focus Hub */}
              {activeRoadmap.companySpecificFocus && activeRoadmap.companySpecificFocus.length > 0 && (
                <div className="rounded-2xl border border-brand-border bg-gradient-to-r from-brand-warmBg/20 to-transparent p-6 shadow-premium space-y-4 text-left">
                  <div className="flex items-center gap-2 font-bold text-xs text-brand-text border-b border-brand-border/40 pb-2">
                    <Sparkles className="h-4.5 w-4.5 text-brand-peach" />
                    <span>{activeRoadmap.dreamCompany} Culture & Core Skill Alignment Directive</span>
                  </div>
                  <ul className="space-y-3 pt-1">
                    {activeRoadmap.companySpecificFocus.map((focus, idx) => (
                      <li key={idx} className="flex gap-2.5 text-xs text-brand-gray font-light leading-relaxed">
                        <span className="rounded bg-brand-warmBg h-5 w-5 text-[10px] flex items-center justify-center border border-brand-border text-brand-text font-bold shrink-0 mt-0.5">{idx + 1}</span>
                        <span>{focus}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actionable Adjustments: ATS & Interview Rehearsals */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Resume optimisation */}
                {activeRoadmap.atsFocusedImprovements && activeRoadmap.atsFocusedImprovements.length > 0 && (
                  <div className="rounded-2xl border border-brand-border bg-white p-6 shadow-premium space-y-3 text-left">
                    <div className="flex items-center gap-2 font-bold text-xs text-brand-text border-b border-brand-border/40 pb-2.5">
                      <FileText className="h-4.5 w-4.5 text-brand-peach" />
                      <span>Resume Correction Lab & ATS Alignments</span>
                    </div>
                    <ul className="space-y-3 pt-1">
                      {activeRoadmap.atsFocusedImprovements.map((imp, idx) => (
                        <li key={idx} className="flex gap-2.5 text-[11px] text-brand-gray font-light leading-relaxed">
                          <span className="rounded bg-brand-warmBg h-5 w-5 text-[10px] flex items-center justify-center border border-brand-border text-brand-text font-bold mt-0.5 shrink-0">{idx + 1}</span>
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Mock Interview Plan */}
                {activeRoadmap.interviewFocusedImprovements && activeRoadmap.interviewFocusedImprovements.length > 0 && (
                  <div className="rounded-2xl border border-brand-border bg-white p-6 shadow-premium space-y-3 text-left">
                    <div className="flex items-center gap-2 font-bold text-xs text-brand-text border-b border-brand-border/40 pb-2.5">
                      <Award className="h-4.5 w-4.5 text-brand-green" />
                      <span>Interview Failure Rehearsal & Mock Targets</span>
                    </div>
                    <ul className="space-y-3 pt-1">
                      {activeRoadmap.interviewFocusedImprovements.map((step, idx) => (
                        <li key={idx} className="flex gap-2.5 text-[11px] text-brand-text font-semibold leading-relaxed">
                          <span className="rounded bg-brand-green/20 h-5 w-5 text-[10px] flex items-center justify-center border border-brand-green/30 text-emerald-800 font-bold mt-0.5 shrink-0">{idx + 1}</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="rounded-2xl border border-brand-border/60 bg-white p-12 shadow-premium text-center space-y-4">
              <div className="flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-green/20 text-brand-text">
                  <Compass className="h-6 w-6 stroke-[1.5]" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="font-heading text-base font-semibold text-brand-text">Define Targets</h3>
                <p className="text-xs text-brand-gray font-light max-w-xs mx-auto">
                  Type your target tech job title, targeted experience class, dream destination, and study focus gaps on the left configurator. We will construct a personalized 4-week FAANG study pathway.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
