import React, { useState, useEffect, useRef } from 'react';
import { useChatStore } from '@/application/store';
import { anclaChat, detectDistortions } from '@/infrastructure/api/aiClient';
import type { ChatMessage, CognitiveDistortion } from '@/domain/models';
import { EMERGENCY_CONTACTS } from '@/domain/constants';
import { DISTORTION_GUIDE } from '@/domain/constants/distortions';

interface EspejoProps {
  onOpenVault: () => void;
}

const DISTORTION_LABELS: Record<CognitiveDistortion, string> = {
  'generalization': '⚡ Generalización',
  'all-or-nothing': '⚡ Todo o Nada',
  'catastrophizing': '⚡ Catastrofismo',
  'self-deprecation': '⚡ Devaluación Propia',
  'fortune-telling': '⚡ Adivinación',
  'mind-reading': '⚡ Lectura de Mente'
};

const Espejo: React.FC<EspejoProps> = ({ onOpenVault }) => {
  const { messages, addMessage, loadMessages } = useChatStore();
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [showEmergency, setShowEmergency] = useState(false);
  const [showPanicMode, setShowPanicMode] = useState(false);
  const [selectedDistortion, setSelectedDistortion] = useState<CognitiveDistortion | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    if (messages.length === 0) {
      addMessage({
        id: 'welcome',
        role: 'assistant',
        content: 'Hola. Soy tu Ancla. Estoy aquí para acompañarte sin juzgarte y ayudarte a poner en perspectiva lo que sientes. ¿Qué pasa por tu mente ahora mismo?',
        timestamp: new Date().toISOString()
      });
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking, streamingText]);

  const handleSend = async () => {
    if (!inputText.trim() || isThinking || streamingText) return;

    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date().toISOString(),
      distortions: detectDistortions(inputText.trim())
    };

    await addMessage(userMessage);
    setInputText('');
    setIsThinking(true);
    setStreamingText('');

    try {
      const result = await anclaChat.sendMessage(userMessage.content, (_chunk, accumulated) => {
        setIsThinking(false);
        setStreamingText(accumulated);
      });

      setStreamingText('');

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
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      setStreamingText('');
      const isTimeout = error?.message === 'TIMEOUT';
      await addMessage({
        id: `${Date.now()}-error`,
        role: 'assistant',
        content: isTimeout 
          ? 'La reflexión ha tardado más de lo habitual debido a la red. Respira profundo, haz una pausa y vuelve a intentarlo.'
          : 'El espejo se ha empañado un momento. Respira profundo e intenta enviar tu mensaje nuevamente.',
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsThinking(false);
      setStreamingText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
      return;
    }

    if (e.key === 'ArrowUp' && !inputText.trim()) {
      e.preventDefault();
      const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
      if (lastUserMsg) {
        setInputText(lastUserMsg.content);
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-calm-900 animate-fade-in relative pb-20">
      {/* Header */}
      <header className="p-4 border-b border-calm-800 flex justify-between items-center bg-calm-900/90 backdrop-blur-md shrink-0">
        <div>
          <span className="text-xs uppercase tracking-widest text-calm-accent font-mono">Espacio Terapéutico</span>
          <h2 className="text-xl font-light text-white tracking-widest">ESPEJO</h2>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setShowEmergency(true)}
            className="px-3 py-1 bg-rose-950/80 hover:bg-rose-900 border border-rose-700/50 rounded-lg text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
            title="Líneas de crisis gratuitas"
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            <span>SOS</span>
          </button>
        </div>
      </header>

      {/* Emergency Hotline Banner */}
      {showEmergency && (
        <div className="bg-rose-950/90 border-b border-rose-800 p-4 animate-fade-in shrink-0">
          <h3 className="text-rose-200 font-bold text-sm mb-1 flex items-center gap-2">
            <svg className="w-5 h-5 text-rose-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            ASISTENCIA INMEDIATA REQUERIDA
          </h3>
          <p className="text-rose-100 text-xs mb-3">Por favor, contacta a un servicio de apoyo profesional gratuito:</p>
          <div className="space-y-2.5">
            {EMERGENCY_CONTACTS.map((contact, index) => {
              const cleanPhone = contact.phone.replace(/[^\d+]/g, '');
              return (
                <div key={index} className="bg-calm-900/90 p-3.5 rounded-xl border border-rose-900/40 text-xs flex items-center justify-between">
                  <div>
                    <div className="text-white font-medium text-sm mb-0.5">{contact.name}</div>
                    <div className="text-gray-300 text-xs">{contact.description}</div>
                  </div>
                  <a
                    href={`tel:${cleanPhone}`}
                    className="px-3 py-1.5 rounded-lg bg-teal-950/80 hover:bg-teal-900 border border-calm-accent/60 text-calm-accent text-sm font-bold font-mono shrink-0 ml-3 flex items-center gap-1.5 shadow-sm"
                  >
                    <span>📞</span>
                    <span>{contact.phone}</span>
                  </a>
                </div>
              );
            })}
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
        <div className="absolute inset-0 z-40 bg-teal-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="w-24 h-24 rounded-full bg-teal-500/20 border-2 border-calm-accent flex items-center justify-center mb-6 animate-pulse">
            <span className="text-3xl">🫁</span>
          </div>
          <h3 className="text-2xl font-light text-white mb-2">Pausa y Respira</h3>
          <p className="text-calm-highlight text-sm max-w-xs mb-6">
            Inhala despacio en 4 segundos... Sostén en 4... Exhala en 4. Estás a salvo aquí y ahora.
          </p>
          <button
            onClick={() => setShowPanicMode(false)}
            className="px-6 py-2 bg-calm-accent text-calm-900 font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-teal-300 transition-all"
          >
            Volver al Chat
          </button>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            <div
              className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 text-sm sm:text-base leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-calm-accent text-calm-900 rounded-br-none shadow-md font-medium'
                  : 'bg-calm-800/80 text-gray-100 rounded-bl-none border border-calm-700/40 shadow-sm'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {/* In-chat interactive Vault Trigger button */}
              {msg.trigger === 'VAULT' && (
                <div className="mt-3 pt-3 border-t border-calm-700/50">
                  <button
                    onClick={onOpenVault}
                    className="w-full py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-amber-950/80 via-calm-900 to-teal-950/80 hover:from-amber-900/90 hover:to-teal-900/90 border border-amber-500/40 text-xs sm:text-sm font-semibold text-amber-200 flex items-center justify-center gap-2 transition-all active:scale-98 shadow-md"
                  >
                    <span>🏛️</span>
                    <span>Abrir La Bóveda de Evidencias</span>
                  </button>
                </div>
              )}

              {/* Distortions Pill Tagging */}
              {msg.distortions && msg.distortions.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-calm-700/40 flex flex-wrap gap-1.5">
                  {msg.distortions.map((dist, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedDistortion(dist)}
                      className="text-xs px-2.5 py-1 bg-amber-950/80 hover:bg-amber-900 border border-amber-500/50 rounded-full text-amber-200 font-mono flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                      title="Toca para ver cómo cuestionar este sesgo"
                    >
                      <span>{DISTORTION_LABELS[dist] || dist}</span>
                      <span className="text-[10px] opacity-75">ℹ️</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Timestamp */}
              <div className="text-[11px] text-gray-400 mt-2 text-right font-mono">
                {new Date(msg.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}

        {/* Streaming message bubble */}
        {streamingText && (
          <div className="flex justify-start animate-fade-in">
            <div className="max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 text-sm sm:text-base leading-relaxed bg-calm-800/90 text-gray-100 rounded-bl-none border border-teal-500/40 shadow-lg">
              <div className="whitespace-pre-wrap">{streamingText}</div>
              <span className="inline-block w-2 h-4 bg-calm-accent ml-1 animate-pulse align-middle" />
            </div>
          </div>
        )}

        {isThinking && !streamingText && (
          <div className="flex justify-start">
            <div className="bg-calm-800/60 rounded-2xl p-4 flex gap-1.5 items-center border border-calm-700/40 shadow-sm">
              <div className="w-2 h-2 bg-calm-accent rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-calm-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-calm-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <span className="text-xs text-calm-highlight ml-2 font-mono">Reflexionando contigo...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 sm:p-4 border-t border-calm-800 bg-calm-950/90 shrink-0">
        <div className="flex items-end gap-2 bg-calm-800/70 rounded-2xl px-4 py-2 border border-calm-700/60 focus-within:border-calm-accent transition-colors shadow-inner">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe lo que sientes... (Enter para enviar, Shift+Enter para salto)"
            rows={1}
            className="flex-1 bg-transparent border-none focus:ring-0 text-white placeholder-gray-400 text-sm sm:text-base resize-none max-h-32 py-2 leading-relaxed focus:outline-none"
            style={{ minHeight: '28px' }}
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isThinking}
            className="p-2.5 bg-calm-accent rounded-full text-calm-900 hover:bg-teal-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 active:scale-95 shadow-md"
            title="Enviar mensaje"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-[11px] text-gray-500 mt-1.5 text-center font-mono">
          Usa ↑ para recuperar tu último mensaje · Espacio privado en tu dispositivo
        </p>
      </div>

      {/* Socratic Reframing Modal */}
      {selectedDistortion && DISTORTION_GUIDE[selectedDistortion] && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedDistortion(null)}
        >
          <div 
            className="max-w-md w-full bg-calm-900 border border-amber-600/40 rounded-2xl p-6 shadow-2xl space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-calm-700/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{DISTORTION_GUIDE[selectedDistortion].emoji}</span>
                <div>
                  <h3 className="text-base font-semibold text-white">
                    {DISTORTION_GUIDE[selectedDistortion].name}
                  </h3>
                  <span className="text-[11px] text-amber-400 font-mono">Sesgo Cognitivo Detectado</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedDistortion(null)}
                className="text-gray-400 hover:text-white p-1 text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed bg-calm-800/50 p-3 rounded-xl border border-calm-700/40">
              {DISTORTION_GUIDE[selectedDistortion].description}
            </p>

            <div>
              <h4 className="text-xs uppercase tracking-wider text-calm-accent font-semibold mb-2">
                Preguntas Socráticas para Cuestionarlo:
              </h4>
              <ul className="space-y-2">
                {DISTORTION_GUIDE[selectedDistortion].socraticQuestions.map((q, idx) => (
                  <li key={idx} className="text-xs text-gray-300 flex items-start gap-2 bg-calm-950/40 p-2.5 rounded-lg border border-calm-800">
                    <span className="text-calm-accent font-bold">•</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-2 border-t border-calm-700/40 flex gap-2">
              <button
                onClick={() => {
                  setInputText(DISTORTION_GUIDE[selectedDistortion].reframeTemplate);
                  setSelectedDistortion(null);
                }}
                className="flex-1 py-2 px-3 bg-calm-accent text-calm-900 rounded-xl text-xs font-bold hover:bg-teal-300 transition-all"
              >
                Usar plantilla de reestructuración
              </button>
              <button
                onClick={() => setSelectedDistortion(null)}
                className="py-2 px-3 bg-calm-800 text-gray-300 rounded-xl text-xs hover:bg-calm-700 transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Espejo;
