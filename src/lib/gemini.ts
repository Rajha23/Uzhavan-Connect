export type ChatRole = 'user' | 'model';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export const sendChatMessage = async (history: ChatMessage[], newMessage: string): Promise<string> => {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        history,
        newMessage
      })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Server error');
    }

    return data.response;
  } catch (error: any) {
    console.error('Chat API Error:', error);
    throw new Error(error.message || 'Failed to connect to the AI service.');
  }
};
