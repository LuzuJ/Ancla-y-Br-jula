import React, { useState, useEffect } from 'react';
import { useVaultStore, useAuthStore, useSettingsStore } from '@/application/store';
import type { VaultEntry } from '@/domain/models';

const CATEGORY_LABELS: Record<VaultEntry['category'], { label: string; icon: string; color: string; border: string }> = {
  achievement: { label: 'Logro', icon: '🏆', color: 'from-amber-950/40 via-calm-800/60 to-calm-800/30', border: 'border-amber-700/40' },
  compliment: { label: 'Cumplido', icon: '💝', color: 'from-pink-950/40 via-calm-800/60 to-calm-800/30', border: 'border-pink-700/40' },
  overcoming: { label: 'Superación', icon: '⚡', color: 'from-purple-950/40 via-calm-800/60 to-calm-800/30', border: 'border-purple-700/40' },
  skill: { label: 'Habilidad', icon: '✨', color: 'from-teal-950/40 via-calm-800/60 to-calm-800/30', border: 'border-teal-700/40' }
};

const Boveda: React.FC = () => {
  const { entries, loadEntries, addEntry, deleteEntry } = useVaultStore();
  const { user } = useAuthStore();
  const { aiApiKey } = useSettingsStore();

  const [isAdding, setIsAdding] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | VaultEntry['category']>('all');
  const [synthesisText, setSynthesisText] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

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
      title: newEntry.title.trim(),
      evidence: newEntry.evidence.trim(),
      date: new Date().toISOString().split('T')[0],
      category: newEntry.category,
      user_id: user?.id || ''
    });

    setNewEntry({ title: '', evidence: '', category: 'achievement' });
    setIsAdding(false);
  };

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleDelete = async (id: string) => {
    await deleteEntry(id);
    setConfirmDeleteId(null);
  };

  const handleSynthesize = async () => {
    if (entries.length === 0) return;
    if (!aiApiKey) {
      showToast('Configura tu API Key en Perfil para que la IA genere un reflejo de fortaleza.');
      return;
    }

    setIsSynthesizing(true);
    try {
      const summaryList = entries.slice(0, 8).map(e => `• ${e.title}: ${e.evidence}`).join('\n');
      const response = await fetch('/api/nim/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${aiApiKey.trim()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'deepseek-ai/deepseek-v4-flash-0731',
          messages: [
            {
              role: 'system',
              content: 'Eres un terapeuta TCC empático. Lee las evidencias de logros y superación de esta persona y escribe UN párrafo breve (máximo 3 frases) cálido y realista que le recuerde su fortaleza cuando duda de sí misma.'
            },
            {
              role: 'user',
              content: `Mis evidencias almacenadas son:\n${summaryList}`
            }
          ],
          temperature: 0.7,
          max_tokens: 300
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSynthesisText(data.choices?.[0]?.message?.content || null);
      }
    } catch (err) {
      console.error('Synthesis error:', err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const filteredEntries = activeFilter === 'all'
    ? entries
    : entries.filter(e => e.category === activeFilter);

  if (isAdding) {
    return (
      <div className="h-full flex flex-col p-6 bg-calm-900 animate-fade-in pb-24">
        <header className="flex justify-between items-center mb-6">
          <button
            onClick={() => setIsAdding(false)}
            className="px-3.5 py-2 rounded-xl bg-calm-800 hover:bg-calm-700 text-gray-200 flex items-center gap-2 text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Cancelar</span>
          </button>
          <h2 className="text-sm font-bold uppercase text-white tracking-widest font-mono">NUEVA EVIDENCIA</h2>
          <button
            onClick={handleAdd}
            disabled={!newEntry.title.trim() || !newEntry.evidence.trim()}
            className="px-5 py-2 bg-calm-accent text-calm-900 rounded-xl text-sm font-bold uppercase tracking-wider hover:bg-teal-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all active:scale-95"
          >
            Guardar
          </button>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto">
          <div>
            <label className="block text-xs sm:text-sm uppercase tracking-wider text-calm-highlight mb-2 font-mono font-semibold">Tipo de evidencia</label>
            <div className="grid grid-cols-2 gap-3">
              {(Object.entries(CATEGORY_LABELS) as [VaultEntry['category'], typeof CATEGORY_LABELS[VaultEntry['category']]][]).map(([key, cat]) => (
                <button
                  key={key}
                  onClick={() => setNewEntry({ ...newEntry, category: key })}
                  className={`p-3.5 rounded-xl border transition-all flex items-center gap-3 ${
                    newEntry.category === key
                      ? 'border-calm-accent bg-calm-800/80 shadow-md text-white'
                      : 'border-calm-700/40 bg-calm-800/30 text-gray-300 hover:border-calm-600'
                  }`}
                >
                  <span className="text-2xl">{cat.icon}</span>
                  <div className="text-left">
                    <div className="text-sm font-semibold">{cat.label}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm uppercase tracking-wider text-calm-highlight mb-2 font-mono font-semibold">Título del Hecho</label>
            <input
              type="text"
              value={newEntry.title}
              onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
              placeholder="Ej: Entregué el informe a tiempo a pesar de la ansiedad"
              className="w-full bg-calm-800/60 border border-calm-700/50 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 text-sm sm:text-base focus:border-calm-accent focus:outline-none shadow-inner"
            />
          </div>

          <div>
            <label className="block text-xs sm:text-sm uppercase tracking-wider text-calm-highlight mb-2 font-mono font-semibold">
              Evidencia Concreta (Hechos, no opiniones)
            </label>
            <textarea
              value={newEntry.evidence}
              onChange={(e) => setNewEntry({ ...newEntry, evidence: e.target.value })}
              placeholder="Ej: Recibí felicitaciones del equipo. No me rendí y mantuve la calma en la presentación."
              rows={5}
              className="w-full bg-calm-800/60 border border-calm-700/50 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 text-sm sm:text-base focus:border-calm-accent focus:outline-none resize-none shadow-inner leading-relaxed"
            />
          </div>

          <div className="bg-teal-950/40 border border-teal-800/40 rounded-xl p-4">
            <p className="text-sm text-teal-200/90 leading-relaxed">
              💡 <strong>Principio TCC:</strong> El síndrome del impostor y la baja autoestima se basan en sesgos cognitivos. La Bóveda es tu repositorio de hechos verificables contra la duda.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-calm-900 animate-fade-in pb-24">
      {/* Header */}
      <header className="p-6 border-b border-calm-800 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-xs uppercase tracking-widest text-calm-accent font-mono">Autoestima Basada en Hechos</span>
            <h2 className="text-3xl font-light text-white tracking-widest">LA BÓVEDA</h2>
          </div>
          <button
            onClick={() => setIsAdding(true)}
            className="p-2.5 bg-calm-accent rounded-full text-calm-900 hover:bg-teal-300 transition-all active:scale-95 shadow-lg"
            title="Añadir evidencia"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        <p className="text-xs text-gray-400 mb-4">
          Hechos reales comprobables que demuestran tu capacidad y valor humano.
        </p>

        {/* Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-all font-mono ${
              activeFilter === 'all'
                ? 'bg-calm-accent text-calm-900 font-bold'
                : 'bg-calm-800/60 text-gray-400 border border-calm-700/40 hover:text-white'
            }`}
          >
            Todas ({entries.length})
          </button>
          {(Object.entries(CATEGORY_LABELS) as [VaultEntry['category'], typeof CATEGORY_LABELS[VaultEntry['category']]][]).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-all flex items-center gap-1 font-mono ${
                activeFilter === key
                  ? 'bg-calm-accent text-calm-900 font-bold'
                  : 'bg-calm-800/60 text-gray-400 border border-calm-700/40 hover:text-white'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="mx-4 mt-3 p-3 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-200 text-xs sm:text-sm flex items-center justify-between animate-fade-in shadow-md">
          <div className="flex items-center gap-2">
            <span>💡</span>
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-amber-400 hover:text-white text-xs ml-2 font-mono">✕</button>
        </div>
      )}

      {/* AI Synthesis Banner (Reflejo de Valor) */}
      {entries.length > 0 && (
        <div className="p-4 pb-0 shrink-0">
          <div className="bg-gradient-to-r from-teal-950/60 via-calm-800/70 to-calm-800/40 p-4 rounded-2xl border border-calm-700/50 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-calm-accent uppercase font-mono tracking-wider">
                  ✨ Reflejo de Fortaleza
                </span>
              </div>
              <button
                onClick={handleSynthesize}
                disabled={isSynthesizing}
                className="text-[11px] px-2.5 py-1 rounded-full bg-calm-900/80 hover:bg-calm-700 border border-calm-700/60 text-calm-highlight transition-all active:scale-95 disabled:opacity-50"
              >
                {isSynthesizing ? 'Sintetizando...' : 'Generar Síntesis IA'}
              </button>
            </div>
            <p className="text-xs sm:text-sm text-gray-200 leading-relaxed italic">
              {synthesisText || 'Tus evidencias son la prueba tangible de que has superado tormentas y posees valor real. Toca "Generar Síntesis IA" para recordar tus fortalezas integradas.'}
            </p>
          </div>
        </div>
      )}

      {/* Entries List */}
      {entries.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 mb-4 rounded-full bg-calm-800/60 border border-calm-700/40 flex items-center justify-center text-3xl">
            🏛️
          </div>
          <h3 className="text-lg font-light text-white mb-2">Tu Bóveda está esperando</h3>
          <p className="text-gray-400 text-sm mb-6 max-w-xs leading-relaxed">
            Guarda aquí cumplidos recibidos, obstáculos que superaste o habilidades que has demostrado.
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="px-5 py-2.5 bg-calm-accent text-calm-900 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-teal-300 transition-all shadow-md"
          >
            Añadir Primera Evidencia
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredEntries.map((entry) => {
            const category = CATEGORY_LABELS[entry.category] || CATEGORY_LABELS.achievement;
            const isConfirming = confirmDeleteId === entry.id;
            return (
              <div
                key={entry.id}
                className={`bg-gradient-to-r ${category.color} border ${category.border} rounded-2xl p-4 shadow-md transition-all hover:border-calm-600`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-2xl shrink-0">{category.icon}</span>
                    <div className="min-w-0">
                      <span className="text-[10px] text-calm-highlight uppercase tracking-wider font-mono">
                        {category.label}
                      </span>
                      <h3 className="text-sm sm:text-base font-semibold text-white truncate">{entry.title}</h3>
                    </div>
                  </div>

                  {isConfirming ? (
                    <div className="flex items-center gap-1 text-xs">
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="px-2 py-0.5 rounded bg-rose-900 text-rose-200 border border-rose-600 text-[11px] font-bold"
                      >
                        Eliminar
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2 py-0.5 rounded bg-calm-800 text-gray-400 text-[11px]"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(entry.id)}
                      className="text-gray-500 hover:text-rose-400 p-1 transition-colors"
                      title="Eliminar evidencia"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>

                <p className="text-gray-100 text-sm sm:text-base leading-relaxed mb-2 bg-calm-950/30 p-3 rounded-xl border border-calm-800/40">
                  {entry.evidence}
                </p>

                <div className="text-[11px] text-gray-400 flex items-center gap-1.5 font-mono">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(entry.date).toLocaleDateString('es-ES', { 
                    day: 'numeric',
                    month: 'short',
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
