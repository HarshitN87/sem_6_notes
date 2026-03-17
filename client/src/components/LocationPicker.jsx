import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const pinIcon = L.divIcon({
  className: '',
  html: `<div style="
    width: 28px; height: 28px;
    background: #6366f1;
    border: 3px solid #fff;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(99,102,241,0.5);
    position: relative;
  "><div style="
    position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%);
    width: 0; height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 8px solid #6366f1;
  "></div></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 36],
});

function ClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
  });
  return null;
}

export default function LocationPicker({ value, onChange }) {
  const [position, setPosition] = useState(
    value?.lat && value?.lng ? [value.lat, value.lng] : null
  );
  const [locationName, setLocationName] = useState(value?.name || '');

  const center = [28.6139, 77.2090]; // Default Delhi

  const handleMapClick = (latlng) => {
    setPosition([latlng.lat, latlng.lng]);
    onChange({
      name: locationName || `Lat ${latlng.lat.toFixed(4)}, Lng ${latlng.lng.toFixed(4)}`,
      lat: latlng.lat,
      lng: latlng.lng,
    });
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setLocationName(name);
    if (position) {
      onChange({ name, lat: position[0], lng: position[1] });
    }
  };

  return (
    <div className="location-picker">
      <div className="form-group">
        <label>Location Name</label>
        <input
          className="form-control"
          placeholder="e.g. Downtown near Central Park"
          value={locationName}
          onChange={handleNameChange}
        />
      </div>
      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
        📍 Click on the map to set the exact location
      </p>
      <MapContainer
        center={position || center}
        zoom={11}
        style={{ height: '220px', width: '100%', borderRadius: '8px', border: '1px solid var(--border)' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onLocationSelect={handleMapClick} />
        {position && <Marker position={position} icon={pinIcon} />}
      </MapContainer>
      {position && (
        <div style={{ fontSize: '0.78rem', color: 'var(--success)', marginTop: '0.4rem' }}>
          ✓ Selected: {position[0].toFixed(4)}, {position[1].toFixed(4)}
        </div>
      )}
    </div>
  );
}
