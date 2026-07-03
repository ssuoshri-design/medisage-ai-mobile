import React, { useEffect } from "react";
import { motion } from "motion/react";
import { Activity, ShieldCheck, Stethoscope } from "lucide-react";

interface SplashProps {
  onComplete: () => void;
}

export default function Splash({ onComplete }: SplashProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="flex-1 flex flex-col items-center justify-between bg-[#F6F8FB] dark:bg-[#07111F] p-8 h-full relative select-none">
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Animated Brand Logo Mark */}
        <div className="relative mb-6">
          <motion.div
            animate={{
              scale: [1, 1.1, 0.95, 1.05, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-[#0B5FFF] to-[#3EC7FF] flex items-center justify-center shadow-lg shadow-blue-500/20 dark:shadow-blue-500/10 border border-white/20"
          >
            <Stethoscope className="text-white" size={44} />
          </motion.div>

          {/* Dynamic pulse ripples */}
          <span className="absolute inset-0 rounded-3xl bg-blue-500/20 -z-10 animate-ping opacity-60 scale-125" />
          <span className="absolute inset-2 rounded-3xl bg-cyan-400/10 -z-10 animate-pulse scale-110" />
        </div>

        {/* Text Headers */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-4xl font-bold tracking-tight text-[#07111F] dark:text-white text-center font-sans"
        >
          MediSage <span className="text-[#0B5FFF]">AI</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2 text-center max-w-[280px]"
        >
          Clinical Intelligence & Symptom Consultation Engine
        </motion.p>
      </div>

      {/* Footer HIPAA Security Details */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.5 }}
        className="w-full flex flex-col items-center space-y-2 mt-auto"
      >
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50">
          <ShieldCheck className="text-[#19C37D]" size={13} />
          <span className="text-[11px] font-semibold text-emerald-800 dark:text-[#19C37D] tracking-wide uppercase">
            HIPAA Compliant Protocol
          </span>
        </div>

        <div className="flex items-center space-x-1 text-slate-400 dark:text-slate-500 text-[10px] font-mono">
          <Activity size={10} className="text-blue-500 animate-pulse" />
          <span>v2.4.0 — Secure Encrypted Sync</span>
        </div>
      </motion.div>
    </div>
  );
}
