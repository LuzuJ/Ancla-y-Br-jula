import React, { useEffect, useState } from 'react';
import { useJournalStore, useAuthStore, useSettingsStore } from '@/application/store';
import type { DailyContent } from '@/domain/models';
import { 
  generateSingleQuoteWithAi, 
  generateSingleMicroActionWithAi, 
  generateSinglePoemWithAi 
} from '@/infrastructure/api/aiClient';
import { getCuratedDailyContent, getSpotifyUrl, getYouTubeMusicUrl } from '@/domain/content/curatedContent';
import { offlineContent } from '@/infrastructure/database/offline';
import { ambientSound } from '@/infrastructure/audio/soundscapes';

type SoundType = 'rain' | 'waves' | 'alpha' | 'zen';

const Brujula: React.FC = () => {
  const { addEntry } = useJournalStore();
  const { user } = useAuthStore();
  const { aiApiKey } = useSettingsStore();

  const [content, setContent] = useState<DailyContent>(() => getCuratedDailyContent());
  const [challengeAccepted, setChallengeAccepted] = useState(false);
  const [selectedArt, setSelectedArt] = useState<{ title: string; artist: string; image_url?: string } | null>(null);

  // Granular AI loading states (fast & token-efficient)
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);
  const [loadingPoem, setLoadingPoem] = useState(false);

  // Ambient soundscape state
  const [activeSound, setActiveSound] = useState<SoundType | null>(null);
  const [soundVolume, setSoundVolume] = useState(0.5);

  useEffect(() => {
    loadInitialContent();
    return () => {
      ambientSound.stop();
    };
  }, []);

  const loadInitialContent = async () => {
    try {
      const cached = await offlineContent.getToday();
      if (cached) {
        setContent(cached);
      } else {
        const curated = getCuratedDailyContent();
        setContent(curated);
        await offlineContent.save(curated);
      }
    } catch (error) {
      console.warn('Fallback to memory curated content:', error);
      setContent(getCuratedDailyContent());
    }
  };

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const checkApiKey = (): boolean => {
    if (!aiApiKey) {
      showToast('Para consultar la IA, añade tu API Key en la pestaña Perfil.');
      return false;
    }
    return true;
  };

  const handleRegenerateQuote = async () => {
    if (!checkApiKey() || loadingQuote) return;
    setLoadingQuote(true);
    try {
      const newQuote = await generateSingleQuoteWithAi();
      if (newQuote) {
        const updated = { ...content, quote: newQuote.quote, author: newQuote.author };
        setContent(updated);
        await offlineContent.save(updated);
      }
    } catch (err) {
      console.error('Error generating quote:', err);
    } finally {
      setLoadingQuote(false);
    }
  };

  const handleRegenerateMicroAction = async () => {
    if (!checkApiKey() || loadingAction) return;
    setLoadingAction(true);
    try {
      const newAction = await generateSingleMicroActionWithAi();
      if (newAction) {
        const updated = { ...content, micro_action: newAction };
        setContent(updated);
        setChallengeAccepted(false);
        await offlineContent.save(updated);
      }
    } catch (err) {
      console.error('Error generating action:', err);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRegeneratePoem = async () => {
    if (!checkApiKey() || loadingPoem) return;
    setLoadingPoem(true);
    try {
      const newPoem = await generateSinglePoemWithAi();
      if (newPoem) {
        const updated = { ...content, poem: newPoem };
        setContent(updated);
        await offlineContent.save(updated);
      }
    } catch (err) {
      console.error('Error generating poem:', err);
    } finally {
      setLoadingPoem(false);
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

    setChallengeAccepted(true);
  };

  const toggleSound = (type: SoundType) => {
    if (activeSound === type) {
      ambientSound.stop();
      setActiveSound(null);
    } else {
      ambientSound.play(type);
      setActiveSound(type);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setSoundVolume(newVol);
    ambientSound.setVolume(newVol);
  };

  return (
    <div className="h-full overflow-y-auto p-6 pb-28 animate-fade-in">
      {/* Header */}
      <header className="mb-6 flex items-end justify-between border-b border-calm-700/50 pb-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-calm-accent font-mono">Brújula Diaria</span>
          <h2 className="text-3xl font-light text-white tracking-wider">ORIENTACIÓN</h2>
          <p className="text-xs text-gray-400 capitalize mt-0.5">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="mb-4 p-3 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-200 text-xs sm:text-sm flex items-center justify-between animate-fade-in shadow-md">
          <div className="flex items-center gap-2">
            <span>💡</span>
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-amber-400 hover:text-white text-xs ml-2 font-mono">✕</button>
        </div>
      )}

      {/* Procedural Soundscapes Bar (Web Audio API - 100% Offline) */}
      <div className="bg-gradient-to-r from-calm-800/80 via-calm-800/40 to-teal-950/40 p-4 rounded-2xl border border-calm-700/50 mb-6 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-calm-accent animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-200">
              Paisajes Sonoros Calmantes
            </span>
          </div>
          {activeSound && (
            <span className="text-[11px] text-calm-accent font-mono animate-fade-in">
              Reproduciendo {activeSound === 'rain' ? 'Lluvia' : activeSound === 'waves' ? 'Olas' : activeSound === 'alpha' ? 'Ondas Alfa 10Hz' : 'Cuenco Zen'}
            </span>
          )}
        </div>

        <div className="grid grid-cols-4 gap-2 mb-3">
          <button
            onClick={() => toggleSound('rain')}
            className={`py-2 px-1 rounded-xl text-xs font-medium flex flex-col items-center gap-1 transition-all ${
              activeSound === 'rain'
                ? 'bg-teal-500/20 text-calm-accent border border-calm-accent/60 shadow-inner'
                : 'bg-calm-900/60 hover:bg-calm-800 text-gray-300 border border-calm-700/40'
            }`}
          >
            <span className="text-base">🌧️</span>
            <span className="text-[10px]">Lluvia</span>
          </button>

          <button
            onClick={() => toggleSound('waves')}
            className={`py-2 px-1 rounded-xl text-xs font-medium flex flex-col items-center gap-1 transition-all ${
              activeSound === 'waves'
                ? 'bg-teal-500/20 text-calm-accent border border-calm-accent/60 shadow-inner'
                : 'bg-calm-900/60 hover:bg-calm-800 text-gray-300 border border-calm-700/40'
            }`}
          >
            <span className="text-base">🌊</span>
            <span className="text-[10px]">Olas</span>
          </button>

          <button
            onClick={() => toggleSound('alpha')}
            className={`py-2 px-1 rounded-xl text-xs font-medium flex flex-col items-center gap-1 transition-all ${
              activeSound === 'alpha'
                ? 'bg-teal-500/20 text-calm-accent border border-calm-accent/60 shadow-inner'
                : 'bg-calm-900/60 hover:bg-calm-800 text-gray-300 border border-calm-700/40'
            }`}
          >
            <span className="text-base">🧘</span>
            <span className="text-[10px]">Alfa 10Hz</span>
          </button>

          <button
            onClick={() => toggleSound('zen')}
            className={`py-2 px-1 rounded-xl text-xs font-medium flex flex-col items-center gap-1 transition-all ${
              activeSound === 'zen'
                ? 'bg-teal-500/20 text-calm-accent border border-calm-accent/60 shadow-inner'
                : 'bg-calm-900/60 hover:bg-calm-800 text-gray-300 border border-calm-700/40'
            }`}
          >
            <span className="text-base">🔔</span>
            <span className="text-[10px]">Campana</span>
          </button>
        </div>

        {activeSound && (
          <div className="flex items-center gap-3 pt-2 border-t border-calm-700/30 animate-fade-in">
            <span className="text-[11px] text-gray-400">Volumen:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={soundVolume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="flex-1 accent-calm-accent h-1.5 bg-calm-900 rounded-lg cursor-pointer"
            />
            <button
              onClick={() => { ambientSound.stop(); setActiveSound(null); }}
              className="px-2 py-0.5 rounded bg-red-950/60 hover:bg-red-900/80 border border-red-700/40 text-[10px] text-red-300"
            >
              Silenciar
            </button>
          </div>
        )}
      </div>

      {/* Quote of the day (Hero Card with Granular AI Button) */}
      <div className="relative overflow-hidden bg-gradient-to-br from-calm-800/70 via-calm-800/40 to-teal-950/20 p-7 rounded-2xl border border-calm-700/50 mb-6 shadow-xl backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase tracking-wider text-calm-accent/80 font-mono">Estoicismo & Presencia</span>
          
          <button
            onClick={handleRegenerateQuote}
            disabled={loadingQuote}
            className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-calm-900/60 hover:bg-calm-700 border border-calm-700/50 text-calm-highlight transition-all active:scale-95 disabled:opacity-50"
            title="Generar nueva cita con IA"
          >
            <svg className={`w-3 h-3 text-calm-accent ${loadingQuote ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{loadingQuote ? 'Consultando...' : 'Nueva Cita'}</span>
          </button>
        </div>

        <blockquote className="text-xl sm:text-2xl font-serif italic text-white leading-relaxed mb-4 relative z-10">
          "{content.quote}"
        </blockquote>
        
        <div className="text-right pt-2 border-t border-calm-700/30">
          <cite className="text-sm font-medium text-calm-highlight not-italic">— {content.author}</cite>
        </div>
      </div>

      {/* Micro-Action / Psychological Challenge (With Granular AI Button) */}
      <div className="bg-gradient-to-r from-teal-950/40 via-calm-800/60 to-calm-800/40 p-6 rounded-2xl border-l-4 border-calm-accent mb-8 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded bg-teal-500/20 text-calm-accent">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </span>
            <h3 className="text-xs font-bold tracking-wider text-calm-accent uppercase">
              Micro-Acción de Bienestar
            </h3>
          </div>

          <button
            onClick={handleRegenerateMicroAction}
            disabled={loadingAction}
            className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-calm-900/60 hover:bg-calm-700 border border-calm-700/50 text-calm-highlight transition-all active:scale-95 disabled:opacity-50"
            title="Generar nueva acción con IA"
          >
            <svg className={`w-3 h-3 text-calm-accent ${loadingAction ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{loadingAction ? 'Creando...' : 'Nueva Acción'}</span>
          </button>
        </div>

        <p className="text-gray-100 text-sm sm:text-base leading-relaxed mb-5">
          {content.micro_action}
        </p>

        <button
          onClick={acceptChallenge}
          disabled={challengeAccepted}
          className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            challengeAccepted
              ? 'bg-teal-900/60 text-teal-300 border border-teal-700/50 cursor-default'
              : 'bg-calm-accent text-calm-900 hover:bg-teal-300 active:scale-98 shadow-md'
          }`}
        >
          {challengeAccepted ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Reto Registrado en tu Bitácora</span>
            </>
          ) : (
            <span>Aceptar Reto del Día</span>
          )}
        </button>
      </div>

      {/* Curator Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold tracking-widest text-calm-highlight uppercase">
            Santuario Sensorial
          </h3>
          <div className="flex-1 h-[1px] bg-calm-700/50"></div>
        </div>

        {/* Music with Interactive Links */}
        {content.curated_songs && content.curated_songs.length > 0 && (
          <div className="bg-calm-800/30 p-5 rounded-2xl border border-calm-700/30">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white text-sm sm:text-base font-medium flex items-center gap-2">
                <svg className="w-4 h-4 text-calm-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                Sonidos para restaurar la calma
              </h4>
              <span className="text-xs text-gray-400 uppercase tracking-wider">Escuchar en</span>
            </div>

            <div className="space-y-2.5">
              {content.curated_songs.map((song, i) => (
                <div 
                  key={i} 
                  className="flex items-center justify-between p-3.5 rounded-xl bg-calm-800/50 hover:bg-calm-800/80 border border-calm-700/30 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-teal-950/80 border border-teal-800/40 flex items-center justify-center text-calm-accent text-xs font-mono">
                      0{i + 1}
                    </div>
                    <div className="truncate">
                      <p className="text-sm sm:text-base font-medium text-gray-100 truncate">{song.title}</p>
                      <p className="text-xs text-gray-400 truncate">{song.artist || 'Música Ambiental'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 ml-2">
                    <a
                      href={getSpotifyUrl(song.title, song.artist)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-700/50 text-xs font-medium text-emerald-400 flex items-center gap-1 transition-all"
                      title="Abrir en Spotify"
                    >
                      <span>Spotify</span>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                    <a
                      href={getYouTubeMusicUrl(song.title, song.artist)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 border border-rose-700/50 text-xs font-medium text-rose-400 flex items-center gap-1 transition-all"
                      title="Abrir en YouTube Music"
                    >
                      <span>YT Music</span>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Visual Artwork Gallery */}
        {content.curated_art && content.curated_art.length > 0 && (
          <div className="bg-calm-800/30 p-5 rounded-2xl border border-calm-700/30">
            <h4 className="text-white text-sm sm:text-base font-medium mb-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-calm-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Arte para contemplar y serenar la mirada
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {content.curated_art.map((art, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedArt(art)}
                  className="group relative overflow-hidden rounded-xl border border-calm-700/40 bg-calm-900/60 cursor-pointer transition-transform hover:scale-[1.02] shadow-md"
                >
                  {art.image_url ? (
                    <div className="aspect-video w-full overflow-hidden bg-calm-950 relative">
                      <img
                        src={art.image_url}
                        alt={art.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity"></div>
                    </div>
                  ) : (
                    <div className="aspect-video w-full bg-gradient-to-tr from-teal-950 to-calm-800 flex items-center justify-center p-4 text-center">
                      <span className="text-sm text-calm-highlight italic">"{art.title}"</span>
                    </div>
                  )}

                  <div className="p-3">
                    <p className="text-sm font-semibold text-gray-200 truncate group-hover:text-calm-accent transition-colors">
                      {art.title}
                    </p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">
                      {art.artist}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Poem Card (With Granular AI Button) */}
        {content.poem && (
          <div className="bg-gradient-to-br from-calm-800/40 to-calm-900/80 p-6 rounded-2xl border border-calm-700/40 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-calm-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h4 className="text-xs font-bold uppercase tracking-wider text-calm-accent">
                  Poema de Esperanza
                </h4>
              </div>

              <button
                onClick={handleRegeneratePoem}
                disabled={loadingPoem}
                className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-calm-900/60 hover:bg-calm-700 border border-calm-700/50 text-calm-highlight transition-all active:scale-95 disabled:opacity-50"
                title="Generar nuevo poema con IA"
              >
                <svg className={`w-3 h-3 text-calm-accent ${loadingPoem ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>{loadingPoem ? 'Escribiendo...' : 'Nuevo Poema'}</span>
              </button>
            </div>

            <div className="mb-3">
              <h5 className="text-base font-semibold text-white">{content.poem.title}</h5>
              <p className="text-xs text-calm-highlight">{content.poem.author}</p>
            </div>

            <p className="text-gray-100 text-sm sm:text-base leading-relaxed font-serif italic whitespace-pre-line bg-calm-950/40 p-5 rounded-xl border border-calm-800/60">
              {content.poem.text}
            </p>
          </div>
        )}
      </div>

      {/* Art Lightbox / Contemplation Modal */}
      {selectedArt && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedArt(null)}
        >
          <div className="max-w-3xl w-full bg-calm-900 rounded-2xl overflow-hidden border border-calm-700 shadow-2xl" onClick={e => e.stopPropagation()}>
            {selectedArt.image_url && (
              <div className="relative max-h-[65vh] overflow-hidden bg-black flex items-center justify-center">
                <img 
                  src={selectedArt.image_url} 
                  alt={selectedArt.title}
                  className="w-full h-full object-contain max-h-[65vh]"
                />
              </div>
            )}
            <div className="p-5 flex items-center justify-between bg-calm-900">
              <div>
                <h3 className="text-base font-light text-white">{selectedArt.title}</h3>
                <p className="text-xs text-calm-highlight">{selectedArt.artist}</p>
              </div>
              <button
                onClick={() => setSelectedArt(null)}
                className="px-4 py-1.5 rounded-lg bg-calm-800 hover:bg-calm-700 text-xs text-white transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Brujula;
