import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Mic, 
  Volume2, 
  VolumeX, 
  History, 
  Plus, 
  Trash2, 
  Clock, 
  ChevronLeft,
  Sparkles
} from 'lucide-react';
import { ChatMessage, sendChatMessage } from '../lib/gemini';

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

const STORAGE_KEY = 'uzhavan_ai_chat_sessions_v1';
const ACTIVE_SESSION_KEY = 'uzhavan_ai_active_session_id';

const createDefaultSession = (): ChatSession => ({
  id: 'chat-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
  title: 'New Conversation',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  messages: [
    {
      role: 'model',
      content: 'Hello! I am the Uzhavan Connect AI Assistant. How can I help you today?'
    }
  ]
});

export const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>('');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load sessions from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: ChatSession[] = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed);
          const savedActiveId = localStorage.getItem(ACTIVE_SESSION_KEY);
          if (savedActiveId && parsed.some(s => s.id === savedActiveId)) {
            setActiveSessionId(savedActiveId);
          } else {
            setActiveSessionId(parsed[0].id);
          }
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to load chat history', e);
    }

    // Initialize fresh session
    const defaultSess = createDefaultSession();
    setSessions([defaultSess]);
    setActiveSessionId(defaultSess.id);
  }, []);

  // Save sessions to localStorage
  const saveSessions = (updatedSessions: ChatSession[], newActiveId?: string) => {
    setSessions(updatedSessions);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
      if (newActiveId) {
        localStorage.setItem(ACTIVE_SESSION_KEY, newActiveId);
      }
    } catch (e) {
      console.warn('Failed to persist chat sessions', e);
    }
  };

  // Get current active session
  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const messages = activeSession ? activeSession.messages : [];

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          submitMessage(transcript);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [activeSessionId, sessions]);

  const startListening = () => {
    if (!recognitionRef.current) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }
    setIsOpen(true);
    setShowHistory(false);
    setIsListening(true);
    try {
      recognitionRef.current.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const speakResponse = (text: string) => {
    if (!isVoiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (!showHistory) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, showHistory]);

  // Start a new chat session like ChatGPT "+ New Chat"
  const handleNewChat = () => {
    const newSess = createDefaultSession();
    const updated = [newSess, ...sessions];
    saveSessions(updated, newSess.id);
    setActiveSessionId(newSess.id);
    setShowHistory(false);
    setInput('');
  };

  // Select a past conversation to continue chatting
  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    localStorage.setItem(ACTIVE_SESSION_KEY, id);
    setShowHistory(false);
  };

  // Delete a specific session
  const handleDeleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const filtered = sessions.filter(s => s.id !== id);
    if (filtered.length === 0) {
      const fresh = createDefaultSession();
      saveSessions([fresh], fresh.id);
      setActiveSessionId(fresh.id);
    } else {
      saveSessions(filtered, activeSessionId === id ? filtered[0].id : activeSessionId);
      if (activeSessionId === id) {
        setActiveSessionId(filtered[0].id);
      }
    }
  };

  const submitMessage = async (messageText: string) => {
    const trimmedInput = messageText.trim();
    if (!trimmedInput || !activeSession) return;

    setShowHistory(false);

    // If session is still named "New Conversation", title it after this first user query
    let newTitle = activeSession.title;
    if (newTitle === 'New Conversation' || newTitle === 'புதிய உரையாடல்') {
      newTitle = trimmedInput.length > 32 ? trimmedInput.slice(0, 32) + '...' : trimmedInput;
    }

    const updatedMessages: ChatMessage[] = [...activeSession.messages, { role: 'user', content: trimmedInput }];
    
    // Optimistically update session
    const updatedSessionsWithUser = sessions.map(s => {
      if (s.id === activeSession.id) {
        return {
          ...s,
          title: newTitle,
          updatedAt: Date.now(),
          messages: updatedMessages
        };
      }
      return s;
    });

    saveSessions(updatedSessionsWithUser, activeSession.id);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await sendChatMessage(updatedMessages.slice(0, -1), trimmedInput);
      
      const finalizedMessages: ChatMessage[] = [
        ...updatedMessages,
        { role: 'model', content: responseText }
      ];

      const finalizedSessions = updatedSessionsWithUser.map(s => {
        if (s.id === activeSession.id) {
          return {
            ...s,
            updatedAt: Date.now(),
            messages: finalizedMessages
          };
        }
        return s;
      });

      saveSessions(finalizedSessions, activeSession.id);
      speakResponse(responseText);
    } catch (error: any) {
      const errorMessages: ChatMessage[] = [
        ...updatedMessages,
        { role: 'model', content: `Sorry, I encountered an issue: ${error.message}` }
      ];

      const errorSessions = updatedSessionsWithUser.map(s => {
        if (s.id === activeSession.id) {
          return { ...s, messages: errorMessages };
        }
        return s;
      });
      saveSessions(errorSessions, activeSession.id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    submitMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Format relative timestamp
  const formatTime = (timestamp: number) => {
    const diffMs = Date.now() - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <>
      {/* Floating Action Buttons Group */}
      <div className={`fixed bottom-6 right-6 flex items-end gap-4 transition-all duration-300 z-50 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}>
        {/* Voice Assistant */}
        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={startListening}
            className={`p-4 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-xl flex items-center justify-center transition-all ${isListening ? 'animate-pulse bg-red-500 hover:bg-red-600' : ''}`}
            aria-label="Start Voice Assistant"
          >
            <Mic className="w-6 h-6" />
          </button>
          <span className="text-[10px] font-bold text-teal-900 bg-white/90 px-2 py-0.5 rounded-full shadow-sm border border-teal-100 backdrop-blur-sm whitespace-nowrap">Voice Assistant</span>
        </div>

        {/* Chatbot */}
        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={() => {
              setIsOpen(true);
              setShowHistory(false);
            }}
            className="p-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-105"
            aria-label="Open Chatbot"
          >
            <MessageSquare className="w-6 h-6" />
          </button>
          <span className="text-[10px] font-bold text-emerald-900 bg-white/90 px-2 py-0.5 rounded-full shadow-sm border border-emerald-100 backdrop-blur-sm whitespace-nowrap">Chatbot</span>
        </div>
      </div>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-6 right-6 w-84 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-300 z-50 transform origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}
        style={{ height: '540px', maxHeight: 'calc(100vh - 48px)' }}
      >
        {/* Header */}
        <div className="bg-emerald-700 p-3.5 text-white flex justify-between items-center shadow-md z-10">
          <div className="flex items-center gap-2">
            {showHistory ? (
              <button
                onClick={() => setShowHistory(false)}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors flex items-center gap-1 text-xs"
                title="Back to chat"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Chat</span>
              </button>
            ) : (
              <div className="bg-white/20 p-1.5 rounded-lg">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-xs sm:text-sm flex items-center gap-1.5">
                <span>{showHistory ? 'Chat History' : 'Uzhavan AI Assistant'}</span>
              </h3>
              <p className="text-[10px] text-emerald-100 opacity-90">
                {showHistory ? `${sessions.length} saved sessions` : 'Powered by Google Gemini Flash'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* New Chat Button */}
            <button
              onClick={handleNewChat}
              className="p-1.5 hover:bg-white/20 rounded-md transition-colors text-white flex items-center gap-1 text-xs font-medium"
              title="Start New Chat"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">New</span>
            </button>

            {/* History Toggle Button */}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`p-1.5 rounded-md transition-colors ${showHistory ? 'bg-white/30 text-white' : 'hover:bg-white/20 text-emerald-100'}`}
              title="Conversation History"
            >
              <History className="w-4 h-4" />
            </button>

            {/* Voice Mute Toggle */}
            <button
              onClick={() => {
                setIsVoiceEnabled(!isVoiceEnabled);
                if (isVoiceEnabled) window.speechSynthesis?.cancel();
              }}
              className="p-1.5 hover:bg-white/20 rounded-md transition-colors text-emerald-100"
              title={isVoiceEnabled ? "Mute AI Voice" : "Enable AI Voice"}
            >
              {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-emerald-300" />}
            </button>

            {/* Close Button */}
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1.5 hover:bg-white/20 rounded-md transition-colors text-emerald-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ChatGPT Style History Drawer */}
        {showHistory ? (
          <div className="flex-1 overflow-y-auto p-3.5 space-y-2 bg-slate-50 flex flex-col">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Start New Chat</span>
            </button>

            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider pt-2 px-1">
              Previous Conversations
            </div>

            <div className="space-y-1.5 flex-1">
              {sessions.map((sess) => {
                const isActive = sess.id === activeSessionId;
                const lastMsg = sess.messages[sess.messages.length - 1]?.content || '';
                return (
                  <div
                    key={sess.id}
                    onClick={() => handleSelectSession(sess.id)}
                    className={`group relative flex items-center justify-between p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-emerald-50/80 border-emerald-300 shadow-sm' 
                        : 'bg-white hover:bg-slate-100/80 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1 pr-2">
                      <div className={`mt-0.5 p-1 rounded-md shrink-0 ${isActive ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <MessageSquare className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-xs font-semibold truncate ${isActive ? 'text-emerald-950' : 'text-slate-800'}`}>
                            {sess.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 shrink-0 ml-1">
                            {formatTime(sess.updatedAt)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {lastMsg}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDeleteSession(e, sess.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                      title="Delete chat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <>
            {/* Active Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${msg.role === 'user' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                      {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                    </div>
                    <div className={`px-3 py-2 rounded-2xl text-xs sm:text-sm ${
                      msg.role === 'user' 
                        ? 'bg-emerald-600 text-white rounded-tr-sm' 
                        : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm whitespace-pre-wrap leading-relaxed'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* FAQ Suggestions when only the greeting is present */}
              {messages.length === 1 && !isLoading && (
                <div className="pt-2 flex flex-col gap-2">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider ml-1">Suggested Questions</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      "How do I list my crops?",
                      "How does the reverse auction work?",
                      "Can I trace the origin of a product?",
                      "What is today's tomato modal price?"
                    ].map((faq, i) => (
                      <button
                        key={i}
                        onClick={() => submitMessage(faq)}
                        className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-2.5 py-1.5 rounded-full transition-colors text-left"
                      >
                        {faq}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-2 max-w-[85%] flex-row">
                    <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center flex-shrink-0 mt-1">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div className="px-3.5 py-2 bg-white border border-slate-200 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                      <span className="text-xs text-slate-500 font-medium">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-slate-200">
              <div className="relative flex items-center">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isListening ? "Listening..." : "Ask anything (farming, market price, orders)..."}
                  className={`w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-20 py-2.5 text-xs sm:text-sm resize-none focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-shadow ${isListening ? 'bg-red-50 border-red-200 text-red-900 placeholder-red-400' : ''}`}
                  rows={1}
                  style={{ minHeight: '44px', maxHeight: '120px' }}
                />
                <div className="absolute right-2 flex items-center gap-1">
                  <button 
                    onClick={isListening ? () => { recognitionRef.current?.stop(); setIsListening(false); } : startListening}
                    disabled={isLoading}
                    title={isListening ? "Stop Listening" : "Start Voice Typing"}
                    className={`p-1.5 rounded-lg transition-colors flex items-center justify-center ${isListening ? 'bg-red-100 text-red-600 hover:bg-red-200 animate-pulse' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="p-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-lg transition-colors flex items-center justify-center"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between mt-1.5 px-1">
                <span className="text-[9px] text-slate-400">Shift+Enter for newline</span>
                <button
                  onClick={() => setShowHistory(true)}
                  className="text-[10px] text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <History className="w-3 h-3" />
                  <span>{sessions.length} chats in history</span>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};
