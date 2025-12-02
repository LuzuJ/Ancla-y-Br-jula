
import React, { useState } from 'react';

interface OnboardingProps {
  onComplete: () => void;
}

const SLIDES = [
  {
    title: "Ancla",
    desc: "Tu botón de pánico personal. Regula emociones fuertes con respiración guiada.",
    icon: (
      <svg className="w-24 h-24 text-calm-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
    )
  },
  {
    title: "Brújula",
    desc: "Encuentra norte diario con arte, filosofía y micro-acciones para tu bienestar.",
    icon: (
      <svg className="w-24 h-24 text-calm-highlight" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
    )
  },
  {
    title: "Privacidad",
    desc: "Tus datos viven en tu dispositivo. Tecnología calmada que te respeta.",
    icon: (
      <svg className="w-24 h-24 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
    )
  }
];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const next = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(c => c + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="flex flex-col items-center justify-between h-full p-8 bg-calm-900 animate-fade-in relative overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 z-10">
        <div className="animate-pulse">
           {SLIDES[currentSlide].icon}
        </div>
        <div>
          <h2 className="text-3xl font-light text-white mb-4 tracking-widest">{SLIDES[currentSlide].title}</h2>
          <p className="text-gray-400 leading-relaxed max-w-xs mx-auto">{SLIDES[currentSlide].desc}</p>
        </div>
      </div>

      <div className="w-full z-10">
        <div className="flex justify-center gap-2 mb-8">
          {SLIDES.map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === currentSlide ? 'w-8 bg-calm-accent' : 'w-2 bg-calm-700'}`} />
          ))}
        </div>
        <button 
          onClick={next}
          className="w-full py-4 bg-calm-accent text-calm-900 font-medium rounded-xl text-lg hover:bg-teal-300 transition-colors"
        >
          {currentSlide === SLIDES.length - 1 ? 'Comenzar' : 'Siguiente'}
        </button>
      </div>

      {/* Decorative background */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-calm-accent/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-calm-highlight/5 rounded-full blur-3xl" />
    </div>
  );
};

export default Onboarding;
