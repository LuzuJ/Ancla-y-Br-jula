import React, { useState, useEffect } from 'react';
import { useJournalStore, useAuthStore } from '@/application/store';
import type { JournalEntry } from '@/domain/models';

const MOOD_OPTIONS: Array<{ key: JournalEntry['emotion']; label: string; color: string; emoji: string }> = [
  { key: 'calm', label: 'Calma', color: 'bg-teal-500', emoji: '😌' },
  { key: 'happy', label: 'Feliz', color: 'bg-yellow-500', emoji: '😊' },
  { key: 'anxious', label: 'Ansioso/a', color: 'bg-orange-500', emoji: '😰' },
  { key: 'sad', label: 'Triste', color: 'bg-blue-500', emoji: '😢' },
  { key: 'angry', label: 'Enojado/a', color: 'bg-red-500', emoji: '😠' },
  { key: 'mixed', label: 'Mixto', color: 'bg-purple-500', emoji: '🌀' }
];

const Bitacora: React.FC = () => {
  const { entries, loadEntries, addEntry, deleteEntry } = useJournalStore();
  const { user } = useAuthStore();
  const [isEditorOpen, setIsEditorOpen] = useState(false);
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
      content: newEntry.content
    });

    setNewEntry({ content: '', emotion: 'calm', intensity: 3 });
    setIsEditorOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Seguro que quieres eliminar esta entrada?')) {
      await deleteEntry(id);
    }
  };

  if (isEditorOpen) {
    return (
      <div className="h-full flex flex-col p-6 bg-calm-900 animate-fade-in">
        <header className="flex justify-between items-center mb-6">
          <button
            onClick={() => setIsEditorOpen(false)}
            className="text-gray-400 hover:text-white"
          >
            Cancelar
          </button>
          <h2 className="text-lg font-medium text-white tracking-widest">NUEVA ENTRADA</h2>
          <button
            onClick={handleSave}
            disabled={!newEntry.content.trim()}
            className="text-calm-accent font-bold hover:text-teal-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Guardar
          </button>
        </header>

        <div className="flex-1 flex flex-col space-y-6">
          {/* Mood Selector */}
          <div>
            <label className="block text-sm text-gray-400 mb-3">¿Cómo te sientes?</label>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {MOOD_OPTIONS.map((mood) => (
                <button
                  key={mood.key}
                  onClick={() => setNewEntry({ ...newEntry, emotion: mood.key })}
                  className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
                    newEntry.emotion === mood.key
                      ? `${mood.color} text-white scale-105 shadow-lg`
                      : 'bg-calm-800 text-gray-400 border border-calm-700 hover:border-calm-600'
                  }`}
                >
                  <span>{mood.emoji}</span>
                  <span>{mood.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Intensity Slider */}
          <div>
            <label className="block text-sm text-gray-400 mb-3">
              Intensidad: {newEntry.intensity}/5
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={newEntry.intensity}
              onChange={(e) => setNewEntry({ ...newEntry, intensity: parseInt(e.target.value) })}
              className="w-full h-2 bg-calm-700 rounded-lg appearance-none cursor-pointer accent-calm-accent"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>Leve</span>
              <span>Moderado</span>
              <span>Intenso</span>
            </div>
          </div>

          {/* Text Area */}
          <div className="flex-1 flex flex-col">
            <label className="block text-sm text-gray-400 mb-2">¿Qué quieres escribir?</label>
            <textarea
              value={newEntry.content}
              onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
              placeholder="Escribe libremente... nadie más lo leerá."
              className="flex-1 bg-calm-800 border border-calm-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-calm-accent focus:border-transparent resize-none"
            />
          </div>

          <div className="bg-calm-accent/10 border border-calm-accent/30 rounded-xl p-4">
            <p className="text-sm text-calm-highlight">
              💡 Expresar tus emociones por escrito ayuda a procesarlas y reduce su intensidad.
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
          <h2 className="text-3xl font-light text-white tracking-widest">BITÁCORA</h2>
          <button
            onClick={() => setIsEditorOpen(true)}
            className="p-2 bg-calm-accent rounded-full text-calm-900 hover:bg-teal-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        <p className="text-sm text-gray-400">Tu diario emocional privado</p>
        <div className="mt-3 text-xs text-calm-accent bg-calm-accent/10 rounded-lg px-3 py-2 border border-calm-accent/30">
          📝 {entries.length} entrada{entries.length !== 1 ? 's' : ''} registrada{entries.length !== 1 ? 's' : ''}
        </div>
      </header>

      {entries.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-24 h-24 mb-6 rounded-full bg-calm-800 flex items-center justify-center">
            <svg className="w-12 h-12 text-calm-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-xl text-white mb-2">Tu Bitácora está vacía</h3>
          <p className="text-gray-400 mb-6 max-w-sm">
            Empieza a escribir tus pensamientos y emociones. Nadie más los verá.
          </p>
          <button
            onClick={() => setIsEditorOpen(true)}
            className="px-6 py-3 bg-calm-accent text-calm-900 rounded-xl font-medium hover:bg-teal-300 transition-colors"
          >
            Crear primera entrada
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {entries.map((entry) => {
            const mood = MOOD_OPTIONS.find(m => m.key === entry.emotion);
            return (
              <div
                key={entry.id}
                className="bg-calm-800/50 border border-calm-700/50 rounded-2xl p-5 shadow-lg shadow-black/20"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{mood?.emoji}</span>
                    <div>
                      <div className="text-white font-medium flex items-center gap-2">
                        {mood?.label}
                        <span className="text-xs px-2 py-1 rounded-full bg-calm-700 text-gray-400">
                          {entry.intensity}/5
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(entry.created_at).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
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

                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {entry.content}
                </p>

                {entry.type === 'challenge' && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-calm-accent">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Reto aceptado de Brújula
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
