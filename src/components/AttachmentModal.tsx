import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Camera, 
  Image as ImageIcon, 
  FileText, 
  X, 
  Film, 
  Mic, 
  Video, 
  FileCode,
  UploadCloud,
  CheckCircle2,
  Minimize2
} from "lucide-react";

interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
  content?: string;
}

interface AttachmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAttachment: (attachment: Attachment) => void;
}

export default function AttachmentModal({ isOpen, onClose, onAddAttachment }: AttachmentModalProps) {
  const [activeTab, setActiveTab] = useState<"menu" | "camera" | "upload">("menu");
  const [cameraStream, setCameraStream] = useState<string | null>(null);
  const [photoCount, setPhotoCount] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const objectUrl = URL.createObjectURL(file);

    // Read small text contents if text file
    if (file.type.startsWith("text/") || file.name.endsWith(".csv") || file.name.endsWith(".txt")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onAddAttachment({
          id: `attach-${Date.now()}`,
          name: file.name,
          type: file.type || "text/plain",
          url: objectUrl,
          content: event.target?.result as string,
        });
      };
      reader.readAsText(file);
    } else {
      onAddAttachment({
        id: `attach-${Date.now()}`,
        name: file.name,
        type: file.type || "application/octet-stream",
        url: objectUrl,
      });
    }

    onClose();
    setActiveTab("menu");
  };

  const handleSimulateCameraSnap = () => {
    setIsCapturing(true);
    setTimeout(() => {
      // Simulate real premium camera photograph snap
      const mockPhotos = [
        "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1559757175-5700dde675bc?auto=format&fit=crop&q=80&w=600",
        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=600",
      ];
      const selectedPhoto = mockPhotos[photoCount % mockPhotos.length];
      setPhotoCount(photoCount + 1);

      onAddAttachment({
        id: `attach-camera-${Date.now()}`,
        name: `ClinSnap_${Date.now().toString().slice(-6)}.jpg`,
        type: "image/jpeg",
        url: selectedPhoto,
      });

      setIsCapturing(false);
      onClose();
      setActiveTab("menu");
    }, 1200);
  };

  const handleAudioRecordSimulate = () => {
    onAddAttachment({
      id: `attach-audio-${Date.now()}`,
      name: `ClinVoice_${Date.now().toString().slice(-4)}.m4a`,
      type: "audio/m4a",
      url: "#",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-end overflow-hidden select-none">
      {/* Background Dim */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
      />

      {/* Sheet panel */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 350 }}
        className="relative w-full bg-white dark:bg-slate-900 rounded-t-[32px] border-t border-slate-200/50 dark:border-slate-800 shadow-2xl p-6 z-50 overflow-hidden"
      >
        {/* Handle slider bar */}
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-5 cursor-pointer" onClick={onClose} />

        <AnimatePresence mode="wait">
          {activeTab === "menu" && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                  Add Clinical Document / Telemetry
                </h3>
                <button onClick={onClose} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition text-slate-400">
                  <X size={16} />
                </button>
              </div>

              {/* Grid Menu Actions */}
              <div className="grid grid-cols-3 gap-3.5">
                {/* Camera simulated */}
                <button
                  onClick={() => setActiveTab("camera")}
                  className="flex flex-col items-center justify-center p-4 bg-blue-50/50 dark:bg-blue-950/20 hover:bg-blue-100/50 dark:hover:bg-blue-950/40 rounded-2xl border border-blue-100/40 dark:border-blue-900/30 transition group cursor-pointer"
                >
                  <div className="w-11 h-11 bg-blue-500 rounded-xl flex items-center justify-center text-white mb-2 shadow-sm shadow-blue-500/20">
                    <Camera size={20} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Camera</span>
                </button>

                {/* Photo Library simulated */}
                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                  }}
                  className="flex flex-col items-center justify-center p-4 bg-[#19C37D]/5 dark:bg-[#19C37D]/10 hover:bg-[#19C37D]/10 dark:hover:bg-[#19C37D]/20 rounded-2xl border border-emerald-100/30 dark:border-emerald-900/20 transition group cursor-pointer"
                >
                  <div className="w-11 h-11 bg-[#19C37D] rounded-xl flex items-center justify-center text-white mb-2 shadow-sm shadow-emerald-500/10">
                    <ImageIcon size={20} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Photo Library</span>
                </button>

                {/* Document Picker */}
                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                  }}
                  className="flex flex-col items-center justify-center p-4 bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-100/50 dark:hover:bg-amber-950/40 rounded-2xl border border-amber-100/40 dark:border-amber-900/30 transition group cursor-pointer"
                >
                  <div className="w-11 h-11 bg-amber-500 rounded-xl flex items-center justify-center text-white mb-2 shadow-sm shadow-amber-500/20">
                    <FileText size={20} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Documents</span>
                </button>

                {/* Simulated Audio Message */}
                <button
                  onClick={handleAudioRecordSimulate}
                  className="flex flex-col items-center justify-center p-4 bg-purple-50/50 dark:bg-purple-950/20 hover:bg-purple-100/50 dark:hover:bg-purple-950/40 rounded-2xl border border-purple-100/40 dark:border-purple-900/30 transition group cursor-pointer"
                >
                  <div className="w-11 h-11 bg-purple-500 rounded-xl flex items-center justify-center text-white mb-2 shadow-sm shadow-purple-500/20">
                    <Mic size={20} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Audio Dictation</span>
                </button>

                {/* Clinical Video */}
                <button
                  onClick={() => {
                    onAddAttachment({
                      id: `attach-video-${Date.now()}`,
                      name: `ClinicalLapse_${Date.now().toString().slice(-4)}.mp4`,
                      type: "video/mp4",
                      url: "#",
                    });
                    onClose();
                  }}
                  className="flex flex-col items-center justify-center p-4 bg-cyan-50/50 dark:bg-cyan-950/20 hover:bg-cyan-100/50 dark:hover:bg-cyan-950/40 rounded-2xl border border-cyan-100/40 dark:border-cyan-900/30 transition group cursor-pointer"
                >
                  <div className="w-11 h-11 bg-cyan-500 rounded-xl flex items-center justify-center text-white mb-2 shadow-sm shadow-cyan-500/20">
                    <Video size={20} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Video clip</span>
                </button>

                {/* Telemetry log CSV */}
                <button
                  onClick={() => {
                    onAddAttachment({
                      id: `attach-csv-${Date.now()}`,
                      name: `VitalBioMetrics_0703.csv`,
                      type: "text/csv",
                      url: "#",
                      content: "Time,BPM,O2,Systolic,Diastolic\n10:00,72,98,120,80\n11:00,74,99,122,81"
                    });
                    onClose();
                  }}
                  className="flex flex-col items-center justify-center p-4 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100/50 dark:hover:bg-rose-950/40 rounded-2xl border border-rose-100/40 dark:border-rose-900/30 transition group cursor-pointer"
                >
                  <div className="w-11 h-11 bg-rose-500 rounded-xl flex items-center justify-center text-white mb-2 shadow-sm shadow-rose-500/20">
                    <FileCode size={20} />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Vitals CSV</span>
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === "camera" && (
            <motion.div
              key="camera"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                  Expo Camera Telemetry View
                </h3>
                <button onClick={() => setActiveTab("menu")} className="p-1 px-2.5 bg-slate-100 dark:bg-slate-800 text-xs font-bold rounded-xl text-slate-500 hover:text-slate-700 transition">
                  Back
                </button>
              </div>

              {/* simulated camera viewport */}
              <div className="relative w-full h-48 bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 flex flex-col items-center justify-center shadow-inner">
                {isCapturing ? (
                  <div className="flex flex-col items-center space-y-2">
                    <div className="w-8 h-8 border-4 border-[#0B5FFF] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-blue-500 font-semibold tracking-wide uppercase">Snapping Frame...</span>
                  </div>
                ) : (
                  <>
                    <img
                      src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=600"
                      alt="Simulated microscope telemetry"
                      className="w-full h-full object-cover opacity-40 select-none pointer-events-none"
                    />
                    <div className="absolute top-4 left-4 flex items-center space-x-1.5 bg-red-500 px-2 py-0.5 rounded-full">
                      <span className="w-2.5 h-2.5 bg-white rounded-full animate-ping" />
                      <span className="text-[9px] font-bold text-white uppercase tracking-wider">REC LIVE</span>
                    </div>

                    <div className="absolute inset-0 border-[2px] border-dashed border-white/20 m-6 pointer-events-none rounded-xl" />

                    <div className="absolute bottom-4 flex justify-center w-full">
                      <button
                        onClick={handleSimulateCameraSnap}
                        className="w-12 h-12 rounded-full bg-white border-4 border-blue-500 shadow-md flex items-center justify-center hover:scale-105 active:scale-95 transition cursor-pointer"
                        title="Capture frame"
                      />
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,application/pdf,.docx,.doc,.txt,.csv"
        />
      </motion.div>
    </div>
  );
}
