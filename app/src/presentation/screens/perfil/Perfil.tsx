import React from 'react';
import { useAuthStore, useJournalStore, useVaultStore, useChatStore, useSettingsStore } from '@/application/store';

const Perfil: React.FC = () => {
  const { user, signOut } = useAuthStore();
  const { entries: journalEntries } = useJournalStore();
  const { entries: vaultEntries } = useVaultStore();
  const { messages, clearMessages } = useChatStore();
  const { soundEnabled, notificationsEnabled, toggleSound, toggleNotifications } = useSettingsStore();

  const handleSignOut = async () => {
    if (window.confirm('¿Seguro que quieres cerrar sesión?')) {
      await signOut();
      window.location.reload();
    }
  };

  const handleClearChat = async () => {
    if (window.confirm('¿Seguro que quieres borrar todo el historial de chat? Esta acción no se puede deshacer.')) {
      await clearMessages();
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-calm-900 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-calm-800 to-calm-900 p-8 border-b border-calm-700">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 bg-calm-accent rounded-full flex items-center justify-center text-calm-900 text-3xl font-bold">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-2xl font-light text-white">{user?.email?.split('@')[0] || 'Usuario'}</h2>
            <p className="text-sm text-gray-400">{user?.email}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 bg-calm-800/50 rounded-xl p-3 border border-calm-700/30">
            <div className="text-2xl font-bold text-calm-accent">{journalEntries.length}</div>
            <div className="text-xs text-gray-400">Entradas</div>
          </div>
          <div className="flex-1 bg-calm-800/50 rounded-xl p-3 border border-calm-700/30">
            <div className="text-2xl font-bold text-calm-accent">{vaultEntries.length}</div>
            <div className="text-xs text-gray-400">Evidencias</div>
          </div>
          <div className="flex-1 bg-calm-800/50 rounded-xl p-3 border border-calm-700/30">
            <div className="text-2xl font-bold text-calm-accent">{messages.length}</div>
            <div className="text-xs text-gray-400">Mensajes</div>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="p-6 space-y-6">
        <section>
          <h3 className="text-lg font-light text-white mb-4 tracking-widest">CONFIGURACIÓN</h3>
          
          {/* Sound Toggle */}
          <div className="bg-calm-800/30 rounded-xl p-4 mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-calm-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
              <div>
                <div className="text-white text-sm">Sonido y voz</div>
                <div className="text-xs text-gray-500">Guías de audio y notificaciones sonoras</div>
              </div>
            </div>
            <button
              onClick={toggleSound}
              className={`w-14 h-8 rounded-full transition-colors ${
                soundEnabled ? 'bg-calm-accent' : 'bg-calm-700'
              }`}
            >
              <div
                className={`w-6 h-6 bg-white rounded-full transition-transform ${
                  soundEnabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Notifications Toggle */}
          <div className="bg-calm-800/30 rounded-xl p-4 mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-calm-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <div>
                <div className="text-white text-sm">Notificaciones</div>
                <div className="text-xs text-gray-500">Recordatorios y alertas</div>
              </div>
            </div>
            <button
              onClick={toggleNotifications}
              className={`w-14 h-8 rounded-full transition-colors ${
                notificationsEnabled ? 'bg-calm-accent' : 'bg-calm-700'
              }`}
            >
              <div
                className={`w-6 h-6 bg-white rounded-full transition-transform ${
                  notificationsEnabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </section>

        {/* Data Management */}
        <section>
          <h3 className="text-lg font-light text-white mb-4 tracking-widest">DATOS</h3>
          
          <button
            onClick={handleClearChat}
            className="w-full bg-calm-800/30 rounded-xl p-4 mb-3 flex items-center justify-between hover:bg-calm-800/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <div className="text-left">
                <div className="text-white text-sm">Borrar historial de chat</div>
                <div className="text-xs text-gray-500">Elimina todas las conversaciones con Ancla</div>
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </section>

        {/* About */}
        <section>
          <h3 className="text-lg font-light text-white mb-4 tracking-widest">ACERCA DE</h3>
          
          <div className="bg-calm-800/30 rounded-xl p-4 mb-3">
            <div className="text-calm-accent text-sm font-medium mb-2">Ancla y Brújula</div>
            <div className="text-gray-400 text-xs mb-3">Versión 2.0.0</div>
            <p className="text-gray-400 text-xs leading-relaxed">
              Una aplicación de acompañamiento emocional basada en Terapia Cognitivo-Conductual (TCC). 
              No reemplaza ayuda profesional. Si tienes pensamientos de autolesión, busca ayuda inmediata.
            </p>
          </div>

          <div className="bg-teal-900/20 border border-teal-800/30 rounded-xl p-4">
            <p className="text-teal-200 text-xs leading-relaxed">
              <strong>Privacidad:</strong> Tus datos se almacenan de forma segura y encriptada. 
              Nunca compartimos tu información con terceros.
            </p>
          </div>
        </section>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="w-full bg-red-900/20 border border-red-800/30 text-red-300 rounded-xl p-4 font-medium hover:bg-red-900/30 transition-colors"
        >
          Cerrar Sesión
        </button>

        {/* Footer */}
        <div className="text-center text-gray-600 text-xs pt-4">
          Hecho con ❤️ para quienes buscan calma
        </div>
      </div>
    </div>
  );
};

export default Perfil;
