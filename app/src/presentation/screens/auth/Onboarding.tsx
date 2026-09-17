import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/application/store';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [welcomePhrase, setWelcomePhrase] = useState('');
  const [name, setName] = useState('');
  const { signUpLocal } = useAuthStore();

  useEffect(() => {
    // Solo un pequeño fallback visual si Gemini falla, pero idealmente BYOK ya debe estar. 
    // Como aún no han configurado API, quizás falle. Mejor hardcodear algo gentil.
    setWelcomePhrase('Tu espacio de calma interior');
  }, []);

  const slides = [
    {
      title: 'Ancla y Brújula',
      subtitle: welcomePhrase,
      icon: (
        <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      description: 'Una aplicación de acompañamiento emocional basada en Terapia Cognitivo-Conductual (TCC).'
    },
    {
      title: 'Ancla',
      subtitle: 'Asistente TCC',
      icon: (
        <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      description: 'Conversa con Ancla para reestructurar pensamientos negativos y gestionar ansiedad usando lógica y empatía.'
    },
    {
      title: 'Privacidad Absoluta',
      subtitle: 'Tus datos son tuyos',
      icon: (
        <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      description: 'Ancla funciona de manera 100% local. Tu diario y emociones nunca se envían a la nube.'
    },
    {
      title: '¿Cómo te llamas?',
      subtitle: 'Para personalizar tu experiencia',
      icon: (
        <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      description: 'Ingresa tu nombre o un apodo. Esto se guardará únicamente en este dispositivo.',
      isInput: true
    }
  ];

  const currentSlide = slides[step - 1];

  const handleComplete = async () => {
    const finalName = name.trim() || 'Amigo';
    await signUpLocal(finalName);
    onComplete();
  };

  return (
    <div className="min-h-screen bg-calm-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-12 animate-fade-in">
          <div className="text-calm-accent mb-8 flex justify-center">
            {currentSlide.icon}
          </div>
          <h2 className="text-3xl font-light text-white tracking-widest mb-2">
            {currentSlide.title}
          </h2>
          <p className="text-calm-highlight text-sm mb-8">
            {currentSlide.subtitle}
          </p>
          
          {currentSlide.isInput ? (
            <div className="mb-8 px-4">
              <p className="text-gray-400 leading-relaxed mb-4">
                {currentSlide.description}
              </p>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre..."
                className="w-full bg-calm-800 border border-calm-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-calm-accent text-center"
                autoFocus
              />
            </div>
          ) : (
            <p className="text-gray-400 leading-relaxed">
              {currentSlide.description}
            </p>
          )}
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setStep(index + 1)}
              className={`h-2 rounded-full transition-all ${
                step === index + 1 ? 'w-8 bg-calm-accent' : 'w-2 bg-calm-700'
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex gap-4">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex-1 py-3 border border-calm-700 text-gray-400 rounded-xl hover:border-calm-600 hover:text-white transition-colors"
            >
              Anterior
            </button>
          )}
          <button
            onClick={() => {
              if (step < slides.length) {
                setStep(step + 1);
              } else {
                handleComplete();
              }
            }}
            className="flex-1 py-3 bg-calm-accent text-calm-900 rounded-xl font-medium hover:bg-teal-300 transition-colors"
          >
            {step < slides.length ? 'Siguiente' : 'Comenzar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
