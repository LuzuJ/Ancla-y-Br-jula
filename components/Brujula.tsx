
import React, { useEffect, useState } from 'react';
import { getDailyContent } from '../services/geminiService';
import { DailyContent, LoadingState } from '../types';

interface BrujulaProps {
  onAcceptChallenge: (challenge: string) => void;
}

const Brujula: React.FC<BrujulaProps> = ({ onAcceptChallenge }) => {
  const [content, setContent] = useState<DailyContent | null>(null);
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);

  useEffect(() => {
    const fetchContent = async () => {
      setStatus(LoadingState.LOADING);
      const data = await getDailyContent();
      if (data) {
        setContent(data);
        setStatus(LoadingState.SUCCESS);
      } else {
        setStatus(LoadingState.ERROR);
      }
    };
    fetchContent();
  }, []);

  if (status === LoadingState.LOADING) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-fade-in">
        <div className="w-12 h-12 border-4 border-calm-highlight border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-calm-highlight/80 animate-pulse">Buscando inspiración real y arte para ti...</p>
      </div>
    );
  }

  if (status === LoadingState.ERROR || !content) {
    return (
       <div className="flex flex-col items-center justify-center h-full p-8 text-center">
         <p className="text-red-400">La conexión se perdió en la niebla. Intenta más tarde.</p>
       </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 animate-fade-in pb-24">
      <header className="mb-8">
        <h2 className="text-3xl font-light text-white tracking-widest mb-1">BRÚJULA</h2>
        <p className="text-sm text-gray-500 uppercase tracking-wider">{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
      </header>

      {/* Quote Card */}
      <div className="bg-calm-800/50 p-6 rounded-2xl border border-calm-700/50 mb-6 shadow-lg shadow-black/20">
        <div className="mb-4 text-calm-accent">
          <svg className="w-8 h-8 opacity-50" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21L14.017 18C14.017 16.8954 13.1216 16 12.017 16H9.017C7.91243 16 7.017 16.8954 7.017 18V21H14.017ZM21.017 21L21.017 18C21.017 16.8954 20.1216 16 19.017 16H16.017C14.9124 16 14.017 16.8954 14.017 18V21H21.017ZM21.017 13.003L14.017 13.003C14.017 11.8984 14.9124 11.003 16.017 11.003H19.017C20.1216 11.003 21.017 11.8984 21.017 13.003ZM14.017 13.003L7.017 13.003C7.017 11.8984 7.91243 11.003 9.017 11.003H12.017C13.1216 11.003 14.017 11.8984 14.017 13.003Z" /></svg>
        </div>
        <blockquote className="text-xl font-serif italic text-gray-300 leading-relaxed mb-4">
          "{content.quote}"
        </blockquote>
        <cite className="block text-right text-sm text-calm-highlight not-italic">— {content.author}</cite>
      </div>

      {/* Micro Action */}
      <div className="bg-gradient-to-r from-teal-900/40 to-calm-800 p-6 rounded-2xl border-l-4 border-calm-accent mb-8">
        <h3 className="text-sm font-bold text-calm-accent uppercase mb-2">Micro-Acción del Día</h3>
        <p className="text-gray-300 mb-4">{content.action}</p>
        <div className="flex gap-3">
          <button 
            onClick={() => onAcceptChallenge(`Reto del día: ${content.action}`)}
            className="flex-1 bg-calm-accent text-calm-900 py-2 rounded-lg text-sm font-medium hover:bg-teal-300 transition-colors"
          >
            Aceptar Reto
          </button>
          <button className="px-4 py-2 border border-calm-600 rounded-lg text-sm text-gray-400 hover:text-white hover:border-gray-400 transition-colors">
            Guardar
          </button>
        </div>
      </div>

      {/* Curator Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-light text-white border-b border-gray-700 pb-2">Curaduría de Calma</h3>
        
        {/* Songs */}
        <div className="bg-calm-800/30 p-4 rounded-xl">
           <h4 className="text-calm-highlight text-sm font-bold mb-3 flex items-center gap-2">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
             Sonidos
           </h4>
           <ul className="space-y-2">
             {content.curatedContent?.songs.map((song, i) => (
               <li key={i} className="text-sm text-gray-400 border-b border-gray-800 last:border-0 pb-1">
                 {song.title} {song.artist ? `- ${song.artist}` : ''}
               </li>
             ))}
           </ul>
        </div>

        {/* Poem */}
        <div className="bg-calm-800/30 p-4 rounded-xl">
          <h4 className="text-calm-highlight text-sm font-bold mb-3">Poesía</h4>
          <p className="text-sm text-gray-300 whitespace-pre-line leading-relaxed italic">
            {content.curatedContent?.poem.text}
          </p>
        </div>
      </div>
      
      <div className="mt-8 text-xs text-center text-gray-600">
        Contenido verificado por Google Search Grounding
      </div>
    </div>
  );
};

export default Brujula;
