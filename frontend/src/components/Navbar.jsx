import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { Sparkles } from 'lucide-react';

export default function Navbar() {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 border-b border-brand-border/40 bg-white/70 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <span className="font-heading text-2xl font-bold tracking-tight text-brand-text">
                HireMind<span className="text-brand-green">.ai</span>
              </span>
            </Link>
          </div>

          {/* Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a href="#features" className="text-sm font-medium text-brand-gray hover:text-brand-text transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-sm font-medium text-brand-gray hover:text-brand-text transition-colors">
                Pricing
              </a>
              <a href="#faq" className="text-sm font-medium text-brand-gray hover:text-brand-text transition-colors">
                FAQ
              </a>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 rounded-xl bg-brand-green/20 px-4 py-2 text-sm font-medium text-brand-text hover:bg-brand-green/30 transition-all active:scale-[0.98]"
              >
                Go to Dashboard
              </button>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="text-sm font-medium text-brand-gray hover:text-brand-text transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth?signup=true"
                  className="rounded-xl bg-brand-text px-4 py-2 text-sm font-medium text-white shadow-premium hover:bg-brand-text/90 transition-all active:scale-[0.98]"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
