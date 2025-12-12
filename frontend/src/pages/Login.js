import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { post } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await post('/api/auth/login', { email, password });
      login(res.user, res.token);
      navigate(from, { replace: true });
    } catch (err) {
      const errorMessage = err?.message || 'Login failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600 flex items-center justify-center p-8 relative overflow-hidden">
      <div className="absolute inset-0 -top-1/2 -right-1/2 w-[200%] h-[200%] opacity-50 animate-pulse-bg" style={{ background: 'radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%)' }}></div>
      
      <div className="bg-white rounded-3xl shadow-2xl p-12 w-full max-w-md relative z-10 animate-slide-up">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Welcome Back
          </h2>
          <p className="text-gray-600 text-sm">Sign in to continue to your account</p>
        </div>
        
        <form onSubmit={handleSubmit} className="w-full">
          <div className="mb-6">
            <label className="block font-semibold text-sm text-gray-700 mb-2">Email or Username</label>
            <input 
              type="text" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              disabled={loading}
              className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 text-base transition-all duration-300 bg-gray-50 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 placeholder:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Enter your email or username"
            />
          </div>
          
          <div className="mb-4 relative">
            <label className="block font-semibold text-sm text-gray-700 mb-2">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                disabled={loading}
                className="w-full px-4 py-3.5 pr-12 rounded-xl border-2 border-gray-200 text-base transition-all duration-300 bg-gray-50 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 placeholder:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="Enter your password"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(s => !s)} 
                disabled={loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none text-indigo-600 cursor-pointer p-1 flex items-center justify-center transition-colors duration-200 hover:text-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          <div className="flex justify-end mb-6">
            <Link to="/forgot" className="text-indigo-600 text-sm font-medium hover:text-purple-600 hover:underline transition-colors duration-200">
              Forgot password?
            </Link>
          </div>
          
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700 text-sm font-medium animate-shake" role="alert">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="flex-shrink-0">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-base border-none cursor-pointer transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/50 hover:-translate-y-0.5 active:translate-y-0 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none mb-6"
          >
            {loading ? (
              <>
                <svg className="animate-spin-slow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" strokeOpacity="0.25"></circle>
                  <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"></path>
                </svg>
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>
        
        <div className="text-center pt-6 border-t border-gray-200 flex items-center justify-center gap-2">
          <span className="text-sm text-gray-600">Don't have an account?</span>
          <Link to="/register" className="text-indigo-600 font-semibold hover:text-purple-600 hover:underline transition-colors duration-200">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}
