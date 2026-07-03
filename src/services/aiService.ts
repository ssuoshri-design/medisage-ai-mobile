import { Message } from "../types";

export interface ChatRequest {
  messages: { role: string; content: string }[];
  userProfile?: {
    name: string;
    email: string;
    membershipStatus: string;
  };
}

export interface ChatResponse {
  content: string;
  error?: string;
}

export async function sendChatMessage(messages: Message[], userProfile?: any): Promise<ChatResponse> {
  try {
    const payload: ChatRequest = {
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      userProfile,
    };

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error ${response.status}`);
    }

    const data = await response.json();
    return {
      content: data.content,
    };
  } catch (error: any) {
    console.error("AI Service failure:", error);
    return {
      content: "",
      error: error.message || "Network error. Please make sure GEMINI_API_KEY is configured in your secret manager.",
    };
  }
}
