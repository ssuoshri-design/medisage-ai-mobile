import React, { useState } from "react";
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Award, 
  Edit3, 
  Camera, 
  Save, 
  Lock,
  HeartPulse,
  Heart,
  FileCode
} from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { getFirebaseService } from "../services/firebase";
import { doc, setDoc } from "firebase/firestore";

const avatarsList = [
  "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150&h=150",
  "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=150&h=150",
  "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150&h=150",
  "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=150&h=150"
];

export default function ProfileView() {
  const { user, setUser } = useAppStore();
  const [name, setName] = useState(user?.name || "Dr. Specialist");
  const [email, setEmail] = useState(user?.email || "specialist@medisage.ai");
  const [avatar, setAvatar] = useState(user?.avatarUrl || avatarsList[0]);
  const [isEditing, setIsEditing] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  const handleSave = async () => {
    setSaveLoading(true);
    setStatusMsg("");

    const updatedUser = {
      ...user!,
      name,
      email,
      avatarUrl: avatar,
    };

    const { db } = getFirebaseService();
    if (db && user?.uid) {
      try {
        await setDoc(doc(db, "users", user.uid), updatedUser);
        setStatusMsg("Secure medical profile updated in Firestore!");
      } catch (error) {
        console.error("Error saving profile:", error);
        setStatusMsg("Failed to sync profile to cloud database.");
      }
    } else {
      setStatusMsg("Profile updated locally (offline mode).");
    }

    setUser(updatedUser);
    setSaveLoading(false);
    setIsEditing(false);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F6F8FB] dark:bg-[#07111F] p-5 h-full overflow-y-auto select-none">
      
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-xl font-extrabold tracking-tight text-[#07111F] dark:text-white font-sans">
          Clinical Profile & Badge
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Secure, verified physician credentials and authorization indices
        </p>
      </div>

      {statusMsg && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/30 text-[#0B5FFF] rounded-2xl text-xs font-bold flex items-center space-x-2">
          <ShieldCheck size={15} />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 rounded-3xl p-6 shadow-sm space-y-6">
        
        {/* Profile Avatar and Edit Controls */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <img
              src={avatar}
              alt="Physician Avatar"
              className="w-24 h-24 rounded-3xl object-cover border-4 border-blue-500/10 dark:border-blue-500/20 shadow-md"
            />
            {isEditing && (
              <span className="absolute bottom-0 right-0 p-1.5 bg-[#0B5FFF] text-white rounded-xl shadow-md">
                <Camera size={14} />
              </span>
            )}
          </div>

          {isEditing && (
            <div className="flex space-x-2.5 mt-4">
              {avatarsList.map((av, index) => (
                <button
                  key={index}
                  onClick={() => setAvatar(av)}
                  className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition ${
                    avatar === av ? "border-[#0B5FFF] scale-105" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={av} alt="Avatar option" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="text-center mt-3">
            <h3 className="text-base font-bold text-slate-800 dark:text-white">{name}</h3>
            <span className="inline-flex items-center space-x-1.5 mt-1 px-3 py-1 text-[10px] font-extrabold tracking-wider bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-[#3EC7FF] rounded-full uppercase">
              <Award size={12} />
              <span>Verified Practitioner</span>
            </span>
          </div>
        </div>

        {/* Credentials Form fields */}
        <div className="space-y-4">
          <div className="relative">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1 px-1">
              Practitioner Name
            </span>
            <div className="relative">
              <User className="absolute left-4 top-3.5 text-slate-400 dark:text-slate-500" size={16} />
              <input
                type="text"
                value={name}
                disabled={!isEditing}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/60 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B5FFF]/40 text-slate-800 dark:text-white disabled:opacity-70"
              />
            </div>
          </div>

          <div className="relative">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1 px-1">
              Secure Medical Email
            </span>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-slate-400 dark:text-slate-500" size={16} />
              <input
                type="email"
                value={email}
                disabled={!isEditing}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/60 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0B5FFF]/40 text-slate-800 dark:text-white disabled:opacity-70"
              />
            </div>
          </div>

          <div className="relative">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1 px-1">
              Authority Tier Status
            </span>
            <div className="flex items-center space-x-2.5 p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/40 dark:border-slate-800/50 rounded-2xl text-slate-600 dark:text-slate-400">
              <Lock size={15} />
              <span className="text-xs font-semibold">Premium Enterprise Subscription tier</span>
            </div>
          </div>
        </div>

        {/* Button Controls */}
        <div className="pt-2">
          {isEditing ? (
            <button
              onClick={handleSave}
              disabled={saveLoading}
              className="w-full py-3.5 bg-[#0B5FFF] hover:bg-[#0049CC] text-white font-bold text-xs rounded-2xl flex items-center justify-center space-x-2 shadow-md shadow-blue-500/10 cursor-pointer"
            >
              {saveLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save size={16} />
                  <span>Sync Medical Profile</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full py-3.5 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 font-bold text-xs rounded-2xl flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
            >
              <Edit3 size={16} />
              <span>Edit Practitioner Profile</span>
            </button>
          )}
        </div>

      </div>

      {/* Verification footer badge */}
      <div className="mt-5 p-4 bg-[#19C37D]/5 border border-emerald-100 dark:border-emerald-900/30 rounded-3xl flex items-center space-x-3">
        <HeartPulse size={24} className="text-[#19C37D] shrink-0" />
        <div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">Verified Specialist Identity</h4>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
            Your clinical account is synced and encrypted using AES-256 standard protocols.
          </p>
        </div>
      </div>

    </div>
  );
}
