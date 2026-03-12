import React, { useState } from 'react';
import { Award, Flame, Leaf, Wind, ShieldCheck, Camera, Share2 } from 'lucide-react';

export default function CitizenApp() {
    const [points, setPoints] = useState(1250);
    const [streak, setStreak] = useState(14);
    const [isScanning, setIsScanning] = useState(false);

    const handleScan = () => {
        setIsScanning(true);
        // Simulate classification delay
        setTimeout(() => {
            setIsScanning(false);
            setPoints(prev => prev + 50);
            setStreak(prev => prev + 1);
        }, 2000);
    };

    return (
        <div className="max-w-md mx-auto min-h-[calc(100vh-4rem)] bg-slate-950 pb-20 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-br from-emerald-900/40 via-teal-900/20 to-transparent -z-10" />
            <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl -z-10" />

            {/* Header */}
            <div className="p-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700/50 mb-4 backdrop-blur-md">
                    <ShieldCheck size={14} className="text-emerald-400" />
                    <span className="text-xs font-semibold text-slate-300">Swachh Bharat 2.0 Sentinel</span>
                </div>

                <div className="flex items-end justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-200">
                            Welcome, Rahul
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">Connaught Place, Ward 1</p>
                    </div>
                    <div className="w-12 h-12 rounded-full border-2 border-emerald-500/50 bg-slate-800 flex items-center justify-center overflow-hidden">
                        <img src="https://i.pravatar.cc/150?u=rahul" alt="Profile" className="w-full h-full object-cover" />
                    </div>
                </div>
            </div>

            {/* Hero Stats */}
            <div className="px-6 grid grid-cols-2 gap-4 mb-8">
                <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-4 backdrop-blur-md relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-bl-full -z-10" />
                    <div className="flex items-center gap-2 mb-2">
                        <Award className="text-emerald-400" size={20} />
                        <span className="text-sm font-medium text-slate-400">Impact Points</span>
                    </div>
                    <div className="text-3xl font-bold text-white tracking-tight">{points.toLocaleString()}</div>
                    <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                        <span>+150 this week</span>
                    </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-4 backdrop-blur-md relative overflow-hidden group hover:border-orange-500/50 transition-colors">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-orange-500/10 rounded-bl-full -z-10" />
                    <div className="flex items-center gap-2 mb-2">
                        <Flame className="text-orange-400" size={20} />
                        <span className="text-sm font-medium text-slate-400">Segregation Streak</span>
                    </div>
                    <div className="text-3xl font-bold text-white tracking-tight">{streak} <span className="text-xl text-slate-500 font-normal">days</span></div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <span>Top 5% in your ward</span>
                    </div>
                </div>
            </div>

            {/* Live AQI Widget */}
            <div className="px-6 mb-8">
                <div className="bg-gradient-to-r from-emerald-900/40 to-slate-900/80 border border-emerald-500/20 rounded-2xl p-5 backdrop-blur-md">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2">
                            <Wind size={16} className="text-emerald-400" />
                            Hyper-Local Air Quality
                        </h3>
                        <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                            SAFE
                        </span>
                    </div>

                    <div className="flex items-end gap-4">
                        <div className="text-5xl font-bold text-white tracking-tighter">45</div>
                        <div className="mb-1">
                            <div className="text-sm font-medium text-slate-300">PM2.5 Level (µg/m³)</div>
                            <div className="text-xs text-slate-400">Your Ward is Safe</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Button */}
            <div className="px-6 mt-12 flex flex-col items-center">
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full blur opacity-70 group-hover:opacity-100 transition duration-200" />
                    <button
                        onClick={handleScan}
                        disabled={isScanning}
                        className="relative bg-slate-900 border-2 border-emerald-500/50 rounded-full w-32 h-32 flex flex-col items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {isScanning ? (
                            <>
                                <div className="w-8 h-8 rounded-full border-4 border-slate-700 border-t-emerald-400 animate-spin" />
                                <span className="text-xs font-semibold text-emerald-400">Analyzing App...</span>
                            </>
                        ) : (
                            <>
                                <Camera size={32} className="text-emerald-400" />
                                <span className="font-bold text-slate-200">Scan Waste</span>
                            </>
                        )}
                    </button>
                </div>
                <p className="text-sm text-slate-400 mt-6 text-center px-4">
                    Scan your segregated waste to earn points and help reduce landfill overflow.
                </p>
            </div>

        </div>
    );
}
