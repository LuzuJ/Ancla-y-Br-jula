import React, { useEffect, useState } from 'react';
import { useJournalStore, useAuthStore } from '@/application/store';
import { LoadingState } from '@/domain/models';
import type { DailyContent } from '@/domain/models';
import { generateDailyContent } from '@/infrastructure/api/gemini';
import { contentService } from '@/infrastructure/api/supabase';
import { offlineContent, isOnline } from '@/infrastructure/database/offline';

const Brujula: React.FC = () => {
  const { addEntry } = useJournalStore();
  const { user } = useAuthStore();
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [content, setContent] = useState<DailyContent | null>(null);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setStatus(LoadingState.LOADING);
    
    try {
      // Try offline first
      const cached = await offlineContent.getToday();
      if (cached) {
        setContent(cached);
        setStatus(LoadingState.SUCCESS);
        return;
      }

      // Try online
      if (isOnline()) {
        // Skip Supabase check - daily_content table not created yet
        // const existingContent = await contentService.getTodayContent();
        // if (existingContent) {
        //   setContent(existingContent);
        //   await offlineContent.save(existingContent);
        //   setStatus(LoadingState.SUCCESS);
        //   return;
        // }

        // Generate new content
        const newContent = await generateDailyContent();
        if (newContent) {
          // Skip Supabase save - daily_content table not created yet
          // await contentService.saveContent(newContent);
          await offlineContent.save(newContent);
          setContent(newContent);
          setStatus(LoadingState.SUCCESS);
          return;
        }
      }

      setStatus(LoadingState.ERROR);
    } catch (error) {
      console.error('Content fetch error:', error);
      setStatus(LoadingState.ERROR);
    }
  };

  const acceptChallenge = async () => {
    if (!content || !user) return;

    await addEntry({
      user_id: user.id,
      date: new Date().toISOString().split('T')[0],
      emotion: 'calm',
      intensity: 3,
      type: 'challenge',
      content: `Reto del día: ${content.micro_action}`
    });

    alert('¡Reto aceptado! Lo encontrarás en tu Bitácora.');
  };

  if (status === LoadingState.LOADING) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-fade-in">
        <div className="w-16 h-16 border-4 border-calm-highlight border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-calm-highlight/80 animate-pulse">Curando contenido real para ti...</p>
      </div>
    );
  }

  if (status === LoadingState.ERROR || !content) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <svg className="w-16 h-16 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-red-400 mb-4">La conexión se perdió en la niebla.</p>
        <button
          onClick={fetchContent}
          className="px-6 py-2 bg-calm-accent text-calm-900 rounded-xl hover:bg-teal-300 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 animate-fade-in pb-24">
      <header className="mb-8">
        <h2 className="text-3xl font-light text-white tracking-widest mb-1">BRÚJULA</h2>
        <p className="text-sm text-gray-500 uppercase tracking-wider">
          {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </header>

      {/* Quote Card */}
      <div className="bg-calm-800/50 p-6 rounded-2xl border border-calm-700/50 mb-6 shadow-lg shadow-black/20">
        <div className="mb-4 text-calm-accent">
          <svg className="w-8 h-8 opacity-50" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-3c0-1.1046-.8954-2-2-2h-3c-1.1046 0-2 .8954-2 2v3h7zm7 0v-3c0-1.1046-.8954-2-2-2h-3c-1.1046 0-2 .8954-2 2v3h7zm0-7.997h-7c0-1.1046.8954-2.003 2-2.003h3c1.1046 0 2 .8974 2 2.003zm-7 0h-7c0-1.1046.8954-2.003 2-2.003h3c1.1046 0 2 .8974 2 2.003z" />
          </svg>
        </div>
        <blockquote className="text-xl font-serif italic text-gray-300 leading-relaxed mb-4">
          "{content.quote}"
        </blockquote>
        <cite className="block text-right text-sm text-calm-highlight not-italic">— {content.author}</cite>
      </div>

      {/* Micro Action */}
      <div className="bg-gradient-to-r from-teal-900/40 to-calm-800 p-6 rounded-2xl border-l-4 border-calm-accent mb-8">
        <h3 className="text-sm font-bold text-calm-accent uppercase mb-2 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Micro-Acción del Día
        </h3>
        <p className="text-gray-300 mb-4">{content.micro_action}</p>
        <div className="flex gap-3">
          <button
            onClick={acceptChallenge}
            className="flex-1 bg-calm-accent text-calm-900 py-3 rounded-lg text-sm font-medium hover:bg-teal-300 transition-colors"
          >
            Aceptar Reto
          </button>
        </div>
      </div>

      {/* Curator Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-light text-white border-b border-gray-700 pb-2">Curaduría de Calma</h3>

        {/* Songs */}
        {content.curated_songs && content.curated_songs.length > 0 && (
          <div className="bg-calm-800/30 p-5 rounded-xl border border-calm-700/30">
            <h4 className="text-calm-highlight text-sm font-bold mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              Sonidos para tu día
            </h4>
            <ul className="space-y-2">
              {content.curated_songs.map((song, i) => (
                <li key={i} className="text-sm text-gray-300 border-b border-gray-800 last:border-0 pb-2 flex items-center gap-2">
                  <span className="text-calm-accent">♪</span>
                  <span>
                    <strong>{song.title}</strong>
                    {song.artist && <span className="text-gray-500"> — {song.artist}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Art */}
        {content.curated_art && content.curated_art.length > 0 && (
          <div className="bg-calm-800/30 p-5 rounded-xl border border-calm-700/30">
            <h4 className="text-calm-highlight text-sm font-bold mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Arte para contemplar
            </h4>
            <ul className="space-y-2">
              {content.curated_art.map((art, i) => (
                <li key={i} className="text-sm text-gray-300 border-b border-gray-800 last:border-0 pb-2">
                  <strong>{art.title}</strong>
                  {art.artist && <span className="text-gray-500"> — {art.artist}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Poem */}
        {content.poem && (
          <div className="bg-calm-800/30 p-5 rounded-xl border border-calm-700/30">
            <h4 className="text-calm-highlight text-sm font-bold mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              Poema del día
            </h4>
            <div className="mb-2">
              <div className="text-white font-medium">{content.poem.title}</div>
              <div className="text-gray-500 text-xs">{content.poem.author}</div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed font-serif italic">
              {content.poem.text}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Brujula;
