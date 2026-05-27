import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  FileCheck,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Bookmark,
  Plus,
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/analytics/stats');
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching dashboard statistics:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-peach border-t-transparent"></div>
      </div>
    );
  }

  // Quick helper to draw circular progress rings
  const CircularProgress = ({ value, label, colorClass = "text-brand-green" }) => {
    const radius = 28;
    const stroke = 6;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
      <div className="flex flex-col items-center justify-center space-y-2 rounded-2xl bg-brand-warmBg/30 p-4 border border-brand-border/40">
        <div className="relative flex items-center justify-center">
          <svg className="h-16 w-16 transform -rotate-90">
            <circle
              className="text-brand-border/60"
              strokeWidth={stroke}
              stroke="currentColor"
              fill="transparent"
              r={normalizedRadius}
              cx={radius + stroke}
              cy={radius + stroke}
            />
            <circle
              className={colorClass}
              strokeWidth={stroke}
              strokeDasharray={circumference + ' ' + circumference}
              style={{ strokeDashoffset }}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r={normalizedRadius}
              cx={radius + stroke}
              cy={radius + stroke}
            />
          </svg>
          <span className="absolute font-heading text-sm font-semibold text-brand-text">{value}%</span>
        </div>
        <span className="text-[10px] font-medium text-brand-gray uppercase tracking-wider">{label}</span>
      </div>
    );
  };

  const dashboardTodo = [
    { label: "Upload & Audit your Resume PDF", desc: "Unlock structural audits, missing keywords matching, and score out of 100.", link: "/ats", completed: (stats?.totalResumes || 0) > 0 },
    { label: "Practice a Mock Interview", desc: "Simulate tight verbal scenarios tailored to major corporate bars.", link: "/interview", completed: (stats?.totalInterviews || 0) > 0 },
    { label: "Generate 4-Week Career Pathway", desc: "Specify dream goals and generate structured weekly schedules.", link: "/roadmap", completed: (user?.usage?.roadmapsGenerated || 0) > 0 }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-brand-text md:text-3xl">
            Welcome back, {user?.name || 'Developer'}
          </h1>
          <p className="text-xs text-brand-gray font-light">
            Here's a breakdown of your preparation trajectory and AI scorecards.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/ats')}
            className="flex items-center gap-2 rounded-xl bg-brand-text px-4 py-2.5 text-xs font-semibold text-white shadow-premium hover:bg-brand-text/90 transition-all active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Audit Resume
          </button>
          <button
            onClick={() => navigate('/interview')}
            className="flex items-center gap-2 rounded-xl border border-brand-border bg-white px-4 py-2.5 text-xs font-semibold text-brand-text hover:bg-brand-warmBg transition-all active:scale-[0.98]"
          >
            Start Mock Session
          </button>
        </div>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-brand-border/60 bg-white p-5 shadow-subtle flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-peach/20 text-brand-text">
            <FileCheck className="h-5.5 w-5.5 stroke-[1.5]" />
          </div>
          <div>
            <div className="text-[10px] font-semibold text-brand-gray uppercase tracking-wider">Resumes Audited</div>
            <div className="font-heading text-xl font-semibold text-brand-text mt-0.5">{stats?.totalResumes || 0}</div>
          </div>
        </div>

        <div className="rounded-2xl border border-brand-border/60 bg-white p-5 shadow-subtle flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-green/20 text-brand-text">
            <MessageSquare className="h-5.5 w-5.5 stroke-[1.5]" />
          </div>
          <div>
            <div className="text-[10px] font-semibold text-brand-gray uppercase tracking-wider">Interviews Taken</div>
            <div className="font-heading text-xl font-semibold text-brand-text mt-0.5">{stats?.totalInterviews || 0}</div>
          </div>
        </div>

        <div className="rounded-2xl border border-brand-border/60 bg-white p-5 shadow-subtle flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-peach/20 text-brand-text">
            <TrendingUp className="h-5.5 w-5.5 stroke-[1.5]" />
          </div>
          <div>
            <div className="text-[10px] font-semibold text-brand-gray uppercase tracking-wider">Average ATS Score</div>
            <div className="font-heading text-xl font-semibold text-brand-text mt-0.5">{stats?.avgATSScore || 74}%</div>
          </div>
        </div>

        <div className="rounded-2xl border border-brand-border/60 bg-white p-5 shadow-subtle flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-green/20 text-brand-text">
            <Sparkles className="h-5.5 w-5.5 stroke-[1.5]" />
          </div>
          <div>
            <div className="text-[10px] font-semibold text-brand-gray uppercase tracking-wider">Mock Interview Rating</div>
            <div className="font-heading text-xl font-semibold text-brand-text mt-0.5">{stats?.avgInterviewScore || 73}%</div>
          </div>
        </div>
      </div>

      {/* Main Charts block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ATS Score Timeline */}
        <div className="rounded-2xl border border-brand-border/60 bg-white p-6 shadow-premium lg:col-span-8 space-y-4">
          <div>
            <h3 className="font-heading text-sm font-semibold text-brand-text">ATS score progression trajectory</h3>
            <p className="text-[11px] text-brand-gray font-light">Historical score trends showing incremental optimization sweeps.</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.atsTrends || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6B7280' }} stroke="#E5E7EB" />
                <YAxis domain={[40, 100]} tick={{ fontSize: 10, fill: '#6B7280' }} stroke="#E5E7EB" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', fontSize: '11px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  name="ATS Score" 
                  stroke="#F5C6A5" 
                  strokeWidth={2} 
                  activeDot={{ r: 6 }} 
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Circular Indicators of Interview Sub-grades */}
        <div className="rounded-2xl border border-brand-border/60 bg-white p-6 shadow-premium lg:col-span-4 space-y-5 flex flex-col justify-between self-stretch">
          <div>
            <h3 className="font-heading text-sm font-semibold text-brand-text">Interview competency scores</h3>
            <p className="text-[11px] text-brand-gray font-light">Breakdown of communication metrics gathered during simulations.</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <CircularProgress value={stats?.averages?.technical || 69} label="Technical" colorClass="text-brand-peach" />
            <CircularProgress value={stats?.averages?.communication || 76} label="Communication" colorClass="text-brand-green" />
            <CircularProgress value={stats?.averages?.confidence || 74} label="Confidence" colorClass="text-brand-peach" />
            <CircularProgress value={stats?.averages?.overall || 73} label="Overall" colorClass="text-brand-green" />
          </div>
        </div>
      </div>

      {/* Double Column: Checklist and Extracted Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Checklist */}
        <div className="rounded-2xl border border-brand-border/60 bg-white p-6 shadow-premium lg:col-span-7 space-y-4">
          <h3 className="font-heading text-sm font-semibold text-brand-text">Your preparation roadmap</h3>
          <div className="space-y-3.5">
            {dashboardTodo.map((todo, idx) => (
              <div 
                key={idx}
                onClick={() => navigate(todo.link)}
                className={`flex gap-4 p-4 rounded-xl border transition-all cursor-pointer hover:bg-brand-warmBg/20 active:scale-[0.99] ${
                  todo.completed ? 'bg-brand-warmBg/35 border-brand-border' : 'bg-white border-brand-border/80'
                }`}
              >
                <div className="pt-0.5">
                  <div className={`flex h-5 w-5 items-center justify-center rounded-md border ${
                    todo.completed ? 'bg-brand-green text-white border-brand-green' : 'border-brand-gray/60'
                  }`}>
                    {todo.completed && <Bookmark className="h-3 w-3 fill-current stroke-none" />}
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <div className={`text-xs font-semibold ${todo.completed ? 'text-brand-text line-through opacity-70' : 'text-brand-text'}`}>
                    {todo.label}
                  </div>
                  <div className="text-[10px] text-brand-gray font-light leading-relaxed">
                    {todo.desc}
                  </div>
                </div>
                <div className="flex items-center">
                  <ArrowRight className="h-3.5 w-3.5 text-brand-gray" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skill tags */}
        <div className="rounded-2xl border border-brand-border/60 bg-white p-6 shadow-premium lg:col-span-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="font-heading text-sm font-semibold text-brand-text">Active Technical Core</h3>
            <p className="text-[11px] text-brand-gray font-light">Technologies and libraries parsed from your active resume records.</p>
          </div>
          
          <div className="flex flex-wrap gap-2.5 py-4">
            {stats?.topSkills && stats.topSkills.length > 0 ? (
              stats.topSkills.map((sk, idx) => (
                <span 
                  key={idx} 
                  className="rounded-full bg-brand-warmBg px-3.5 py-1.5 text-xs font-medium text-brand-text border border-brand-border/60 transition-all hover:border-brand-peach/80"
                >
                  {sk.name} <span className="text-[10px] font-normal text-brand-gray">({sk.value})</span>
                </span>
              ))
            ) : (
              <div className="text-center text-xs text-brand-gray py-6 font-light">
                No skills detected. Upload a resume in the ATS tab to display clusters here.
              </div>
            )}
          </div>

          <div className="rounded-xl bg-brand-peach/10 border border-brand-peach/25 p-3 flex items-center justify-between text-xs text-amber-900">
            <span>Ready to double your match scoring?</span>
            <button 
              onClick={() => navigate('/ats')} 
              className="flex items-center gap-1 font-semibold underline hover:text-brand-text"
            >
              Analyze CV
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
