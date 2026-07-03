import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Plus, 
  MessageSquare, 
  History, 
  FileText, 
  BarChart2, 
  Settings, 
  Moon, 
  Sun, 
  ShieldCheck, 
  HelpCircle, 
  LogOut, 
  X,
  Trash2,
  Pin,
  Edit2,
  Check
} from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { ChatSession } from "../types";

export default function DrawerMenu() {
  const { 
    user,
    sessions, 
    currentSessionId, 
    isDrawerOpen, 
    isDarkMode, 
    activeView,
    setDrawerOpen, 
    setDarkMode, 
    setActiveView,
    createSession,
    setCurrentSessionId,
    deleteSession,
    togglePinSession,
    renameSession,
    setSessions,
    setUser,
    setAuthenticated
  } = useAppStore();

  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const handleNewConsultation = async () => {
    const newChatId = await createSession(`Consultation ${sessions.length + 1}`);
    setDrawerOpen(false);
    setActiveView("consult");
  };

  const handleSelectSession = (id: string) => {
    setCurrentSessionId(id);
    setActiveView("consult");
    setDrawerOpen(false);
  };

  const handleStartRename = (e: React.MouseEvent, session: ChatSession) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditTitle(session.title);
  };

  const handleSaveRename = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      await renameSession(id, editTitle);
    }
    setEditingSessionId(null);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to permanently delete this clinical consultation history?")) {
      await deleteSession(id);
    }
  };

  const handlePin = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await togglePinSession(id);
  };

  const handleLogout = () => {
    setUser(null);
    setAuthenticated(false);
    setDrawerOpen(false);
  };

  if (!isDrawerOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex overflow-hidden">
      {/* Background Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        onClick={() => setDrawerOpen(false)}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Container */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="relative w-[300px] max-w-[85%] h-full bg-white dark:bg-slate-900 border-r border-slate-200/50 dark:border-slate-800/50 shadow-2xl flex flex-col justify-between overflow-hidden"
      >
        {/* Top Header Section with Doctor profile */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={user?.avatarUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150&h=150"}
                  alt="Doctor avatar"
                  className="w-12 h-12 rounded-2xl object-cover border-2 border-blue-500/30 shadow-md"
                  onError={(e) => {
                    // Fallback to stylized SVG placeholder if asset fails to load
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=150&h=150";
                  }}
                />
                <span className="absolute bottom-[-1px] right-[-1px] w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white leading-tight">
                  {user?.name || "Dr. Specialist"}
                </h3>
                <span className="inline-block mt-0.5 px-2 py-0.5 text-[9px] font-extrabold tracking-wider bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-[#3EC7FF] rounded-full uppercase">
                  {user?.membershipStatus || "PREMIUM MEMBER"}
                </span>
              </div>
            </div>
            <button 
              onClick={() => setDrawerOpen(false)}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400 dark:text-slate-500"
            >
              <X size={18} />
            </button>
          </div>

          {/* Large "+ New Consultation" Button */}
          <button
            onClick={handleNewConsultation}
            className="w-full py-3 px-4 bg-[#0B5FFF] hover:bg-[#0049CC] text-white font-bold text-[13px] rounded-2xl shadow-md shadow-blue-500/10 flex items-center justify-center space-x-2 transition"
          >
            <Plus size={16} />
            <span>New Consultation</span>
          </button>
        </div>

        {/* Scrollable Navigation Area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          
          {/* Main Menu Items */}
          <div className="space-y-1">
            <button
              onClick={() => setActiveView("consult")}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeView === "consult" 
                  ? "bg-blue-50 dark:bg-blue-950/50 text-[#0B5FFF] dark:text-[#3EC7FF]" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
              }`}
            >
              <MessageSquare size={16} />
              <span>Consultations</span>
            </button>
            <button
              onClick={() => setActiveView("history")}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeView === "history" 
                  ? "bg-blue-50 dark:bg-blue-950/50 text-[#0B5FFF] dark:text-[#3EC7FF]" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
              }`}
            >
              <History size={16} />
              <span>Medical History</span>
            </button>
            <button
              onClick={() => setActiveView("profile")}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeView === "profile" 
                  ? "bg-blue-50 dark:bg-blue-950/50 text-[#0B5FFF] dark:text-[#3EC7FF]" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
              }`}
            >
              <FileText size={16} />
              <span>Prescriptions / Profile</span>
            </button>
            <button
              onClick={() => setActiveView("analytics")}
              className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                activeView === "analytics" 
                  ? "bg-blue-50 dark:bg-blue-950/50 text-[#0B5FFF] dark:text-[#3EC7FF]" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
              }`}
            >
              <BarChart2 size={16} />
              <span>Analytics</span>
            </button>
          </div>

          {/* RECENT consultations block */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-extrabold tracking-wider uppercase text-slate-400 dark:text-slate-500 px-4">
              Recent Consultations
            </h4>
            <div className="space-y-1">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => handleSelectSession(session.id)}
                  className={`group w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-medium cursor-pointer transition ${
                    currentSessionId === session.id 
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white" 
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/20"
                  }`}
                >
                  <div className="flex items-center space-x-2.5 overflow-hidden flex-1 mr-2">
                    <MessageSquare size={14} className={session.pinned ? "text-amber-500" : "text-slate-400"} />
                    {editingSessionId === session.id ? (
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="bg-white dark:bg-slate-950 px-1 py-0.5 rounded text-xs text-slate-800 dark:text-white focus:outline-none w-full"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="truncate font-semibold">{session.title}</span>
                    )}
                  </div>
                  
                  {/* Actions (visible on hover) */}
                  <div className="flex items-center space-x-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {editingSessionId === session.id ? (
                      <button
                        onClick={(e) => handleSaveRename(e, session.id)}
                        className="p-1 hover:text-emerald-500"
                      >
                        <Check size={12} />
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={(e) => handlePin(e, session.id)}
                          className={`p-1 hover:text-amber-500 ${session.pinned ? "text-amber-500" : ""}`}
                        >
                          <Pin size={11} />
                        </button>
                        <button
                          onClick={(e) => handleStartRename(e, session)}
                          className="p-1 hover:text-blue-500"
                        >
                          <Edit2 size={11} />
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, session.id)}
                          className="p-1 hover:text-red-500"
                        >
                          <Trash2 size={11} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Fixed Footer items */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800/60 space-y-3.5">
          {/* Icons control panel */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveView("settings")}
              className="p-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400 border border-slate-200/40 dark:border-slate-800 shadow-sm transition"
              title="Settings"
            >
              <Settings size={16} />
            </button>

            <button
              onClick={() => setDarkMode(!isDarkMode)}
              className="p-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400 border border-slate-200/40 dark:border-slate-800 shadow-sm transition"
              title={isDarkMode ? "Light Mode" : "Dark Mode"}
            >
              {isDarkMode ? <Sun size={16} className="text-amber-500" /> : <Moon size={16} />}
            </button>

            <button
              onClick={() => setActiveView("profile")}
              className="p-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400 border border-slate-200/40 dark:border-slate-800 shadow-sm transition"
              title="Security Protocol"
            >
              <ShieldCheck size={16} className="text-emerald-500" />
            </button>

            <button
              onClick={handleLogout}
              className="p-2 bg-white dark:bg-slate-900 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl text-red-500 border border-slate-200/40 dark:border-slate-800 shadow-sm transition"
              title="Logout Securely"
            >
              <LogOut size={16} />
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 font-mono">
            <div className="flex items-center space-x-1">
              <HelpCircle size={11} />
              <span>Help & Support</span>
            </div>
            <span>v2.4.0</span>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
