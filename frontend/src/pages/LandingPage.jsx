import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Compass,
  MessageSquare,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState(null);

  const features = [
    {
      icon: ShieldCheck,
      title: "ATS Resume Auditor",
      desc: "Instantly scan and audit your resumes against specific Job Descriptions. Extract skills, detect missing keywords, score readability, and secure action-verb alignments.",
    },
    {
      icon: MessageSquare,
      title: "AI Interview Simulator",
      desc: "Converse with a customized AI Interviewer tailored to target difficulty levels and company styles. Evaluate technical content, confidence, and voice communication scores.",
    },

    {
      icon: Compass,
      title: "Learning Pathway Engine",
      desc: "Specify your dream company, target role, and current skills. Generate tailored 4-week preparation calendars with step-by-step topic lists and portfolio project tasks.",
    }
  ];

  const pricingPlans = [
    {
      name: "Free Sandbox",
      price: "$0",
      desc: "Experience core AI audits and trial sessions.",
      features: [
        "Audit up to 3 Resumes",
        "Converse in 3 Mock Interviews",
        "Generate 2 Career Roadmaps",
        "Dynamic Plan swapper included"
      ],
      cta: "Try Now",
      premium: false
    },
    {
      name: "Professional Prep",
      price: "$19",
      desc: "Unlimited assets for comprehensive careers prep.",
      features: [
        "Unlimited Resume audits against JDs",
        "Unlimited Live Interactive Interviews",
        "Unlimited 4-Week Roadmaps",
        "Dedicated behavioral & technical summaries"
      ],
      cta: "Go Premium",
      premium: true
    }
  ];

  const faqs = [
    {
      q: "What is an ATS Resume score, and how is it calculated?",
      a: "Applicant Tracking Systems parse and index resumes looking for critical keywords. Our analyzer scores your formatting, keyword match density, spelling correctness, and metrics presence out of 100, providing drop-in bullet replacements."
    },

    {
      q: "Can I try out the Premium features for free?",
      a: "Absolutely! HireMind includes a dynamic SaaS Plan Swapper right in your dashboard sidebar. You can instantly toggle between Free and Premium plans at the click of a button to experience the premium limits!"
    }
  ];

  return (
    <div className="relative overflow-x-hidden bg-brand-bg px-4 sm:px-6 lg:px-8">
      {/* Background soft shapes */}
      <div className="absolute top-20 left-1/4 h-72 w-72 rounded-full bg-brand-peach/10 blur-3xl"></div>
      <div className="absolute top-60 right-1/4 h-80 w-80 rounded-full bg-brand-green/10 blur-3xl"></div>

      {/* Hero Section */}
      <section className="mx-auto max-w-4xl pt-20 pb-16 md:pt-32 md:pb-24 text-center">
        <div className="space-y-6 flex flex-col items-center justify-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-peach/15 px-3 py-1 text-xs font-medium text-amber-800 animate-fade-in">
            <Sparkles className="h-3.5 w-3.5 stroke-[2]" />
            Startup-ready Careers Simulator
          </div>

          <h1 className="font-heading text-4xl font-semibold tracking-tight text-brand-text sm:text-5xl md:text-6xl transition-all duration-300 max-w-3xl leading-tight">
            Secure your dream technical offer with <span className="relative">HireMind <span className="absolute bottom-1 left-0 -z-10 h-3 w-full bg-brand-green/20"></span></span>
          </h1>

          <p className="text-base text-brand-gray sm:text-lg max-w-2xl leading-relaxed font-light mx-auto">
            Unleash a high-fidelity MERN + GenAI ecosystem that audits resumes, analyzes job descriptions, generates tailored learning roadmaps, and conducts live mock evaluations.
          </p>

          <div className="flex flex-wrap gap-4 pt-4 justify-center">
            <button
              onClick={() => navigate('/auth?signup=true')}
              className="flex items-center gap-2 rounded-xl bg-brand-text px-6 py-3 text-sm font-medium text-white shadow-premium hover:bg-brand-text/90 transition-all active:scale-[0.98]"
            >
              Start Preparation
              <ArrowRight className="h-4 w-4" />
            </button>
            <a
              href="#features"
              className="flex items-center justify-center rounded-xl border border-brand-border/80 bg-white px-6 py-3 text-sm font-medium text-brand-text hover:bg-brand-warmBg transition-all active:scale-[0.98]"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="mx-auto max-w-7xl py-20 border-t border-brand-border/40">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-brand-text sm:text-4xl">
            Complete startup preparation toolkit
          </h2>
          <p className="text-brand-gray font-light max-w-lg mx-auto">
            Everything you need to evaluate, structure, and practice your technical narrative in one unified, clean SaaS sandbox.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-brand-border/60 bg-white p-6 shadow-subtle hover:shadow-premium hover:-translate-y-1 transition-all duration-300 text-left"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green/20 text-brand-text">
                  <Icon className="h-5 w-5 stroke-[1.5]" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-brand-text mb-2">{feat.title}</h3>
                <p className="text-sm text-brand-gray font-light leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* SaaS Pricing Matrix */}
      <section id="pricing" className="mx-auto max-w-7xl py-20 border-t border-brand-border/40">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-brand-text sm:text-4xl">
            Calm, transparent pricing
          </h2>
          <p className="text-brand-gray font-light max-w-lg mx-auto">
            Try all premium modules in our Free Sandbox plan, with simulated swapper toggles included.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          {pricingPlans.map((plan, idx) => (
            <div
              key={idx}
              className={`flex flex-col rounded-2xl border bg-white p-8 shadow-premium relative ${
                plan.premium ? 'border-brand-peach border-2' : 'border-brand-border/60'
              }`}
            >
              {plan.premium && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-brand-peach px-3 py-1 text-[10px] font-semibold text-amber-900 uppercase">
                  Most Popular
                </span>
              )}
              <div className="mb-6 space-y-2 text-left">
                <h3 className="font-heading text-xl font-semibold text-brand-text">{plan.name}</h3>
                <p className="text-xs text-brand-gray font-light">{plan.desc}</p>
                <div className="flex items-baseline gap-1 pt-2">
                  <span className="font-heading text-4xl font-semibold text-brand-text">{plan.price}</span>
                  <span className="text-xs text-brand-gray">/ month</span>
                </div>
              </div>

              <ul className="flex-1 space-y-3.5 mb-8 text-left">
                {plan.features.map((feat, fIdx) => (
                  <li key={fIdx} className="flex items-center gap-3 text-xs text-brand-text font-light">
                    <CheckCircle2 className="h-4 w-4 stroke-brand-green fill-brand-green/20" />
                    {feat}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => navigate('/auth?signup=true')}
                className={`w-full rounded-xl py-3 text-sm font-medium transition-all active:scale-[0.98] ${
                  plan.premium
                    ? 'bg-brand-peach text-amber-900 shadow-premium hover:bg-brand-peach/90'
                    : 'bg-brand-text text-white hover:bg-brand-text/90'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Accordion FAQ */}
      <section id="faq" className="mx-auto max-w-4xl py-20 border-t border-brand-border/40">
        <div className="text-center mb-12 space-y-4">
          <h2 className="font-heading text-2xl font-semibold tracking-tight text-brand-text sm:text-3xl">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-brand-border/60 bg-white shadow-subtle overflow-hidden transition-all text-left"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between p-5 text-left transition-colors hover:bg-brand-warmBg/35"
                >
                  <span className="text-sm font-semibold text-brand-text">{faq.q}</span>
                  <ChevronDown className={`h-4.5 w-4.5 text-brand-gray transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && (
                  <div className="border-t border-brand-border/40 bg-brand-warmBg/10 px-5 py-4 text-xs font-light leading-relaxed text-brand-gray">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Elegant Footer */}
      <footer className="mx-auto max-w-7xl py-12 border-t border-brand-border/40 text-center space-y-6">
        <div className="flex items-center justify-center gap-2">
          <span className="font-heading text-xl font-bold tracking-tight text-brand-text">
            HireMind<span className="text-brand-green">.ai</span>
          </span>
        </div>
        <p className="text-xs text-brand-gray font-light">
          © {new Date().getFullYear()} HireMind AI Platform. All rights reserved. MERN + Groq AI Startup Architecture.
        </p>
      </footer>
    </div>
  );
}
