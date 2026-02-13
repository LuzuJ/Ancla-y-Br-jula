import React, { useState, useEffect } from 'react';
import { useVaultStore, useAuthStore } from '@/application/store';
import type { VaultEntry } from '@/domain/models';

const CATEGORY_LABELS = {
  achievement: { label: 'Logro', icon: '🏆', color: 'from-yellow-900/40 to-yellow-800/20' },
  compliment: { label: 'Cumplido', icon: '💝', color: 'from-pink-900/40 to-pink-800/20' },
  overcoming: { label: 'Superación', icon: '⚡', color: 'from-purple-900/40 to-purple-800/20' },
  skill: { label: 'Habilidad', icon: '✨', color: 'from-teal-900/40 to-teal-800/20' }
};

const Boveda: React.FC = () => {
  const { entries, loadEntries, addEntry, deleteEntry } = useVaultStore();
  const { user } = useAuthStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newEntry, setNewEntry] = useState({
    title: '',
    evidence: '',
    category: 'achievement' as VaultEntry['category']
  });

  useEffect(() => {
    loadEntries();
  }, []);

  const handleAdd = async () => {
    if (!newEntry.title.trim() || !newEntry.evidence.trim()) return;

    await addEntry({
      title: newEntry.title,
      evidence: newEntry.evidence,
      date: new Date().toISOString().split('T')[0],
      category: newEntry.category,
      user_id: user?.id || ''
    });

    setNewEntry({ title: '', evidence: '', category: 'achievement' });
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Seguro que quieres eliminar esta evidencia?')) {
      await deleteEntry(id);
    }
  };

  if (isAdding) {
    return (
      <div className="h-full flex flex-col p-6 bg-calm-900 animate-fade-in">
        <header className="flex justify-between items-center mb-6">
          <button
            onClick={() => setIsAdding(false)}
            className="text-gray-400 hover:text-white flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver
          </button>
          <h2 className="text-lg font-medium text-white tracking-widest">NUEVA EVIDENCIA</h2>
          <button
            onClick={handleAdd}
            disabled={!newEntry.title.trim() || !newEntry.evidence.trim()}
            className="text-calm-accent font-bold hover:text-teal-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Guardar
          </button>
        </header>

        <div className="flex-1 space-y-6">
          {/* Category Selector */}
          <div>
            <label className="block text-sm text-gray-400 mb-3">Tipo de evidencia</label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(CATEGORY_LABELS).map(([key, cat]) => (
                <button
                  key={key}
                  onClick={() => setNewEntry({ ...newEntry, category: key as VaultEntry['category'] })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    newEntry.category === key
                      ? 'border-calm-accent bg-calm-800'
                      : 'border-calm-700 bg-calm-800/30 hover:border-calm-600'
                  }`}
                >
                  <div className="text-3xl mb-2">{cat.icon}</div>
                  <div className="text-white text-sm font-medium">{cat.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Título</label>
            <input
              type="text"
              value={newEntry.title}
              onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
              placeholder="Ej: Terminé el proyecto a tiempo"
              className="w-full bg-calm-800 border border-calm-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-calm-accent focus:border-transparent"
            />
          </div>

          {/* Evidence */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Evidencia (¿Qué prueba que esto es real?)
            </label>
            <textarea
              value={newEntry.evidence}
              onChange={(e) => setNewEntry({ ...newEntry, evidence: e.target.value })}
              placeholder="Ej: Mi jefe me felicitó y el cliente quedó satisfecho. Superé mis dudas y lo logré."
              rows={6}
              className="w-full bg-calm-800 border border-calm-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-calm-accent focus:border-transparent resize-none"
            />
          </div>

          <div className="bg-teal-900/20 border border-teal-800/30 rounded-xl p-4">
            <p className="text-sm text-teal-200/80">
              💡 <strong>Tip:</strong> Cuando dudes de tu valor, vuelve aquí y lee estas evidencias. Son hechos, no opiniones.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-calm-900 animate-fade-in">
      <header className="p-6 border-b border-calm-800">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-3xl font-light text-white tracking-widest">LA BÓVEDA</h2>
          <button
            onClick={() => setIsAdding(true)}
            className="p-2 bg-calm-accent rounded-full text-calm-900 hover:bg-teal-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        <p className="text-sm text-gray-400">
          Aquí guardas las <span className="text-calm-accent">pruebas</span> de que sí vales. Evidencias, no opiniones.
        </p>
        <div className="mt-3 text-xs text-teal-300 bg-teal-900/20 rounded-lg px-3 py-2 border border-teal-800/30">
          📊 {entries.length} evidencia{entries.length !== 1 ? 's' : ''} almacenada{entries.length !== 1 ? 's' : ''}
        </div>
      </header>

      {entries.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-24 h-24 mb-6 rounded-full bg-calm-800 flex items-center justify-center">
            <svg className="w-12 h-12 text-calm-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl text-white mb-2">Tu Bóveda está vacía</h3>
          <p className="text-gray-400 mb-6 max-w-sm">
            Empieza guardando logros, cumplidos, o cualquier evidencia que demuestre tu valor.
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="px-6 py-3 bg-calm-accent text-calm-900 rounded-xl font-medium hover:bg-teal-300 transition-colors"
          >
            Añadir primera evidencia
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {entries.map((entry) => {
            const category = CATEGORY_LABELS[entry.category];
            return (
              <div
                key={entry.id}
                className={`bg-gradient-to-r ${category.color} border border-calm-700/50 rounded-2xl p-5 shadow-lg shadow-black/20`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{category.icon}</span>
                    <div>
                      <div className="text-xs text-calm-highlight uppercase tracking-wider">
                        {category.label}
                      </div>
                      <h3 className="text-lg font-medium text-white">{entry.title}</h3>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                <p className="text-gray-300 text-sm leading-relaxed mb-3">
                  {entry.evidence}
                </p>

                <div className="text-xs text-gray-500 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(entry.date).toLocaleDateString('es-ES', { 
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Boveda;
