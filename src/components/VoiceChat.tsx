'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, ArrowUp, Plus, Search, Microscope, Brain, BookOpen, Code, PenTool } from 'lucide-react';

export default function VoiceChat() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [inputText, setInputText] = useState('');
  const [response, setResponse] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = async (event: any) => {
        const text = event.results[0][0].transcript;
        setTranscript(text);
        setIsListening(false);
        await handleSend(text);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
    }
  }, []);

  const toggleListen = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setResponse('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleSend = async (text: string) => {
    setIsThinking(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: text }]
        })
      });
      const data = await res.json();
      setResponse(data.text);
      speakResponse(data.text);
    } catch (err) {
      console.error(err);
      setResponse("Sorry, there was an error processing your request.");
    } finally {
      setIsThinking(false);
    }
  };

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSubmitText = async () => {
    if (!inputText.trim()) return;
    const text = inputText;
    setInputText('');
    setTranscript(text);
    await handleSend(text);
  };

  return (
    <div className="flex flex-col items-center max-w-3xl mx-auto w-full py-8 space-y-12">
      {/* Top Logo and text */}
      <div className="flex flex-col items-center space-y-6">
        <div className="relative flex items-center justify-center w-24 h-24">
          <div className="absolute w-24 h-24 bg-blue-500 rounded-full opacity-20 blur-xl"></div>
          <div className="absolute w-16 h-16 rounded-full border-[10px] border-blue-500"></div>
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-semibold text-blue-500 tracking-tight">Ready to assist you</h2>
          <p className="text-gray-500 text-sm">Ask me anything or try one of the suggestions below</p>
        </div>
      </div>

      {/* Main input box */}
      <div className="w-full bg-white border border-gray-200 rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-4 space-y-3 transition-shadow relative">
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

      {/* Suggestion Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
         <button onClick={() => {setInputText('Learn about Class 11 English'); handleSubmitText();}} className="flex flex-col items-center justify-center py-6 px-4 bg-white border border-gray-200 rounded-2xl hover:border-gray-300 hover:shadow-sm transition gap-3">
           <BookOpen className="w-6 h-6 text-gray-400" />
           <span className="text-sm font-medium text-gray-700">Learn</span>
         </button>
         <button onClick={() => {setInputText('Quiz me on a chapter'); handleSubmitText();}} className="flex flex-col items-center justify-center py-6 px-4 bg-white border border-gray-200 rounded-2xl hover:border-gray-300 hover:shadow-sm transition gap-3">
           <Code className="w-6 h-6 text-gray-400" />
           <span className="text-sm font-medium text-gray-700">Quiz</span>
         </button>
         <button onClick={() => {setInputText('Write an essay'); handleSubmitText();}} className="flex flex-col items-center justify-center py-6 px-4 bg-white border border-gray-200 rounded-2xl hover:border-gray-300 hover:shadow-sm transition gap-3">
           <PenTool className="w-6 h-6 text-gray-400" />
           <span className="text-sm font-medium text-gray-700">Write</span>
         </button>
      </div>

      {/* Response Area */}
      <div className="w-full space-y-4">
        {transcript && (
          <div className="bg-gray-50 border border-gray-100 p-5 rounded-2xl w-full">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">You</p>
            <p className="text-gray-800">{transcript}</p>
          </div>
        )}
        
        {isThinking && (
          <div className="flex items-center gap-2 text-blue-500 p-4">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        )}

        {response && (
          <div className="bg-white border border-blue-100 shadow-sm p-6 rounded-3xl w-full">
            <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-2">AI Tutor</p>
            <p className="text-gray-800 leading-relaxed">{response}</p>
          </div>
        )}
      </div>
    </div>
  );
}
