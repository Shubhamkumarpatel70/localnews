import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { post } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }
    setLoading(true);
    try {
      const res = await post('/api/auth/register', { username, email, password });
      login(res.user, res.token);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px rgba(0,0,0,0.10)', padding: '2.2rem 1.5rem', width: 340, maxWidth: '90vw', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 style={{ marginBottom: 18, fontWeight: 700, color: '#2196f3' }}>Register</h2>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 600 }}>Username</label><br />
            <input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              required 
              disabled={loading}
              style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc', fontSize: 15 }} 
            />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 600 }}>Email</label><br />
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              disabled={loading}
              style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc', fontSize: 15 }} 
            />
          </div>
          <div style={{ marginBottom: 10, position: 'relative' }}>
            <label style={{ fontWeight: 600 }}>Password</label><br />
            <input 
              type={showPassword ? 'text' : 'password'} 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              disabled={loading}
              style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc', fontSize: 15 }} 
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(s => !s)} 
              disabled={loading}
              style={{ position: 'absolute', right: 10, top: 34, background: 'none', border: 'none', color: '#2196f3', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontWeight: 600 }}>Confirm Password</label><br />
            <input 
              type={showPassword ? 'text' : 'password'} 
              value={confirmPassword} 
              onChange={e => setConfirmPassword(e.target.value)} 
              required 
              disabled={loading}
              style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #ccc', fontSize: 15 }} 
            />
          </div>
          {error && <div style={{ color: '#B71C1C', marginBottom: 10, fontWeight: 600 }}>{error}</div>}
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: 12, 
              borderRadius: 8, 
              background: loading ? '#ccc' : '#2196f3', 
              color: '#fff', 
              fontWeight: 700, 
              fontSize: 16, 
              border: 'none', 
              cursor: loading ? 'not-allowed' : 'pointer', 
              marginBottom: 10 
            }}
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <div style={{ fontSize: 14, color: '#888', marginTop: 10 }}>Already have an account? <Link to="/login" style={{ color: '#2196f3', fontWeight: 600 }}>Login</Link></div>
      </div>
    </div>
  );
} 