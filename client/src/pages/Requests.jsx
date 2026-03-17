import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import RequestCard from '../components/RequestCard';
import LocationPicker from '../components/LocationPicker';

const CATEGORIES = ['food', 'water', 'medical', 'shelter', 'rescue'];
const PRIORITIES = ['normal', 'critical'];
const STATUSES = ['pending', 'assigned', 'completed'];

export default function Requests() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [requests, setRequests] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', category: '', priority: '', search: '' });

  // Modal states
  const [showCreate, setShowCreate] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [showAssign, setShowAssign] = useState(null);

  // Form state for create
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'food',
    priority: 'normal',
  });
  const [formLocation, setFormLocation] = useState({ name: '', lat: 0, lng: 0 });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchRequests();
    fetchVolunteers();
  }, []);

  const fetchRequests = async () => {
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.category) params.category = filters.category;
      if (filters.priority) params.priority = filters.priority;
      if (filters.search) params.search = filters.search;
      const res = await api.get('/requests', { params });
      setRequests(res.data);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchVolunteers = async () => {
    try {
      const res = await api.get('/volunteers');
      setVolunteers(res.data);
    } catch (err) {
      console.error('Failed to fetch volunteers:', err);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRequests();
    }, 300);
    return () => clearTimeout(timer);
  }, [filters]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!formLocation.lat && !formLocation.lng) {
      setFormError('Please select a location on the map');
      return;
    }
    try {
      await api.post('/requests', {
        title: form.title,
        description: form.description,
        category: form.category,
        priority: form.priority,
        location: formLocation,
      });
      setShowCreate(false);
      setForm({ title: '', description: '', category: 'food', priority: 'normal' });
      setFormLocation({ name: '', lat: 0, lng: 0 });
      fetchRequests();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create request');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/requests/${id}`, { status: newStatus });
      fetchRequests();
      setShowDetail(null);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleAssign = async (requestId, volunteerId) => {
    try {
      await api.put(`/requests/${requestId}/assign`, { volunteerId });
      fetchRequests();
      setShowAssign(null);
    } catch (err) {
      console.error('Failed to assign volunteer:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this request?')) return;
    try {
      await api.delete(`/requests/${id}`);
      fetchRequests();
      setShowDetail(null);
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>📋 Help Requests</h1>
          <p>Manage and track all disaster relief requests</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          + New Request
        </button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <input
          type="text"
          className="form-control"
          placeholder="🔍  Search title, location..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          style={{ minWidth: '220px' }}
        />
        <select
          className="form-control"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <select
          className="form-control"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
        <select
          className="form-control"
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
        >
          <option value="">All Priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Request List */}
      {loading ? (
        <div className="loading"><div className="spinner"></div> Loading...</div>
      ) : requests.length > 0 ? (
        <div className="request-list">
          {requests.map((req) => (
            <RequestCard key={req._id} request={req} onClick={() => setShowDetail(req)} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <p>No requests found matching your filters.</p>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
            <h2>Create Help Request</h2>
            {formError && <div className="error-msg">{formError}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Title</label>
                <input
                  className="form-control"
                  required
                  placeholder="e.g. Urgent medical supplies needed"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  className="form-control"
                  placeholder="Describe the situation and needs..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    className="form-control"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    className="form-control"
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Location</label>
                <LocationPicker value={formLocation} onChange={setFormLocation} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-ghost" onClick={() => setShowCreate(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && (
        <div className="modal-overlay" onClick={() => setShowDetail(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{showDetail.title}</h2>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <span className={`badge badge-${showDetail.category}`}>{showDetail.category}</span>
              <span className={`badge badge-${showDetail.priority === 'critical' ? 'critical' : 'normal'}`}>
                {showDetail.priority}
              </span>
              <span className={`badge badge-${showDetail.status}`}>{showDetail.status}</span>
              {showDetail.source === 'sms' && <span className="badge badge-assigned">via SMS</span>}
            </div>

            {showDetail.description && (
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem', lineHeight: '1.6' }}>
                {showDetail.description}
              </p>
            )}

            <div className="detail-info-grid">
              <div className="detail-info-item">
                <span className="detail-info-label">📍 Location</span>
                <span>{showDetail.location?.name || 'Unknown'}</span>
              </div>
              <div className="detail-info-item">
                <span className="detail-info-label">🌐 Coordinates</span>
                <span>{showDetail.location?.lat?.toFixed(4)}, {showDetail.location?.lng?.toFixed(4)}</span>
              </div>
              <div className="detail-info-item">
                <span className="detail-info-label">👤 Reported by</span>
                <span>{showDetail.reportedBy?.name || 'Unknown'}</span>
              </div>
              {showDetail.assignedTo && (
                <div className="detail-info-item">
                  <span className="detail-info-label">🙋 Assigned to</span>
                  <span>{showDetail.assignedTo.name}</span>
                </div>
              )}
              <div className="detail-info-item">
                <span className="detail-info-label">🕒 Created</span>
                <span>{new Date(showDetail.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="modal-actions" style={{ flexWrap: 'wrap' }}>
              {isAdmin && showDetail.status === 'pending' && (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => { setShowDetail(null); setShowAssign(showDetail); }}
                >
                  Assign Volunteer
                </button>
              )}
              {showDetail.status === 'assigned' && (
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => handleStatusChange(showDetail._id, 'completed')}
                >
                  ✓ Mark Completed
                </button>
              )}
              {isAdmin && (
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(showDetail._id)}
                >
                  Delete
                </button>
              )}
              <button className="btn btn-ghost btn-sm" onClick={() => setShowDetail(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Volunteer Modal */}
      {showAssign && (
        <div className="modal-overlay" onClick={() => setShowAssign(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Assign Volunteer</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
              Select a volunteer for: <strong>{showAssign.title}</strong>
            </p>
            {volunteers.length > 0 ? (
              <div className="request-list">
                {volunteers.map((vol) => (
                  <div
                    key={vol._id}
                    className="request-item"
                    onClick={() => handleAssign(showAssign._id, vol._id)}
                  >
                    <div className="request-item-left">
                      <h3>{vol.name}</h3>
                      <div className="request-meta">
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{vol.email}</span>
                        {vol.phone && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📞 {vol.phone}</span>}
                      </div>
                    </div>
                    <button className="btn btn-primary btn-sm">Assign</button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No volunteers registered yet.</p>
              </div>
            )}
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setShowAssign(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
