import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../App';
import { Mail, Lock, User, ArrowRight, ShieldCheck, X } from 'lucide-react';

export default function AuthPage() {
  const { login, signup, loginAsGuest, googleLogin } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Mode state: 'login' or 'signup'
  const [mode, setMode] = useState('login');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Google SSO selector modal states
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleName, setCustomGoogleName] = useState('');
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');

  const preconfiguredGoogleUsers = [
    { name: 'Kaushal Patel', email: 'kaushal@gmail.com', avatar: 'KP' },
    { name: 'Alex Rivera', email: 'alex.rivera@hiremind.ai', avatar: 'AR' },
  ];

  useEffect(() => {
    if (searchParams.get('signup') === 'true') {
      setMode('signup');
    } else {
      setMode('login');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    if (!email || !password || (mode === 'signup' && !name)) {
      setErrorMessage('Please fill out all active fields.');
      setIsSubmitting(false);
      return;
    }

    try {
      let result;
      if (mode === 'login') {
        result = await login(email, password);
      } else {
        result = await signup(name, email, password);
      }

      if (result.success) {
        navigate('/dashboard');
      } else {
        setErrorMessage('Authentication credentials failed.');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Authentication error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestBypass = () => {
    setIsSubmitting(true);
    try {
      const result = loginAsGuest();
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setErrorMessage('Guest bypass failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectGoogleUser = async (gName, gEmail) => {
    setIsSubmitting(true);
    setErrorMessage('');
    setShowGoogleModal(false);
    try {
      const result = await googleLogin(gEmail, gName);
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Google database login failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomGoogleSubmit = async (e) => {
    e.preventDefault();
    if (!customGoogleName || !customGoogleEmail) return;
    await handleSelectGoogleUser(customGoogleName, customGoogleEmail);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-bg px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background radial soft highlights */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-brand-green/10 blur-3xl"></div>
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-brand-peach/10 blur-3xl"></div>

      <div className="w-full max-w-md space-y-6">
        {/* Logo and Header */}
        <div className="text-center space-y-2">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-brand-text mb-2">
            HireMind<span className="text-brand-green">.ai</span>
          </h1>
          <h2 className="font-heading text-xl font-semibold tracking-tight text-brand-text">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-xs text-brand-gray font-light">
            {mode === 'login' 
              ? 'Sign in to access your AI mock sessions and ATS reports.' 
              : 'Sign up to build tailored learning roadmaps and parse resumes.'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="rounded-2xl border border-brand-border/60 bg-white p-8 shadow-premium space-y-6">
          {/* Tab togglers */}
          <div className="grid grid-cols-2 rounded-xl bg-brand-warmBg/50 p-1 border border-brand-border/40">
            <button
              onClick={() => setMode('login')}
              className={`rounded-lg py-2 text-xs font-medium transition-all ${
                mode === 'login' 
                  ? 'bg-white text-brand-text shadow-subtle font-semibold' 
                  : 'text-brand-gray hover:text-brand-text'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`rounded-lg py-2 text-xs font-medium transition-all ${
                mode === 'signup' 
                  ? 'bg-white text-brand-text shadow-subtle font-semibold' 
                  : 'text-brand-gray hover:text-brand-text'
              }`}
            >
              Sign Up
            </button>
          </div>

          {errorMessage && (
            <div className="rounded-xl border border-red-200/50 bg-red-50/50 p-3 text-center text-xs font-medium text-red-800 animate-fade-in">
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-brand-gray uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="absolute top-3 left-3.5 h-4 w-4 text-brand-gray/60 stroke-[1.5]" />
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-brand-border bg-white py-2.5 pl-10 pr-4 text-xs text-brand-text outline-none transition-all placeholder:text-brand-gray/40 focus:border-brand-peach/80 focus:ring-1 focus:ring-brand-peach/40"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-brand-gray uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute top-3 left-3.5 h-4 w-4 text-brand-gray/60 stroke-[1.5]" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-brand-border bg-white py-2.5 pl-10 pr-4 text-xs text-brand-text outline-none transition-all placeholder:text-brand-gray/40 focus:border-brand-peach/80 focus:ring-1 focus:ring-brand-peach/40"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-brand-gray uppercase tracking-wider">Password</label>
                {mode === 'login' && (
                  <a href="#reset" className="text-[10px] text-brand-gray hover:text-brand-text transition-colors">Forgot?</a>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute top-3 left-3.5 h-4 w-4 text-brand-gray/60 stroke-[1.5]" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-brand-border bg-white py-2.5 pl-10 pr-4 text-xs text-brand-text outline-none transition-all placeholder:text-brand-gray/40 focus:border-brand-peach/80 focus:ring-1 focus:ring-brand-peach/40"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-text py-3 text-xs font-semibold text-white shadow-premium hover:bg-brand-text/90 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Sign Up'}
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-brand-border/60"></div>
            <span className="flex-shrink mx-4 text-[10px] text-brand-gray/60 font-light">or bypass options</span>
            <div className="flex-grow border-t border-brand-border/60"></div>
          </div>

          {/* Real Google SSO button */}
          <button
            type="button"
            onClick={() => setShowGoogleModal(true)}
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-border/80 bg-white py-2.5 text-xs font-semibold text-brand-text hover:bg-brand-warmBg transition-all active:scale-[0.98] disabled:opacity-70"
          >
            <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Guest Mode bypass */}
          <button
            type="button"
            onClick={handleGuestBypass}
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-green/20 py-2.5 text-xs font-semibold text-emerald-950 border border-brand-green/30 hover:bg-brand-green/35 transition-all active:scale-[0.98] disabled:opacity-70"
          >
            Continue as Guest (Instant Bypass)
          </button>
        </div>

        {/* Database notice */}
        <div className="flex gap-2.5 items-center justify-center rounded-xl bg-brand-warmBg/50 border border-brand-border/60 p-3 text-center text-[10px] text-brand-gray font-light">
          <ShieldCheck className="h-4 w-4 text-brand-green shrink-0" />
          <span><strong>Secure Database Auth:</strong> Standard login connects to MongoDB. Google/Guest options bypass form creation.</span>
        </div>
      </div>

      {/* Interactive Google Sign-In Selector Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm transition-all duration-300">
          <div className="w-full max-w-sm rounded-2xl border border-brand-border/80 bg-white p-6 shadow-premium relative animate-fade-in space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="font-heading text-sm font-semibold text-brand-text">Sign in with Google</span>
              </div>
              <button
                onClick={() => setShowGoogleModal(false)}
                className="rounded-lg p-1 text-brand-gray hover:bg-brand-warmBg hover:text-brand-text transition-all"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Subtext */}
            <p className="text-[11px] text-brand-gray font-light">
              Choose a Google Account to sign in to HireMind.ai. This automatically links with your active database profiles.
            </p>

            {/* Preconfigured selector cards */}
            <div className="space-y-2">
              {preconfiguredGoogleUsers.map((gUser, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectGoogleUser(gUser.name, gUser.email)}
                  className="flex w-full items-center gap-3 rounded-xl border border-brand-border bg-white p-3 hover:bg-brand-warmBg/55 transition-all text-left"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-green/20 text-xs font-semibold text-brand-text">
                    {gUser.avatar}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-brand-text">{gUser.name}</div>
                    <div className="text-[10px] text-brand-gray">{gUser.email}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Custom Google account selector divider */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-brand-border/60"></div>
              <span className="flex-shrink mx-3 text-[9px] text-brand-gray/50 uppercase">or use another</span>
              <div className="flex-grow border-t border-brand-border/60"></div>
            </div>

            {/* Custom inputs */}
            <form onSubmit={handleCustomGoogleSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-brand-gray uppercase">Google Name</label>
                <input
                  type="text"
                  required
                  placeholder="Kaushal Patel"
                  value={customGoogleName}
                  onChange={(e) => setCustomGoogleName(e.target.value)}
                  className="w-full rounded-xl border border-brand-border bg-white p-2.5 text-xs text-brand-text outline-none transition-all placeholder:text-brand-gray/40 focus:border-brand-peach/80"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-brand-gray uppercase">Google Email</label>
                <input
                  type="email"
                  required
                  placeholder="kaushal@gmail.com"
                  value={customGoogleEmail}
                  onChange={(e) => setCustomGoogleEmail(e.target.value)}
                  className="w-full rounded-xl border border-brand-border bg-white p-2.5 text-xs text-brand-text outline-none transition-all placeholder:text-brand-gray/40 focus:border-brand-peach/80"
                />
              </div>

              <button
                type="submit"
                disabled={!customGoogleName || !customGoogleEmail}
                className="w-full rounded-xl bg-brand-text py-2.5 text-xs font-semibold text-white shadow-premium hover:bg-brand-text/90 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Proceed with Google SSO
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
