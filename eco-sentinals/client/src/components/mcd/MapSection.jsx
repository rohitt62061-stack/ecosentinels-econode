import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const WARDS = [
  { id: 'DL-OK-04', name: 'Okhla Industrial',    aqi: 312, pm25: 184, lat: 28.5500, lng: 77.2700, severity: 'critical' },
  { id: 'DL-CP-01', name: 'Connaught Place',      aqi:  62, pm25:  62, lat: 28.6300, lng: 77.2200, severity: 'moderate' },
  { id: 'DL-RO-07', name: 'Rohini Section 12',    aqi:  38, pm25:  38, lat: 28.7300, lng: 77.0700, severity: 'good'     },
  { id: 'DL-DW-10', name: 'Dwarka Sector 10',     aqi: 115, pm25: 115, lat: 28.5900, lng: 77.0500, severity: 'unhealthy'},
];

const SEVERITY_COLORS = {
  good:      '#22c55e',
  moderate:  '#eab308',
  unhealthy: '#f97316',
  critical:  '#ef4444',
};

const RecenterAutomatically = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
};

const MapSection = () => {
  const [hotspot, setHotspot] = useState(WARDS[0]);

  useEffect(() => {
    const id = setInterval(() => {
      setHotspot(prev => {
        const idx = WARDS.findIndex(w => w.id === prev.id);
        return WARDS[(idx + 1) % WARDS.length];
      });
    }, 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex-1 min-h-[500px] relative rounded-2xl overflow-hidden bg-surface-container shadow-[0_8px_30px_rgba(0,0,0,0.04)] group">
      
      {/* React Leaflet Map */}
      <MapContainer 
        center={[28.6139, 77.2090]} // Delhi
        zoom={11} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <RecenterAutomatically lat={hotspot.lat} lng={hotspot.lng} />
        {WARDS.map(ward => {
          const isActive = hotspot.id === ward.id;
          return (
            <CircleMarker
              key={ward.id}
              center={[ward.lat, ward.lng]}
              radius={isActive ? 12 : 8}
              pathOptions={{ color: 'white', weight: 2, fillColor: SEVERITY_COLORS[ward.severity], fillOpacity: 0.9 }}
              className={isActive ? "animate-pulse" : "transition-all duration-300"}
              eventHandlers={{ click: () => setHotspot(ward) }}
            >
              <Popup className="font-body text-sm text-slate-900 font-bold">
                {ward.name}<br />AQI: {ward.aqi}
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Stitch Overlays HUD */}
      <div className="absolute inset-0 map-gradient-overlay pointer-events-none z-10 mix-blend-multiply opacity-50"></div>
      
      {/* Map Legend (Bottom Left) */}
      <div className="absolute bottom-6 left-6 glass-panel px-5 py-4 rounded-xl shadow-lg flex flex-col gap-3 border border-white/40 z-20 pointer-events-auto backdrop-blur-md bg-white/60">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">AQI Gradient</p>
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-32 rounded-full bg-gradient-to-r from-emerald-400 via-yellow-400 to-red-600 shadow-inner"></div>
        </div>
        <div className="flex justify-between text-[9px] font-extrabold text-slate-600 tracking-wider">
          <span>GOOD</span>
          <span>CRITICAL</span>
        </div>
      </div>

      {/* Map Interaction Controls (Top Right) */}
      <div className="absolute top-6 right-6 flex flex-col gap-2 z-20 pointer-events-auto">
        <button className="w-10 h-10 glass-panel rounded-xl flex items-center justify-center shadow-md hover:bg-white transition-colors backdrop-blur-md bg-white/70 text-slate-700">
          <span className="material-symbols-outlined">add</span>
        </button>
        <button className="w-10 h-10 glass-panel rounded-xl flex items-center justify-center shadow-md hover:bg-white transition-colors backdrop-blur-md bg-white/70 text-slate-700">
          <span className="material-symbols-outlined">remove</span>
        </button>
        <button className="w-10 h-10 glass-panel rounded-xl flex items-center justify-center shadow-md hover:bg-white transition-colors backdrop-blur-md bg-white/70 text-slate-700">
          <span className="material-symbols-outlined">layers</span>
        </button>
      </div>

      {/* Data Point Floating Tooltip (Dynamic based on active hotspot) */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-slide-up">
        <div className="glass-panel px-6 py-3 rounded-2xl shadow-xl border border-white/60 backdrop-blur-lg bg-white/80 text-center">
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{hotspot.name}</p>
          <p className="text-sm font-extrabold text-slate-800 mt-0.5 tracking-tight">
            AQI: {hotspot.aqi} <span className="opacity-60 text-xs font-semibold">({hotspot.severity})</span>
          </p>
        </div>
      </div>
      
    </div>
  );
};

export default MapSection;
