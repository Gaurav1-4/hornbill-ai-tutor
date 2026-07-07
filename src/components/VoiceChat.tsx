'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, ArrowUp, Plus, Search, Microscope, Brain, BookOpen, Code, PenTool, Volume2 } from 'lucide-react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function VoiceChat() {
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  
  const recognitionRef = useRef<any>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch initial chat history
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/chat');
        if (res.ok) {
          const data = await res.json();
          if (data.messages) {
            setMessages(data.messages);
          }
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
      }
    };
    fetchHistory();

    // Initialize Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = async (event: any) => {
        const text = event.results[0][0].transcript;
        setIsListening(false);
        await handleSend(text);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
    }

    // Load available voices
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      // Try to find a good default English voice
      const defaultVoice = availableVoices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha') || v.lang === 'en-US');
      if (defaultVoice) {
        setSelectedVoice(defaultVoice.name);
      } else if (availableVoices.length > 0) {
        setSelectedVoice(availableVoices[0].name);
      }
    };
    
    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleSend = async (text: string) => {
    const newMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, newMsg]);
    setIsThinking(true);
    
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      
      const assistantMsg: Message = { role: 'assistant', content: data.text };
      setMessages(prev => [...prev, assistantMsg]);
      speakResponse(data.text);
    } catch (err) {
      console.error(err);
    } finally {
      setIsThinking(false);
    }
  };

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any current speech
      const utterance = new SpeechSynthesisUtterance(text);
      
      const voice = voices.find(v => v.name === selectedVoice);
      if (voice) {
        utterance.voice = voice;
      }
      
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSubmitText = async () => {
    if (!inputText.trim()) return;
    const text = inputText;
    setInputText('');
    await handleSend(text);
  };

  return (
    <div className="flex flex-col items-center max-w-4xl mx-auto w-full py-8 space-y-8 h-[85vh]">
      {/* Top Logo and text */}
      <div className="flex flex-col items-center space-y-4 shrink-0">
        <div className="relative flex items-center justify-center w-16 h-16">
          <div className="absolute w-16 h-16 bg-blue-500 rounded-full opacity-20 blur-lg"></div>
          <div className="absolute w-10 h-10 rounded-full border-[6px] border-blue-500"></div>
        </div>
        {messages.length === 0 && (
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-semibold text-blue-500 tracking-tight">Ready to assist you</h2>
            <p className="text-gray-500 text-sm">Ask me anything or try one of the suggestions below</p>
          </div>
        )}
      </div>

      {/* Voice Selection */}
      <div className="shrink-0 flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-full text-xs text-gray-600 shadow-sm">
        <Volume2 className="w-3.5 h-3.5" />
        <span>Voice:</span>
        <select 
          value={selectedVoice} 
          onChange={(e) => setSelectedVoice(e.target.value)}
          className="bg-transparent outline-none border-none cursor-pointer max-w-[150px] truncate"
        >
          {voices.filter(v => v.lang.startsWith('en')).map(v => (
            <option key={v.name} value={v.name}>{v.name}</option>
          ))}
        </select>
      </div>

      {/* Response Area (Scrollable) */}
      <div 
        ref={chatContainerRef}
        className="w-full flex-1 overflow-y-auto space-y-6 px-4 scroll-smooth"
      >
        {messages.length === 0 && (
          /* Suggestion Cards for empty state */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-4">
             <button onClick={() => handleSend('Learn about Class 11 English Hornbill')} className="flex flex-col items-center justify-center py-6 px-4 bg-white border border-gray-200 rounded-2xl hover:border-gray-300 hover:shadow-sm transition gap-3">
               <BookOpen className="w-6 h-6 text-gray-400" />
               <span className="text-sm font-medium text-gray-700">Learn</span>
             </button>
             <button onClick={() => handleSend('Quiz me on a chapter')} className="flex flex-col items-center justify-center py-6 px-4 bg-white border border-gray-200 rounded-2xl hover:border-gray-300 hover:shadow-sm transition gap-3">
               <Code className="w-6 h-6 text-gray-400" />
               <span className="text-sm font-medium text-gray-700">Quiz</span>
             </button>
             <button onClick={() => handleSend('Write a summary of The Portrait of a Lady')} className="flex flex-col items-center justify-center py-6 px-4 bg-white border border-gray-200 rounded-2xl hover:border-gray-300 hover:shadow-sm transition gap-3">
               <PenTool className="w-6 h-6 text-gray-400" />
               <span className="text-sm font-medium text-gray-700">Write</span>
             </button>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`w-full flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-4 max-w-[80%] rounded-2xl ${msg.role === 'user' ? 'bg-gray-100 text-gray-800 rounded-br-none' : 'bg-white border border-blue-100 shadow-sm rounded-bl-none'}`}>
               <p className="text-xs font-semibold uppercase tracking-wider mb-2 opacity-50">
                 {msg.role === 'user' ? 'You' : 'AI Tutor'}
               </p>
               <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        
        {isThinking && (
          <div className="flex items-center gap-2 text-blue-500 p-4">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        )}
      </div>

      {/* Main input box */}
      <div className="shrink-0 w-full bg-white border border-gray-200 rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-4 space-y-3 transition-shadow relative">
        <textarea 
           value={inputText}
           onChange={(e) => setInputText(e.target.value)}
           placeholder="Ask me anything..."
           className="w-full bg-transparent border-none outline-none resize-none min-h-[60px] text-gray-800 placeholder:text-gray-400"
           onKeyDown={(e) => {
             if (e.key === 'Enter' && !e.shiftKey) {
               e.preventDefault();
               handleSubmitText();
             }
           }}
        />
        
        {/* Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-500 rounded-full hover:bg-gray-100 transition border border-gray-100">
            <Search className="w-3.5 h-3.5" />
            Search
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-500 rounded-full hover:bg-gray-100 transition border border-gray-100">
            <Microscope className="w-3.5 h-3.5" />
            Deep Research
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-500 rounded-full hover:bg-gray-100 transition border border-gray-100">
            <Brain className="w-3.5 h-3.5" />
            Reason
          </button>
        </div>

        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition font-medium">
            <Plus className="w-4 h-4" />
            Upload Files
          </button>
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleListen}
              title="Voice Input"
              className={`p-2 rounded-full transition ${isListening ? 'bg-red-50 text-red-500 animate-pulse' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <button 
              onClick={handleSubmitText}
              disabled={!inputText.trim()}
              className={`p-2 rounded-full transition ${inputText.trim() ? 'bg-gray-900 text-white hover:bg-gray-800' : 'bg-gray-50 text-gray-300'}`}
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
