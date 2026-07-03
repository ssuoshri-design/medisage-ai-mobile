import React, { useEffect } from "react";
import { motion } from "motion/react";
import { Heart, Droplet, Activity } from "lucide-react";
import { useAppStore } from "../store/useAppStore";

export default function VitalsTracker() {
  const { vitals, setVitals, isVitalsActive } = useAppStore();

  useEffect(() => {
    if (!isVitalsActive) return;

    const interval = setInterval(() => {
      // Simulate real-time biological micro-variations
      const bpmDelta = Math.random() > 0.5 ? 1 : -1;
      const o2Delta = Math.random() > 0.85 ? (Math.random() > 0.5 ? 1 : -1) : 0;

      const nextBpm = Math.max(68, Math.min(82, vitals.bpm + bpmDelta));
      const nextO2 = Math.max(96, Math.min(100, vitals.o2 + o2Delta));

      setVitals({ bpm: nextBpm, o2: nextO2 });
    }, 4000);

    return () => clearInterval(interval);
  }, [vitals, setVitals, isVitalsActive]);

  // SVG parameters
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const bpmProgress = (vitals.bpm / 120) * circumference;
  const o2Progress = (vitals.o2 / 100) * circumference;

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-[28px] p-4 shadow-sm">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center space-x-2">
          <Activity className="text-blue-500 animate-pulse" size={16} />
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Real-Time BioTelemetry
          </span>
        </div>
        <span className="text-[9px] font-extrabold tracking-widest bg-emerald-100 dark:bg-emerald-950/60 text-[#19C37D] px-2 py-0.5 rounded-full uppercase">
          Live Synced
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Heart Rate Indicator */}
        <div className="flex items-center space-x-3.5 bg-slate-50 dark:bg-slate-950/40 p-3.5 rounded-2xl border border-slate-200/20">
          <div className="relative flex items-center justify-center">
            {/* Circular Progress Gauge */}
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r={radius}
                className="stroke-slate-200 dark:stroke-slate-800 fill-none"
                strokeWidth="4"
              />
              <motion.circle
                cx="32"
                cy="32"
                r={radius}
                className="stroke-blue-500 fill-none"
                strokeWidth="4.5"
                strokeDasharray={circumference}
                animate={{ strokeDashoffset: circumference - bpmProgress }}
                transition={{ duration: 1 }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute">
              <Heart className="text-red-500 animate-pulse" size={18} />
            </div>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Heart Rate
            </span>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                {vitals.bpm}
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono">
                BPM
              </span>
            </div>
          </div>
        </div>

        {/* Oxygen Saturation */}
        <div className="flex items-center space-x-3.5 bg-slate-50 dark:bg-slate-950/40 p-3.5 rounded-2xl border border-slate-200/20">
          <div className="relative flex items-center justify-center">
            {/* Circular Progress Gauge */}
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r={radius}
                className="stroke-slate-200 dark:stroke-slate-800 fill-none"
                strokeWidth="4"
              />
              <motion.circle
                cx="32"
                cy="32"
                r={radius}
                className="stroke-[#19C37D] fill-none"
                strokeWidth="4.5"
                strokeDasharray={circumference}
                animate={{ strokeDashoffset: circumference - o2Progress }}
                transition={{ duration: 1 }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute">
              <Droplet className="text-cyan-500" size={18} />
            </div>
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Oxygen (O₂)
            </span>
            <div className="flex items-baseline space-x-1 mt-0.5">
              <span className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
                {vitals.o2}
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-mono">
                %
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
