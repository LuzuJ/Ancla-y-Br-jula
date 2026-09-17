import { describe, it, expect } from 'vitest';
import { 
  CURATED_LIBRARY, 
  getCuratedDailyContent, 
  getSpotifyUrl, 
  getYouTubeMusicUrl 
} from './curatedContent';

describe('Curated Offline Content Vault', () => {
  it('should have well-formed items in CURATED_LIBRARY', () => {
    expect(CURATED_LIBRARY.length).toBeGreaterThan(0);

    for (const item of CURATED_LIBRARY) {
      expect(item.quote.trim()).not.toBe('');
      expect(item.author.trim()).not.toBe('');
      expect(item.micro_action.trim()).not.toBe('');
      expect(item.songs.length).toBeGreaterThan(0);
      expect(item.art.length).toBeGreaterThan(0);
      expect(item.poem.text.trim()).not.toBe('');

      // Art check
      for (const art of item.art) {
        expect(art.title.trim()).not.toBe('');
        expect(art.image_url.startsWith('https://')).toBe(true);
      }
    }
  });

  it('should generate valid Spotify and YouTube Music URLs', () => {
    const spotifyUrl = getSpotifyUrl('Weightless', 'Marconi Union');
    expect(spotifyUrl).toBe('https://open.spotify.com/search/Weightless%20Marconi%20Union');

    const ytUrl = getYouTubeMusicUrl('Weightless', 'Marconi Union');
    expect(ytUrl).toBe('https://music.youtube.com/search?q=Weightless%20Marconi%20Union');
  });

  it('should return deterministic content for a given date', () => {
    const contentDay1 = getCuratedDailyContent('2026-09-16');
    const contentDay1Again = getCuratedDailyContent('2026-09-16');
    const contentDay2 = getCuratedDailyContent('2026-09-17');

    expect(contentDay1.quote).toBe(contentDay1Again.quote);
    expect(contentDay1.author).toBe(contentDay1Again.author);
    expect(contentDay2.quote).toBeDefined();
    expect(contentDay1.curated_songs.length).toBeGreaterThan(0);
    expect(contentDay1.curated_art.length).toBeGreaterThan(0);
    expect(contentDay1.curated_songs[0].url).toBeDefined();
  });
});
