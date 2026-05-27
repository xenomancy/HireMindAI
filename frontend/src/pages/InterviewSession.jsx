import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  MessageSquare,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  CheckCircle,
  TrendingUp,
  Brain,
  ChevronDown,
  ChevronUp,
  FileText,
  Printer,
  Home,
  CheckCircle2,
  AlertTriangle,
  Shield,
  ShieldAlert,
} from 'lucide-react';

export default function InterviewSession() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const sessionRef = useRef(null);
  sessionRef.current = session;
  const [loading, setLoading] = useState(true);
  
  // Active session states
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  
  // Voice Transcriber (Speech-to-Text) states
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const inactivityTimerRef = useRef(null);

  // Expandable turns
  const [expandedTurns, setExpandedTurns] = useState({});

  const fetchSession = async () => {
    try {
      const response = await axios.get(`/api/interview/session/${id}`);
      if (response.data.success) {
        const data = response.data.session;
        setSession(data);
        
        if (data.status === 'in-progress') {
          const firstUnanswered = data.questions.findIndex(q => !q.userAnswer || q.userAnswer.trim().length === 0);
          setCurrentIdx(firstUnanswered !== -1 ? firstUnanswered : 0);
        }
      }
    } catch (e) {
      console.error('Error fetching mock interview session:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [id]);

  const reportSuspicious = async (activityType, description) => {
    // Fire synchronous warning popup immediately
    alert(`WARNING: Suspicious activity detected (${activityType}). Cheating or changing windows is strictly prohibited!\n\nDetails: ${description}`);

    try {
      const response = await axios.post(`/api/interview/session/${id}/suspicious`, {
        activityType,
        description
      });
      if (response.data.success) {
        const updated = response.data.interview;
        setSession(updated);
        
        if (updated.cheatingDetected) {
          alert("Interview terminated due to suspicious activity. Cheating is not allowed.");
        }
      }
    } catch (err) {
      console.error("Error logging cheating incident:", err);
    }
  };

  const resetInactivityTimer = () => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    
    const activeSession = sessionRef.current;
    if (!activeSession || activeSession.status !== 'in-progress' || activeSession.cheatingDetected) return;
    
    inactivityTimerRef.current = setTimeout(() => {
      reportSuspicious("Suspicious Inactivity", "No interaction or input detected on the active question for 45 seconds.");
      resetInactivityTimer();
    }, 45000);
  };

  useEffect(() => {
    resetInactivityTimer();
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [currentIdx, session?.status]);

  // Cheating Visibility Blur/Focus/Key/Resize Event Listeners
  useEffect(() => {
    let leftTab = false;
    const handleVisibility = () => {
      const activeSession = sessionRef.current;
      if (!activeSession || activeSession.status !== 'in-progress' || activeSession.cheatingDetected) return;

      if (document.hidden) {
        leftTab = true;
        reportSuspicious("Tab Changed / Hidden", "Candidate minimized the tab or switched to another window tab.");
      } else if (!document.hidden && leftTab) {
        leftTab = false;
        alert("WARNING: You left the interview tab! Keeping this tab active is mandatory. This incident has been flagged.");
      }
    };

    const handleBlur = () => {
      const activeSession = sessionRef.current;
      if (!activeSession || activeSession.status !== 'in-progress' || activeSession.cheatingDetected) return;

      reportSuspicious("Browser Window Focus Loss", "Candidate blurred the main browser window, indicating background window switching.");
    };

    const handleCopyPaste = (e) => {
      const activeSession = sessionRef.current;
      if (!activeSession || activeSession.status !== 'in-progress' || activeSession.cheatingDetected) return;

      e.preventDefault();
      reportSuspicious("Copy-Paste Event Intercepted", "Candidate attempted a keyboard or menu copy/paste command.");
    };

    const handleKeyDown = (e) => {
      const activeSession = sessionRef.current;
      if (!activeSession || activeSession.status !== 'in-progress' || activeSession.cheatingDetected) return;

      const isF12 = e.key === 'F12';
      const isCtrlShiftI = e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i');
      const isCtrlShiftJ = e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j');
      const isCtrlShiftC = e.ctrlKey && e.shiftKey && (e.key === 'C' || e.key === 'c');
      const isCtrlShiftU = e.ctrlKey && e.shiftKey && (e.key === 'U' || e.key === 'u');
      const isCmdOptI = e.metaKey && e.altKey && (e.key === 'I' || e.key === 'i');
      const isCmdOptJ = e.metaKey && e.altKey && (e.key === 'J' || e.key === 'j');
      const isCmdOptC = e.metaKey && e.altKey && (e.key === 'C' || e.key === 'c');

      if (isF12 || isCtrlShiftI || isCtrlShiftJ || isCtrlShiftC || isCtrlShiftU || isCmdOptI || isCmdOptJ || isCmdOptC) {
        e.preventDefault();
        reportSuspicious("DevTools Shortcut Attempt", "Candidate attempted standard keyboard shortcuts used to launch Inspector or DevTools.");
      }
    };

    const handleContextMenu = (e) => {
      const activeSession = sessionRef.current;
      if (!activeSession || activeSession.status !== 'in-progress' || activeSession.cheatingDetected) return;

      e.preventDefault();
      reportSuspicious("Context Menu Blocked", "Candidate right-clicked on the interface, suggesting inspect-element attempts.");
    };

    let lastWidth = window.outerWidth;
    let lastHeight = window.outerHeight;
    const handleResize = () => {
      const activeSession = sessionRef.current;
      if (!activeSession || activeSession.status !== 'in-progress' || activeSession.cheatingDetected) return;
      
      const threshold = 160;
      const widthDiff = Math.abs(window.outerWidth - window.innerWidth);
      const heightDiff = Math.abs(window.outerHeight - window.innerHeight);
      
      if ((widthDiff > threshold || heightDiff > threshold) && (window.outerWidth !== lastWidth || window.outerHeight !== lastHeight)) {
        reportSuspicious("DevTools Panel Open Detected", "Candidates window inner and outer size differential indicates open developer console panels.");
      }
      lastWidth = window.outerWidth;
      lastHeight = window.outerHeight;
    };

    const handleUserInteraction = () => {
      resetInactivityTimer();
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('resize', handleResize);

    window.addEventListener('mousemove', handleUserInteraction);
    window.addEventListener('keydown', handleUserInteraction);
    window.addEventListener('input', handleUserInteraction);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('resize', handleResize);

      window.removeEventListener('mousemove', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
      window.removeEventListener('input', handleUserInteraction);
    };
  }, [id]);

  // TTS speaker
  useEffect(() => {
    if (session && session.status === 'in-progress' && ttsEnabled) {
      const currentQuestion = session.questions[currentIdx]?.question;
      if (currentQuestion) {
        speakQuestion(currentQuestion);
      }
    }
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, [session, currentIdx, ttsEnabled]);

  // STT initialization with technical keyword corrections
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (e) => {
        let transcript = e.results[e.results.length - 1][0].transcript;
        
        // Phonetic matching technical dictionary correction
        const techDict = {
          "node jess": "Node.js",
          "node js": "Node.js",
          "mongo db": "MongoDB",
          "next jess": "Next.js",
          "next js": "Next.js",
          "rest api": "REST API",
          "rest apis": "REST APIs",
          "jwt": "JWT",
          "postgres": "PostgreSQL",
          "postgress": "PostgreSQL",
          "postgre sql": "PostgreSQL",
          "css": "CSS",
          "html": "HTML",
          "javascript": "JavaScript",
          "typescript": "TypeScript",
          "aws": "AWS",
          "docker": "Docker",
          "kafka": "Kafka",
          "graphql": "GraphQL"
        };
        
        Object.keys(techDict).forEach(key => {
          const regex = new RegExp(`\\b${key}\\b`, 'gi');
          transcript = transcript.replace(regex, techDict[key]);
        });

        setUserAnswer(prev => prev + (prev ? ' ' : '') + transcript);
      };

      rec.onerror = (e) => {
        console.error("Speech transcription error:", e.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice transcription is not supported in this browser. Please type your response!");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const speakQuestion = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleTextToSpeechToggle = () => {
    if (ttsEnabled) {
      window.speechSynthesis?.cancel();
      setSpeaking(false);
    } else if (session && session.questions[currentIdx]) {
      speakQuestion(session.questions[currentIdx].question);
    }
    setTtsEnabled(!ttsEnabled);
  };

  const submitAnswer = async (e) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    setSubmittingAnswer(true);
    try {
      const response = await axios.post(`/api/interview/session/${session._id}/answer`, {
        answer: userAnswer,
        questionIndex: currentIdx,
      });

      if (response.data.success) {
        setUserAnswer('');
        setSession(response.data.interview);
        
        const nextUnanswered = response.data.interview.questions.findIndex(q => !q.userAnswer || q.userAnswer.trim().length === 0);
        if (nextUnanswered !== -1) {
          setCurrentIdx(nextUnanswered);
        } else {
          await fetchSession();
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const toggleTurnExpand = (idx) => {
    setExpandedTurns(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-peach border-t-transparent"></div>
      </div>
    );
  }

  // -------------------- CHEATING TERMINATION LOCKOUT SCREEN --------------------
  if (session && (session.cheatingDetected || session.suspiciousActivityCount >= 3)) {
    return (
      <div className="max-w-md mx-auto my-16 rounded-2xl border border-red-200 bg-red-50/20 p-8 shadow-premium text-center space-y-6">
        <div className="flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600 animate-bounce">
            <AlertTriangle className="h-8 w-8 stroke-[1.5]" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="font-heading text-lg font-bold text-red-900">Session Disqualified</h3>
          <p className="text-xs text-red-800 leading-relaxed font-light">
            Interview terminated due to suspicious activity. Cheating is not allowed. Browser blurs and copy-paste shifts are tracked automatically by the security gateway.
          </p>
        </div>
        <button
          onClick={() => navigate('/interview')}
          className="w-full rounded-xl bg-red-700 hover:bg-red-800 text-white py-2.5 text-xs font-semibold transition-all active:scale-[0.98]"
        >
          Return to Preparation Hub
        </button>
      </div>
    );
  }

  const isCompleted = session.status === 'completed';

  return (
    <div className="max-w-5xl mx-auto space-y-8 text-left print:p-0 print:bg-white">
      
      {/* -------------------- STATE 1: ACTIVE INTERVIEW CHAT PANEL -------------------- */}
      {!isCompleted ? (
        <div className="space-y-6">
          {/* Active security bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-border/60 pb-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-peach/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-800 uppercase tracking-wide">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-peach animate-ping"></span> Live Evaluation
              </span>
              <h2 className="font-heading text-lg font-semibold text-brand-text mt-1">{session.role} ({session.difficulty})</h2>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Integrity Score Tag */}
              <div className="flex items-center gap-1.5 rounded-lg border border-brand-border px-2.5 py-1 text-xs">
                {session.suspiciousActivityCount > 0 ? (
                  <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
                ) : (
                  <Shield className="h-3.5 w-3.5 text-brand-green" />
                )}
                <span className="text-[10px] font-medium text-brand-gray">
                  Integrity Rating: <span className={session.suspiciousActivityCount > 0 ? "text-amber-600 font-bold" : "text-brand-green font-bold"}>{session.interviewIntegrityScore || 100}%</span>
                </span>
              </div>

              <button
                onClick={handleTextToSpeechToggle}
                className="p-2 rounded-xl border border-brand-border hover:bg-brand-warmBg transition-all text-brand-gray hover:text-brand-text"
                title={ttsEnabled ? "Mute audio synthesis" : "Unmute audio synthesis"}
              >
                {ttsEnabled ? <Volume2 className="h-4.5 w-4.5" /> : <VolumeX className="h-4.5 w-4.5" />}
              </button>
              <span className="text-xs text-brand-gray font-medium">Q {currentIdx + 1} of {session.questions.length}</span>
            </div>
          </div>

          {/* Active Suspicious Warnings Banner */}
          {session.suspiciousActivityCount > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-subtle flex items-start gap-3 animate-pulse">
              <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-left">
                <h4 className="font-heading text-xs font-bold text-amber-900">Suspicious Behavior Flagged</h4>
                <p className="text-[11px] text-amber-800 font-light leading-relaxed">
                  We detected tab switching, window focus loss, or copy-paste actions. You have registered <strong>{session.suspiciousActivityCount} warnings</strong>. At 3 warnings, the AI security gateway automatically disqualifies and terminates your active session. Keep this browser tab focused!
                </p>
              </div>
            </div>
          )}

          {/* Prompt Bubble */}
          <div className="rounded-2xl border border-brand-border/60 bg-white p-6 shadow-premium relative overflow-hidden">
            <div className="absolute top-0 left-0 h-1.5 bg-brand-peach transition-all duration-300" style={{ width: `${((currentIdx + 1) / session.questions.length) * 100}%` }}></div>
            
            <div className="flex gap-4 items-start pt-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-green/10 text-brand-text">
                <Brain className="h-5 w-5 stroke-[1.5] animate-pulse" />
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="text-[9px] font-semibold text-brand-gray uppercase tracking-wider">AI Technical Lead Prompt</div>
                <p className="text-sm font-light text-brand-text leading-relaxed">
                  "{session.questions[currentIdx]?.question}"
                </p>
                {speaking && (
                  <span className="inline-flex gap-1.5 items-center text-[9px] text-brand-green font-semibold">
                    <span className="h-1.5 w-1.5 bg-brand-green rounded-full animate-ping"></span> Speaking Question...
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Answer Area */}
          <form onSubmit={submitAnswer} className="space-y-4">
            <div className="rounded-2xl border border-brand-border/60 bg-white p-5 shadow-premium space-y-4">
              <div className="flex items-center justify-between border-b border-brand-border/40 pb-2.5">
                <div className="text-[9px] font-semibold text-brand-gray uppercase tracking-wider">Your Technical Response</div>
                
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold border transition-all active:scale-[0.96] ${
                    isListening
                      ? 'bg-red-50 border-red-200 text-red-600 animate-pulse'
                      : 'bg-white border-brand-border text-brand-gray hover:bg-brand-warmBg hover:text-brand-text'
                  }`}
                >
                  {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
                  {isListening ? 'Stop Mic Capture' : 'Speak Phrasings'}
                </button>
              </div>

              {submittingAnswer ? (
                <div className="h-28 flex flex-col items-center justify-center space-y-3">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-peach border-t-transparent"></div>
                  <span className="text-[10px] text-brand-gray font-light">Calibrating engineering metrics and STAR structures...</span>
                </div>
              ) : (
                <textarea
                  placeholder={isListening ? "Speech captured in real-time... Speak technical keywords clearly." : "Draft your design answer here. Proactively elaborate on tradeoffs, complexity, and tooling boundaries to score high..."}
                  rows={5}
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="w-full bg-white text-xs text-brand-text outline-none transition-all placeholder:text-brand-gray/40 resize-none font-light leading-relaxed border-none focus:ring-0"
                ></textarea>
              )}
            </div>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Abandon this interview? Answered responses will not compile a scorecard.")) {
                    navigate('/interview');
                  }
                }}
                className="rounded-xl border border-brand-border px-4 py-2.5 text-xs font-semibold text-brand-gray hover:bg-brand-warmBg hover:text-brand-text transition-all active:scale-[0.98]"
              >
                Quit Session
              </button>
              
              <button
                type="submit"
                disabled={submittingAnswer || !userAnswer.trim()}
                className="flex items-center gap-2 rounded-xl bg-brand-text px-5 py-2.5 text-xs font-semibold text-white shadow-premium hover:bg-brand-text/90 transition-all active:scale-[0.98] disabled:opacity-75 disabled:cursor-not-allowed"
              >
                Evaluate & Next
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        </div>
      ) : (
        
        // -------------------- STATE 2: COMPLETED SCORECARD PANEL --------------------
        <div className="space-y-6">
          {/* Top header bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-brand-border/60 pb-4 print:hidden">
            <div>
              <span className="rounded-full bg-brand-green/10 px-2.5 py-0.5 text-[9px] font-semibold text-emerald-800 uppercase tracking-wide">
                Evaluation Scorecard Compiled
              </span>
              <h2 className="font-heading text-xl font-semibold text-brand-text mt-1">Mock Interview Performance Audit</h2>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/interview')}
                className="flex items-center gap-1.5 rounded-xl border border-brand-border bg-white px-3.5 py-2 text-xs font-semibold text-brand-text hover:bg-brand-warmBg transition-all active:scale-[0.96]"
              >
                <Home className="h-3.5 w-3.5 text-brand-gray" />
                Prep Hub
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-xl border border-brand-border bg-white px-3.5 py-2 text-xs font-semibold text-brand-text hover:bg-brand-warmBg transition-all active:scale-[0.96]"
              >
                <Printer className="h-3.5 w-3.5 text-brand-gray" />
                Print Scorecard
              </button>
            </div>
          </div>

          {/* Scorecards Double-Column panel */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            {/* Left: Overall Circular Dial & Probability */}
            <div className="rounded-2xl border border-brand-border/60 bg-white p-6 shadow-premium md:col-span-5 text-center flex flex-col justify-between space-y-6">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-brand-gray uppercase tracking-widest">{session.role}</span>
                <p className="text-[9px] text-brand-gray font-light">Level: {session.difficulty} • Company Style: {session.companyStyle}</p>
              </div>

              {/* Main Score Ring */}
              <div className="flex justify-center">
                <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-brand-green/5 border-[5px] border-brand-green shadow-premium">
                  <div className="text-center">
                    <span className="font-heading text-3xl font-bold text-brand-text">{session.overallScores?.overall || 70}%</span>
                    <div className="text-[8px] text-brand-gray font-semibold uppercase">Calibrated Score</div>
                  </div>
                </div>
              </div>

              {/* Hiring Probability Tag */}
              <div className="space-y-2">
                <div>
                  <span className="text-[9px] font-bold text-brand-gray uppercase tracking-wider block">Hiring Decision Probability</span>
                  <span className={`inline-block rounded-full px-3 py-1 text-[11px] font-bold mt-1 ${
                    session.hiringProbability === 'High'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : session.hiringProbability === 'Moderate'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {session.hiringProbability || 'Moderate'} Fit Probability
                  </span>
                </div>

                {/* Integrity Log Info */}
                <div className="border-t border-brand-border/50 pt-2.5 text-[9px] text-brand-gray font-light">
                  Suspicious Activity Count: <span className="font-bold text-brand-text">{session.suspiciousActivityCount || 0}</span> • Integrity Score: <span className="font-bold text-brand-text">{session.interviewIntegrityScore || 100}%</span>
                </div>
              </div>
            </div>

            {/* Right: Glassmorphic matrix cards list */}
            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { label: "Technical Accuracy", val: session.overallScores?.technicalAccuracy || session.overallScores?.technical || 70, color: "bg-brand-peach", desc: "Correct engineering facts", icon: Brain },
                { label: "Conceptual Depth", val: Math.round(((session.overallScores?.technicalAccuracy || 70) + (session.overallScores?.communicationClarity || 72)) / 2), color: "bg-purple-500", desc: "Abstraction and paradigms", icon: MessageSquare },
                { label: "Communication Clarity", val: session.overallScores?.communicationClarity || session.overallScores?.communication || 75, color: "bg-brand-green", desc: "STAR structure mapping", icon: Volume2 },
                { label: "Problem Solving", val: session.overallScores?.problemSolving || 70, color: "bg-amber-500", desc: "Algorithmic tradeoff focus", icon: TrendingUp },
                { label: "Confidence & Tone", val: session.overallScores?.confidence || 75, color: "bg-blue-500", desc: "Assurance under constraints", icon: Mic },
                { label: "Real-world Practical", val: session.overallScores?.realWorldKnowledge || 65, color: "bg-emerald-500", desc: "Scalability implementation", icon: FileText }
              ].map((met, idx) => {
                const IconComponent = met.icon;
                return (
                  <div key={idx} className="rounded-xl border border-brand-border/60 bg-white p-3.5 shadow-subtle flex gap-3 items-center">
                    <div className="h-8 w-8 rounded-lg bg-brand-warmBg flex items-center justify-center text-brand-text shrink-0">
                      <IconComponent className="h-4.5 w-4.5 stroke-[1.5]" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex justify-between items-center text-[10px] font-bold text-brand-text">
                        <span className="truncate">{met.label}</span>
                        <span>{met.val}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-brand-border/50 rounded-full mt-1.5 overflow-hidden">
                        <div className={`h-full rounded-full ${met.color}`} style={{ width: `${met.val}%` }}></div>
                      </div>
                      <p className="text-[8px] text-brand-gray mt-1 truncate font-light">{met.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hiring summary critique */}
          <div className="rounded-2xl border border-brand-border/60 bg-white p-6 shadow-premium space-y-3">
            <h3 className="font-heading text-sm font-semibold text-brand-text">AI Recruiter Narrative Summary</h3>
            <p className="text-xs text-brand-gray font-light leading-relaxed">
              {session.feedbackSummary}
            </p>
          </div>

          {/* Dynamic recommendations checklist */}
          {session.improvementSuggestions && session.improvementSuggestions.length > 0 && (
            <div className="rounded-2xl border border-brand-border/60 bg-white p-6 shadow-premium space-y-3">
              <h3 className="font-heading text-sm font-semibold text-brand-text">Actionable Recruiter Recommendation Plan</h3>
              <ul className="space-y-2.5">
                {session.improvementSuggestions.map((sug, idx) => (
                  <li key={idx} className="flex gap-2.5 text-xs text-brand-gray font-light leading-relaxed">
                    <CheckCircle2 className="h-4.5 w-4.5 stroke-brand-green fill-brand-green/10 shrink-0 mt-0.5" />
                    {sug}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Q&A dialogue history timeline */}
          <div className="space-y-4">
            <h3 className="font-heading text-sm font-semibold text-brand-text">Dialogue Transcript & Segment Audits</h3>
            
            <div className="space-y-3">
              {session.questions.map((item, idx) => {
                const isExpanded = expandedTurns[idx];
                return (
                  <div key={idx} className="rounded-xl border border-brand-border/60 bg-white overflow-hidden shadow-subtle">
                    <div
                      onClick={() => toggleTurnExpand(idx)}
                      className="flex items-center justify-between p-4 cursor-pointer hover:bg-brand-warmBg/20 transition-all"
                    >
                      <div className="flex gap-3 items-center truncate">
                        <span className="rounded-full bg-brand-peach/10 px-2 py-0.5 text-[9px] font-semibold text-amber-800 border border-brand-peach/20">
                          Segment Q{idx + 1}
                        </span>
                        {item.evaluation?.isAnswerValid === false && (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[9px] font-semibold text-red-800 border border-red-200 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Invalid Answer
                          </span>
                        )}
                        <div className="text-xs font-semibold text-brand-text truncate max-w-lg">
                          "{item.question}"
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-brand-text">{item.evaluation?.score || 0}%</span>
                        {isExpanded ? <ChevronUp className="h-4.5 w-4.5 text-brand-gray" /> : <ChevronDown className="h-4.5 w-4.5 text-brand-gray" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-brand-border/40 bg-brand-warmBg/5 p-4 space-y-4 font-light text-left">
                        <div className="space-y-2">
                          <div>
                            <span className="text-[8px] font-bold text-brand-gray uppercase">Interviewer segment prompt:</span>
                            <p className="text-xs text-brand-text italic bg-brand-warmBg/30 p-2.5 rounded-lg border border-brand-border/40 leading-relaxed font-light">"{item.question}"</p>
                          </div>
                          <div>
                            <span className="text-[8px] font-bold text-brand-peach uppercase">Spoken answer transcript:</span>
                            <p className="text-xs text-brand-text bg-white p-3 rounded-lg border border-brand-border leading-relaxed font-light">"{item.userAnswer || 'No response captured.'}"</p>
                            {item.evaluation?.isAnswerValid === false && (
                              <div className="mt-2 flex items-center gap-1 text-[10px] text-red-600 font-semibold bg-red-50 p-2 rounded border border-red-100">
                                <AlertTriangle className="h-3.5 w-3.5" />
                                Flagged: Response rejected by senior evaluator (gibberish, buzzword stuffing, or placeholder detected).
                              </div>
                            )}
                          </div>
                        </div>

                        {/* segment sub-scores */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-brand-border/40 pt-3">
                          <div className="space-y-1">
                            <span className="text-[8px] font-bold text-brand-peach uppercase block">Technical Correctness:</span>
                            <p className="text-[10px] text-brand-gray leading-relaxed font-light">{item.evaluation?.technicalFeedback}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[8px] font-bold text-brand-green uppercase block">Communication Delivery:</span>
                            <p className="text-[10px] text-brand-gray leading-relaxed font-light">{item.evaluation?.communicationFeedback}</p>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[8px] font-bold text-brand-peach uppercase block">Confidence & Compose:</span>
                            <p className="text-[10px] text-brand-gray leading-relaxed font-light">{item.evaluation?.confidenceFeedback}</p>
                          </div>
                        </div>

                        {/* Adaptive Follow-up recommendation */}
                        {item.evaluation?.followUpQuestions && item.evaluation.followUpQuestions.length > 0 && (
                          <div className="border-t border-brand-border/40 pt-3 space-y-1">
                            <span className="text-[8px] font-bold text-purple-600 uppercase block">AI Adaptive Follow-Up Question:</span>
                            <p className="text-[10.5px] text-brand-text italic leading-relaxed font-semibold">"{item.evaluation.followUpQuestions[0]}"</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
