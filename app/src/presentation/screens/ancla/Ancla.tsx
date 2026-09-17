import React, { useState, useEffect, useRef } from 'react';
import type { BreathingPhase } from '@/domain/models';
import { generateBreathingGuide } from '@/infrastructure/api/aiClient';
import { ambientSound } from '@/infrastructure/audio/soundscapes';

type SoundType = 'rain' | 'waves' | 'alpha' | 'zen' | 'none';

const BREATHING_PHASES: BreathingPhase[] = [
  { label: 'Inhala', duration: 4000, color: 'text-teal-300', animation: 'animate-breathe-in' },
  { label: 'Retén', duration: 4000, color: 'text-indigo-300', animation: 'animate-breathe-hold' },
  { label: 'Exhala', duration: 4000, color: 'text-teal-300', animation: 'animate-breathe-out' },
  { label: 'Retén', duration: 4000, color: 'text-indigo-300', animation: 'animate-breathe-hold' },
];

const Ancla: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [selectedSound, setSelectedSound] = useState<SoundType>('waves');
  const [voiceGuide, setVoiceGuide] = useState<string>('');
  const [loadingGuide, setLoadingGuide] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setTimeout>;
    if (isActive) {
      const currentPhase = BREATHING_PHASES[phaseIndex];
      interval = setTimeout(() => {
        setPhaseIndex((prev) => (prev + 1) % BREATHING_PHASES.length);
        if (navigator.vibrate) navigator.vibrate(50);
      }, currentPhase.duration);
    }
    return () => clearTimeout(interval);
  }, [isActive, phaseIndex]);

  useEffect(() => {
    return () => {
      ambientSound.stop();
    };
  }, []);

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
      if (selectedSound !== 'none') {
        ambientSound.play(selectedSound as any);
      }
      if (voiceGuide) {
        playVoiceGuide();
      }
    } else {
      setIsActive(false);
      setPhaseIndex(0);
      ambientSound.stop();
      window.speechSynthesis.cancel();
    }
  };

  return (
    <div className="relative h-full flex flex-col items-center justify-center p-6 overflow-hidden animate-fade-in pb-24">
      {/* Animated background */}
      <div
        className={`absolute inset-0 bg-gradient-to-b from-calm-900 to-calm-800 transition-all duration-[4000ms] ${
          phaseIndex % 2 === 0 ? 'opacity-90' : 'opacity-100'
        }`}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-md">
        <h2 className="text-3xl font-light text-white mb-2 tracking-widest">ANCLA</h2>
        <p className="text-calm-highlight text-xs mb-8 text-center uppercase tracking-wider font-mono">
          Ejercicio 4-4-4-4 · Calma tu sistema nervioso
        </p>

        {/* Breathing Circle */}
        <div className="mb-8">
          <div
            className={`w-64 h-64 border-4 border-calm-accent/30 rounded-full flex items-center justify-center transition-all duration-[4000ms] ${
              isActive ? BREATHING_PHASES[phaseIndex].animation : ''
            }`}
          >
            <div
              className={`w-48 h-48 bg-calm-accent/10 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-[4000ms] ${
                isActive ? 'scale-110' : 'scale-100'
              }`}
            >
              <span className={`text-2xl font-light tracking-widest ${BREATHING_PHASES[phaseIndex].color}`}>
                {isActive ? BREATHING_PHASES[phaseIndex].label : 'Listo'}
              </span>
            </div>
          </div>
        </div>

        {/* Ambient Sound Selector */}
        {!isActive && (
          <div className="w-full mb-6 bg-calm-800/40 p-3 rounded-2xl border border-calm-700/40">
            <span className="text-[11px] text-gray-400 font-mono block mb-2 text-center uppercase">
              Sonido de fondo (Procedural)
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'waves', label: '🌊 Olas' },
                { id: 'rain', label: '🌧️ Lluvia' },
                { id: 'alpha', label: '🧘 Alfa' },
                { id: 'none', label: '🔇 Silencio' }
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSound(s.id as SoundType)}
                  className={`py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedSound === s.id
                      ? 'bg-teal-500/20 text-calm-accent border border-calm-accent/60'
                      : 'bg-calm-900/40 text-gray-400 hover:text-gray-200 border border-transparent'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="w-full space-y-3">
          <button
            onClick={toggleSession}
            className={`w-full py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300 shadow-lg ${
              isActive
                ? 'bg-red-500/20 text-red-200 border border-red-500/40 hover:bg-red-500/30'
                : 'bg-calm-accent text-calm-900 hover:bg-teal-300 active:scale-98'
            }`}
          >
            {isActive ? 'Detener Sesión' : 'Iniciar Respiración'}
          </button>

          {!voiceGuide && !isActive && (
            <button
              onClick={loadVoiceGuide}
              disabled={loadingGuide}
              className="w-full text-xs text-calm-highlight hover:text-white transition-colors py-1.5 flex items-center justify-center gap-1.5"
            >
              {loadingGuide ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-calm-accent border-t-transparent rounded-full animate-spin"></div>
                  <span>Generando guía de voz...</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5 text-calm-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.828 2.828" />
                  </svg>
                  <span>Activar Guía Hablada</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Ancla;
