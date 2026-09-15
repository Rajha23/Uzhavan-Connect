import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2, Mic, Volume2, VolumeX } from 'lucide-react';
import { ChatMessage, sendChatMessage } from '../lib/gemini';

export const ChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Speech recognition instance ref
  const recognitionRef = useRef<any>(null);

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: 'model',
          content: 'Hello! I am the Uzhavan Connect AI Assistant. How can I help you today?'
        }
      ]);
    }
  }, [messages.length]);

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
          // Set the input field and submit it
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
  }, []); // Run once on mount

  const startListening = () => {
    if (!recognitionRef.current) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }
    setIsOpen(true);
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
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Strip markdown formatting like asterisks or hash symbols for better speech
    const cleanText = text.replace(/[*#]/g, '').trim();
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';
    
    window.speechSynthesis.speak(utterance);
  };

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const submitMessage = async (messageText: string) => {
    const trimmedInput = messageText.trim();
    if (!trimmedInput) return;

    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: trimmedInput }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Pass the previous history
      const responseText = await sendChatMessage(newMessages.slice(0, -1), trimmedInput);
      setMessages(prev => [...prev, { role: 'model', content: responseText }]);
      speakResponse(responseText);
    } catch (error: any) {
      setMessages(prev => [
        ...prev, 
        { role: 'model', content: `Sorry, I encountered an error: ${error.message}` }
      ]);
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

  return (
    <>
      {/* Floating Action Buttons Group */}
      <div className={`fixed bottom-6 right-6 flex items-end gap-4 transition-all duration-300 z-50 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}>
        {/* Voice Assistant */}
        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={startListening}
            className={`p-4 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-xl flex items-center justify-center ${isListening ? 'animate-pulse bg-red-500 hover:bg-red-600' : ''}`}
            aria-label="Start Voice Assistant"
          >
            <Mic className="w-6 h-6" />
          </button>
          <span className="text-[10px] font-bold text-teal-900 bg-white/90 px-2 py-0.5 rounded-full shadow-sm border border-teal-100 backdrop-blur-sm whitespace-nowrap">Voice Assistant</span>
        </div>

        {/* Chatbot */}
        <div className="flex flex-col items-center gap-1.5">
          <button
            onClick={() => setIsOpen(true)}
            className="p-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-xl flex items-center justify-center"
            aria-label="Open Chatbot"
          >
            <MessageSquare className="w-6 h-6" />
          </button>
          <span className="text-[10px] font-bold text-emerald-900 bg-white/90 px-2 py-0.5 rounded-full shadow-sm border border-emerald-100 backdrop-blur-sm whitespace-nowrap">Chatbot</span>
        </div>
      </div>

      {/* Chat Window */}
      <div 
        className={`fixed bottom-6 right-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col transition-all duration-300 z-50 transform origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}
        style={{ height: '500px', maxHeight: 'calc(100vh - 48px)' }}
      >
        {/* Header */}
        <div className="bg-emerald-700 p-4 text-white flex justify-between items-center shadow-md z-10">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-1.5 rounded-lg">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Uzhavan AI Assistant</h3>
              <p className="text-[10px] text-emerald-100 opacity-90">Powered by Google Gemini</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setIsVoiceEnabled(!isVoiceEnabled);
                if (isVoiceEnabled) window.speechSynthesis.cancel();
              }}
              className="p-1 hover:bg-white/20 rounded-md transition-colors mr-1"
              title={isVoiceEnabled ? "Mute AI Voice" : "Enable AI Voice"}
            >
              {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-emerald-300" />}
            </button>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${msg.role === 'user' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                  {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>
                <div className={`px-3 py-2 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-emerald-600 text-white rounded-tr-sm' 
                    : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm whitespace-pre-wrap'
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
              <div className="flex flex-wrap gap-2">
                {[
                  "How do I list my crops?",
                  "How does the reverse auction work?",
                  "Can I trace the origin of a product?"
                ].map((faq, i) => (
                  <button
                    key={i}
                    onClick={() => submitMessage(faq)}
                    className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full transition-colors text-left"
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
                <div className="px-4 py-2.5 bg-white border border-slate-200 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
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
              placeholder={isListening ? "Listening..." : "Ask anything..."}
              className={`w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-20 py-2.5 text-sm resize-none focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-shadow ${isListening ? 'bg-red-50 border-red-200 text-red-900 placeholder-red-400' : ''}`}
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
          <div className="text-center mt-1.5">
            <span className="text-[9px] text-slate-400">Press Shift+Enter for new line</span>
          </div>
        </div>
      </div>
    </>
  );
};
