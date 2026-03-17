import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import api from '../api';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons in Leaflet + Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function createIcon(color, size = 22) {
  return L.divIcon({
    className: '',
    html: `<div style="
      width: ${size}px; height: ${size}px;
      background: ${color};
      border: 3px solid rgba(255,255,255,0.9);
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.4), 0 0 12px ${color}44;
    "></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 2)],
  });
}

const ICONS = {
  critical: createIcon('#f24e4e', 26),
  normal: createIcon('#7c5cfc', 20),
};

const CAT_ICONS = {
  food: '🍚',
  water: '💧',
  medical: '🏥',
  shelter: '🏠',
  rescue: '🚨',
};

export default function MapView() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await api.get('/requests');
        setRequests(res.data);
      } catch (err) {
        console.error('Failed to fetch requests:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const center = [28.6139, 77.2090];

  const filteredRequests = filter === 'all'
    ? requests
    : requests.filter((r) => r.status === filter);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading map data...
      </div>
    );
  }

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1>🗺️ Disaster Map</h1>
          <p>Geographic view of all help requests</p>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {['all', 'pending', 'assigned', 'completed'].map((f) => (
            <button
              key={f}
              className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{
        display: 'flex', gap: '1.5rem', marginBottom: '0.75rem', fontSize: '0.82rem',
        color: 'var(--text-secondary)', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#f24e4e', border: '2px solid rgba(255,255,255,0.6)', boxShadow: '0 0 6px rgba(242,78,78,0.3)' }}></div>
          Critical
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#7c5cfc', border: '2px solid rgba(255,255,255,0.6)', boxShadow: '0 0 6px rgba(124,92,252,0.3)' }}></div>
          Normal
        </div>
        <div style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {filteredRequests.length} request{filteredRequests.length !== 1 ? 's' : ''}
        </div>
      </div>

      <MapContainer center={center} zoom={11} style={{ height: '520px', width: '100%', borderRadius: '14px' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {filteredRequests.map((req) => {
          if (!req.location?.lat || !req.location?.lng) return null;
          return (
            <Marker
              key={req._id}
              position={[req.location.lat, req.location.lng]}
              icon={ICONS[req.priority] || ICONS.normal}
            >
              <Popup>
                <div style={{ minWidth: 200, fontFamily: 'Inter, sans-serif' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.35rem' }}>
                    {CAT_ICONS[req.category] || '📋'} {req.title}
                  </div>
                  <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                    <span style={{
                      padding: '0.1rem 0.4rem', borderRadius: '10px', fontSize: '0.65rem',
                      fontWeight: 700, textTransform: 'uppercase', background: '#f0f0f0', color: '#333'
                    }}>
                      {req.category}
                    </span>
                    <span style={{
                      padding: '0.1rem 0.4rem', borderRadius: '10px', fontSize: '0.65rem',
                      fontWeight: 700, textTransform: 'uppercase',
                      background: req.priority === 'critical' ? '#fee2e2' : '#ede9fe',
                      color: req.priority === 'critical' ? '#b91c1c' : '#6d28d9'
                    }}>
                      {req.priority}
                    </span>
                    <span style={{
                      padding: '0.1rem 0.4rem', borderRadius: '10px', fontSize: '0.65rem',
                      fontWeight: 700, textTransform: 'uppercase',
                      background: req.status === 'completed' ? '#d1fae5' : req.status === 'assigned' ? '#dbeafe' : '#fef3c7',
                      color: req.status === 'completed' ? '#065f46' : req.status === 'assigned' ? '#1e40af' : '#92400e'
                    }}>
                      {req.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.15rem' }}>
                    📍 {req.location.name}
                  </div>
                  {req.description && (
                    <div style={{ fontSize: '0.78rem', color: '#999', lineHeight: '1.4' }}>
                      {req.description.slice(0, 120)}{req.description.length > 120 ? '...' : ''}
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
