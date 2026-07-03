import React, { useState } from "react";
import { 
  Settings, 
  Moon, 
  Sun, 
  ShieldCheck, 
  Bell, 
  Info, 
  LogOut, 
  RefreshCw, 
  Trash2, 
  Flame, 
  Lock,
  Database,
  Volume2
} from "lucide-react";
import { useAppStore } from "../store/useAppStore";

export default function SettingsView() {
  const { 
    isDarkMode, 
    setDarkMode, 
    setUser, 
    setAuthenticated, 
    clearAllSessions 
  } = useAppStore();

  const [hipaaConsent, setHipaaConsent] = useState(true);
  const [notifyConsent, setNotifyConsent] = useState(true);
  const [audioDictationConsent, setAudioDictationConsent] = useState(true);
  const [isResetting, setIsResetting] = useState(false);

  const handleResetApp = () => {
    if (confirm("Are you sure you want to permanently clear all consultation history, local caches, and log files? This cannot be undone.")) {
      setIsResetting(true);
      setTimeout(() => {
        clearAllSessions();
        setIsResetting(false);
        alert("Consultation database purged successfully.");
      }, 1500);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setAuthenticated(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F6F8FB] dark:bg-[#07111F] p-5 h-full overflow-y-auto select-none">
      
      {/* Title */}
      <div className="mb-5">
        <h2 className="text-xl font-extrabold tracking-tight text-[#07111F] dark:text-white font-sans">
          Secure Portal Settings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Configure security credentials, telemetry, and system options
        </p>
      </div>

      {/* Settings Grid list */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 rounded-3xl p-5 shadow-sm space-y-6">
        
        {/* Appearance Row */}
        <div>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2.5 px-1">
            Display Settings
          </span>
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/20 rounded-2xl">
            <div className="flex items-center space-x-3">
              {isDarkMode ? (
                <Moon className="text-[#3EC7FF]" size={18} />
              ) : (
                <Sun className="text-amber-500" size={18} />
              )}
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white leading-tight">Dark Mode Theme</h4>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">Optimized for night duty and fatigue reduction</p>
              </div>
            </div>
            
            <button
              onClick={() => setDarkMode(!isDarkMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isDarkMode ? "bg-blue-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isDarkMode ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Security & HIPAA */}
        <div>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2.5 px-1">
            Privacy & HIPAA Compliance
          </span>
          <div className="space-y-2.5">
            
            {/* HIPAA Log Toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/20 rounded-2xl">
              <div className="flex items-center space-x-3">
                <ShieldCheck className="text-emerald-500" size={18} />
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white leading-tight">Secure Telemetry Logs</h4>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">All transmissions are protected with AES-256 layers</p>
                </div>
              </div>
              
              <button
                onClick={() => setHipaaConsent(!hipaaConsent)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  hipaaConsent ? "bg-emerald-500" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    hipaaConsent ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Notifications toggle */}
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/20 rounded-2xl">
              <div className="flex items-center space-x-3">
                <Bell className="text-[#0B5FFF]" size={18} />
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white leading-tight">Patient Urgent Alerts</h4>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">Push telemetry notifications for risk alerts</p>
                </div>
              </div>
              
              <button
                onClick={() => setNotifyConsent(!notifyConsent)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifyConsent ? "bg-blue-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifyConsent ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Simulated Microphone / Dictation permissions */}
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950/40 border border-slate-200/20 rounded-2xl">
              <div className="flex items-center space-x-3">
                <Volume2 className="text-purple-500" size={18} />
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white leading-tight">Dictation Voice Transcribe</h4>
                  <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">Enable secure local speech-to-text dictation</p>
                </div>
              </div>
              
              <button
                onClick={() => setAudioDictationConsent(!audioDictationConsent)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  audioDictationConsent ? "bg-purple-500" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    audioDictationConsent ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

          </div>
        </div>

        {/* Database administration */}
        <div>
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2.5 px-1">
            Database Administration
          </span>
          <div className="space-y-2">
            <button
              onClick={handleResetApp}
              disabled={isResetting}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40 text-xs font-bold rounded-2xl transition cursor-pointer"
            >
              {isResetting ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Trash2 size={14} />
              )}
              <span>Purge Consultation History</span>
            </button>
          </div>
        </div>

        {/* Logout Row */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60">
          <button
            onClick={handleLogout}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-950 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-2xl flex items-center justify-center space-x-2 transition cursor-pointer"
          >
            <LogOut size={15} className="text-red-500" />
            <span>Secure Logout Session</span>
          </button>
        </div>

      </div>

      {/* Build Details */}
      <div className="mt-5 p-4 bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800/60 rounded-3xl flex items-center space-x-3">
        <Info size={18} className="text-slate-400" />
        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
          <p><strong>System Core:</strong> MediSage AI Build v2.4.0</p>
          <p className="mt-0.5"><strong>Cloud Sync:</strong> active via Firestore (Database: ai-studio-...)</p>
        </div>
      </div>

    </div>
  );
}
