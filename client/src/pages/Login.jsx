import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left branding panel */}
      <div className="auth-branding">
        <div className="auth-branding-content">
          <div className="auth-logo">
            <div className="auth-logo-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span>CrisisConnect</span>
          </div>
          <h2>Disaster Help &<br/>Resource Coordination</h2>
          <p>Coordinating relief operations for disaster management authorities and volunteer teams.</p>

          <div className="auth-features">
            <div className="auth-feature">
              <div className="auth-feature-icon">📋</div>
              <div>
                <strong>Request Management</strong>
                <span>Create, track, and manage relief requests</span>
              </div>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">🗺️</div>
              <div>
                <strong>Map Visualization</strong>
                <span>See disaster zones on interactive map</span>
              </div>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">👥</div>
              <div>
                <strong>Team Coordination</strong>
                <span>Assign volunteers to relief operations</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-form-panel">
        <div className="auth-card">
          <h1>Welcome back</h1>
          <p className="subtitle">Sign in to continue to your dashboard</p>

          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                className="form-control"
                placeholder="you@organization.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2, margin: 0, marginRight: 8 }}></div> Signing in...</>
              ) : 'Sign In →'}
            </button>
          </form>

          <div className="auth-link">
            New to CrisisConnect? <Link to="/register">Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
