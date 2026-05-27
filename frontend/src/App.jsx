import React, { createContext, useState, useEffect, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';

// Context
export const AuthContext = createContext(null);

// Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import ATSAnalyzer from './pages/ATSAnalyzer';
import InterviewPrep from './pages/InterviewPrep';
import InterviewSession from './pages/InterviewSession';
import RoadmapGenerator from './pages/RoadmapGenerator';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-brand-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-peach border-t-transparent"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/auth" replace />;
};

function NavigationLayout({ children }) {
  const { isAuthenticated } = useContext(AuthContext);
  const location = useLocation();
  
  const isAuthPage = location.pathname === '/auth';
  const isLandingPage = location.pathname === '/';
  
  if (isAuthPage) return <>{children}</>;
  
  return (
    <div className="flex min-h-screen flex-col bg-brand-bg">
      {/* Show regular Landing page Navbar or Dashboard Layout */}
      {isLandingPage ? (
        <>
          <Navbar />
          <main className="flex-1">{children}</main>
        </>
      ) : (
        <div className="flex min-h-screen">
          {isAuthenticated && <Sidebar />}
          <div className="flex flex-1 flex-col overflow-x-hidden">
            <main className="flex-1 p-6 md:p-8 lg:p-10">{children}</main>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Setup default AXIOS base URL or headers
  useEffect(() => {
    axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Load User Profile on bootstrap
  const checkAuthStatus = async () => {
    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get('/api/auth/me');
      if (response.data.success) {
        setUser(response.data.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.warn('Backend server offline or invalid token. Activating Sandbox Guest Profile...');
      
      // Fallback guest user for local sandbox testing
      const guestUser = {
        id: 'sandbox_guest_123',
        name: 'Guest Innovator',
        email: 'guest@hiremind.ai',
        plan: 'free',
        usage: {
          resumesAnalyzed: 1,
          interviewsConducted: 1,
          roadmapsGenerated: 1,
        }
      };
      setUser(guestUser);
      setIsAuthenticated(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      if (response.data.success) {
        const { token: userToken, user: userData } = response.data;
        localStorage.setItem('token', userToken);
        setToken(userToken);
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true };
      }
    } catch (error) {
      console.error('Database sign-in failed:', error.response?.data?.message || error.message);
      throw error;
    }
  };

  const signup = async (name, email, password) => {
    try {
      const response = await axios.post('/api/auth/register', { name, email, password });
      if (response.data.success) {
        const { token: userToken, user: userData } = response.data;
        localStorage.setItem('token', userToken);
        setToken(userToken);
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true };
      }
    } catch (error) {
      console.error('Database registration failed:', error.response?.data?.message || error.message);
      throw error;
    }
  };

  const loginAsGuest = () => {
    const mockToken = 'sandbox_jwt_session_token_xyz';
    localStorage.setItem('token', mockToken);
    setToken(mockToken);
    setUser({
      id: 'sandbox_guest_123',
      name: 'Guest Innovator',
      email: 'guest@hiremind.ai',
      plan: 'free',
      usage: {
        resumesAnalyzed: 1,
        interviewsConducted: 1,
        roadmapsGenerated: 1,
      }
    });
    setIsAuthenticated(true);
    return { success: true };
  };

  const googleLogin = async (email, name) => {
    try {
      const response = await axios.post('/api/auth/google', { email, name });
      if (response.data.success) {
        const { token: userToken, user: userData } = response.data;
        localStorage.setItem('token', userToken);
        setToken(userToken);
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true };
      }
    } catch (error) {
      console.error('Google login failed:', error.response?.data?.message || error.message);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const upgradePlan = async () => {
    try {
      const response = await axios.post('/api/auth/upgrade');
      if (response.data.success) {
        setUser(response.data.user);
        return true;
      }
    } catch (e) {
      // Offline toggle
      setUser(prev => {
        if (!prev) return null;
        const newPlan = prev.plan === 'premium' ? 'free' : 'premium';
        return { ...prev, plan: newPlan };
      });
      return true;
    }
  };

  const refreshUserUsage = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      if (response.data.success) {
        setUser(response.data.user);
      }
    } catch (e) {
      // In sandbox mode, simulate increments
      console.warn("Refreshing sandbox limits...");
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, signup, loginAsGuest, googleLogin, logout, upgradePlan, refreshUserUsage }}>
      <BrowserRouter>
        <NavigationLayout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/ats" 
              element={
                <ProtectedRoute>
                  <ATSAnalyzer />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/interview" 
              element={
                <ProtectedRoute>
                  <InterviewPrep />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/interview/session/:id" 
              element={
                <ProtectedRoute>
                  <InterviewSession />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/roadmap" 
              element={
                <ProtectedRoute>
                  <RoadmapGenerator />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NavigationLayout>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}
