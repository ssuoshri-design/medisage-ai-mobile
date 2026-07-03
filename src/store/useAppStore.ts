import { create } from "zustand";
import { UserProfile, ChatSession, Message } from "../types";
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  updateDoc 
} from "firebase/firestore";
import { getFirebaseService } from "../services/firebase";

interface AppState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  sessions: ChatSession[];
  currentSessionId: string | null;
  isDrawerOpen: boolean;
  isDarkMode: boolean;
  activeView: "consult" | "history" | "analytics" | "settings" | "profile";
  isVitalsActive: boolean;
  vitals: { bpm: number; o2: number };
  
  // Actions
  setUser: (user: UserProfile | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setAuthLoading: (loading: boolean) => void;
  setDrawerOpen: (isOpen: boolean) => void;
  setDarkMode: (isDark: boolean) => void;
  setActiveView: (view: "consult" | "history" | "analytics" | "settings" | "profile") => void;
  setVitalsActive: (active: boolean) => void;
  setVitals: (vitals: { bpm: number; o2: number }) => void;
  
  // Chat Actions
  setSessions: (sessions: ChatSession[]) => void;
  setCurrentSessionId: (id: string | null) => void;
  loadSessionsFromFirestore: () => Promise<void>;
  createSession: (title: string, customId?: string) => Promise<string>;
  addMessageToSession: (sessionId: string, message: Message) => Promise<void>;
  updateMessageFeedback: (sessionId: string, messageId: string, feedback: "like" | "dislike" | null) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  togglePinSession: (id: string) => Promise<void>;
  toggleArchiveSession: (id: string) => Promise<void>;
  renameSession: (id: string, newTitle: string) => Promise<void>;
  clearAllSessions: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isAuthLoading: true,
  sessions: [],
  currentSessionId: null,
  isDrawerOpen: false,
  isDarkMode: false,
  activeView: "consult",
  isVitalsActive: true,
  vitals: { bpm: 72, o2: 98 },

  setUser: (user) => set({ user }),
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setAuthLoading: (isAuthLoading) => set({ isAuthLoading }),
  setDrawerOpen: (isDrawerOpen) => set({ isDrawerOpen }),
  setDarkMode: (isDarkMode) => {
    set({ isDarkMode });
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  },
  setActiveView: (activeView) => set({ activeView, isDrawerOpen: false }),
  setVitalsActive: (isVitalsActive) => set({ isVitalsActive }),
  setVitals: (vitals) => set({ vitals }),

  setSessions: (sessions) => set({ sessions }),
  setCurrentSessionId: (currentSessionId) => set({ currentSessionId }),

  loadSessionsFromFirestore: async () => {
    const { db } = getFirebaseService();
    const currentUser = get().user;
    
    if (!db || !currentUser) {
      // Offline / Guest Fallback: Load from localStorage
      const cached = localStorage.getItem(`medisage_sessions_guest`);
      if (cached) {
        set({ sessions: JSON.parse(cached) });
      } else {
        // Create initial placeholder session for guests
        const defaultSession: ChatSession = {
          id: "welcome-session",
          title: "Fever for 3 Days",
          preview: "Analyze symptom profile for persistent temperature spikes.",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          pinned: false,
          archived: false,
          userId: "guest",
          messages: [
            {
              id: "msg-1",
              role: "assistant",
              content: `### Symptom Analysis
Based on your reports, we identified key trends.
- [x] Season Respiratory Infection (92% Match)
- [x] Mild Allergic Reaction (45% Match)

### Rest & Hydration
Ensure 8+ hours of restful sleep and constant hydration to support physical recovery.`,
              timestamp: new Date().toISOString(),
              type: "symptom_analysis",
              vitals: { bpm: 72, o2: 98 }
            }
          ]
        };
        set({ sessions: [defaultSession] });
        localStorage.setItem(`medisage_sessions_guest`, JSON.stringify([defaultSession]));
      }
      return;
    }

    try {
      const q = query(
        collection(db, "chats"),
        where("userId", "==", currentUser.uid),
        orderBy("updatedAt", "desc")
      );
      const snapshot = await getDocs(q);
      const loadedSessions: ChatSession[] = [];
      snapshot.forEach((doc) => {
        loadedSessions.push(doc.data() as ChatSession);
      });
      set({ sessions: loadedSessions });
    } catch (error) {
      console.error("Error loading chat sessions from Firestore:", error);
    }
  },

  createSession: async (title, customId) => {
    const { db } = getFirebaseService();
    const currentUser = get().user;
    const newId = customId || `chat-${Date.now()}`;
    
    const newSession: ChatSession = {
      id: newId,
      title: title,
      preview: "Empty consultation started.",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pinned: false,
      archived: false,
      userId: currentUser?.uid || "guest",
      messages: []
    };

    const updatedSessions = [newSession, ...get().sessions];
    set({ sessions: updatedSessions, currentSessionId: newId });

    if (db && currentUser) {
      try {
        await setDoc(doc(db, "chats", newId), newSession);
      } catch (error) {
        console.error("Error saving new session to Firestore:", error);
      }
    } else {
      localStorage.setItem(`medisage_sessions_guest`, JSON.stringify(updatedSessions));
    }

    return newId;
  },

  addMessageToSession: async (sessionId, message) => {
    const { db } = getFirebaseService();
    const currentUser = get().user;
    
    const sessions = get().sessions;
    const sessionIndex = sessions.findIndex((s) => s.id === sessionId);
    if (sessionIndex === -1) return;

    const session = sessions[sessionIndex];
    const updatedMessages = [...session.messages, message];
    
    // Create quick preview
    const preview = message.content.substring(0, 80).replace(/[#*`\n]/g, "") + "...";

    const updatedSession: ChatSession = {
      ...session,
      messages: updatedMessages,
      preview,
      updatedAt: new Date().toISOString()
    };

    const updatedSessions = [...sessions];
    updatedSessions[sessionIndex] = updatedSession;
    
    // Sort so newest updated is first, except keeping pinned ones high
    const sortedSessions = [...updatedSessions].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    set({ sessions: sortedSessions });

    if (db && currentUser) {
      try {
        await setDoc(doc(db, "chats", sessionId), updatedSession);
      } catch (error) {
        console.error("Error updating session with new message:", error);
      }
    } else {
      localStorage.setItem(`medisage_sessions_guest`, JSON.stringify(sortedSessions));
    }
  },

  updateMessageFeedback: async (sessionId, messageId, feedback) => {
    const { db } = getFirebaseService();
    const currentUser = get().user;

    const sessions = get().sessions;
    const sessionIndex = sessions.findIndex((s) => s.id === sessionId);
    if (sessionIndex === -1) return;

    const session = sessions[sessionIndex];
    const updatedMessages = session.messages.map((m) => {
      if (m.id === messageId) {
        return { ...m, feedback };
      }
      return m;
    });

    const updatedSession: ChatSession = {
      ...session,
      messages: updatedMessages,
      updatedAt: new Date().toISOString()
    };

    const updatedSessions = [...sessions];
    updatedSessions[sessionIndex] = updatedSession;
    set({ sessions: updatedSessions });

    if (db && currentUser) {
      try {
        await updateDoc(doc(db, "chats", sessionId), {
          messages: updatedMessages,
          updatedAt: updatedSession.updatedAt
        });
      } catch (error) {
        console.error("Error updating feedback in Firestore:", error);
      }
    } else {
      localStorage.setItem(`medisage_sessions_guest`, JSON.stringify(updatedSessions));
    }
  },

  deleteSession: async (id) => {
    const { db } = getFirebaseService();
    const currentUser = get().user;

    const updatedSessions = get().sessions.filter((s) => s.id !== id);
    set({ 
      sessions: updatedSessions,
      currentSessionId: get().currentSessionId === id ? null : get().currentSessionId
    });

    if (db && currentUser) {
      try {
        await deleteDoc(doc(db, "chats", id));
      } catch (error) {
        console.error("Error deleting session from Firestore:", error);
      }
    } else {
      localStorage.setItem(`medisage_sessions_guest`, JSON.stringify(updatedSessions));
    }
  },

  togglePinSession: async (id) => {
    const { db } = getFirebaseService();
    const currentUser = get().user;

    const sessions = get().sessions;
    const sessionIndex = sessions.findIndex((s) => s.id === id);
    if (sessionIndex === -1) return;

    const session = sessions[sessionIndex];
    const updatedSession = { ...session, pinned: !session.pinned, updatedAt: new Date().toISOString() };
    
    const updatedSessions = [...sessions];
    updatedSessions[sessionIndex] = updatedSession;
    
    const sortedSessions = [...updatedSessions].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

    set({ sessions: sortedSessions });

    if (db && currentUser) {
      try {
        await setDoc(doc(db, "chats", id), updatedSession);
      } catch (error) {
        console.error("Error updating pin status in Firestore:", error);
      }
    } else {
      localStorage.setItem(`medisage_sessions_guest`, JSON.stringify(sortedSessions));
    }
  },

  toggleArchiveSession: async (id) => {
    const { db } = getFirebaseService();
    const currentUser = get().user;

    const sessions = get().sessions;
    const sessionIndex = sessions.findIndex((s) => s.id === id);
    if (sessionIndex === -1) return;

    const session = sessions[sessionIndex];
    const updatedSession = { ...session, archived: !session.archived, updatedAt: new Date().toISOString() };

    const updatedSessions = [...sessions];
    updatedSessions[sessionIndex] = updatedSession;
    set({ sessions: updatedSessions });

    if (db && currentUser) {
      try {
        await setDoc(doc(db, "chats", id), updatedSession);
      } catch (error) {
        console.error("Error updating archive status in Firestore:", error);
      }
    } else {
      localStorage.setItem(`medisage_sessions_guest`, JSON.stringify(updatedSessions));
    }
  },

  renameSession: async (id, newTitle) => {
    const { db } = getFirebaseService();
    const currentUser = get().user;

    const sessions = get().sessions;
    const sessionIndex = sessions.findIndex((s) => s.id === id);
    if (sessionIndex === -1) return;

    const session = sessions[sessionIndex];
    const updatedSession = { ...session, title: newTitle, updatedAt: new Date().toISOString() };

    const updatedSessions = [...sessions];
    updatedSessions[sessionIndex] = updatedSession;
    set({ sessions: updatedSessions });

    if (db && currentUser) {
      try {
        await setDoc(doc(db, "chats", id), updatedSession);
      } catch (error) {
        console.error("Error renaming session in Firestore:", error);
      }
    } else {
      localStorage.setItem(`medisage_sessions_guest`, JSON.stringify(updatedSessions));
    }
  },

  clearAllSessions: () => {
    set({ sessions: [], currentSessionId: null });
    localStorage.removeItem(`medisage_sessions_guest`);
  }
}));
