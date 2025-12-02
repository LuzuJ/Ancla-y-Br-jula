
import React, { useState, useEffect, useRef } from 'react';
import { generateBreathingAudio } from '../services/geminiService';

// --- Sub-Component: Breathing Exercise ---
const BreathingExercise: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [isActive, setIsActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const BREATHING_PHASES = [
    { label: 'Inhala', duration: 4000, color: 'text-teal-300', animation: 'animate-breathe-in' },
    { label: 'Retén', duration: 4000, color: 'text-indigo-300', animation: 'animate-breathe-hold' },
    { label: 'Exhala', duration: 4000, color: 'text-teal-300', animation: 'animate-breathe-out' },
    { label: 'Retén', duration: 4000, color: 'text-indigo-300', animation: 'animate-breathe-hold' },
  ];

  useEffect(() => {
    let interval: any;
    if (isActive) {
      const currentPhase = BREATHING_PHASES[phaseIndex];
      interval = setTimeout(() => {
        setPhaseIndex((prev) => (prev + 1) % BREATHING_PHASES.length);
        if (navigator.vibrate) navigator.vibrate(50);
      }, currentPhase.duration);
    }
    return () => clearTimeout(interval);
  }, [isActive, phaseIndex]);

  const loadAudioGuide = async () => {
    setLoadingAudio(true);
    const text = "Inhala profundamente... dos... tres... cuatro. Retén el aire... siente la calma. Exhala suavemente... liberando tensión. Retén en el vacío... estás a salvo.";
    const buffer = await generateBreathingAudio(text);
    setAudioBuffer(buffer);
    setLoadingAudio(false);
  };

  const playAudio = () => {
    if (!audioBuffer) return;
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContextRef.current.destination);
    source.start();
  };

  const toggleSession = () => {
    if (!isActive) {
      setIsActive(true);
      if (audioBuffer) playAudio();
    } else {
      setIsActive(false);
      setPhaseIndex(0);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 animate-fade-in relative overflow-hidden">
       <button onClick={onBack} className="absolute top-4 left-4 text-white/50 hover:text-white z-50">
         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
       </button>
       <div className={`absolute inset-0 bg-gradient-to-b from-calm-900 to-calm-800 transition-colors duration-[4000ms] ${phaseIndex % 2 === 0 ? 'opacity-90' : 'opacity-100'}`} />
       
       <h2 className="text-3xl font-light text-white mb-12 z-10 tracking-widest">RESPIRA</h2>

      <div className="relative z-10 mb-12">
        <div 
          className={`w-64 h-64 border-4 border-calm-accent/30 rounded-full flex items-center justify-center transition-all duration-[4000ms] ${isActive ? BREATHING_PHASES[phaseIndex].animation : ''}`}
        >
          <div className={`w-48 h-48 bg-calm-accent/10 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-[4000ms] ${isActive ? 'scale-110' : 'scale-100'}`}>
             <span className={`text-2xl font-medium tracking-widest ${BREATHING_PHASES[phaseIndex].color}`}>
               {isActive ? BREATHING_PHASES[phaseIndex].label : 'Listo'}
             </span>
          </div>
        </div>
      </div>

      <div className="z-10 flex flex-col gap-4 w-full max-w-xs">
        <button
          onClick={toggleSession}
          className={`w-full py-4 rounded-xl text-lg font-medium transition-all duration-300 ${
            isActive 
              ? 'bg-red-500/20 text-red-200 hover:bg-red-500/30' 
              : 'bg-calm-accent text-calm-900 hover:bg-teal-300'
          }`}
        >
          {isActive ? 'Detener' : 'Iniciar'}
        </button>

        {!audioBuffer && !isActive && (
          <button 
            onClick={loadAudioGuide}
            disabled={loadingAudio}
            className="text-sm text-calm-700 hover:text-calm-accent transition-colors flex items-center justify-center gap-2"
          >
            {loadingAudio ? <span>Generando voz...</span> : <span>Activar Guía de Voz</span>}
          </button>
        )}
      </div>
    </div>
  );
};

// --- Sub-Component: Grounding 5-4-3-2-1 ---
const GroundingExercise: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [step, setStep] = useState(5);
  const steps = [
    { count: 5, label: "Cosas que ves", icon: "👁️", color: "text-blue-300" },
    { count: 4, label: "Cosas que tocas", icon: "🤚", color: "text-green-300" },
    { count: 3, label: "Cosas que oyes", icon: "👂", color: "text-yellow-300" },
    { count: 2, label: "Cosas que hueles", icon: "👃", color: "text-orange-300" },
    { count: 1, label: "Cosa que saboreas", icon: "👅", color: "text-pink-300" }
  ];

  const currentStep = steps.find(s => s.count === step) || steps[0];

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 animate-fade-in bg-calm-900">
      <button onClick={onBack} className="absolute top-4 left-4 text-white/50 hover:text-white z-50">
         <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
      </button>

      <div className="text-center space-y-8 max-w-sm">
        <h2 className="text-2xl font-light text-white tracking-widest mb-4">GROUNDING</h2>
        
        <div className="p-8 bg-calm-800 rounded-3xl border border-calm-700 shadow-2xl">
          <div className="text-6xl mb-4">{currentStep.icon}</div>
          <h3 className={`text-6xl font-bold mb-2 ${currentStep.color}`}>{currentStep.count}</h3>
          <p className="text-xl text-gray-300">{currentStep.label}</p>
        </div>

        <div className="flex justify-between gap-4 w-full">
           <button 
             onClick={() => setStep(s => Math.min(5, s + 1))}
             disabled={step === 5}
             className="px-6 py-3 rounded-xl bg-calm-800 text-gray-400 disabled:opacity-30 hover:bg-calm-700"
           >
             Anterior
           </button>
           <button 
             onClick={() => {
               if (step > 1) setStep(s => s - 1);
               else onBack();
             }}
             className="flex-1 px-6 py-3 rounded-xl bg-calm-accent text-calm-900 font-medium hover:bg-teal-300"
           >
             {step === 1 ? 'Terminar' : 'Siguiente'}
           </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Selector Component ---
interface AnclaProps {
  onOpenEspejo?: () => void;
}

const Ancla: React.FC<AnclaProps> = ({ onOpenEspejo }) => {
  const [mode, setMode] = useState<'MENU' | 'BREATHING' | 'GROUNDING'>('MENU');

  if (mode === 'BREATHING') return <BreathingExercise onBack={() => setMode('MENU')} />;
  if (mode === 'GROUNDING') return <GroundingExercise onBack={() => setMode('MENU')} />;

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 animate-fade-in relative bg-calm-900/95 backdrop-blur-sm">
      <h2 className="text-3xl font-light text-white mb-2 tracking-widest">CALMA</h2>
      <p className="text-gray-400 mb-12 text-center max-w-xs">Selecciona tu ancla para este momento</p>

      <div className="grid grid-cols-1 gap-6 w-full max-w-xs z-10">
        <button 
          onClick={() => setMode('BREATHING')}
          className="group relative overflow-hidden bg-gradient-to-br from-teal-900/50 to-calm-800 p-6 rounded-2xl border border-teal-500/30 hover:border-teal-400 transition-all shadow-lg text-left"
        >
          <div className="absolute right-[-20px] top-[-20px] w-24 h-24 bg-teal-500/10 rounded-full group-hover:scale-150 transition-transform" />
          <h3 className="text-xl font-medium text-white mb-1">Respiración</h3>
          <p className="text-sm text-teal-200/60">Técnica de caja 4-4-4-4</p>
        </button>

        <button 
          onClick={() => setMode('GROUNDING')}
          className="group relative overflow-hidden bg-gradient-to-br from-amber-900/50 to-calm-800 p-6 rounded-2xl border border-amber-500/30 hover:border-amber-400 transition-all shadow-lg text-left"
        >
          <div className="absolute right-[-20px] top-[-20px] w-24 h-24 bg-amber-500/10 rounded-full group-hover:scale-150 transition-transform" />
          <h3 className="text-xl font-medium text-white mb-1">Grounding</h3>
          <p className="text-sm text-amber-200/60">5 sentidos: Aquí y ahora</p>
        </button>

        <button 
          onClick={onOpenEspejo}
          className="group relative overflow-hidden bg-gradient-to-br from-indigo-900/50 to-calm-800 p-6 rounded-2xl border border-indigo-500/30 hover:border-indigo-400 transition-all shadow-lg text-left"
        >
          <div className="absolute right-[-20px] top-[-20px] w-24 h-24 bg-indigo-500/10 rounded-full group-hover:scale-150 transition-transform" />
          <h3 className="text-xl font-medium text-white mb-1">El Espejo</h3>
          <p className="text-sm text-indigo-200/60">Desahogo con IA empática</p>
        </button>
      </div>
    </div>
  );
};

export default Ancla;
