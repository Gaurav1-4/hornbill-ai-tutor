'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, MessageSquare } from 'lucide-react';

export default function VoiceChat() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
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

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold flex items-center justify-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Talk to your AI Tutor
        </h3>
        <p className="text-gray-500 text-sm">Click the mic and ask me anything about the Hornbill textbook.</p>
      </div>

      <button 
        onClick={toggleListen}
        className={`p-6 rounded-full transition-all shadow-lg ${
          isListening 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse text-white' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
      </button>

      <div className="w-full max-w-2xl text-center space-y-4 mt-4">
        {transcript && (
          <div className="bg-gray-100 p-4 rounded-lg inline-block text-left w-full">
            <p className="text-sm font-semibold text-gray-500">You said:</p>
            <p className="text-gray-800">{transcript}</p>
          </div>
        )}
        
        {isThinking && <p className="text-blue-500 animate-pulse">Tutor is thinking...</p>}

        {response && (
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg inline-block text-left w-full shadow-sm">
            <p className="text-sm font-semibold text-blue-500">Tutor says:</p>
            <p className="text-blue-900">{response}</p>
          </div>
        )}
      </div>
    </div>
  );
}
