import React, { useState } from "react";
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  AreaChart, 
  Area,
  ReferenceLine
} from "recharts";
import { 
  TrendingUp, 
  Heart, 
  Activity, 
  Calendar, 
  Plus, 
  CheckCircle2, 
  ShieldAlert 
} from "lucide-react";

// Mock historic medical data
const weeklyBioData = [
  { day: "Mon", bpm: 72, o2: 98, systolic: 120, diastolic: 80, glucose: 95 },
  { day: "Tue", bpm: 74, o2: 99, systolic: 118, diastolic: 78, glucose: 98 },
  { day: "Wed", bpm: 71, o2: 98, systolic: 121, diastolic: 82, glucose: 92 },
  { day: "Thu", bpm: 75, o2: 97, systolic: 124, diastolic: 84, glucose: 104 },
  { day: "Fri", bpm: 72, o2: 98, systolic: 119, diastolic: 79, glucose: 96 },
  { day: "Sat", bpm: 69, o2: 99, systolic: 116, diastolic: 76, glucose: 89 },
  { day: "Sun", bpm: 70, o2: 98, systolic: 118, diastolic: 77, glucose: 91 },
];

export default function AnalyticsView() {
  const [timeframe, setTimeframe] = useState<"1W" | "1M" | "3M">("1W");
  const [activeMetric, setActiveMetric] = useState<"vitals" | "bp" | "glucose">("vitals");

  return (
    <div className="flex-1 flex flex-col bg-[#F6F8FB] dark:bg-[#07111F] p-5 h-full overflow-y-auto select-none">
      
      {/* Title */}
      <div className="mb-5">
        <h2 className="text-xl font-extrabold tracking-tight text-[#07111F] dark:text-white font-sans">
          Clinimetrics & Analytics
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Secure, HIPAA-compliant diagnostic trend logs
        </p>
      </div>

      {/* Grid: Health Score & Highlights */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="col-span-1 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 p-3.5 rounded-2xl flex flex-col justify-between shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            Health Index
          </span>
          <div className="mt-2.5">
            <span className="text-3xl font-black text-[#19C37D] tracking-tight">98.4</span>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block mt-0.5">Optimal Range</span>
          </div>
        </div>

        <div className="col-span-1 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 p-3.5 rounded-2xl flex flex-col justify-between shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            Resting BPM
          </span>
          <div className="mt-2.5">
            <span className="text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tight">72.1</span>
            <span className="text-[10px] font-bold text-emerald-500 block mt-0.5">Stable</span>
          </div>
        </div>

        <div className="col-span-1 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 p-3.5 rounded-2xl flex flex-col justify-between shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
            Avg O₂
          </span>
          <div className="mt-2.5">
            <span className="text-3xl font-black text-cyan-500 tracking-tight">98.2%</span>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 block mt-0.5">Saturated</span>
          </div>
        </div>
      </div>

      {/* Tabs Selector & Timeframes */}
      <div className="bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200/40 dark:border-slate-800/60 mb-5 flex items-center justify-between shadow-sm">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveMetric("vitals")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeMetric === "vitals" 
                ? "bg-[#0B5FFF] text-white" 
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
            }`}
          >
            Heart & O₂
          </button>
          <button
            onClick={() => setActiveMetric("bp")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeMetric === "bp" 
                ? "bg-[#0B5FFF] text-white" 
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
            }`}
          >
            Pressure
          </button>
          <button
            onClick={() => setActiveMetric("glucose")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              activeMetric === "glucose" 
                ? "bg-[#0B5FFF] text-white" 
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
            }`}
          >
            Glucose
          </button>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl">
          {(["1W", "1M", "3M"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-2 py-1 text-[10px] font-bold rounded-lg transition ${
                timeframe === t 
                  ? "bg-white dark:bg-slate-900 text-[#0B5FFF] dark:text-white shadow-sm" 
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-600"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Main Charts Canvas Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 p-4 rounded-3xl shadow-sm flex-1 min-h-[280px] flex flex-col justify-between">
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <TrendingUp size={16} className="text-[#0B5FFF]" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {activeMetric === "vitals" && "Resting Heart Rate & Blood Oxygen Saturation"}
              {activeMetric === "bp" && "Systolic vs Diastolic Blood Pressure"}
              {activeMetric === "glucose" && "Glucose Trend Log (mg/dL)"}
            </span>
          </div>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 flex items-center space-x-1">
            <Calendar size={11} />
            <span>Mon 07/03 — Sun 07/09</span>
          </span>
        </div>

        {/* Charts Canvas */}
        <div className="flex-1 w-full h-full min-h-[190px]">
          {activeMetric === "vitals" && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyBioData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBpm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0B5FFF" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0B5FFF" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:opacity-10" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis domain={[60, 90]} tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <Tooltip />
                <ReferenceLine y={72} stroke="#19C37D" strokeDasharray="3 3" label={{ value: 'Ideal BPM', fill: '#19C37D', fontSize: 10, position: 'insideTopRight' }} />
                <Area type="monotone" dataKey="bpm" stroke="#0B5FFF" strokeWidth={2.5} fillOpacity={1} fill="url(#colorBpm)" name="Heart Rate (BPM)" />
              </AreaChart>
            </ResponsiveContainer>
          )}

          {activeMetric === "bp" && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyBioData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:opacity-10" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis domain={[60, 140]} tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <Tooltip />
                <ReferenceLine y={120} stroke="#94A3B8" strokeDasharray="3 3" label={{ value: 'Systolic Target', fill: '#94A3B8', fontSize: 10, position: 'insideTopRight' }} />
                <Line type="monotone" dataKey="systolic" stroke="#0B5FFF" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} name="Systolic" />
                <Line type="monotone" dataKey="diastolic" stroke="#3EC7FF" strokeWidth={2.5} dot={{ r: 4 }} name="Diastolic" />
              </LineChart>
            </ResponsiveContainer>
          )}

          {activeMetric === "glucose" && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyBioData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGlucose" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#19C37D" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#19C37D" stopOpacity={0.01}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:opacity-10" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis domain={[70, 120]} tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="glucose" stroke="#19C37D" strokeWidth={2.5} fillOpacity={1} fill="url(#colorGlucose)" name="Glucose Level" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Action recommendations banner */}
        <div className="flex items-center space-x-2.5 mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
          <CheckCircle2 size={16} className="text-[#19C37D] shrink-0" />
          <p className="text-[11px] text-emerald-800 dark:text-[#19C37D] font-medium leading-normal">
            <strong>Optimal Diagnostics Status</strong> — All recorded biometric signals are within acceptable, healthy boundaries.
          </p>
        </div>

      </div>

    </div>
  );
}
