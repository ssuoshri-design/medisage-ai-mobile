import React, { useState, useEffect } from "react";
import { 
  Wifi, 
  Battery, 
  Signal, 
  Maximize2, 
  Minimize2, 
  Clock, 
  Heart, 
  ShieldAlert 
} from "lucide-react";

interface PhoneShellProps {
  children: React.ReactNode;
}

export default function PhoneShell({ children }: PhoneShellProps) {
  const [time, setTime] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(98);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12 || 12;
      setTime(`${hours}:${minutes} ${ampm}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setBatteryLevel((prev) => {
        if (prev <= 15) return 98; // simulated recharge
        return prev - 1;
      });
    }, 120000); // drain battery slowly
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center transition-colors duration-500 bg-slate-50 dark:bg-slate-950 p-0 md:p-4 font-sans`}>
      {/* Visual background ambient shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 dark:bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-400/10 dark:bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Control panel floating bar (only on medium/large screens) */}
      <div className="hidden md:flex items-center justify-between w-full max-w-sm mb-3 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm z-50">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">MediSage Cloud Synced</span>
        </div>
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="flex items-center space-x-1.5 px-2.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"
          title={isFullscreen ? "Show Phone Shell" : "Maximize Screen View"}
        >
          {isFullscreen ? (
            <>
              <Minimize2 size={13} />
              <span>Mobile Frame</span>
            </>
          ) : (
            <>
              <Maximize2 size={13} />
              <span>Full Width</span>
            </>
          )}
        </button>
      </div>

      {/* Simulator Container */}
      <div 
        id="phone-frame-main"
        className={`relative w-full transition-all duration-500 shadow-2xl flex flex-col overflow-hidden
          ${isFullscreen 
            ? "max-w-none h-screen rounded-none md:max-w-7xl md:h-[90vh] md:rounded-3xl border border-slate-200 dark:border-slate-800" 
            : "max-w-md h-screen md:h-[860px] md:rounded-[44px] border-[10px] border-slate-900 dark:border-slate-800"
          }
        `}
      >
        {/* Dynamic Island / Speaker notch (only in mobile shell view) */}
        {!isFullscreen && (
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-full z-50 flex items-center justify-center pointer-events-none">
            <div className="w-12 h-1 bg-slate-800 rounded-full absolute top-1" />
            <div className="w-2.5 h-2.5 bg-slate-950 rounded-full border border-slate-900/50 absolute right-4 flex items-center justify-center">
              <div className="w-1 h-1 bg-blue-900 rounded-full" />
            </div>
          </div>
        )}

        {/* Mobile Status Bar */}
        <div className="w-full h-11 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md px-6 flex items-center justify-between text-slate-800 dark:text-slate-200 font-sans font-semibold text-[13px] z-40 shrink-0 pointer-events-none select-none">
          <div className="flex items-center space-x-1.5">
            <Clock size={13} className="text-blue-600 dark:text-blue-400" />
            <span>{time}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Signal size={13} />
            <span className="text-[10px] font-mono tracking-wider">MediNet 5G</span>
            <Wifi size={13} />
            <div className="flex items-center space-x-0.5">
              <span className="text-[10px] font-mono">{batteryLevel}%</span>
              <Battery size={15} className={batteryLevel < 20 ? "text-red-500" : "text-emerald-500"} />
            </div>
          </div>
        </div>

        {/* Inner Content Area */}
        <div className="flex-1 w-full bg-[#F6F8FB] dark:bg-[#07111F] text-slate-900 dark:text-slate-100 relative flex flex-col overflow-hidden">
          {children}
        </div>

        {/* Home Indicator bar (only in phone mode) */}
        {!isFullscreen && (
          <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-slate-400 dark:bg-slate-600 rounded-full z-50 pointer-events-none" />
        )}
      </div>
    </div>
  );
}
