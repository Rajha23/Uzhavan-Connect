import { GoogleGenAI } from '@google/genai';

// Initialize the Gemini Client on the backend securely
const apiKey = process.env.GEMINI_API_KEY;
let ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Define the system instructions for the chatbot
const SYSTEM_INSTRUCTION = `You are the official AI Assistant for Uzhavan Connect, an agricultural supply chain ecosystem platform.
Your primary role is to help users navigate the app, explain features, and answer general questions about agricultural processes (like farming, logistics, and reverse auctions).

CRITICAL CONSTRAINTS:
1. DO NOT ask for, process, or help users with sensitive personal information, passwords, financial data, or specific user data.
2. If a user asks a question about their specific account data (like "What is my bank balance?" or "What are my exact crop listings?"), politely decline and instruct them to check the relevant dashboard screen instead.
3. Keep your answers concise, helpful, and friendly. You are talking to farmers, buyers, FPOs, and logistics providers.
4. Format your responses in plain text or simple markdown (bullet points are fine). Avoid overly complex formatting.
`;

export default async function handler(req: any, res: any) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!ai) {
    return res.status(500).json({ error: 'Gemini API is not configured on the server. Missing GEMINI_API_KEY.' });
  }

  try {
    const { history, newMessage } = req.body;

    if (!newMessage) {
      return res.status(400).json({ error: 'Missing newMessage' });
    }

    // Format the history for the Gemini API
    const formattedHistory = (history || []).map((msg: any) => ({
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

    return res.status(200).json({ response: response.text || "I'm sorry, I couldn't generate a response." });
  } catch (error: any) {
    console.error('Serverless API Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
