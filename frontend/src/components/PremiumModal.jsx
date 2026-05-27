import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../App';
import { Sparkles, Check, X, Shield, Lock, CreditCard } from 'lucide-react';

export default function PremiumModal({ isOpen, onClose }) {
  const { upgradePlan, refreshUserUsage } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Handle Stripe Redirection
  const handleStripeCheckout = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('/api/payment/create-checkout-session');
      if (response.data.success && response.data.url) {
        // Redirect user to Stripe Checkout
        window.location.href = response.data.url;
      } else {
        setError('Failed to initiate checkout session.');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error connecting to the payment server.');
    } finally {
      setLoading(false);
    }
  };

  // Developer Sandbox Instant Toggle
  const handleSandboxBypass = async () => {
    setLoading(true);
    try {
      await upgradePlan();
      await refreshUserUsage();
      onClose();
    } catch (err) {
      setError('Sandbox toggle failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
      {/* Modal Card */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-brand-border/60 bg-white shadow-2xl transition-all duration-300">
        
        {/* Top Decorative Gradient Banner */}
        <div className="h-2.5 w-full bg-gradient-to-r from-brand-peach via-rose-400 to-brand-green"></div>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-5 top-6 rounded-full bg-brand-bg p-1.5 text-brand-gray transition-all hover:bg-brand-border/40 hover:text-brand-text active:scale-90"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content Container */}
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center gap-2.5 text-brand-peach">
            <div className="rounded-xl bg-brand-peach/10 p-2">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider">Premium Access</span>
          </div>

          <h2 className="mt-4 font-heading text-2xl font-bold tracking-tight text-brand-text">
            Elevate Your Career with <span className="bg-gradient-to-r from-brand-peach to-rose-500 bg-clip-text text-transparent">HireMind Premium</span>
          </h2>
          <p className="mt-2 text-sm text-brand-gray">
            Unlock the ultimate AI-driven career suite to out-prepare, out-perform, and secure top-tier tech roles.
          </p>

          {/* Premium Value Props */}
          <ul className="mt-6 space-y-3.5">
            {[
              { title: 'Unlimited ATS Resumes', desc: 'Audit and optimize infinite resumes against any job profile.' },
              { title: 'Unlimited AI Mock Interviews', desc: 'Conduct adaptive, technical interviews with dynamic follow-ups.' },
              { title: 'Unlimited Study Roadmaps', desc: 'Generate customized learning paths tailored to your target roles.' },
              { title: 'Full Anti-Cheating Suite Access', desc: 'Ensure strict interview integrity matching real recruiter assessments.' }
            ].map((prop, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-brand-green/10 p-0.5 text-brand-green">
                  <Check className="h-4 w-4 stroke-[3]" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-brand-text">{prop.title}</h4>
                  <p className="text-[11px] text-brand-gray">{prop.desc}</p>
                </div>
              </li>
            ))}
          </ul>

          {/* Pricing Box */}
          <div className="mt-6 rounded-2xl border border-brand-border/60 bg-brand-warmBg/40 p-4 text-center">
            <div className="text-xs text-brand-gray">Lifetime Access One-Time Payment</div>
            <div className="mt-1 flex items-baseline justify-center gap-1">
              <span className="text-xl font-semibold text-brand-text">$</span>
              <span className="text-3xl font-black tracking-tight text-brand-text">19.99</span>
              <span className="text-xs text-brand-gray">/ forever</span>
            </div>
          </div>

          {/* Error Message Display */}
          {error && (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-center text-xs font-medium text-rose-800">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 space-y-2.5">
            {/* Primary Stripe Button */}
            <button
              onClick={handleStripeCheckout}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-text py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-brand-text/90 active:scale-[0.98] disabled:opacity-50"
            >
              <CreditCard className="h-4 w-4" />
              {loading ? 'Initiating...' : 'Upgrade via Stripe'}
            </button>

            {/* Sandbox Quick Bypass Button */}
            <button
              onClick={handleSandboxBypass}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-brand-border/80 bg-white py-2.5 text-xs font-medium text-brand-gray transition-all hover:bg-brand-bg hover:text-brand-text active:scale-[0.98] disabled:opacity-50"
            >
              <Shield className="h-3.5 w-3.5" />
              Developer Sandbox Instant Toggle
            </button>
          </div>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] text-brand-gray">
            <Lock className="h-3 w-3" />
            <span>Secure encryption via Stripe. 100% money-back guarantee.</span>
          </div>

        </div>
      </div>
    </div>
  );
}
