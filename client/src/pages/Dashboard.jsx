import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import RequestCard from '../components/RequestCard';

const CAT_COLORS = {
  food: '#f0a030',
  water: '#38a5f6',
  medical: '#f24e4e',
  shelter: '#a78bfa',
  rescue: '#fb923c',
};

const CAT_ICONS = {
  food: '🍚',
  water: '💧',
  medical: '🏥',
  shelter: '🏠',
  rescue: '🚨',
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading dashboard...
      </div>
    );
  }

  if (!stats) {
    return <div className="empty-state">Failed to load dashboard data.</div>;
  }

  const maxCat = Math.max(...(stats.categoryStats?.map((c) => c.count) || [1]), 1);
  const totalPriority = (stats.priority.critical + stats.priority.normal) || 1;
  const critPercent = Math.round((stats.priority.critical / totalPriority) * 100);

  return (
    <div className="dashboard">
      {/* Welcome banner */}
      <div className="dash-welcome">
        <div className="dash-welcome-text">
          <h1>Welcome back, {user?.name?.split(' ')[0] || 'Admin'} 👋</h1>
          <p>Here's the latest overview of disaster relief operations.</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/requests')}>
          + New Request
        </button>
      </div>

      {/* Stats Grid */}
      <div className="dash-stats">
        <div className="dash-stat-card">
          <div className="dash-stat-icon" style={{ background: 'rgba(124,92,252,0.12)', color: '#7c5cfc' }}>📋</div>
          <div className="dash-stat-info">
            <span className="dash-stat-value">{stats.total}</span>
            <span className="dash-stat-label">Total Requests</span>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-icon" style={{ background: 'rgba(240,160,48,0.12)', color: '#f0a030' }}>⏳</div>
          <div className="dash-stat-info">
            <span className="dash-stat-value">{stats.pending}</span>
            <span className="dash-stat-label">Pending</span>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-icon" style={{ background: 'rgba(56,165,246,0.12)', color: '#38a5f6' }}>🔄</div>
          <div className="dash-stat-info">
            <span className="dash-stat-value">{stats.assigned}</span>
            <span className="dash-stat-label">Assigned</span>
          </div>
        </div>
        <div className="dash-stat-card">
          <div className="dash-stat-icon" style={{ background: 'rgba(52,211,153,0.12)', color: '#34d399' }}>✅</div>
          <div className="dash-stat-info">
            <span className="dash-stat-value">{stats.completed}</span>
            <span className="dash-stat-label">Completed</span>
          </div>
        </div>
      </div>

      {/* Middle Row */}
      <div className="dash-mid-row">
        {/* Priority Ring */}
        <div className="card dash-priority-card">
          <h3>Priority Breakdown</h3>
          <div className="dash-priority-ring-wrapper">
            <div className="dash-priority-ring">
              <svg viewBox="0 0 120 120" width="140" height="140">
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border)" strokeWidth="12" />
                <circle
                  cx="60" cy="60" r="50" fill="none"
                  stroke="#f24e4e" strokeWidth="12"
                  strokeDasharray={`${critPercent * 3.14} ${(100 - critPercent) * 3.14}`}
                  strokeDashoffset="78.5"
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 1s ease' }}
                />
              </svg>
              <div className="dash-priority-ring-center">
                <span>{stats.total}</span>
                <small>total</small>
              </div>
            </div>
            <div className="dash-priority-legend">
              <div className="dash-priority-legend-item">
                <span className="dash-dot" style={{ background: '#f24e4e' }}></span>
                <span>Critical</span>
                <strong>{stats.priority.critical}</strong>
              </div>
              <div className="dash-priority-legend-item">
                <span className="dash-dot" style={{ background: '#7c5cfc' }}></span>
                <span>Normal</span>
                <strong>{stats.priority.normal}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="card dash-category-card">
          <h3>Category Breakdown</h3>
          <div className="category-bar-wrapper">
            {stats.categoryStats && stats.categoryStats.length > 0 ? (
              stats.categoryStats.map((cat) => (
                <div key={cat._id} className="category-bar-item">
                  <span className="cat-emoji">{CAT_ICONS[cat._id] || '📦'}</span>
                  <span className="cat-label">{cat._id}</span>
                  <div className="cat-bar">
                    <div
                      className="cat-bar-fill"
                      style={{
                        width: `${(cat.count / maxCat) * 100}%`,
                        background: CAT_COLORS[cat._id] || '#7c5cfc',
                      }}
                    />
                  </div>
                  <span className="cat-count">{cat.count}</span>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem' }}>
                No requests yet — data will appear here.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card dash-recent">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>Recent Requests</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/requests')}>View all →</button>
        </div>
        {stats.recentRequests?.length > 0 ? (
          <div className="request-list">
            {stats.recentRequests.map((req) => (
              <RequestCard key={req._id} request={req} onClick={() => navigate('/requests')} />
            ))}
          </div>
        ) : (
          <div className="empty-state" style={{ padding: '2rem' }}>
            <div className="empty-icon">📭</div>
            <p style={{ marginBottom: '1rem' }}>No requests yet.</p>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/requests')}>
              Create your first request
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
