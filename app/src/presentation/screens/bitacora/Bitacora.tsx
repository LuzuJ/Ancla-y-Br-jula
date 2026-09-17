import React, { useState, useEffect } from 'react';
import { useJournalStore, useAuthStore } from '@/application/store';
import type { JournalEntry } from '@/domain/models';

const MOOD_OPTIONS: Array<{ key: JournalEntry['emotion']; label: string; color: string; bgBadge: string; emoji: string }> = [
  { key: 'calm', label: 'Calma', color: 'bg-teal-500', bgBadge: 'bg-teal-950/70 border-teal-700/50 text-teal-300', emoji: '😌' },
  { key: 'happy', label: 'Feliz', color: 'bg-emerald-500', bgBadge: 'bg-emerald-950/70 border-emerald-700/50 text-emerald-300', emoji: '😊' },
  { key: 'anxious', label: 'Ansiedad', color: 'bg-amber-500', bgBadge: 'bg-amber-950/70 border-amber-700/50 text-amber-300', emoji: '😰' },
  { key: 'sad', label: 'Tristeza', color: 'bg-blue-500', bgBadge: 'bg-blue-950/70 border-blue-700/50 text-blue-300', emoji: '😢' },
  { key: 'angry', label: 'Enojo', color: 'bg-rose-500', bgBadge: 'bg-rose-950/70 border-rose-700/50 text-rose-300', emoji: '😠' },
  { key: 'mixed', label: 'Mixto', color: 'bg-purple-500', bgBadge: 'bg-purple-950/70 border-purple-700/50 text-purple-300', emoji: '🌀' }
];

const PROMPTS = [
  '¿Qué pensamiento me está incomodando y qué evidencia real tengo?',
  'Tres cosas pequeñas por las que agradezco hoy...',
  '¿Cómo me gustaría tratarme a mí mismo/a en este momento difícil?'
];

const Bitacora: React.FC = () => {
  const { entries, loadEntries, addEntry, deleteEntry } = useJournalStore();
  const { user } = useAuthStore();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedEmotionFilter, setSelectedEmotionFilter] = useState<'all' | JournalEntry['emotion']>('all');

  const [newEntry, setNewEntry] = useState({
    content: '',
    emotion: 'calm' as JournalEntry['emotion'],
    intensity: 3
  });

  useEffect(() => {
    loadEntries();
  }, []);

  const handleSave = async () => {
    if (!newEntry.content.trim() || !user) return;

    await addEntry({
      user_id: user.id,
      date: new Date().toISOString().split('T')[0],
      emotion: newEntry.emotion,
      intensity: newEntry.intensity,
      type: 'text',
      content: newEntry.content.trim()
    });

    setNewEntry({ content: '', emotion: 'calm', intensity: 3 });
    setIsEditorOpen(false);
  };

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    await deleteEntry(id);
    setConfirmDeleteId(null);
  };

  const filteredEntries = selectedEmotionFilter === 'all'
    ? entries
    : entries.filter(e => e.emotion === selectedEmotionFilter);

  if (isEditorOpen) {
    return (
      <div className="h-full flex flex-col p-6 bg-calm-900 animate-fade-in pb-24">
        <header className="flex justify-between items-center mb-6">
          <button
            onClick={() => setIsEditorOpen(false)}
            className="text-gray-400 hover:text-white flex items-center gap-2 text-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Cancelar
          </button>
          <h2 className="text-xs font-semibold uppercase text-white tracking-widest font-mono">NUEVA ENTRADA</h2>
          <button
            onClick={handleSave}
            disabled={!newEntry.content.trim()}
            className="px-4 py-1.5 bg-calm-accent text-calm-900 rounded-lg text-xs font-bold hover:bg-teal-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Guardar
          </button>
        </header>

        <div className="flex-1 flex flex-col space-y-5 overflow-y-auto">
          {/* Mood Selector */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-calm-highlight mb-2 font-mono">
              ¿Cómo te sientes en este instante?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {MOOD_OPTIONS.map((mood) => (
                <button
                  key={mood.key}
                  onClick={() => setNewEntry({ ...newEntry, emotion: mood.key })}
                  className={`p-2.5 rounded-xl border text-xs font-medium transition-all flex items-center justify-center gap-2 ${
                    newEntry.emotion === mood.key
                      ? 'border-calm-accent bg-calm-800 text-white shadow-md'
                      : 'border-calm-700/40 bg-calm-800/30 text-gray-400 hover:border-calm-600'
                  }`}
                >
                  <span className="text-base">{mood.emoji}</span>
                  <span>{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Intensity Slider */}
          <div className="bg-calm-800/40 p-4 rounded-xl border border-calm-700/40">
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs uppercase tracking-wider text-calm-highlight font-mono">
                Intensidad Emocional
              </label>
              <span className="text-xs font-mono font-bold text-calm-accent bg-calm-950/60 px-2 py-0.5 rounded border border-calm-800">
                {newEntry.intensity} / 5
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={newEntry.intensity}
              onChange={(e) => setNewEntry({ ...newEntry, intensity: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-calm-700 rounded-lg appearance-none cursor-pointer accent-calm-accent"
            />
            <div className="flex justify-between text-[10px] text-gray-500 mt-1 font-mono">
              <span>1 (Leve)</span>
              <span>3 (Moderada)</span>
              <span>5 (Intensa)</span>
            </div>
          </div>

          {/* Prompt chips */}
          <div>
            <span className="text-[11px] text-gray-400 block mb-1.5 font-mono uppercase">Inspiración para escribir:</span>
            <div className="space-y-1">
              {PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setNewEntry(prev => ({ ...prev, content: prev.content ? `${prev.content}\n\n${prompt}\n` : `${prompt}\n` }))}
                  className="w-full text-left text-xs text-calm-highlight/80 hover:text-white bg-calm-800/30 hover:bg-calm-800/60 p-2 rounded-lg border border-calm-700/30 transition-colors block truncate"
                >
                  💬 {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Text Area */}
          <div className="flex-1 flex flex-col min-h-[160px]">
            <textarea
              value={newEntry.content}
              onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  handleSave();
                }
              }}
              placeholder="Vuelca tus pensamientos sin filtro... Este espacio es 100% privado en tu dispositivo. (Ctrl+Enter para guardar)"
              className="flex-1 w-full bg-calm-800/60 border border-calm-700/50 rounded-xl p-4 text-white placeholder-gray-500 text-sm sm:text-base leading-relaxed focus:border-calm-accent focus:outline-none resize-none"
            />
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
            <span className="text-xs uppercase tracking-widest text-calm-accent font-mono">Registro Emocional</span>
            <h2 className="text-3xl font-light text-white tracking-widest">BITÁCORA</h2>
          </div>
          <button
            onClick={() => setIsEditorOpen(true)}
            className="p-2.5 bg-calm-accent rounded-full text-calm-900 hover:bg-teal-300 transition-all active:scale-95 shadow-lg"
            title="Nueva entrada"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        <p className="text-xs sm:text-sm text-gray-400 mb-4">
          Espacio de descarga y autorreflexión protegido en tu almacenamiento local.
        </p>

        {/* Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedEmotionFilter('all')}
            className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-all font-mono ${
              selectedEmotionFilter === 'all'
                ? 'bg-calm-accent text-calm-900 font-bold'
                : 'bg-calm-800/60 text-gray-400 border border-calm-700/40 hover:text-white'
            }`}
          >
            Todas ({entries.length})
          </button>
          {MOOD_OPTIONS.map((mood) => (
            <button
              key={mood.key}
              onClick={() => setSelectedEmotionFilter(mood.key)}
              className={`px-3 py-1 rounded-full text-xs whitespace-nowrap transition-all flex items-center gap-1 font-mono ${
                selectedEmotionFilter === mood.key
                  ? 'bg-calm-accent text-calm-900 font-bold'
                  : 'bg-calm-800/60 text-gray-400 border border-calm-700/40 hover:text-white'
              }`}
            >
              <span>{mood.emoji}</span>
              <span>{mood.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Entries List */}
      {entries.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-20 h-20 mb-4 rounded-full bg-calm-800/60 border border-calm-700/40 flex items-center justify-center text-3xl">
            📖
          </div>
          <h3 className="text-lg font-light text-white mb-2">Tu diario está en blanco</h3>
          <p className="text-gray-400 text-sm mb-6 max-w-xs leading-relaxed">
            Escribir lo que sientes libera la carga mental y activa tu capacidad de autoregulación.
          </p>
          <button
            onClick={() => setIsEditorOpen(true)}
            className="px-5 py-2.5 bg-calm-accent text-calm-900 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-teal-300 transition-all shadow-md"
          >
            Escribir Primera Entrada
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredEntries.map((entry) => {
            const mood = MOOD_OPTIONS.find(m => m.key === entry.emotion) || MOOD_OPTIONS[0];
            return (
              <div
                key={entry.id}
                className="bg-calm-800/40 border border-calm-700/40 hover:border-calm-600/60 rounded-2xl p-4 shadow-sm transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{mood.emoji}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full border font-mono font-medium ${mood.bgBadge}`}>
                          {mood.label}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          Intensidad: {entry.intensity}/5
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                        {new Date(entry.created_at).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>

                  {confirmDeleteId === entry.id ? (
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
                      title="Eliminar entrada"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>

                <p className="text-gray-100 text-sm sm:text-base leading-relaxed whitespace-pre-wrap bg-calm-950/30 p-3.5 rounded-xl border border-calm-800/40">
                  {entry.content}
                </p>

                {entry.type === 'challenge' && (
                  <div className="mt-2.5 flex items-center gap-1.5 text-xs text-calm-accent font-mono">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Reto aceptado de Brújula</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Bitacora;
