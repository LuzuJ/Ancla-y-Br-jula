import { useEffect, useState } from 'react';
import { useAuthStore, useSettingsStore } from '@/application/store';
import { initDB } from '@/infrastructure/database/offline';

// Features
import Ancla from '@/presentation/screens/ancla/Ancla';
import Brujula from '@/presentation/screens/brujula/Brujula';
import Bitacora from '@/presentation/screens/bitacora/Bitacora';
import Espejo from '@/presentation/screens/espejo/Espejo';
import Boveda from '@/presentation/screens/boveda/Boveda';
import Perfil from '@/presentation/screens/perfil/Perfil';

// Auth
import Onboarding from '@/presentation/screens/auth/Onboarding';

type Screen = 'ancla' | 'brujula' | 'bitacora' | 'espejo' | 'boveda' | 'perfil';

function App() {
  const { user, loadUser, loading } = useAuthStore();
  const { aiApiKey } = useSettingsStore();
  const [currentScreen, setCurrentScreen] = useState<Screen>('espejo');

  useEffect(() => {
    initDB();
    loadUser();
  }, []);

  const completeOnboarding = () => {};

  if (loading) {
    return (
      <div className="h-screen bg-calm-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-calm-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-calm-highlight text-sm font-mono">Cargando tu santuario...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Onboarding onComplete={completeOnboarding} />;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'ancla':
        return <Ancla />;
      case 'brujula':
        return <Brujula />;
      case 'bitacora':
        return <Bitacora />;
      case 'espejo':
        return <Espejo onOpenVault={() => setCurrentScreen('boveda')} />;
      case 'boveda':
        return <Boveda />;
      case 'perfil':
        return <Perfil />;
      default:
        return <Espejo onOpenVault={() => setCurrentScreen('boveda')} />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-calm-900 text-white font-sans antialiased select-none">
      
      {/* API Key Banner */}
      {!aiApiKey && currentScreen !== 'perfil' && (
        <div className="bg-gradient-to-r from-amber-900/90 to-amber-800/90 border-b border-amber-600/50 text-white px-4 py-2.5 text-xs text-center shadow-lg z-50 flex flex-row items-center justify-between gap-3 animate-fade-in shrink-0">
          <span className="truncate">⚠️ <strong>Configura tu IA</strong>: Ingresa tu API Key en Perfil para activar el chat y generadores.</span>
          <button 
            onClick={() => setCurrentScreen('perfil')}
            className="bg-amber-400 text-amber-950 px-3 py-1 rounded-full text-xs font-bold hover:bg-amber-300 transition-colors shadow-sm whitespace-nowrap shrink-0"
          >
            Configurar
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        {renderScreen()}
      </main>

      {/* Sleek Bottom Navigation */}
      <nav className="bg-calm-950/95 border-t border-calm-800/80 px-1 py-1.5 safe-bottom backdrop-blur-lg shrink-0 z-40">
        <div className="flex items-center justify-around max-w-lg mx-auto">
          <NavButton
            icon={
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            label="Ancla"
            active={currentScreen === 'ancla'}
            onClick={() => setCurrentScreen('ancla')}
          />

          <NavButton
            icon={
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            }
            label="Brújula"
            active={currentScreen === 'brujula'}
            onClick={() => setCurrentScreen('brujula')}
          />

          <NavButton
            icon={
              <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            }
            label="Espejo"
            active={currentScreen === 'espejo'}
            onClick={() => setCurrentScreen('espejo')}
            primary
          />

          <NavButton
            icon={
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
            label="Bitácora"
            active={currentScreen === 'bitacora'}
            onClick={() => setCurrentScreen('bitacora')}
          />

          <NavButton
            icon={
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
            label="Bóveda"
            active={currentScreen === 'boveda'}
            onClick={() => setCurrentScreen('boveda')}
          />

          <NavButton
            icon={
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
            label="Perfil"
            active={currentScreen === 'perfil'}
            onClick={() => setCurrentScreen('perfil')}
          />
        </div>
      </nav>
    </div>
  );
}

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  primary?: boolean;
}

const NavButton: React.FC<NavButtonProps> = ({ icon, label, active, onClick, primary }: NavButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center min-w-[48px] min-h-[48px] py-1 px-1.5 sm:px-3 rounded-xl transition-all touch-manipulation active:scale-95 ${
        primary
          ? active
            ? 'text-calm-accent scale-105 font-bold'
            : 'text-gray-400 hover:text-calm-accent'
          : active
          ? 'text-calm-accent font-semibold'
          : 'text-gray-500 hover:text-gray-300'
      }`}
    >
      <div className={`p-1 rounded-xl transition-colors ${active ? 'bg-calm-800/80 text-calm-accent' : ''}`}>
        {icon}
      </div>
      <span className={`text-[10px] sm:text-xs tracking-tight transition-colors ${active ? 'text-calm-accent font-semibold' : 'text-gray-400'}`}>
        {label}
      </span>
    </button>
  );
};

export default App;
