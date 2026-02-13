import { useEffect, useState } from 'react';
import { useAuthStore } from '@/application/store';
import { initDB } from '@/infrastructure/database/offline';

// Features
import Ancla from '@/presentation/screens/ancla/Ancla';
import Brujula from '@/presentation/screens/brujula/Brujula';
import Bitacora from '@/presentation/screens/bitacora/Bitacora';
import Espejo from '@/presentation/screens/espejo/Espejo';
import Boveda from '@/presentation/screens/boveda/Boveda';
import Perfil from '@/presentation/screens/perfil/Perfil';

// Auth
import Login from '@/presentation/screens/auth/Login';
import Onboarding from '@/presentation/screens/auth/Onboarding';

type Screen = 'ancla' | 'brujula' | 'bitacora' | 'espejo' | 'boveda' | 'perfil';

function App() {
  const { user, loadUser, loading } = useAuthStore();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<Screen>('espejo');

  useEffect(() => {
    // Initialize DB and load user
    initDB();
    loadUser();
  }, []);

  useEffect(() => {
    // Check if user needs onboarding
    if (user) {
      const hasSeenOnboarding = localStorage.getItem('ancla-onboarding-completed');
      if (!hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    }
  }, [user]);

  const completeOnboarding = () => {
    localStorage.setItem('ancla-onboarding-completed', 'true');
    setShowOnboarding(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className="h-screen bg-calm-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-calm-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-calm-highlight">Cargando...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <Login onOnboarding={() => setShowOnboarding(true)} />;
  }

  // Onboarding
  if (showOnboarding) {
    return <Onboarding onComplete={completeOnboarding} />;
  }

  // Main App
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
    <div className="h-screen flex flex-col bg-calm-900">
      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {renderScreen()}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-calm-800 border-t border-calm-700 px-2 py-2 safe-bottom">
        <div className="flex items-center justify-around max-w-2xl mx-auto">
          <NavButton
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            label="Ancla"
            active={currentScreen === 'ancla'}
            onClick={() => setCurrentScreen('ancla')}
          />
          <NavButton
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
            label="Bitácora"
            active={currentScreen === 'bitacora'}
            onClick={() => setCurrentScreen('bitacora')}
          />
          <NavButton
            icon={
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            }
            label="Brújula"
            active={currentScreen === 'brujula'}
            onClick={() => setCurrentScreen('brujula')}
          />
          <NavButton
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
            label="Perfil"
            active={currentScreen === 'perfil'}
            onClick={() => setCurrentScreen('perfil')}
          />
        </div>
      </nav>

      {/* Vault Quick Access Button (when not in vault) */}
      {currentScreen !== 'boveda' && (
        <button
          onClick={() => setCurrentScreen('boveda')}
          className="fixed bottom-20 right-6 w-14 h-14 bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-full shadow-2xl flex items-center justify-center text-white hover:scale-110 transition-transform z-50"
          title="Abrir La Bóveda"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </button>
      )}
    </div>
  );
}

// Navigation Button Component
interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  primary?: boolean;
}

const NavButton: React.FC<NavButtonProps> = ({ icon, label, active, onClick, primary }: NavButtonProps) => {
  const getButtonClass = () => {
    if (primary) {
      return active ? 'text-calm-accent scale-110' : 'text-gray-400 hover:text-calm-accent';
    }
    return active ? 'text-calm-accent' : 'text-gray-500 hover:text-gray-300';
  };

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl transition-all ${getButtonClass()}`}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
};

export default App;
