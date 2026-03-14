import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useTheme } from '../../context/ThemeContext';
import { wardData } from '../../data/mockData';
import { Layers } from 'lucide-react';

// Centers map dynamically based on markers
function MapUpdater({ markers }) {
  const map = useMap();
  useEffect(() => {
    if (markers.length > 0) {
      // Rough bounds centered on Delhi
      map.setView([28.6139, 77.2090], 11);
    }
  }, [map, markers]);
  return null;
}

const InteractiveWardMap = () => {
  const { theme } = useTheme();
  const [activeLayer, setActiveLayer] = useState('aqi'); // 'aqi' | 'waste'

  // URL Templates based on theme
  // Standard OSM for light mode
  const lightTileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  // CartoDB Dark Matter for dark mode
  const darkTileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

  const tileUrl = theme === 'dark' ? darkTileUrl : lightTileUrl;

  const getMarkerColor = (ward) => {
    if (activeLayer === 'aqi') {
      if (ward.aqi > 300) return '#E76F51'; // Danger Coral
      if (ward.aqi > 200) return '#E36414'; // Warning Orange
      if (ward.aqi > 100) return '#E9C46A'; // Moderate Yellow
      return '#2A9D8F'; // Success Teal
    } else {
      // Waste fill levels
      if (ward.wasteLevel > 90) return '#E76F51';
      if (ward.wasteLevel > 70) return '#FB8B24';
      return '#2A9D8F';
    }
  };

  return (
    <div className="relative h-full w-full flex flex-col">
      {/* Map Header Overlay */}
      <div className="absolute top-4 left-4 z-[400] bg-white/90 dark:bg-mcd-dark-surface/90 backdrop-blur-md px-4 py-3 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
          <Layers size={16} className="text-mcd-primary" /> Active Overlay
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveLayer('aqi')}
            className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${
              activeLayer === 'aqi'
                ? 'bg-mcd-primary text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            AQI Sensor Data
          </button>
          <button
            onClick={() => setActiveLayer('waste')}
            className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${
              activeLayer === 'waste'
                ? 'bg-mcd-accent text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Waste Fill
          </button>
        </div>
      </div>

      <div className="flex-1 w-full bg-slate-100 dark:bg-slate-900 relative">
        <MapContainer
          center={[28.6139, 77.2090]}
          zoom={11}
          style={{ height: '100%', width: '100%', zIndex: 10 }}
          zoomControl={false}
        >
          <TileLayer
            url={tileUrl}
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapUpdater markers={wardData} />

          {wardData.map((ward) => (
            <CircleMarker
              key={ward.id}
              center={ward.coordinates}
              radius={Math.max(12, (activeLayer === 'aqi' ? ward.aqi / 15 : ward.wasteLevel / 4))}
              pathOptions={{
                color: getMarkerColor(ward),
                fillColor: getMarkerColor(ward),
                fillOpacity: 0.6,
                weight: 2
              }}
            >
              <Popup className="custom-popup">
                <div className="p-2 font-sans">
                  <h4 className="font-bold text-lg mb-1">{ward.name}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                    <div>
                      <p className="text-slate-500 font-semibold mb-1">AQI Status</p>
                      <p className="font-mono font-bold text-mcd-primary text-xl">{ward.aqi}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 font-semibold mb-1">Waste Fullness</p>
                      <p className="font-mono font-bold text-mcd-accent text-xl">{ward.wasteLevel}%</p>
                    </div>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* Custom CSS overrides for Leaflet popups inside current application scope */}
      <style>{`
        .leaflet-popup-content-wrapper {
          border-radius: 0.75rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        }
        .dark .leaflet-popup-content-wrapper {
          background-color: #132F4C;
          color: white;
          border: 1px solid #1E293B;
        }
        .dark .leaflet-popup-tip {
          background-color: #132F4C;
        }
        .dark .leaflet-container a.leaflet-popup-close-button {
          color: #fff;
        }
      `}</style>
    </div>
  );
};

export default InteractiveWardMap;
