
import React, { useState, useEffect } from 'react';
import Ancla from './components/Ancla';
import Brujula from './components/Brujula';
import Espejo from './components/Espejo';
import Bitacora from './components/Bitacora';
import Onboarding from './components/Onboarding';
import Perfil from './components/Perfil';
import { ModuleView } from './types';
import { getOnboardingStatus, setOnboardingCompleted } from './services/storageService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ModuleView>(ModuleView.SPLASH);
  // State to pass data between modules
  const [bitacoraInitialContent, setBitacoraInitialContent] = useState<string | null>(null);

  // --- Router & Splash Logic ---
  useEffect(() => {
    // Splash lasts 2 seconds
    const splashTimer = setTimeout(() => {
      const hasOnboarded = getOnboardingStatus();
      if (hasOnboarded) {
        setCurrentView(ModuleView.BITACORA); // Default Home
      } else {
        setCurrentView(ModuleView.ONBOARDING);
      }
    }, 2000);

    return () => clearTimeout(splashTimer);
  }, []);

  const handleOnboardingComplete = () => {
    setOnboardingCompleted();
    setCurrentView(ModuleView.BITACORA);
  };

  // --- Navigation Handlers ---
  const handleOpenEspejo = () => {
    setCurrentView(ModuleView.ESPEJO);
  };

  const handleAcceptChallenge = (challenge: string) => {
    setBitacoraInitialContent(challenge);
    setCurrentView(ModuleView.BITACORA);
  };

  // --- View Rendering ---
  const renderView = () => {
    switch (currentView) {
      case ModuleView.SPLASH:
        return (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-fade-in bg-calm-900">
             <div className="mb-6 opacity-80">
               <svg className="w-20 h-20 text-white mx-auto animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
             </div>
             <h1 className="text-2xl font-light text-white tracking-[0.5em] animate-fade-in">RELÁJATE</h1>
          </div>
        );
      case ModuleView.ONBOARDING:
        return <Onboarding onComplete={handleOnboardingComplete} />;
      case ModuleView.ANCLA:
        return (
          <div className="relative h-full">
            <button 
              onClick={() => setCurrentView(ModuleView.BITACORA)} 
              className="absolute top-6 right-6 z-50 p-2 text-white/50 hover:text-white bg-black/20 rounded-full"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <Ancla onOpenEspejo={handleOpenEspejo} />
          </div>
        );
      case ModuleView.BRUJULA:
        return <Brujula onAcceptChallenge={handleAcceptChallenge} />;
      case ModuleView.ESPEJO:
        return (
          <div className="relative h-full flex flex-col">
             <div className="flex items-center justify-between p-4 bg-calm-900 border-b border-calm-800">
               <button onClick={() => setCurrentView(ModuleView.BITACORA)} className="text-calm-accent flex items-center gap-1 text-sm">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                 Volver
               </button>
               <span className="text-white text-sm tracking-widest">ESPEJO</span>
               <div className="w-12"></div>
             </div>
             <div className="flex-1 overflow-hidden">
               <Espejo />
             </div>
          </div>
        );
      case ModuleView.BITACORA:
        return (
          <Bitacora 
            onOpenEspejo={handleOpenEspejo} 
            initialEditorContent={bitacoraInitialContent}
            onClearInitialContent={() => setBitacoraInitialContent(null)}
          />
        );
      case ModuleView.PROFILE:
        return <Perfil />;
      default:
        return <Bitacora onOpenEspejo={handleOpenEspejo} />;
    }
  };

  const NavButton = ({ view, icon, label, isActive }: { view: ModuleView, icon: React.ReactNode, label: string, isActive: boolean }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`flex flex-col items-center justify-center w-full py-2 transition-all duration-300 ${
        isActive ? 'text-calm-accent scale-105' : 'text-gray-500 hover:text-gray-300'
      }`}
    >
      <div className="mb-1">{icon}</div>
      <span className="text-[10px] uppercase tracking-wider font-medium">{label}</span>
    </button>
  );

  // --- Navigation Layout ---
  const isFullScreen = currentView === ModuleView.SPLASH || currentView === ModuleView.ONBOARDING || currentView === ModuleView.ANCLA || currentView === ModuleView.ESPEJO;

  return (
    <div className="bg-calm-900 min-h-screen text-slate-200 font-sans selection:bg-calm-accent selection:text-calm-900 overflow-hidden flex flex-col">
      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden">
        {renderView()}
      </main>

      {/* FAB - SOS ANCLA (Visible on Main Views) */}
      {!isFullScreen && (
        <div className="absolute bottom-24 left-0 right-0 flex justify-center pointer-events-none z-50">
          <button
            onClick={() => setCurrentView(ModuleView.ANCLA)}
            className="pointer-events-auto bg-red-500/90 text-white rounded-full p-4 shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:scale-110 hover:bg-red-500 transition-all active:scale-95 flex items-center justify-center border-4 border-calm-900"
            aria-label="SOS Ancla"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
          </button>
        </div>
      )}

      {/* Bottom Navigation */}
      {!isFullScreen && (
        <nav className="bg-calm-900/95 backdrop-blur-xl border-t border-calm-800 pt-2 pb-safe z-40 relative">
          <div className="flex justify-around items-end max-w-md mx-auto px-4 pb-2">
            
            <NavButton 
              view={ModuleView.BITACORA} 
              label="Bitácora"
              isActive={currentView === ModuleView.BITACORA}
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
            />

            {/* Spacer for FAB */}
            <div className="w-16" />

            <NavButton 
              view={ModuleView.BRUJULA} 
              label="Impulso"
              isActive={currentView === ModuleView.BRUJULA}
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>}
            />

            <NavButton 
              view={ModuleView.PROFILE} 
              label="Perfil"
              isActive={currentView === ModuleView.PROFILE}
              icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
            />
          </div>
        </nav>
      )}
    </div>
  );
};

export default App;
