import { GoogleGenAI } from '@google/genai';

// Initialize the Gemini Client
// WARNING: In a production app, you should proxy these calls through a backend
// to avoid exposing the API key in the frontend. For a hackathon/demo, this is acceptable.
let ai: GoogleGenAI | null = null;

export const initGemini = (apiKey: string) => {
  if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
  }
};

export const isGeminiInitialized = () => {
  return ai !== null;
};

// Define the system instructions for the chatbot
const SYSTEM_INSTRUCTION = `You are the official AI Assistant for Uzhavan Connect, an agricultural supply chain ecosystem platform.
Your primary role is to help users navigate the app, explain features, and answer general questions about agricultural processes (like farming, logistics, and reverse auctions).

CRITICAL CONSTRAINTS:
1. DO NOT ask for, process, or help users with sensitive personal information, passwords, financial data, or specific user data.
2. If a user asks a question about their specific account data (like "What is my bank balance?" or "What are my exact crop listings?"), politely decline and instruct them to check the relevant dashboard screen instead.
3. Keep your answers concise, helpful, and friendly. You are talking to farmers, buyers, FPOs, and logistics providers.
4. Format your responses in plain text or simple markdown (bullet points are fine). Avoid overly complex formatting.
`;

export type ChatRole = 'user' | 'model';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export const sendChatMessage = async (history: ChatMessage[], newMessage: string): Promise<string> => {
  if (!ai) {
    throw new Error('Gemini API is not initialized. Please provide an API key.');
  }

  try {
    // Format the history for the Gemini API
    const formattedHistory = history.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        ...formattedHistory,
        { role: 'user', parts: [{ text: newMessage }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      }
    });

    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    throw new Error(error.message || 'Failed to connect to the AI service.');
  }
};
