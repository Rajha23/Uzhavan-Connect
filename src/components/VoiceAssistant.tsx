import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, X, Sparkles, MessageSquare } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const VoiceAssistant: React.FC = () => {
  const { t, currentLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthesisRef.current = window.speechSynthesis;
      
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        
        recognitionRef.current.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          setTranscript(text);
          handleUserQuery(text);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
        
        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
        };
      }
    }
  }, []);

  // Update language when it changes
  useEffect(() => {
    if (recognitionRef.current) {
      // Map app language code to BCP 47 tag dynamically for all 22+ languages
      const code = currentLanguage.iso6391 || currentLanguage.code;
      recognitionRef.current.lang = code === 'en' ? 'en-IN' : `${code}-IN`;
    }
  }, [currentLanguage.code, currentLanguage.iso6391]);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (synthesisRef.current?.speaking) {
        synthesisRef.current.cancel();
        setIsSpeaking(false);
      }
      setTranscript('');
      setResponse('');
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error('Error starting recognition', e);
      }
    }
  };

  const speakText = (text: string) => {
    if (!synthesisRef.current) return;
    
    // Stop any current speech
    synthesisRef.current.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to find a voice that matches the current language
    const voices = synthesisRef.current.getVoices();
    const langPrefix = currentLanguage.code; // 'en', 'ta', 'hi', etc.
    const matchingVoice = voices.find(v => v.lang.startsWith(langPrefix));
    
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    synthesisRef.current.speak(utterance);
  };

  const handleUserQuery = async (query: string) => {
    // In a real app, this would call the Gemini API or a backend endpoint
    // For now, we simulate an AI response based on keywords
    setResponse('Processing your query...');
    
    setTimeout(() => {
      const lowerQuery = query.toLowerCase();
      let aiResponse = '';
      
      if (lowerQuery.includes('price') || lowerQuery.includes('market')) {
        aiResponse = t('ai.responseMarketPrice', undefined, 'The current market price for Tomatoes in your region is ₹35 per kg. Would you like to create a listing?');
      } else if (lowerQuery.includes('weather') || lowerQuery.includes('rain')) {
        aiResponse = t('ai.responseWeather', undefined, 'There is a 60% chance of rain tomorrow in your district. It is advisable to delay harvesting if possible.');
      } else if (lowerQuery.includes('buyer') || lowerQuery.includes('demand')) {
        aiResponse = t('ai.responseDemand', undefined, 'There is high demand for organic onions from 3 FPO aggregators nearby. You can potentially earn 15% above market rate.');
      } else {
        aiResponse = t('ai.responseGeneric', undefined, 'I am your Uzhavan Connect AI Assistant. I can help you check market prices, find buyers, or get weather updates. How can I assist you today?');
      }
      
      setResponse(aiResponse);
      speakText(aiResponse);
    }, 1000);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl text-white transition-all transform hover:scale-105 flex items-center justify-center ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'} bg-gradient-to-r from-emerald-500 to-[#01472e]`}
      >
        <Sparkles className="w-6 h-6 animate-pulse" />
      </button>

      {/* Voice Assistant Panel */}
      <div className={`fixed bottom-6 right-6 z-50 w-80 sm:w-96 rounded-3xl shadow-2xl border border-emerald-100 bg-white overflow-hidden transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#01472e] to-emerald-700 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-200" />
            <h3 className="font-bold tracking-wide">Uzhavan AI</h3>
          </div>
          <button 
            onClick={() => {
              setIsOpen(false);
              synthesisRef.current?.cancel();
              recognitionRef.current?.stop();
              setIsListening(false);
              setIsSpeaking(false);
            }} 
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Area */}
        <div className="h-64 p-4 overflow-y-auto bg-slate-50 flex flex-col gap-4">
          
          {/* Welcome Message */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-[#01472e]" />
            </div>
            <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-emerald-100 shadow-sm text-sm text-slate-700">
              {t('ai.welcomeMessage', undefined, 'Hello! I am your AI assistant. Tap the microphone and speak to me to check prices, find buyers, or ask for guidance.')}
            </div>
          </div>

          {/* User Transcript */}
          {transcript && (
            <div className="flex gap-3 justify-end">
              <div className="bg-[#01472e] text-white p-3 rounded-2xl rounded-tr-none shadow-sm text-sm">
                {transcript}
              </div>
            </div>
          )}

          {/* AI Response */}
          {response && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-[#01472e]" />
              </div>
              <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-emerald-100 shadow-sm text-sm text-slate-700">
                {response === 'Processing your query...' ? (
                  <div className="flex space-x-1.5 items-center h-5">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                ) : (
                  <p>{response}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="p-4 bg-white border-t border-slate-100 flex justify-center items-center gap-6">
          <button
            onClick={() => {
              if (response && !isSpeaking) {
                speakText(response);
              } else if (isSpeaking) {
                synthesisRef.current?.cancel();
                setIsSpeaking(false);
              }
            }}
            disabled={!response && !isSpeaking}
            className={`p-3 rounded-full transition-colors ${isSpeaking ? 'bg-amber-100 text-amber-600' : response ? 'bg-emerald-50 text-[#01472e] hover:bg-emerald-100' : 'bg-slate-50 text-slate-300'}`}
          >
            <Volume2 className="w-5 h-5" />
          </button>

          <button
            onClick={toggleListen}
            className={`p-4 rounded-full shadow-lg transition-all ${isListening ? 'bg-rose-500 text-white animate-pulse shadow-rose-200' : 'bg-[#01472e] text-white hover:bg-[#025a3b] shadow-emerald-200'}`}
          >
            {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          
          <div className="w-11"></div> {/* Spacer for balance */}
        </div>
        
        {isListening && (
          <div className="bg-rose-50 text-rose-600 text-[10px] text-center py-1 font-medium tracking-widest uppercase">
            {t('ai.listening', undefined, 'Listening...')}
          </div>
        )}
      </div>
    </>
  );
};
