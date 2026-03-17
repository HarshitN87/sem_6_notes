export default function StatsCard({ icon, label, value, color }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{ color: color || 'var(--text-primary)' }}>
        {value}
      </div>
    </div>
  );
}
