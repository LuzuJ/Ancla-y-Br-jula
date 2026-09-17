import React, { useState, useRef } from 'react';
import { useAuthStore, useJournalStore, useVaultStore, useChatStore, useSettingsStore } from '@/application/store';
import { offlineJournal, offlineVault, offlineChat, offlineProfile } from '@/infrastructure/database/offline';

const Perfil: React.FC = () => {
  const { user, signOut, loadUser } = useAuthStore();
  const { entries: journalEntries, loadEntries: loadJournal } = useJournalStore();
  const { entries: vaultEntries, loadEntries: loadVault } = useVaultStore();
  const { messages, clearMessages, loadMessages } = useChatStore();
  
  const { 
    soundEnabled, notificationsEnabled, toggleSound, toggleNotifications,
    aiProvider, aiApiKey, aiModel, updateAiSettings
  } = useSettingsStore();

  const [localApiKey, setLocalApiKey] = useState(aiApiKey);
  const [localProvider, setLocalProvider] = useState(aiProvider);
  const [localModel, setLocalModel] = useState(aiModel);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.reload();
  };

  const handleClearChat = async () => {
    await clearMessages();
    setShowClearConfirm(false);
    showToast('Historial de chat borrado con éxito.');
  };

  const handleExportBackup = async () => {
    try {
      const journals = await offlineJournal.getAll();
      const vault = await offlineVault.getAll();
      const chat = await offlineChat.getAll();
      const profile = await offlineProfile.get('local_user');

      const backupData = {
        app: 'Ancla y Brújula',
        version: '2.0.0',
        exportedAt: new Date().toISOString(),
        data: {
          profile,
          journalEntries: journals,
          vaultEntries: vault,
          chatMessages: chat
        }
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ancla_respaldo_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Copia de seguridad descargada correctamente.');
    } catch (e) {
      console.error('Export error:', e);
      showToast('Error al exportar los datos.');
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const json = JSON.parse(text);

      if (!json.data || (!json.data.journalEntries && !json.data.vaultEntries)) {
        showToast('El archivo no tiene el formato de respaldo válido de Ancla.');
        return;
      }

      if (json.data.profile) {
        await offlineProfile.save(json.data.profile);
      }

      if (Array.isArray(json.data.journalEntries)) {
        for (const entry of json.data.journalEntries) {
          await offlineJournal.add(entry);
        }
      }

      if (Array.isArray(json.data.vaultEntries)) {
        for (const entry of json.data.vaultEntries) {
          await offlineVault.add(entry);
        }
      }

      if (Array.isArray(json.data.chatMessages)) {
        for (const msg of json.data.chatMessages) {
          await offlineChat.add(msg);
        }
      }

      await loadJournal();
      await loadVault();
      await loadMessages();
      await loadUser();

      showToast('¡Datos importados con éxito!');
    } catch (err) {
      console.error('Import error:', err);
      showToast('Error al procesar el archivo de respaldo.');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleProviderChange = (newProvider: 'gemini' | 'generic') => {
    setLocalProvider(newProvider);
    if (newProvider === 'generic') {
      if (!['deepseek-ai/deepseek-v4-flash-0731', 'mistralai/mistral-nemotron', 'openai/gpt-oss-20b'].includes(localModel)) {
        setLocalModel('deepseek-ai/deepseek-v4-flash-0731');
      }
    } else {
      if (!['gemini-2.5-flash', 'gemini-2.0-flash-exp'].includes(localModel)) {
        setLocalModel('gemini-2.5-flash');
      }
    }
  };

  const saveAiSettings = () => {
    const finalModel = localProvider === 'generic' 
      ? (['deepseek-ai/deepseek-v4-flash-0731', 'mistralai/mistral-nemotron', 'openai/gpt-oss-20b'].includes(localModel) ? localModel : 'deepseek-ai/deepseek-v4-flash-0731')
      : (['gemini-2.5-flash', 'gemini-2.0-flash-exp'].includes(localModel) ? localModel : 'gemini-2.5-flash');
      
    updateAiSettings(localProvider as 'gemini' | 'generic', localApiKey.trim(), finalModel);
    setLocalModel(finalModel);
    showToast('Configuración de IA guardada con éxito.');
  };

  return (
    <div className="h-full overflow-y-auto bg-calm-900 pb-24">
      {/* Hidden File Input for Backup Import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImportFile}
        accept=".json,application/json"
        className="hidden"
      />

      {/* Header */}
      <div className="bg-gradient-to-b from-calm-800 to-calm-900 p-8 border-b border-calm-700">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-20 h-20 bg-calm-accent rounded-full flex items-center justify-center text-calm-900 text-3xl font-bold uppercase shadow-lg">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-2xl font-light text-white">{user?.name || 'Usuario Local'}</h2>
            <p className="text-sm text-calm-highlight">Modo Privado (Offline First)</p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex-1 bg-calm-800/50 rounded-xl p-3 border border-calm-700/30 text-center">
            <div className="text-2xl font-bold text-calm-accent">{journalEntries.length}</div>
            <div className="text-xs text-gray-400">Entradas</div>
          </div>
          <div className="flex-1 bg-calm-800/50 rounded-xl p-3 border border-calm-700/30 text-center">
            <div className="text-2xl font-bold text-calm-accent">{vaultEntries.length}</div>
            <div className="text-xs text-gray-400">Evidencias</div>
          </div>
          <div className="flex-1 bg-calm-800/50 rounded-xl p-3 border border-calm-700/30 text-center">
            <div className="text-2xl font-bold text-calm-accent">{messages.length}</div>
            <div className="text-xs text-gray-400">Mensajes</div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="mx-6 mt-4 p-3.5 rounded-xl bg-teal-950/90 border border-calm-accent/50 text-teal-200 text-xs sm:text-sm flex items-center justify-between animate-fade-in shadow-md">
          <div className="flex items-center gap-2">
            <span>✨</span>
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-teal-400 hover:text-white text-xs ml-2 font-mono">✕</button>
        </div>
      )}

      <div className="p-6 space-y-6">
        
        {/* IA Settings (BYOK) */}
        <section>
          <h3 className="text-sm font-semibold text-calm-highlight mb-3 uppercase tracking-widest font-mono">INTELIGENCIA ARTIFICIAL</h3>
          <div className="bg-calm-800/30 rounded-2xl p-5 border border-calm-700/30 space-y-4">
            <p className="text-xs text-gray-400 leading-relaxed">
              Ancla es "Bring Your Own Key" (BYOK). Tu clave API nunca viaja a servidores intermedios y solo se guarda en el almacenamiento local de tu navegador.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-calm-highlight mb-1.5 uppercase font-mono">Proveedor</label>
                <select 
                  value={localProvider}
                  onChange={(e) => handleProviderChange(e.target.value as 'gemini' | 'generic')}
                  className="w-full bg-calm-900 border border-calm-700 text-white rounded-xl p-3 text-sm focus:outline-none focus:border-calm-accent"
                >
                  <option value="generic">NVIDIA NIM (OpenAI-compatible)</option>
                  <option value="gemini">Google Gemini</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-calm-highlight mb-1.5 uppercase font-mono">Modelo</label>
                {localProvider === 'generic' ? (
                  <select
                    value={localModel}
                    onChange={(e) => setLocalModel(e.target.value)}
                    className="w-full bg-calm-900 border border-calm-700 text-white rounded-xl p-3 text-sm focus:outline-none focus:border-calm-accent"
                  >
                    <option value="deepseek-ai/deepseek-v4-flash-0731">DeepSeek v4 Flash (Recomendado, ultra rápido)</option>
                    <option value="mistralai/mistral-nemotron">Mistral Nemotron (Excelente para chat)</option>
                    <option value="openai/gpt-oss-20b">GPT-OSS 20B (Ligero y rápido)</option>
                  </select>
                ) : (
                  <select
                    value={localModel}
                    onChange={(e) => setLocalModel(e.target.value)}
                    className="w-full bg-calm-900 border border-calm-700 text-white rounded-xl p-3 text-sm focus:outline-none focus:border-calm-accent"
                  >
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash (Gratis, Rápido)</option>
                    <option value="gemini-2.0-flash-exp">Gemini 2.0 Flash Exp</option>
                  </select>
                )}
              </div>

              <div>
                <label className="block text-xs text-calm-highlight mb-1.5 uppercase font-mono">API Key</label>
                <input 
                  type="password"
                  value={localApiKey}
                  onChange={(e) => setLocalApiKey(e.target.value)}
                  placeholder="nvapi-..."
                  className="w-full bg-calm-900 border border-calm-700 text-white rounded-xl p-3 text-sm focus:outline-none focus:border-calm-accent font-mono"
                />
              </div>

              <button 
                onClick={saveAiSettings}
                className="w-full bg-calm-accent text-calm-900 py-3 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-teal-300 transition-all active:scale-98 shadow-md"
              >
                Guardar Configuración IA
              </button>
            </div>
          </div>
        </section>

        {/* General Settings */}
        <section>
          <h3 className="text-sm font-semibold text-calm-highlight mb-3 uppercase tracking-widest font-mono">EXPERIENCIA SENSORIAL</h3>
          
          <div className="bg-calm-800/30 rounded-2xl p-4 mb-3 flex items-center justify-between border border-calm-700/30">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-calm-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
              <div>
                <div className="text-white text-sm font-medium">Sonido y audio ambiental</div>
                <div className="text-xs text-gray-400">Paisajes sonoros procedimentales</div>
              </div>
            </div>
            <button
              onClick={toggleSound}
              className={`w-12 h-7 rounded-full transition-colors ${soundEnabled ? 'bg-calm-accent' : 'bg-calm-700'}`}
            >
              <div className={`w-5 h-5 bg-calm-900 rounded-full transition-transform ${soundEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="bg-calm-800/30 rounded-2xl p-4 mb-3 flex items-center justify-between border border-calm-700/30">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-calm-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <div>
                <div className="text-white text-sm font-medium">Notificaciones</div>
                <div className="text-xs text-gray-400">Recordatorios diarios de presencia</div>
              </div>
            </div>
            <button
              onClick={toggleNotifications}
              className={`w-12 h-7 rounded-full transition-colors ${notificationsEnabled ? 'bg-calm-accent' : 'bg-calm-700'}`}
            >
              <div className={`w-5 h-5 bg-calm-900 rounded-full transition-transform ${notificationsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </section>

        {/* Data Sovereignty / Backup */}
        <section>
          <h3 className="text-sm font-semibold text-calm-highlight mb-3 uppercase tracking-widest font-mono">RESPALDO & SOBERANÍA DE DATOS</h3>
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleExportBackup}
                className="p-3.5 rounded-xl bg-calm-800/40 hover:bg-calm-800/80 border border-teal-600/40 text-left transition-all active:scale-98"
              >
                <div className="flex items-center gap-2 text-calm-accent mb-1">
                  <span>📥</span>
                  <span className="text-xs font-bold uppercase tracking-wider">Exportar JSON</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-tight">
                  Descarga tus entradas, bóveda y chats en tu equipo.
                </p>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3.5 rounded-xl bg-calm-800/40 hover:bg-calm-800/80 border border-calm-600/40 text-left transition-all active:scale-98"
              >
                <div className="flex items-center gap-2 text-calm-highlight mb-1">
                  <span>📤</span>
                  <span className="text-xs font-bold uppercase tracking-wider">Restaurar JSON</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-tight">
                  Carga una copia previa guardada.
                </p>
              </button>
            </div>

            {/* Clear Chat Button */}
            <div className="bg-calm-800/30 rounded-xl p-4 border border-calm-700/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <div>
                    <div className="text-white text-sm">Borrar historial de chat</div>
                    <div className="text-xs text-gray-500">Elimina las reflexiones del espejo</div>
                  </div>
                </div>

                {showClearConfirm ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleClearChat}
                      className="px-2.5 py-1 rounded-lg bg-rose-900 text-rose-200 text-xs font-bold"
                    >
                      Sí, borrar
                    </button>
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="px-2.5 py-1 rounded-lg bg-calm-800 text-gray-400 text-xs"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="px-3 py-1.5 rounded-lg bg-calm-900 border border-calm-700 text-xs text-gray-300 hover:text-rose-400"
                  >
                    Borrar
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* About */}
        <section>
          <h3 className="text-sm font-semibold text-calm-highlight mb-3 uppercase tracking-widest font-mono">ACERCA DE</h3>
          
          <div className="bg-calm-800/30 rounded-2xl p-5 border border-calm-700/30">
            <div className="text-calm-accent text-sm font-medium mb-1">Ancla y Brújula</div>
            <div className="text-gray-400 text-xs mb-3 font-mono">Versión 2.2.0 (Resilient Offline Edition)</div>
            <p className="text-gray-300 text-xs leading-relaxed">
              Aplicación de acompañamiento y reestructuración cognitiva basada en TCC y filosofía estoica. 
              Tus datos son 100% tuyos y residen únicamente en tu dispositivo.
            </p>
          </div>
        </section>

        {/* Sign Out / Reset */}
        <div className="pt-2">
          {showSignOutConfirm ? (
            <div className="p-4 rounded-xl bg-red-950/80 border border-red-800/50 text-center space-y-3">
              <p className="text-xs text-red-200">
                ¿Seguro que deseas borrar la sesión local?
              </p>
              <div className="flex justify-center gap-2">
                <button
                  onClick={handleSignOut}
                  className="px-4 py-1.5 rounded-lg bg-red-600 text-white font-bold text-xs"
                >
                  Confirmar Borrado
                </button>
                <button
                  onClick={() => setShowSignOutConfirm(false)}
                  className="px-4 py-1.5 rounded-lg bg-calm-800 text-gray-300 text-xs"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowSignOutConfirm(true)}
              className="w-full bg-red-950/40 border border-red-800/30 text-red-300 rounded-xl p-3.5 text-xs font-semibold uppercase tracking-wider hover:bg-red-900/40 transition-colors"
            >
              Borrar Sesión Local
            </button>
          )}
        </div>

        <div className="text-center text-gray-600 text-xs pt-4 font-mono">
          Ancla & Brújula · Privacidad sin concesiones
        </div>
      </div>
    </div>
  );
};

export default Perfil;
