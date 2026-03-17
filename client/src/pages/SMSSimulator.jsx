import { useState, useEffect } from 'react';
import api from '../api';

export default function SMSSimulator() {
  const [senderPhone, setSenderPhone] = useState('+91 9876543210');
  const [messageBody, setMessageBody] = useState('');
  const [result, setResult] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await api.get('/sms/logs');
      setLogs(res.data);
    } catch (err) {
      console.error('Failed to fetch SMS logs:', err);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const res = await api.post('/sms/incoming', { senderPhone, messageBody });
      setResult(res.data);
      setMessageBody('');
      fetchLogs();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process SMS');
    } finally {
      setLoading(false);
    }
  };

  const examples = [
    'HELP MEDICAL downtown near hospital',
    'HELP FOOD central market area',
    'HELP RESCUE river side flooding',
    'HELP WATER north district school',
    'HELP SHELTER east railway station',
  ];

  return (
    <div>
      <div className="page-header">
        <h1>📱 SMS Simulator</h1>
        <p>Simulate SMS-based emergency requests for low-connectivity scenarios</p>
      </div>

      <div className="grid-2" style={{ alignItems: 'flex-start' }}>
        {/* Send Form */}
        <div className="card">
          <h3 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>Send SMS</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>
            Format: <code style={{ color: 'var(--accent-primary)' }}>HELP [CATEGORY] [LOCATION]</code>
          </p>

          {error && <div className="error-msg">{error}</div>}

          <form onSubmit={handleSend}>
            <div className="form-group">
              <label>Sender Phone</label>
              <input
                className="form-control"
                value={senderPhone}
                onChange={(e) => setSenderPhone(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Message Body</label>
              <textarea
                className="form-control"
                placeholder="HELP MEDICAL downtown near hospital"
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                required
                rows={3}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Sending...' : '📤 Send SMS'}
            </button>
          </form>

          {/* Quick examples */}
          <div style={{ marginTop: '1rem' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Quick examples:</p>
            {examples.map((ex, i) => (
              <button
                key={i}
                className="btn btn-ghost btn-sm"
                style={{ margin: '0.2rem', fontSize: '0.75rem' }}
                onClick={() => setMessageBody(ex)}
              >
                {ex}
              </button>
            ))}
          </div>

          {/* Result */}
          {result && (
            <div className="sms-preview" style={{ marginTop: '1rem' }}>
              <div style={{ marginBottom: '0.5rem', color: result.parsed ? 'var(--success)' : 'var(--danger)' }}>
                {result.parsed ? '✅ SMS Parsed Successfully' : '❌ Failed to Parse SMS'}
              </div>
              {result.parsed && (
                <>
                  <div>Category: {result.parsed.category}</div>
                  <div>Location: {result.parsed.location.name}</div>
                  <div>Coords: ({result.parsed.location.lat}, {result.parsed.location.lng})</div>
                </>
              )}
              <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {result.message}
              </div>
            </div>
          )}
        </div>

        {/* SMS Logs */}
        <div className="card">
          <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>SMS Logs</h3>
          {logs.length > 0 ? (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Phone</th>
                    <th>Message</th>
                    <th>Status</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log._id}>
                      <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>{log.senderPhone}</td>
                      <td style={{ fontSize: '0.8rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {log.messageBody}
                      </td>
                      <td>
                        <span className={`badge ${log.parsedStatus === 'success' ? 'badge-completed' : 'badge-critical'}`}>
                          {log.parsedStatus}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {new Date(log.receivedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <p>No SMS logs yet. Send a simulated SMS to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
