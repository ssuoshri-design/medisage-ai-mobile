export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  type?: "text" | "medical_report" | "symptom_analysis" | "digital_prescription" | "diagnostics";
  feedback?: "like" | "dislike" | null;
  vitals?: {
    bpm: number;
    o2: number;
  };
  suggestions?: string[];
  considerations?: {
    label: string;
    match: string;
    checked?: boolean;
  }[];
  media?: {
    name: string;
    type: string;
    url: string;
  }[];
}

export interface ChatSession {
  id: string;
  title: string;
  preview: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
  pinned: boolean;
  archived: boolean;
  userId: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  membershipStatus: "Premium Member" | "Standard Specialist";
  avatarUrl?: string;
  healthScore?: number;
}
