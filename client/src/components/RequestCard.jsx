export default function RequestCard({ request, onClick }) {
  const priorityClass = request.priority === 'critical' ? 'badge-critical' : 'badge-normal';
  const statusClass = `badge-${request.status}`;

  return (
    <div className="request-item" onClick={onClick}>
      <div className="request-item-left">
        <h3>{request.title}</h3>
        <div className="request-meta">
          <span className={`badge badge-${request.category}`}>{request.category}</span>
          <span className={`badge ${priorityClass}`}>{request.priority}</span>
          <span className={`badge ${statusClass}`}>{request.status}</span>
          {request.location?.name && (
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              📍 {request.location.name}
            </span>
          )}
        </div>
      </div>
      <div className="request-item-right">
        {request.assignedTo && (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            → {request.assignedTo.name || 'Assigned'}
          </span>
        )}
      </div>
    </div>
  );
}
