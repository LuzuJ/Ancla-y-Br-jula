import React, { useState, useRef, useEffect } from 'react';
import { createChatSession } from '../services/geminiService';
import { ChatMessage } from '../types';

const Espejo: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Hola. Soy tu espejo. No estoy aquí para juzgarte ni arreglarte, solo para escucharte. ¿Qué pesa en tu mente hoy?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const chatSessionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat session once
    if (!chatSessionRef.current) {
      chatSessionRef.current = createChatSession();
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!inputText.trim() || isThinking) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: inputText };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);

    try {
      const result = await chatSessionRef.current.sendMessage(userMsg.text);
      const responseText = result.response.text();
      
      const modelMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: responseText };
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error("Chat Error", error);
      setMessages(prev => [...prev, { id: 'error', role: 'model', text: 'Lo siento, el espejo se ha empañado un momento. Intenta de nuevo.' }]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-calm-900 animate-fade-in">
      <header className="p-4 border-b border-calm-800 flex items-center justify-between">
         <h2 className="text-xl font-light text-white tracking-widest">EL ESPEJO</h2>
         <div className="text-xs text-calm-highlight px-2 py-1 rounded-full bg-calm-800/50">Gemini 3 Pro</div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-calm-700 text-white rounded-br-none' 
                : 'bg-calm-800/80 text-gray-200 rounded-bl-none border border-calm-700/50'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isThinking && (
           <div className="flex justify-start">
             <div className="bg-calm-800/50 rounded-2xl p-4 flex gap-1">
               <div className="w-2 h-2 bg-calm-accent rounded-full animate-bounce"></div>
               <div className="w-2 h-2 bg-calm-accent rounded-full animate-bounce delay-75"></div>
               <div className="w-2 h-2 bg-calm-accent rounded-full animate-bounce delay-150"></div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-calm-800 bg-calm-900">
        <div className="flex items-center gap-2 bg-calm-800 rounded-full px-4 py-2 border border-calm-700 focus-within:border-calm-accent transition-colors">
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Escribe lo que sientes..." 
            className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 text-sm h-10"
          />
          <button 
            onClick={handleSend}
            disabled={!inputText.trim() || isThinking}
            className="p-2 bg-calm-accent rounded-full text-calm-900 hover:bg-teal-300 disabled:opacity-50 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Espejo;