import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { AlertTriangle, Activity, Map as MapIcon, ShieldAlert } from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

// Mock data for Delhi Wards
const MOCK_WARDS = [
    { id: 1, name: 'Connaught Place', aqi: 45, positions: [[28.6331, 77.2185], [28.6331, 77.2285], [28.6231, 77.2285], [28.6231, 77.2185]] },
    { id: 2, name: 'Okhla', aqi: 320, positions: [[28.5630, 77.2885], [28.5630, 77.2985], [28.5530, 77.2985], [28.5530, 77.2885]] },
    { id: 3, name: 'Dwarka', aqi: 150, positions: [[28.5830, 77.0485], [28.5830, 77.0585], [28.5730, 77.0585], [28.5730, 77.0485]] },
    { id: 4, name: 'Rohini', aqi: 280, positions: [[28.7330, 77.1185], [28.7330, 77.1285], [28.7230, 77.1285], [28.7230, 77.1185]] },
];

const MOCK_CHART_DATA = [
    { time: '08:00', aqi: 150 },
    { time: '10:00', aqi: 180 },
    { time: '12:00', aqi: 220 },
    { time: '14:00', aqi: 310 },
    { time: '16:00', aqi: 320 },
    { time: '18:00', aqi: 290 },
];

const getAQIColor = (aqi) => {
    if (aqi < 50) return '#10b981'; // green-500
    if (aqi < 100) return '#eab308'; // yellow-500
    if (aqi < 200) return '#f97316'; // orange-500
    if (aqi < 300) return '#ef4444'; // red-500
    return '#8b5cf6'; // violet-500
};

export default function MCDDashboard() {
    const [alerts, setAlerts] = useState([]);

    useEffect(() => {
        // Simulate polling for policy alerts
        const interval = setInterval(() => {
            const highAqiWard = MOCK_WARDS.find(w => w.aqi > 300);
            if (highAqiWard) {
                setAlerts([{
                    id: Date.now(),
                    ward: highAqiWard.name,
                    message: `Deploy Sprinklers immediately (Article 21 Compliance) - AQI ${highAqiWard.aqi}`
                }]);
            }
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex h-[calc(100vh-4rem)]">
            {/* Sidebar */}
            <div className="w-96 bg-slate-900 border-r border-slate-800 flex flex-col pt-6 pb-2 relative overflow-hidden">
                {/* Glow effect */}
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-emerald-500/10 blur-3xl mix-blend-screen pointer-events-none" />

                <div className="px-6 mb-6 z-10">
                    <h2 className="text-sm font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-2">
                        <ShieldAlert size={16} className="text-emerald-400" />
                        74th Amendment
                    </h2>
                    <h1 className="text-2xl font-bold mt-1 text-slate-100">Municipal Governance</h1>
                    <p className="text-xs text-slate-500 mt-1">Real-time Constituent Data Stream</p>
                </div>

                <div className="flex-1 overflow-y-auto px-6 space-y-6 z-10 custom-scrollbar">

                    {/* Article 21 Compliance Monitor */}
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 backdrop-blur-sm">
                        <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2 mb-4">
                            <Activity size={16} className="text-blue-400" />
                            Article 21 Compliance Monitor
                        </h3>

                        {alerts.length > 0 ? (
                            <div className="space-y-3">
                                {alerts.map(alert => (
                                    <div key={alert.id} className="bg-red-500/10 border border-red-500/20 p-3 rounded-lg flex items-start gap-3 relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <AlertTriangle size={18} className="text-red-400 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-xs font-semibold text-red-400">{alert.ward}</p>
                                            <p className="text-sm text-red-200 mt-1 leading-snug">{alert.message}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-slate-500 text-sm flex flex-col items-center">
                                <ShieldAlert size={24} className="mb-2 opacity-50 text-emerald-500" />
                                All wards within safe limits.
                            </div>
                        )}
                    </div>

                    {/* Regional AQI Trend */}
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 backdrop-blur-sm">
                        <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2 mb-4">
                            <MapIcon size={16} className="text-violet-400" />
                            Delhi Regional Trend (PM2.5)
                        </h3>
                        <div className="h-48 w-full -ml-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={MOCK_CHART_DATA}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickMargin={10} />
                                    <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 500]} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem' }}
                                        itemStyle={{ color: '#e2e8f0' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="aqi"
                                        stroke="#10b981"
                                        strokeWidth={2}
                                        dot={{ fill: '#0f172a', stroke: '#10b981', strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6, fill: '#10b981' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                </div>
            </div>

            {/* Main Map Area */}
            <div className="flex-1 relative bg-slate-950 z-0">
                <MapContainer
                    center={[28.6139, 77.2090]}
                    zoom={11}
                    style={{ height: '100%', width: '100%' }}
                    className="z-0"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {MOCK_WARDS.map((ward) => (
                        <Polygon
                            key={ward.id}
                            positions={ward.positions}
                            pathOptions={{
                                color: getAQIColor(ward.aqi),
                                fillColor: getAQIColor(ward.aqi),
                                fillOpacity: 0.4,
                                weight: 2
                            }}
                        >
                            <Popup className="custom-popup">
                                <div className="p-1">
                                    <h4 className="font-bold text-slate-800 mb-1">{ward.name}</h4>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-500">AQI:</span>
                                        <span className={`font-semibold px-2 py-0.5 rounded text-white`} style={{ backgroundColor: getAQIColor(ward.aqi) }}>
                                            {ward.aqi}
                                        </span>
                                    </div>
                                </div>
                            </Popup>
                        </Polygon>
                    ))}
                </MapContainer>

                {/* Overlay Status Bar */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] bg-slate-900/80 backdrop-blur-md px-6 py-3 rounded-full border border-slate-700 shadow-2xl flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-medium text-slate-300">Live Telemetry Active</span>
                    </div>
                    <div className="w-px h-4 bg-slate-700" />
                    <div className="text-xs text-slate-400">
                        Connected Nodes: <span className="text-emerald-400 font-mono">250/250</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
