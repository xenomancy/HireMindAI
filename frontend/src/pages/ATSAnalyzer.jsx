import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../App';
import axios from 'axios';
import {
  UploadCloud,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Printer,
  ChevronRight,
  TrendingUp,
  Briefcase,
  HelpCircle,
  ShieldAlert,
  ListChecks,
  Activity,
  Award,
  Terminal,
  ArrowUpRight,
  Lock,
  RefreshCw,
  Search,
  Layers,
  Wrench,
  ThumbsUp,
} from 'lucide-react';

export default function ATSAnalyzer() {
  const { user, refreshUserUsage, setIsPremiumModalOpen } = useContext(AuthContext);
  
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  
  const [analyzing, setAnalyzing] = useState(false);
  const [activeReport, setActiveReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(true);
  
  // Live Optimizer Sandbox state
  const [sandboxInput, setSandboxInput] = useState('');
  const [sandboxOutput, setSandboxOutput] = useState('');
  const [optimizingSandbox, setOptimizingSandbox] = useState(false);
  
  // Active priority fix category tab
  const [activeFixTab, setActiveFixTab] = useState('high');
  
  // Custom progress stage labels during AI parse
  const [stageIndex, setStageIndex] = useState(0);
  const stages = [
    "Uploading document binaries safely...",
    "Parsing PDF layout structures...",
    "Executing Groq semantic key comparisons...",
    "Evaluating formatting standards and margins...",
    "Compiling ATS optimization reports..."
  ];

  const fileInputRef = useRef(null);
  const reportRef = useRef(null);

  const fetchHistory = async () => {
    try {
      const response = await axios.get('/api/resume/history');
      if (response.data.success) {
        setHistory(response.data.reports);
      }
    } catch (e) {
      console.warn("Could not load uploads history:", e.message);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Cycle progress text when analyzing
  useEffect(() => {
    let interval;
    if (analyzing) {
      interval = setInterval(() => {
        setStageIndex(prev => (prev + 1) % stages.length);
      }, 2500);
    } else {
      setStageIndex(0);
    }
    return () => clearInterval(interval);
  }, [analyzing]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setErrorMsg('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const ext = droppedFile.name.split('.').pop().toLowerCase();
      if (ext === 'pdf' || ext === 'docx') {
        setFile(droppedFile);
        setErrorMsg('');
      } else {
        setErrorMsg('Only PDF and DOCX file types are allowed.');
      }
    }
  };

  const triggerUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg('Please select a resume file first.');
      return;
    }

    // Free Tier Usage Limit Check
    if (user && user.plan === 'free' && user.usage.resumesAnalyzed >= 3) {
      setErrorMsg("Free Tier limit reached (Max 3 Resumes). Upgrade to Premium to unlock unlimited resume scans!");
      setIsPremiumModalOpen(true);
      return;
    }

    setAnalyzing(true);
    setErrorMsg('');
    setActiveReport(null);

    const formData = new FormData();
    formData.append('resume', file);
    if (jobDescription) formData.append('jobDescription', jobDescription);
    if (jobTitle) formData.append('jobTitle', jobTitle);

    try {
      const response = await axios.post('/api/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 25000,
      });

      if (response.data.success) {
        setActiveReport(response.data.report);
        setFile(null);
        setJobDescription('');
        setJobTitle('');
        await fetchHistory();
        await refreshUserUsage();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error occurred while scanning resume.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSandboxOptimize = async (e) => {
    e.preventDefault();
    if (!sandboxInput.trim()) return;
    setOptimizingSandbox(true);
    setSandboxOutput('');
    try {
      const response = await axios.post('/api/resume/optimize-bullet', { bulletText: sandboxInput });
      if (response.data.success) {
        setSandboxOutput(response.data.optimized);
      } else {
        setSandboxOutput("Could not optimize text. Please check the backend service.");
      }
    } catch (err) {
      setSandboxOutput("API error: Could not optimize bullet point.");
    } finally {
      setOptimizingSandbox(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto print:p-0 print:bg-white">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-brand-text md:text-3xl">
            ATS Resume Auditor
          </h1>
          <p className="text-xs text-brand-gray font-light">
            Compare resumes against JDs, audit keyword alignments, and optimize bullet structures using Groq Llama 3.
          </p>
        </div>
        {activeReport && (
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-xl border border-brand-border bg-white px-4 py-2.5 text-xs font-semibold text-brand-text hover:bg-brand-warmBg transition-all active:scale-[0.98]"
          >
            <Printer className="h-4 w-4" />
            Print Audit Report
          </button>
        )}
      </div>

      {/* Main double layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Upload Panels (Left) */}
        <div className="lg:col-span-5 space-y-6 print:hidden">
          <div className="rounded-2xl border border-brand-border/60 bg-white p-6 shadow-premium space-y-4">
            <h3 className="font-heading text-sm font-semibold text-brand-text">Audit new resume</h3>
            
            {errorMsg && (
              <div className="rounded-xl border border-red-200/50 bg-red-50/50 p-3 text-xs font-medium text-red-800">
                {errorMsg}
              </div>
            )}

            <form onSubmit={triggerUploadSubmit} className="space-y-4">
              {/* Drag/Drop Box */}
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-all hover:bg-brand-warmBg/20 ${
                  file ? 'border-brand-peach/80 bg-brand-peach/5' : 'border-brand-border bg-white'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.docx"
                  className="hidden"
                />
                <UploadCloud className={`h-8 w-8 mb-3 stroke-[1.5] ${file ? 'text-brand-peach' : 'text-brand-gray/60'}`} />
                {file ? (
                  <div className="text-center space-y-1">
                    <div className="text-xs font-semibold text-brand-text truncate max-w-xs">{file.name}</div>
                    <div className="text-[10px] text-brand-gray">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                  </div>
                ) : (
                  <div className="text-center space-y-1">
                    <div className="text-xs font-medium text-brand-text">Drag & drop resume here</div>
                    <div className="text-[10px] text-brand-gray">Supports PDF and DOCX up to 5MB</div>
                  </div>
                )}
              </div>

              {/* Job Title */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-brand-gray uppercase tracking-wider">Target Job Title</label>
                <div className="relative">
                  <Briefcase className="absolute top-3 left-3.5 h-4 w-4 text-brand-gray/60 stroke-[1.5]" />
                  <input
                    type="text"
                    placeholder="e.g. Senior Full Stack Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full rounded-xl border border-brand-border bg-white py-2.5 pl-10 pr-4 text-xs text-brand-text outline-none transition-all placeholder:text-brand-gray/40 focus:border-brand-peach/80 focus:ring-1 focus:ring-brand-peach/40"
                  />
                </div>
              </div>

              {/* JD Box */}
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-brand-gray uppercase tracking-wider">Target Job Description (Text)</label>
                <textarea
                  placeholder="Paste the target job description requirements here to perform keywords and experience matching checks..."
                  rows={4}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full rounded-xl border border-brand-border bg-white p-3.5 text-xs text-brand-text outline-none transition-all placeholder:text-brand-gray/40 focus:border-brand-peach/80 focus:ring-1 focus:ring-brand-peach/40 resize-none font-light leading-relaxed"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={analyzing}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-text py-3 text-xs font-semibold text-white shadow-premium hover:bg-brand-text/90 transition-all active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {analyzing ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    Audit Resume PDF
                    <ChevronRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Upload History List */}
          <div className="rounded-2xl border border-brand-border/60 bg-white p-6 shadow-premium space-y-4">
            <h3 className="font-heading text-sm font-semibold text-brand-text">Audit History</h3>
            
            {loadingHistory ? (
              <div className="space-y-2 py-4">
                <div className="h-4 w-full animate-pulse rounded bg-brand-border/40"></div>
                <div className="h-4 w-5/6 animate-pulse rounded bg-brand-border/40"></div>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center text-xs text-brand-gray py-6 font-light">
                No past audit reports found. Select a file above to begin.
              </div>
            ) : (
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {history.map((rep) => (
                  <div
                    key={rep._id}
                    onClick={() => setActiveReport(rep)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all hover:bg-brand-warmBg/25 active:scale-[0.99] ${
                      activeReport?._id === rep._id ? 'border-brand-peach bg-brand-peach/5' : 'border-brand-border/60'
                    }`}
                  >
                    <div className="flex gap-2.5 items-center truncate">
                      <FileText className="h-4.5 w-4.5 text-brand-peach shrink-0 stroke-[1.5]" />
                      <div className="truncate text-left">
                        <div className="text-xs font-semibold text-brand-text truncate">{rep.jobTitle}</div>
                        <div className="text-[9px] text-brand-gray font-light">{new Date(rep.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      rep.overallScore >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-brand-peach/20 text-amber-800'
                    }`}>
                      {rep.overallScore}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Audit Report Displays (Right) */}
        <div className="lg:col-span-7 print:col-span-12">
          {analyzing ? (
            <div className="rounded-2xl border border-brand-border/60 bg-white p-12 shadow-premium text-center space-y-6">
              <div className="flex justify-center">
                <div className="relative flex items-center justify-center">
                  <div className="h-16 w-16 animate-spin rounded-full border-4 border-brand-peach border-t-transparent"></div>
                  <Sparkles className="h-6 w-6 text-brand-green absolute" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-heading text-base font-semibold text-brand-text">Auditing Resume</h3>
                <p className="text-xs text-brand-gray max-w-xs mx-auto animate-pulse">{stages[stageIndex]}</p>
              </div>
            </div>
                    ) : activeReport ? (
            (() => {
              const overallATSScore = activeReport.overallATSScore || activeReport.overallScore || 0;
              const scoreBreakdown = activeReport.scoreBreakdown || {
                roleRelevance: activeReport.sectionScores?.roleRelevance || 75,
                keywordSemanticMatch: activeReport.sectionScores?.keywords || 70,
                projectQuality: activeReport.sectionScores?.projectQuality || 70,
                experienceImpact: activeReport.sectionScores?.impact || 65,
                formatting: activeReport.sectionScores?.structure || 80,
                skills: activeReport.sectionScores?.skills || 75,
                readability: activeReport.sectionScores?.readability || 75
              };
              
              // Calibrated Category text and colors
              let gradeText = "Improvement Recommended";
              let gradeColor = "text-amber-600 border-amber-200 bg-amber-50/50";
              let ringColor = "border-amber-500 text-amber-600";
              let ringBg = "bg-amber-50/30";
              
              if (overallATSScore >= 92) {
                gradeText = "Exceptional Industry Level";
                gradeColor = "text-indigo-600 border-indigo-200 bg-indigo-50/50 shadow-indigo-100/50";
                ringColor = "border-indigo-600 text-indigo-700 shadow-[0_0_15px_rgba(99,102,241,0.2)]";
                ringBg = "bg-indigo-50/50";
              } else if (overallATSScore >= 82) {
                gradeText = "Strong Production Level";
                gradeColor = "text-emerald-600 border-emerald-200 bg-emerald-50/50";
                ringColor = "border-emerald-500 text-emerald-600 shadow-[0_0_12px_rgba(16,185,129,0.15)]";
                ringBg = "bg-emerald-50/40";
              } else if (overallATSScore >= 70) {
                gradeText = "Good Professional Fit";
                gradeColor = "text-sky-600 border-sky-200 bg-sky-50/50";
                ringColor = "border-sky-500 text-sky-600 shadow-[0_0_10px_rgba(14,165,233,0.1)]";
                ringBg = "bg-sky-50/30";
              } else if (overallATSScore < 55) {
                gradeText = "Critical Refactoring Required";
                gradeColor = "text-rose-600 border-rose-200 bg-rose-50/50";
                ringColor = "border-rose-500 text-rose-600 shadow-[0_0_10px_rgba(244,63,94,0.1)]";
                ringBg = "bg-rose-50/20";
              }
              
              const strengths = activeReport.strengths || [];
              const weaknesses = activeReport.weaknesses || [];
              const missingKeywords = activeReport.missingKeywords || [];
              const weakBulletPoints = activeReport.weakBulletPoints || [];
              const improvedBulletPoints = activeReport.improvedBulletPoints || activeReport.bulletPointImprovements || [];
              const projectAnalysis = activeReport.projectAnalysis || [];
              const formattingIssues = activeReport.formattingIssues || activeReport.formattingSuggestions || [];
              const recruiterRisks = activeReport.recruiterRisks || [];
              const atsParsingRisks = activeReport.atsParsingRisks || [];
              const jobDescriptionMatch = activeReport.jobDescriptionMatch || {};
              const priorityFixes = activeReport.priorityFixes || { high: [], medium: [], low: [] };
              const finalRecruiterSummary = activeReport.finalRecruiterSummary || "";
              
              return (
                <div ref={reportRef} className="space-y-8 bg-white rounded-2xl border border-brand-border/60 p-6 md:p-8 shadow-premium print:border-none print:shadow-none print:p-0">
                  {/* Report Header */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-border/40 pb-5">
                    <div className="space-y-1 text-left">
                      <span className="rounded-full bg-brand-green/20 px-2.5 py-0.5 text-[9px] font-semibold text-emerald-800 uppercase tracking-wider">
                        Enterprise ATS Audit Completed
                      </span>
                      <h2 className="font-heading text-xl font-bold text-brand-text md:text-2xl">{activeReport.jobTitle}</h2>
                      <p className="text-[10px] text-brand-gray font-light">
                        File: {activeReport.resume?.fileName || 'ExtractedResume.pdf'} • Audited: {new Date(activeReport.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <span className={`rounded-xl border px-3 py-1.5 text-xs font-semibold ${gradeColor}`}>
                      {gradeText}
                    </span>
                  </div>

                  {/* Executive Scoring Row */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                    {/* Radial Score Gauge Card (Left) */}
                    <div className="md:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl border border-brand-border/60 bg-gradient-to-br from-brand-warmBg/20 to-white text-center space-y-4">
                      <span className="text-[10px] font-semibold text-brand-gray uppercase tracking-wider">Overall Calibration Score</span>
                      <div className={`relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full border-4 ${ringColor} ${ringBg} transition-all duration-700`}>
                        <span className="font-heading text-3xl font-extrabold text-brand-text">{overallATSScore}%</span>
                        <div className="absolute inset-0 rounded-full border border-dashed border-brand-text/10 animate-spin-slow"></div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-bold text-brand-text">Calibrated ATS Rating</div>
                        <p className="text-[9px] text-brand-gray font-light mt-1 max-w-[140px] mx-auto">Weighted combination of recruiters and parser criteria.</p>
                      </div>
                    </div>

                    {/* Recruiter Overview Summary Card (Right) */}
                    <div className="md:col-span-8 flex flex-col justify-between p-6 rounded-2xl border border-brand-border/60 bg-white shadow-subtle text-left space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-brand-text">
                          <Activity className="h-4.5 w-4.5 text-brand-peach stroke-[1.5]" />
                          <h3 className="text-xs font-bold uppercase tracking-wider">Hiring Team Overview</h3>
                        </div>
                        <p className="text-xs text-brand-gray font-light leading-relaxed">
                          {finalRecruiterSummary || "The candidate shows standard technical baseline alignment. However, the experience narrative relies primarily on high-level operational descriptions. Incorporating metrics, optimization benchmarks, and cloud scalability details will significantly increase parser scanability and interview conversions."}
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-[10px] text-brand-gray border-t border-brand-border/30 pt-3">
                        <div>
                          <span className="font-semibold text-brand-text">Parser Safety:</span> {overallATSScore >= 80 ? "Fully Compliant" : "Low Risk"}
                        </div>
                        <div>
                          <span className="font-semibold text-brand-text">Recruiter Impact:</span> {scoreBreakdown.experienceImpact >= 75 ? "High Accomplishment Narrative" : "Needs Quantification"}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Weighted Sub-Scores Category Breakdown */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* 7-Category Horizontal Progress Charts (Left) */}
                    <div className="lg:col-span-7 rounded-2xl border border-brand-border/60 bg-white p-6 shadow-subtle text-left space-y-5">
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-brand-text uppercase tracking-wider">Weighted ATS Categories Audit</h4>
                        <p className="text-[10px] text-brand-gray font-light">Strict grading based on standard technical hiring matrices.</p>
                      </div>
                      
                      <div className="space-y-3.5">
                        {[
                          { label: "Role Relevance", val: scoreBreakdown.roleRelevance, weight: "25%", color: "bg-indigo-500", desc: "Domain suitabilities & seniority fits" },
                          { label: "Keyword & Semantic Match", val: scoreBreakdown.keywordSemanticMatch, weight: "20%", color: "bg-purple-500", desc: "ATS searchability & skill concepts mapping" },
                          { label: "Project Architecture Complexity", val: scoreBreakdown.projectQuality, weight: "15%", color: "bg-emerald-500", desc: "Scale, deployment, & systems engineering" },
                          { label: "Experience Narrative Impact", val: scoreBreakdown.experienceImpact, weight: "15%", color: "bg-blue-500", desc: "Action verbs, ownership, & quantifiable metrics" },
                          { label: "ATS Layout Formatting", val: scoreBreakdown.formatting, weight: "10%", color: "bg-teal-500", desc: "Single-column safety & header compliance" },
                          { label: "Skills Stack Modernity", val: scoreBreakdown.skills, weight: "10%", color: "bg-amber-500", desc: "Framework specializations & modern tools" },
                          { label: "Readability & conciseness", val: scoreBreakdown.readability, weight: "5%", color: "bg-rose-500", desc: "Professional tone & grammar density" }
                        ].map((sec, idx) => (
                          <div key={idx} className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-brand-text">{sec.label} <span className="text-[10px] font-normal text-brand-gray">({sec.weight} wt)</span></span>
                              <span className="font-bold text-brand-text">{sec.val}%</span>
                            </div>
                            <div className="relative h-2 w-full bg-brand-warmBg/50 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-1000 ${sec.color}`}
                                style={{ width: `${sec.val}%` }}
                              ></div>
                            </div>
                            <p className="text-[8px] text-brand-gray font-light">{sec.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Job Description Semantic Alignment (Right) */}
                    <div className="lg:col-span-5 rounded-2xl border border-brand-border/60 bg-white p-6 shadow-subtle text-left space-y-4">
                      <div className="flex items-center gap-2 text-brand-text">
                        <Award className="h-4.5 w-4.5 text-indigo-500 stroke-[1.5]" />
                        <h4 className="text-xs font-bold uppercase tracking-wider">Semantic Job Alignment</h4>
                      </div>
                      
                      {jobDescriptionMatch && jobDescriptionMatch.matchScore ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 bg-brand-warmBg/30 border border-brand-border/30 rounded-xl p-3.5">
                            <div className="h-11 w-11 shrink-0 rounded-full border-2 border-indigo-500 flex items-center justify-center font-heading text-sm font-bold text-indigo-600 bg-indigo-50">
                              {jobDescriptionMatch.matchScore}%
                            </div>
                            <div>
                              <div className="text-[10px] font-bold text-brand-text">JD Semantic Match Score</div>
                              <p className="text-[8px] text-brand-gray font-light">Based on semantic concept coverage rather than raw word counts.</p>
                            </div>
                          </div>
                          <p className="text-[11px] text-brand-gray font-light leading-relaxed">
                            {jobDescriptionMatch.explanation}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-brand-gray font-light italic leading-relaxed">
                          Provide a target Job Description on the left panel to execute deep semantic keyword similarity analyses.
                        </p>
                      )}

                      {missingKeywords && missingKeywords.length > 0 && (
                        <div className="space-y-2 border-t border-brand-border/30 pt-3">
                          <span className="text-[9px] font-semibold text-brand-gray uppercase tracking-wider">Critical Skills Gap Checklist</span>
                          <div className="flex flex-wrap gap-1.5">
                            {missingKeywords.map((kw, idx) => (
                              <span key={idx} className="rounded-lg bg-rose-50 text-rose-800 border border-rose-200/50 px-2 py-0.5 text-[10px] font-medium">
                                + {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Strengths & Weaknesses side-by-side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                    {/* Strengths Card (Emerald Glow) */}
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/10 p-6 shadow-subtle space-y-4">
                      <div className="flex items-center gap-2 text-emerald-800">
                        <CheckCircle2 className="h-4.5 w-4.5 stroke-emerald-600 fill-emerald-100" />
                        <h4 className="text-xs font-bold uppercase tracking-wider">Identified Core Strengths</h4>
                      </div>
                      <ul className="space-y-2.5">
                        {strengths.map((str, idx) => (
                          <li key={idx} className="flex gap-2.5 text-xs text-emerald-950/80 font-light leading-relaxed">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                            {str}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Weaknesses Card (Amber Glow) */}
                    <div className="rounded-2xl border border-amber-100 bg-amber-50/10 p-6 shadow-subtle space-y-4">
                      <div className="flex items-center gap-2 text-amber-800">
                        <AlertTriangle className="h-4.5 w-4.5 stroke-amber-600 fill-amber-100" />
                        <h4 className="text-xs font-bold uppercase tracking-wider">Critical Action Areas</h4>
                      </div>
                      <ul className="space-y-2.5">
                        {weaknesses.map((weak, idx) => (
                          <li key={idx} className="flex gap-2.5 text-xs text-amber-950/80 font-light leading-relaxed">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
                            {weak}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Technical Risk Warnings & Formatting Audit */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left border-t border-brand-border/40 pt-6">
                    {/* Recruiter Evaluation Risks */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-rose-700">
                        <ShieldAlert className="h-4 w-4 stroke-[1.5]" />
                        <h5 className="text-[10px] font-bold uppercase tracking-wider">Recruiter Assessment Risks</h5>
                      </div>
                      <ul className="space-y-2">
                        {recruiterRisks.map((risk, idx) => (
                          <li key={idx} className="text-[11px] text-brand-gray font-light leading-relaxed pl-3 border-l-2 border-rose-300">
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* ATS Technical Parsing Risks */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-amber-700">
                        <Lock className="h-4 w-4 stroke-[1.5]" />
                        <h5 className="text-[10px] font-bold uppercase tracking-wider">ATS Parser Scanning Risks</h5>
                      </div>
                      <ul className="space-y-2">
                        {atsParsingRisks.map((risk, idx) => (
                          <li key={idx} className="text-[11px] text-brand-gray font-light leading-relaxed pl-3 border-l-2 border-amber-300">
                            {risk}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Standard Layout Guidelines */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sky-700">
                        <Layers className="h-4 w-4 stroke-[1.5]" />
                        <h5 className="text-[10px] font-bold uppercase tracking-wider">Layout Margins & Formats</h5>
                      </div>
                      <ul className="space-y-2">
                        {formattingIssues.map((issue, idx) => (
                          <li key={idx} className="text-[11px] text-brand-gray font-light leading-relaxed pl-3 border-l-2 border-sky-300">
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Priority Action Checklist Tabs */}
                  <div className="rounded-2xl border border-brand-border/60 bg-brand-warmBg/5 p-5 text-left space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-brand-text uppercase tracking-wider">Priority Optimizations Checklist</h4>
                        <p className="text-[9px] text-brand-gray font-light">Categorized fixes by technical audit impact.</p>
                      </div>
                      
                      {/* Priority Tabs selection */}
                      <div className="flex rounded-xl bg-brand-border/30 p-1 text-[10px]">
                        {[
                          { id: 'high', label: 'High Priority', color: 'text-rose-800' },
                          { id: 'medium', label: 'Medium', color: 'text-amber-800' },
                          { id: 'low', label: 'Low', color: 'text-slate-800' }
                        ].map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setActiveFixTab(t.id)}
                            className={`rounded-lg px-3 py-1 font-semibold transition-all ${
                              activeFixTab === t.id 
                                ? 'bg-white shadow-sm text-brand-text' 
                                : 'text-brand-gray hover:text-brand-text'
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-brand-border/50 p-4 min-h-[90px] flex flex-col justify-center">
                      {priorityFixes[activeFixTab] && priorityFixes[activeFixTab].length > 0 ? (
                        <ul className="space-y-2">
                          {priorityFixes[activeFixTab].map((fix, idx) => (
                            <li key={idx} className="flex gap-2.5 text-xs text-brand-gray font-light leading-relaxed">
                              <ListChecks className="h-4 w-4 stroke-brand-peach shrink-0 mt-0.5" />
                              <span>{fix}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-brand-gray font-light italic">No pending tasks in this category.</p>
                      )}
                    </div>
                  </div>

                  {/* Project Complexity Architect Critiques */}
                  {projectAnalysis && projectAnalysis.length > 0 && (
                    <div className="space-y-4 border-t border-brand-border/40 pt-6 text-left">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-brand-text uppercase tracking-wider">Project Quality & Tech Complexity Audit</h4>
                        <p className="text-[10px] text-brand-gray font-light">Deep architectural review of technical projects.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {projectAnalysis.map((proj, idx) => (
                          <div key={idx} className="rounded-xl border border-brand-border/60 bg-gradient-to-b from-brand-warmBg/10 to-white p-4 space-y-2">
                            <div className="flex items-center justify-between gap-2 border-b border-brand-border/30 pb-2">
                              <span className="text-xs font-bold text-brand-text truncate max-w-[190px]">{proj.name}</span>
                              <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                                proj.qualityScore >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-brand-peach/10 text-brand-text border border-brand-peach/30'
                              }`}>
                                Complexity: {proj.qualityScore}%
                              </span>
                            </div>
                            <p className="text-[11px] text-brand-gray font-light leading-relaxed">
                              {proj.analysis}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Bullet-Point Optimization sandbox and Live Playground */}
                  <div className="space-y-6 border-t border-brand-border/40 pt-6 text-left">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-brand-text uppercase tracking-wider">AI Resume Bullet-Point Upgrades</h4>
                        <p className="text-[10px] text-brand-gray font-light">Upgrading task-oriented statements into metrics-driven achievements.</p>
                      </div>
                      <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[9px] font-medium text-indigo-900 border border-indigo-200">
                        Enterprise Llama 3.1 Optimizer
                      </span>
                    </div>

                    {/* Pre-calculated bullet point upgrades list */}
                    <div className="space-y-3">
                      {improvedBulletPoints.map((bullet, idx) => (
                        <div key={idx} className="rounded-xl border border-brand-border/60 bg-white p-4 space-y-2.5 shadow-sm">
                          <div className="space-y-1">
                            <span className="text-[9px] font-bold text-rose-500 uppercase tracking-wider">Before: Generic/Task-Oriented</span>
                            <p className="text-xs text-brand-gray italic font-light">"{bullet.original}"</p>
                          </div>
                          <div className="border-t border-brand-border/30 pt-2.5 space-y-1">
                            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">After: Recruiter-Grade Action Upgrade</span>
                            <p className="text-xs text-brand-text font-semibold leading-relaxed">"{bullet.improved}"</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Interactive Sandbox Optimizer Playground (wow factor) */}
                    <div className="rounded-2xl border border-brand-text bg-brand-text p-6 text-white space-y-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-white">
                          <Terminal className="h-4.5 w-4.5 stroke-[1.5]" />
                          <h4 className="text-xs font-bold uppercase tracking-wider">Live Sandbox Bullet Point Optimizer</h4>
                        </div>
                        <p className="text-[10px] text-white/70 font-light">
                          Paste a sentence from your current resume (e.g., "Wrote API code" or "Helped manage CSS details"). We will compile a premium, accomplishments-driven tech upgrade in real-time.
                        </p>
                      </div>

                      <form onSubmit={handleSandboxOptimize} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1 text-left">
                            <label className="text-[8px] font-bold uppercase tracking-wider text-white/60">Your Original Bullet Sentence</label>
                            <textarea
                              rows={3}
                              placeholder="e.g. Built a database schema and did backend work."
                              value={sandboxInput}
                              onChange={(e) => setSandboxInput(e.target.value)}
                              className="w-full rounded-xl border border-white/20 bg-white/10 p-3 text-xs text-white outline-none transition-all placeholder:text-white/40 focus:border-white/50 focus:ring-1 focus:ring-white/20 resize-none font-light leading-relaxed"
                            ></textarea>
                          </div>

                          <div className="space-y-1 text-left flex flex-col">
                            <label className="text-[8px] font-bold uppercase tracking-wider text-white/60">Real-Time Recruiter-Grade Upgrade</label>
                            <div className="flex-1 rounded-xl border border-dashed border-white/20 bg-white/5 p-3 text-xs text-white min-h-[72px] flex items-center justify-center leading-relaxed font-medium">
                              {optimizingSandbox ? (
                                <div className="flex items-center gap-2 text-xs text-white/70">
                                  <RefreshCw className="h-4 w-4 animate-spin text-white" />
                                  Orchestrating architectural tags...
                                </div>
                              ) : sandboxOutput ? (
                                `"${sandboxOutput}"`
                              ) : (
                                <span className="text-white/40 italic font-light">Input your bullet on the left and trigger the upgrader...</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                          {sandboxOutput && (
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(sandboxOutput);
                                alert("Optimized sentence copied to clipboard!");
                              }}
                              className="rounded-lg bg-white/10 px-4 py-2 text-[10px] font-bold text-white hover:bg-white/20 transition-all active:scale-[0.98]"
                            >
                              Copy Upgrade
                            </button>
                          )}
                          <button
                            type="submit"
                            disabled={optimizingSandbox || !sandboxInput.trim()}
                            className="flex items-center gap-1.5 rounded-lg bg-brand-peach px-4 py-2 text-[10px] font-bold text-brand-text shadow-sm hover:bg-brand-peach/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Optimize Sentence
                            <ArrowUpRight className="h-3 w-3 stroke-[2]" />
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="rounded-2xl border border-brand-border/60 bg-white p-12 shadow-premium text-center space-y-4">
              <div className="flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-green/20 text-brand-text">
                  <FileText className="h-6 w-6 stroke-[1.5]" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="font-heading text-base font-semibold text-brand-text">Select Resume to Audit</h3>
                <p className="text-xs text-brand-gray font-light max-w-xs mx-auto">
                  Upload a PDF/DOCX file and optionally paste a job description. We will compile a comprehensive ATS scorecard with formatting, keyword matches, and strengths checks.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
