import React, { useState } from 'react';
import { getWelcomePhrase } from '@/infrastructure/api/gemini';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [welcomePhrase, setWelcomePhrase] = useState('');

  useState(() => {
    getWelcomePhrase().then(setWelcomePhrase);
  });

  const slides = [
    {
      title: 'Ancla y Brújula',
      subtitle: welcomePhrase || 'Tu espacio de calma interior',
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
      title: 'Ejercicios de Respiración',
      subtitle: 'Calma instantánea',
      icon: (
        <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      description: 'Practica respiración 4-4-4-4 con guía visual y de voz para activar tu sistema nervioso parasimpático.'
    },
    {
      title: 'La Bóveda',
      subtitle: 'Evidencias de tu valor',
      icon: (
        <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      description: 'Guarda logros, cumplidos y evidencias que demuestran tu valor. Hechos, no opiniones.'
    },
    {
      title: 'Bitácora y Brújula',
      subtitle: 'Tu diario y contenido diario',
      icon: (
        <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      description: 'Escribe tu diario emocional y descubre contenido curado diariamente: citas, música, arte y poesía.'
    }
  ];

  const currentSlide = slides[step - 1];

  return (
    <div className="min-h-screen bg-calm-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-12 animate-fade-in">
          <div className="text-calm-accent mb-8">
            {currentSlide.icon}
          </div>
          <h2 className="text-3xl font-light text-white tracking-widest mb-2">
            {currentSlide.title}
          </h2>
          <p className="text-calm-highlight text-sm mb-8">
            {currentSlide.subtitle}
          </p>
          <p className="text-gray-400 leading-relaxed">
            {currentSlide.description}
          </p>
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
                onComplete();
              }
            }}
            className="flex-1 py-3 bg-calm-accent text-calm-900 rounded-xl font-medium hover:bg-teal-300 transition-colors"
          >
            {step < slides.length ? 'Siguiente' : 'Comenzar'}
          </button>
        </div>

        {step === 1 && (
          <button
            onClick={onComplete}
            className="w-full mt-4 text-sm text-gray-500 hover:text-gray-400 transition-colors"
          >
            Saltar introducción
          </button>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
