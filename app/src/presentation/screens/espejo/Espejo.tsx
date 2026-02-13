import React, { useState, useEffect, useRef } from 'react';
import { useChatStore } from '@/application/store';
import { anclaChat } from '@/infrastructure/api/gemini';
import type { ChatMessage } from '@/domain/models';
import { EMERGENCY_CONTACTS } from '@/domain/constants';

interface EspejoProps {
  onOpenVault: () => void;
}

const Espejo: React.FC<EspejoProps> = ({ onOpenVault }) => {
  const { messages, addMessage, loadMessages } = useChatStore();
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [showPanicMode, setShowPanicMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    
    // Add welcome message if first time
    if (messages.length === 0) {
      addMessage({
        id: 'welcome',
        role: 'assistant',
        content: 'Hola. Soy Ancla, tu acompañante emocional. No estoy aquí para juzgarte ni arreglarte, solo para ayudarte a reestructurar pensamientos y encontrar calma. ¿Qué pesa en tu mente hoy?',
        timestamp: new Date().toISOString()
      });
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSend = async () => {
    if (!inputText.trim() || isThinking) return;

    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      content: inputText,
      timestamp: new Date().toISOString()
    };

    await addMessage(userMessage);
    setInputText('');
    setIsThinking(true);

    try {
      const result = await anclaChat.sendMessage(userMessage.content);

      const assistantMessage: ChatMessage = {
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        content: result.response,
        timestamp: new Date().toISOString(),
        trigger: result.trigger || undefined,
        distortions: result.distortions
      };

      await addMessage(assistantMessage);

      // Handle triggers
      if (result.trigger === 'EMERGENCY_CONTACT') {
        setShowEmergency(true);
      } else if (result.trigger === 'PANIC_MODE') {
        setShowPanicMode(true);
        setTimeout(() => setShowPanicMode(false), 5000);
      } else if (result.trigger === 'VAULT') {
        // Show vault button
        setTimeout(() => {
          if (window.confirm('¿Quieres abrir La Bóveda para ver las evidencias de tu valor?')) {
            onOpenVault();
          }
        }, 1000);
      }
    } catch (error) {
      console.error('Chat error:', error);
      await addMessage({
        id: `${Date.now()}-error`,
        role: 'assistant',
        content: 'Lo siento, he perdido la conexión un momento. Respira profundo e intenta de nuevo.',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-calm-900 relative">
      {/* Header */}
      <header className="p-4 border-b border-calm-800 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xl font-light text-white tracking-widest">ANCLA · TCC</h2>
          <p className="text-xs text-calm-highlight mt-1">Terapia Cognitivo-Conductual</p>
        </div>
        <div className="text-xs text-calm-700 px-3 py-1 rounded-full bg-calm-800/50 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          En línea
        </div>
      </header>

      {/* Emergency Banner */}
      {showEmergency && (
        <div className="bg-red-900/30 border-l-4 border-red-500 p-4 animate-fade-in shrink-0">
          <h3 className="text-red-200 font-bold mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            NECESITAS AYUDA PROFESIONAL AHORA
          </h3>
          <p className="text-red-100 text-sm mb-3">Por favor, contacta a uno de estos servicios de emergencia:</p>
          <div className="space-y-2">
            {EMERGENCY_CONTACTS.map((contact, index) => (
              <div key={index} className="bg-calm-800/50 p-3 rounded-lg text-sm">
                <div className="text-white font-medium mb-1">{contact.name}</div>
                <div className="text-calm-accent text-lg font-bold">{contact.phone}</div>
                <div className="text-gray-400 text-xs">{contact.description}</div>
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowEmergency(false)}
            className="mt-3 text-xs text-gray-400 hover:text-white"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* Panic Mode Overlay */}
      {showPanicMode && (
        <div className="absolute inset-0 bg-calm-900/95 z-50 flex items-center justify-center p-8 animate-fade-in">
          <div className="text-center">
            <div className="w-32 h-32 mx-auto mb-8 border-4 border-calm-accent rounded-full flex items-center justify-center animate-breathe-in">
              <div className="w-24 h-24 bg-calm-accent/20 rounded-full"></div>
            </div>
            <h2 className="text-3xl font-light text-white mb-4">RESPIRA</h2>
            <p className="text-calm-highlight text-lg">Estás a salvo. Esto va a pasar.</p>
            <p className="text-gray-400 mt-4 text-sm">Inhala... retén... exhala... retén...</p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-calm-700 text-white rounded-br-none'
                : 'bg-calm-800/80 text-gray-200 rounded-bl-none border border-calm-700/50'
            }`}>
              <div className="whitespace-pre-wrap">{msg.content}</div>
              
              {/* Distortions Badge */}
              {msg.distortions && msg.distortions.length > 0 && msg.role === 'user' && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {msg.distortions.map((dist, index) => (
                    <span key={index} className="text-xs px-2 py-1 bg-calm-600 rounded-full text-calm-accent">
                      {dist}
                    </span>
                  ))}
                </div>
              )}

              {/* Timestamp */}
              <div className="text-xs text-gray-500 mt-2">
                {new Date(msg.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="flex justify-start">
            <div className="bg-calm-800/50 rounded-2xl p-4 flex gap-1">
              <div className="w-2 h-2 bg-calm-accent rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-calm-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-calm-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-calm-800 bg-calm-900 shrink-0">
        <div className="flex items-end gap-2 bg-calm-800 rounded-2xl px-4 py-2 border border-calm-700 focus-within:border-calm-accent transition-colors">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Escribe lo que sientes..."
            rows={1}
            className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 text-sm resize-none max-h-32 py-2"
            style={{ minHeight: '24px' }}
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isThinking}
            className="p-2 bg-calm-accent rounded-full text-calm-900 hover:bg-teal-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-gray-600 mt-2 text-center">
          Ancla no reemplaza ayuda profesional. Si tienes pensamientos de autolesión, busca ayuda inmediata.
        </p>
      </div>
    </div>
  );
};

export default Espejo;
