import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'volunteer',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
          <h2>Join the Relief<br/>Network Today</h2>
          <p>Help coordinate disaster response operations as an administrator or volunteer.</p>

          <div className="auth-features">
            <div className="auth-feature">
              <div className="auth-feature-icon">🛡️</div>
              <div>
                <strong>Admin Role</strong>
                <span>Manage requests, assign teams, monitor ops</span>
              </div>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">🤝</div>
              <div>
                <strong>Volunteer Role</strong>
                <span>Accept tasks, update status, work in the field</span>
              </div>
            </div>
            <div className="auth-feature">
              <div className="auth-feature-icon">📱</div>
              <div>
                <strong>SMS Support</strong>
                <span>Requests can be submitted via structured SMS</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-form-panel">
        <div className="auth-card">
          <h1>Create account</h1>
          <p className="subtitle">Get started with CrisisConnect</p>

          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                className="form-control"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                className="form-control"
                placeholder="you@organization.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                className="form-control"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
              />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  name="role"
                  className="form-control"
                  value={form.role}
                  onChange={handleChange}
                >
                  <option value="volunteer">Volunteer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  className="form-control"
                  placeholder="+91 98765..."
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? (
                <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2, margin: 0, marginRight: 8 }}></div> Creating...</>
              ) : 'Create Account →'}
            </button>
          </form>

          <div className="auth-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
