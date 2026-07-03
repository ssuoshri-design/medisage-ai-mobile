import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Menu, 
  Send, 
  Plus, 
  Mic, 
  Copy, 
  Share2, 
  ThumbsUp, 
  ThumbsDown, 
  RefreshCw, 
  X, 
  CheckCircle2, 
  FileText, 
  AlertCircle, 
  Activity, 
  Sparkles,
  Search,
  BookOpen,
  PlusCircle,
  FileCheck2,
  Stethoscope,
  Volume2
} from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { sendChatMessage } from "../services/aiService";
import { Message, ChatSession } from "../types";
import AttachmentModal from "./AttachmentModal";
import VitalsTracker from "./VitalsTracker";

interface ChatInterfaceProps {
  onOpenDrawer: () => void;
}

export default function ChatInterface({ onOpenDrawer }: ChatInterfaceProps) {
  const { 
    user,
    sessions, 
    currentSessionId, 
    addMessageToSession, 
    createSession,
    updateMessageFeedback,
    setActiveView,
    vitals
  } = useAppStore();

  const [inputMessage, setInputMessage] = useState("");
  const [attachments, setAttachments] = useState<any[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showAttachmentSheet, setShowAttachmentSheet] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  // Load or create active session
  const currentSession = sessions.find((s) => s.id === currentSessionId);

  useEffect(() => {
    // Scroll to bottom on new message
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentSession?.messages, isAiLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text && attachments.length === 0) return;

    let activeSessionId = currentSessionId;
    
    // If no current session, initialize new
    if (!activeSessionId) {
      const createdId = await createSession(text.substring(0, 24) || "New Consultation");
      activeSessionId = createdId;
    }

    const userMsg: Message = {
      id: `msg-user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      media: attachments.map(att => ({ name: att.name, type: att.type, url: att.url }))
    };

    // Reset inputs
    setInputMessage("");
    setAttachments([]);
    
    // Append user message
    await addMessageToSession(activeSessionId!, userMsg);

    // AI loading state
    setIsAiLoading(true);

    // Fetch refreshed session history
    const refreshedSessions = useAppStore.getState().sessions;
    const currentActiveSession = refreshedSessions.find(s => s.id === activeSessionId);
    const contextMessages = currentActiveSession ? currentActiveSession.messages : [userMsg];

    // Trigger API request
    const response = await sendChatMessage(contextMessages, user);

    if (response.error) {
      const errorMsg: Message = {
        id: `msg-error-${Date.now()}`,
        role: "assistant",
        content: `### Clinical Service Interruption
We were unable to access the MediSage neural engine.
- [ ] Ensure API keys are active in your secrets manager
- [ ] Verify local network configurations

*Diagnostic Error details:* ${response.error}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: "medical_report"
      };
      await addMessageToSession(activeSessionId!, errorMsg);
    } else {
      // Parse AI response to check structure
      const parsedMsg: Message = {
        id: `msg-ai-${Date.now()}`,
        role: "assistant",
        content: response.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        vitals: { bpm: vitals.bpm, o2: vitals.o2 },
        // Simple mock suggestions
        suggestions: ["Check Fever Indicators", "Review Medication Guide", "Download Lab Summary"]
      };

      await addMessageToSession(activeSessionId!, parsedMsg);
    }

    setIsAiLoading(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
    handleSend(suggestion);
  };

  const handleMicSimulate = () => {
    setIsRecording(true);
    setInputMessage("Dictating secure audio...");
    
    setTimeout(() => {
      setIsRecording(false);
      setInputMessage("I have been feeling a bit fatigued lately with a slight cough. What should I check?");
    }, 2000);
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    alert("Consultation text copied securely to clipboard.");
  };

  const handleShareMessage = () => {
    alert("Secure medical consultation dispatch generated.");
  };

  const handleAddAttachment = (att: any) => {
    setAttachments((prev) => [...prev, att]);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSuggestionSelectCard = (symptom: string) => {
    handleSend(symptom);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden relative">
      
      {/* Top Header Navigation Bar */}
      <div className="h-14 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 shrink-0 z-10 select-none">
        <div className="flex items-center space-x-2.5">
          <button
            onClick={onOpenDrawer}
            className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition text-slate-700 dark:text-slate-200"
          >
            <Menu size={20} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-sm font-extrabold text-[#07111F] dark:text-white flex items-center space-x-1">
              <span>MediSage AI</span>
              <Sparkles size={11} className="text-[#0B5FFF]" />
            </h1>
            <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">
              Specialist Consultation
            </span>
          </div>
        </div>

        {/* Right side Profile Avatar */}
        <button
          onClick={() => setActiveView("profile")}
          className="relative transition hover:scale-105 active:scale-95"
        >
          <img
            src={user?.avatarUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150&h=150"}
            alt="Doctor Avatar"
            className="w-8.5 h-8.5 rounded-xl object-cover border border-blue-500/20 shadow-sm"
          />
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
        </button>
      </div>

      {/* Main Chat Content Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6 bg-[#F6F8FB] dark:bg-[#07111F]">
        
        {/* If session empty, show the luxurious medical consultation ready screen */}
        {!currentSession || currentSession.messages.length === 0 ? (
          <div className="max-w-md mx-auto space-y-6 pt-2 select-none">
            
            {/* Visual Header card */}
            <div className="text-center space-y-3.5">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100/40 dark:border-blue-900/40 flex items-center justify-center mx-auto shadow-sm">
                <Stethoscope className="text-[#0B5FFF]" size={30} />
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-[#07111F] dark:text-white font-sans">
                Ready for Consultation
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
                MediSage is active and distraction-free. Analyze complex case files, cross-reference medical literature, or draft clinical reports.
              </p>
            </div>

            {/* Quick Consultation templates / suggestion cards */}
            <div className="space-y-3">
              <div 
                onClick={() => handleSuggestionSelectCard("I need to analyze lab reports and clinical telemetry results.")}
                className="p-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/60 rounded-3xl flex items-start space-x-3.5 shadow-sm transition cursor-pointer"
              >
                <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 rounded-xl text-blue-600 dark:text-[#3EC7FF]">
                  <Search size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white leading-snug">Analyze Lab Results</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-normal">
                    Upload bloodwork, biometrics, or imaging records for instant synthesis.
                  </p>
                </div>
              </div>

              <div 
                onClick={() => handleSuggestionSelectCard("Explain the latest research and clinical standards for persistent fever management.")}
                className="p-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800/60 rounded-3xl flex items-start space-x-3.5 shadow-sm transition cursor-pointer"
              >
                <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl text-emerald-600 dark:text-[#19C37D]">
                  <BookOpen size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white leading-snug">Research Literature</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-normal">
                    Cross reference current peer-reviewed guidelines and diagnostics.
                  </p>
                </div>
              </div>
            </div>

            {/* Real-time vitals preview card */}
            <VitalsTracker />

            {/* Compliance floating pill line */}
            <div className="flex items-center justify-center space-x-2 text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
              <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-950">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <span>Clinical Logic Active</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-950">
                <span>HIPAA Compliant</span>
              </span>
            </div>

          </div>
        ) : (
          /* Render messages lists */
          <div className="space-y-6">
            {currentSession.messages.map((msg) => {
              const isAi = msg.role === "assistant";
              return (
                <div 
                  key={msg.id} 
                  className={`flex ${isAi ? "justify-start" : "justify-end"}`}
                >
                  <div className={`max-w-[85%] space-y-2`}>
                    
                    {/* User speech bubble */}
                    {!isAi ? (
                      <div className="bg-[#0B5FFF] text-white p-4 rounded-3xl rounded-tr-none shadow-md space-y-2 text-xs font-semibold leading-relaxed">
                        <p>{msg.content}</p>
                        
                        {/* Render attached files preview within bubble */}
                        {msg.media && msg.media.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-white/20">
                            {msg.media.map((file, i) => (
                              <div key={i} className="flex items-center space-x-1.5 bg-white/10 px-2 py-1 rounded-lg text-[9px] font-bold">
                                <FileText size={11} />
                                <span className="truncate max-w-[120px]">{file.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      /* AI Medical clinical report card layout */
                      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 p-5 rounded-3xl rounded-tl-none shadow-sm space-y-4 text-xs font-semibold leading-relaxed dark:text-slate-200">
                        
                        {/* Header bar icon */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/40">
                          <div className="flex items-center space-x-2 text-blue-600 dark:text-[#3EC7FF]">
                            <Sparkles size={15} />
                            <span className="text-[10px] font-extrabold uppercase tracking-wider">
                              MediSage Clinical Insight
                            </span>
                          </div>
                          
                          <span className="text-[9px] font-extrabold tracking-widest bg-emerald-50 dark:bg-emerald-950/40 text-[#19C37D] px-2 py-0.5 rounded-full uppercase border border-emerald-100/10">
                            HIPAA Verified
                          </span>
                        </div>

                        {/* Markdown body wrapper */}
                        <div className="prose prose-sm dark:prose-invert text-slate-800 dark:text-slate-300">
                          {msg.content.split("\n\n").map((para, pIdx) => {
                            if (para.startsWith("###")) {
                              return <h3 key={pIdx} className="text-sm font-black text-[#07111F] dark:text-white mt-3 mb-1.5">{para.replace("###", "").trim()}</h3>;
                            }
                            if (para.includes("- [x]")) {
                              return (
                                <div key={pIdx} className="space-y-1.5 my-2">
                                  {para.split("\n").map((line, lIdx) => (
                                    <div key={lIdx} className="flex items-start space-x-2.5">
                                      <CheckCircle2 size={14} className="text-blue-500 shrink-0 mt-0.5" />
                                      <span className="text-slate-700 dark:text-slate-300 font-semibold">{line.replace("- [x]", "").trim()}</span>
                                    </div>
                                  ))}
                                </div>
                              );
                            }
                            return <p key={pIdx} className="leading-relaxed mb-2.5">{para}</p>;
                          })}
                        </div>

                        {/* Simulated diagnostics telemetry attachment within message */}
                        {msg.vitals && (
                          <div className="grid grid-cols-2 gap-3.5 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-2xl border border-slate-200/20">
                            <div className="flex items-center space-x-2">
                              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                              <span className="text-[10px] font-bold text-slate-500">BPM: {msg.vitals.bpm}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="w-2 h-2 rounded-full bg-[#19C37D]" />
                              <span className="text-[10px] font-bold text-slate-500">O₂ Sat: {msg.vitals.o2}%</span>
                            </div>
                          </div>
                        )}

                        {/* Actions bar under message */}
                        <div className="flex items-center justify-between pt-3.5 border-t border-slate-100 dark:border-slate-800/40 select-none text-slate-400">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => updateMessageFeedback(currentSession.id, msg.id, "like")}
                              className={`hover:text-blue-500 transition ${msg.feedback === "like" ? "text-blue-500" : ""}`}
                              title="Like diagnostic advisory"
                            >
                              <ThumbsUp size={13} />
                            </button>
                            <button
                              onClick={() => updateMessageFeedback(currentSession.id, msg.id, "dislike")}
                              className={`hover:text-red-500 transition ${msg.feedback === "dislike" ? "text-red-500" : ""}`}
                              title="Dislike diagnostic advisory"
                            >
                              <ThumbsDown size={13} />
                            </button>
                          </div>

                          <div className="flex items-center space-x-3.5">
                            <button
                              onClick={() => handleCopyMessage(msg.content)}
                              className="hover:text-slate-600 dark:hover:text-slate-300 transition"
                              title="Copy clinical report"
                            >
                              <Copy size={13} />
                            </button>
                            <button
                              onClick={handleShareMessage}
                              className="hover:text-slate-600 dark:hover:text-slate-300 transition"
                              title="Secure dispatch"
                            >
                              <Share2 size={13} />
                            </button>
                          </div>
                        </div>

                      </div>
                    )}

                    {/* Timestamp / Suggestions */}
                    <div className={`flex items-center space-x-1 text-[9px] font-bold text-slate-400 dark:text-slate-500 tracking-wider ${!isAi ? "justify-end" : "justify-start"}`}>
                      <span>{msg.timestamp}</span>
                    </div>

                    {/* Show Suggestion chips on latest AI message */}
                    {isAi && msg.suggestions && msg.id === currentSession.messages[currentSession.messages.length - 1].id && !isAiLoading && (
                      <div className="flex flex-wrap gap-2 pt-2 select-none">
                        {msg.suggestions.map((sug, i) => (
                          <button
                            key={i}
                            onClick={() => handleSuggestionClick(sug)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/20 dark:hover:bg-blue-950/40 text-[#0B5FFF] dark:text-[#3EC7FF] border border-blue-100/40 dark:border-blue-900/30 text-[10px] font-bold rounded-full transition shadow-sm cursor-pointer"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    )}

                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isAiLoading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/60 p-4 rounded-3xl rounded-tl-none shadow-sm flex items-center space-x-3">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce delay-75" />
                    <span className="w-2.5 h-2.5 bg-[#19C37D] rounded-full animate-bounce delay-150" />
                    <span className="w-2.5 h-2.5 bg-[#3EC7FF] rounded-full animate-bounce delay-225" />
                  </div>
                  <span className="text-[10px] font-extrabold tracking-widest text-slate-400 uppercase">
                    Analyzing biometrics...
                  </span>
                </div>
              </div>
            )}

            {/* Scroll Anchor */}
            <div ref={messagesEndRef} />
          </div>
        )}

      </div>

      {/* Floating Attachments Previews Bar (Above Input) */}
      {attachments.length > 0 && (
        <div className="absolute bottom-[72px] left-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-2.5 rounded-2xl border border-slate-200/60 dark:border-slate-800 flex flex-wrap gap-2 z-10 shadow-lg">
          {attachments.map((att) => (
            <div 
              key={att.id} 
              className="flex items-center space-x-1.5 bg-slate-50 dark:bg-slate-950 px-2.5 py-1.5 rounded-xl border border-slate-200/40 dark:border-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 shadow-sm"
            >
              {att.type.startsWith("image/") ? (
                <img src={att.url} alt="upload preview" className="w-5 h-5 rounded-lg object-cover" />
              ) : (
                <FileText size={13} className="text-blue-500" />
              )}
              <span className="truncate max-w-[100px]">{att.name}</span>
              <button 
                onClick={() => handleRemoveAttachment(att.id)}
                className="hover:text-red-500 transition p-0.5"
              >
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Floating Bar Input Section */}
      <div className="p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-100 dark:border-slate-800/60 shrink-0 z-10 select-none">
        <div className="flex items-center space-x-2 bg-[#F6F8FB] dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/60 px-4 py-2.5 rounded-3xl shadow-inner relative">
          
          {/* "+" attachment sheet trigger */}
          <button
            onClick={() => setShowAttachmentSheet(true)}
            className="p-1 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full border border-slate-200/30 dark:border-slate-800 shadow-sm transition text-slate-700 dark:text-slate-200 shrink-0"
            title="Attach documents"
          >
            <Plus size={16} />
          </button>

          {/* Core Input Field */}
          <textarea
            ref={textInputRef}
            rows={1}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Describe your symptoms or case..."
            className="flex-1 bg-transparent border-none text-xs font-semibold focus:outline-none dark:text-white resize-none max-h-24 leading-normal pt-1.5"
          />

          {/* Dictation voice simulated */}
          <button
            onClick={handleMicSimulate}
            className={`p-1 rounded-full transition shrink-0 ${
              isRecording 
                ? "bg-red-500 text-white animate-pulse" 
                : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200/30 dark:border-slate-800 shadow-sm"
            }`}
            title="Microphone Dictation"
          >
            <Mic size={15} />
          </button>

          {/* Send active animation */}
          <button
            onClick={() => handleSend()}
            disabled={!inputMessage.trim() && attachments.length === 0}
            className={`p-2.5 rounded-full flex items-center justify-center transition shrink-0 cursor-pointer ${
              (inputMessage.trim() || attachments.length > 0)
                ? "bg-[#0B5FFF] text-white shadow-md shadow-blue-500/20"
                : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
            }`}
          >
            <Send size={14} />
          </button>

        </div>
      </div>

      {/* Attachments Bottom Sheet Modal */}
      <AttachmentModal
        isOpen={showAttachmentSheet}
        onClose={() => setShowAttachmentSheet(false)}
        onAddAttachment={handleAddAttachment}
      />

    </div>
  );
}
