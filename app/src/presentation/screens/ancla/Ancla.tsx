import React, { useState, useEffect, useRef } from 'react';
import type { BreathingPhase } from '@/domain/models';
import { generateBreathingGuide } from '@/infrastructure/api/gemini';

const BREATHING_PHASES: BreathingPhase[] = [
  { label: 'Inhala', duration: 4000, color: 'text-teal-300', animation: 'animate-breathe-in' },
  { label: 'Retén', duration: 4000, color: 'text-indigo-300', animation: 'animate-breathe-hold' },
  { label: 'Exhala', duration: 4000, color: 'text-teal-300', animation: 'animate-breathe-out' },
  { label: 'Retén', duration: 4000, color: 'text-indigo-300', animation: 'animate-breathe-hold' },
];

const Ancla: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [voiceGuide, setVoiceGuide] = useState<string>('');
  const [loadingGuide, setLoadingGuide] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      const currentPhase = BREATHING_PHASES[phaseIndex];
      interval = setTimeout(() => {
        setPhaseIndex((prev) => (prev + 1) % BREATHING_PHASES.length);
        if (navigator.vibrate) navigator.vibrate(50);
      }, currentPhase.duration);
    }
    return () => clearTimeout(interval);
  }, [isActive, phaseIndex]);

  const loadVoiceGuide = async () => {
    setLoadingGuide(true);
    try {
      const guide = await generateBreathingGuide();
      setVoiceGuide(guide);
    } catch (error) {
      setVoiceGuide('Inhala profundamente... dos... tres... cuatro. Retén el aire. Exhala suavemente. Retén. Estás a salvo.');
    }
    setLoadingGuide(false);
  };

  const playVoiceGuide = () => {
    if (!voiceGuide) return;
    
    // Stop any current speech
    window.speechSynthesis.cancel();

    utteranceRef.current = new SpeechSynthesisUtterance(voiceGuide);
    utteranceRef.current.lang = 'es-ES';
    utteranceRef.current.rate = 0.8;
    utteranceRef.current.pitch = 1;
    
    window.speechSynthesis.speak(utteranceRef.current);
  };

  const toggleSession = () => {
    if (!isActive) {
      setIsActive(true);
      if (voiceGuide) {
        playVoiceGuide();
      }
    } else {
      setIsActive(false);
      setPhaseIndex(0);
      window.speechSynthesis.cancel();
    }
  };

  return (
    <div className="relative h-full flex flex-col items-center justify-center p-6 overflow-hidden animate-fade-in">
      {/* Animated background */}
      <div
        className={`absolute inset-0 bg-gradient-to-b from-calm-900 to-calm-800 transition-all duration-[4000ms] ${
          phaseIndex % 2 === 0 ? 'opacity-90' : 'opacity-100'
        }`}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-md">
        <h2 className="text-4xl font-light text-white mb-4 tracking-widest">ANCLA</h2>
        <p className="text-calm-highlight text-sm mb-12 text-center">
          Ejercicio 4-4-4-4 · Calma tu sistema nervioso
        </p>

        {/* Breathing Circle */}
        <div className="mb-16">
          <div
            className={`w-72 h-72 border-4 border-calm-accent/30 rounded-full flex items-center justify-center transition-all duration-[4000ms] ${
              isActive ? BREATHING_PHASES[phaseIndex].animation : ''
            }`}
          >
            <div
              className={`w-56 h-56 bg-calm-accent/10 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-[4000ms] ${
                isActive ? 'scale-110' : 'scale-100'
              }`}
            >
              <span className={`text-3xl font-medium tracking-widest ${BREATHING_PHASES[phaseIndex].color}`}>
                {isActive ? BREATHING_PHASES[phaseIndex].label : 'Listo'}
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full space-y-4">
          <button
            onClick={toggleSession}
            className={`w-full py-4 rounded-xl text-lg font-medium transition-all duration-300 ${
              isActive
                ? 'bg-red-500/20 text-red-200 hover:bg-red-500/30'
                : 'bg-calm-accent text-calm-900 hover:bg-teal-300'
            }`}
          >
            {isActive ? 'Detener' : 'Iniciar Sesión'}
          </button>

          {!voiceGuide && !isActive && (
            <button
              onClick={loadVoiceGuide}
              disabled={loadingGuide}
              className="w-full text-sm text-calm-700 hover:text-calm-accent transition-colors py-2 flex items-center justify-center gap-2"
            >
              {loadingGuide ? (
                <>
                  <div className="w-4 h-4 border-2 border-calm-accent border-t-transparent rounded-full animate-spin"></div>
                  Generando guía...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.828 2.828" />
                  </svg>
                  Activar Guía de Voz
                </>
              )}
            </button>
          )}

          {voiceGuide && !isActive && (
            <button
              onClick={playVoiceGuide}
              className="w-full text-sm text-calm-accent hover:text-teal-300 transition-colors py-2 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Reproducir Guía
            </button>
          )}
        </div>

        {/* Info */}
        {!isActive && (
          <div className="mt-8 text-center space-y-2">
            <p className="text-gray-400 text-sm">
              Este ejercicio activa tu sistema nervioso parasimpático
            </p>
            <p className="text-gray-500 text-xs">
              Respiración cuadrada 4-4-4-4 (Inhalar-Retener-Exhalar-Retener)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ancla;
