
import React, { useState, useEffect, useRef } from 'react';
import { JournalEntry } from '../types';
import { saveEntry, getEntries } from '../services/storageService';
import { generatePoemAndAudio } from '../services/geminiService';

interface BitacoraProps {
  onOpenEspejo: () => void;
  initialEditorContent?: string | null;
  onClearInitialContent?: () => void;
}

const MOOD_COLORS: Record<string, string> = {
  'calm': 'bg-teal-500',
  'happy': 'bg-yellow-500',
  'anxious': 'bg-orange-500',
  'sad': 'bg-blue-500',
  'angry': 'bg-red-500',
};

const Bitacora: React.FC<BitacoraProps> = ({ onOpenEspejo, initialEditorContent, onClearInitialContent }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [newEntryText, setNewEntryText] = useState('');
  const [selectedMood, setSelectedMood] = useState('calm');
  const [isEditorOpen, setIsEditorOpen] = useState(false); // Replaces simple showTextForm
  
  const [audioCapsule, setAudioCapsule] = useState<{text: string, buffer: AudioBuffer} | null>(null);
  const [generatingAudio, setGeneratingAudio] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    setEntries(getEntries());
  }, []);

  // Handle incoming challenge/content from Compass
  useEffect(() => {
    if (initialEditorContent) {
      setNewEntryText(initialEditorContent);
      setIsEditorOpen(true);
      if (onClearInitialContent) onClearInitialContent();
    }
  }, [initialEditorContent, onClearInitialContent]);

  const handleSave = () => {
    if (!newEntryText.trim()) return;
    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      emotion: selectedMood,
      type: 'text',
      content: newEntryText,
      intensity: 3,
    };
    saveEntry(entry);
    setEntries(getEntries());
    setNewEntryText('');
    setIsEditorOpen(false);
  };

  const generateCapsule = async () => {
    setGeneratingAudio(true);
    const result = await generatePoemAndAudio();
    if (result.audio) {
      setAudioCapsule({ text: result.text, buffer: result.audio });
    }
    setGeneratingAudio(false);
  };

  const playCapsule = () => {
    if (!audioCapsule) return;
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioCapsule.buffer;
    source.connect(audioContextRef.current.destination);
    source.start();
  };

  if (isEditorOpen) {
    return (
      <div className="h-full flex flex-col p-6 animate-fade-in bg-calm-900 absolute inset-0 z-20">
        <header className="flex justify-between items-center mb-6">
          <button onClick={() => setIsEditorOpen(false)} className="text-gray-400 hover:text-white">
            Cancelar
          </button>
          <h2 className="text-lg font-medium text-white tracking-widest">NUEVA ENTRADA</h2>
          <button onClick={handleSave} className="text-calm-accent font-bold hover:text-teal-300">
            Guardar
          </button>
        </header>

        <div className="flex-1 flex flex-col gap-4">
           {/* Mood Selector */}
           <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
             {Object.keys(MOOD_COLORS).map(mood => (
               <button
                 key={mood}
                 onClick={() => setSelectedMood(mood)}
                 className={`px-4 py-2 rounded-full text-xs capitalize transition-all whitespace-nowrap ${selectedMood === mood ? MOOD_COLORS[mood] + ' text-white scale-105' : 'bg-calm-800 text-gray-400 border border-calm-700'}`}
               >
                 {mood}
               </button>
             ))}
           </div>

           {/* Canvas / Text Area */}
           <textarea
             className="flex-1 w-full bg-calm-800/50 rounded-xl p-4 text-white text-base leading-relaxed focus:ring-1 focus:ring-calm-accent border border-calm-700/50 resize-none placeholder-gray-600"
             placeholder="Hoy siento..."
             value={newEntryText}
             onChange={(e) => setNewEntryText(e.target.value)}
           />

           {/* Toolbar (Mock) */}
           <div className="bg-calm-800 p-3 rounded-xl flex justify-around text-gray-400">
              <button className="flex flex-col items-center gap-1 hover:text-calm-accent"><span className="text-lg">📷</span><span className="text-[10px]">Cámara</span></button>
              <button className="flex flex-col items-center gap-1 hover:text-calm-accent"><span className="text-lg">✏️</span><span className="text-[10px]">Dibujo</span></button>
              <button className="flex flex-col items-center gap-1 hover:text-calm-accent"><span className="text-lg">🔗</span><span className="text-[10px]">Enlace</span></button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 animate-fade-in pb-24 relative">
       <header className="mb-6 flex justify-between items-center">
        <h2 className="text-3xl font-light text-white tracking-widest">BITÁCORA</h2>
        
        {/* Simple Add Button */}
        <button 
          onClick={() => setIsEditorOpen(true)}
          className="bg-calm-accent text-calm-900 rounded-full p-2 hover:bg-teal-300 transition-colors shadow-lg shadow-teal-500/20"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        </button>
      </header>

      {/* Capsule of Calm Section */}
      <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/30 p-6 rounded-2xl mb-8 border border-indigo-500/20">
        <h3 className="text-indigo-300 font-medium mb-2 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
          Cápsula de Calma
        </h3>
        <p className="text-xs text-indigo-200/60 mb-4">Un poema generado solo para ti, narrado por voz AI.</p>
        
        {!audioCapsule ? (
          <button 
            onClick={generateCapsule}
            disabled={generatingAudio}
            className="w-full py-3 bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-200 rounded-xl text-sm transition-colors border border-indigo-500/30 flex items-center justify-center gap-2"
          >
            {generatingAudio ? (
              <span className="animate-pulse">Creando magia...</span>
            ) : (
              'Generar Audio Poema'
            )}
          </button>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-300 italic">"{audioCapsule.text}"</p>
            <button 
              onClick={playCapsule}
              className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-sm font-medium shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              Reproducir Audio
            </button>
          </div>
        )}
      </div>

      <h3 className="text-xs font-bold text-gray-500 mb-4 tracking-wider uppercase">Tu Mapa de Calor</h3>
      {/* Simplified Heatmap Grid */}
      <div className="grid grid-cols-7 gap-2 mb-8">
        {Array.from({ length: 28 }).map((_, i) => {
          const entry = entries[i]; 
          return (
            <div 
              key={i} 
              className={`aspect-square rounded-md ${entry ? MOOD_COLORS[entry.emotion] : 'bg-calm-800'} opacity-80 hover:opacity-100 transition-opacity`}
              title={entry ? entry.date : ''}
            />
          );
        })}
      </div>
      
      <div className="space-y-4">
        {entries.length === 0 ? (
          <p className="text-gray-600 text-center text-sm py-4">Aún no hay entradas. Usa el botón + para comenzar.</p>
        ) : (
          entries.slice(0, 5).map(entry => (
            <div key={entry.id} className="border-l-2 border-calm-700 pl-4 py-2 hover:bg-calm-800/30 transition-colors rounded-r-lg">
               <div className="flex justify-between items-center mb-1">
                 <span className="text-xs text-gray-500">{new Date(entry.date).toLocaleDateString()}</span>
                 <div className={`w-2 h-2 rounded-full ${MOOD_COLORS[entry.emotion]}`} />
               </div>
               <p className="text-gray-300 text-sm line-clamp-2">{entry.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Bitacora;
