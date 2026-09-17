import { describe, it, expect } from 'vitest';
import { 
  detectTriggers, 
  detectDistortions, 
  getEndpointUrl
} from './aiClient';
import { AI_PROVIDERS } from '@/domain/constants';

describe('AI Client & Cognitive Diagnostics', () => {
  describe('Multi-Provider Configurations', () => {
    it('should include DeepSeek, Gemini, OpenAI, Groq, Ollama and Custom in provider list', () => {
      expect(AI_PROVIDERS).toHaveProperty('deepseek');
      expect(AI_PROVIDERS).toHaveProperty('gemini');
      expect(AI_PROVIDERS).toHaveProperty('openai');
      expect(AI_PROVIDERS).toHaveProperty('groq');
      expect(AI_PROVIDERS).toHaveProperty('ollama');
      expect(AI_PROVIDERS).toHaveProperty('custom');
    });

    it('should correctly format endpoint URLs', () => {
      expect(getEndpointUrl('https://api.deepseek.com/v1', 'deepseek')).toBe('https://api.deepseek.com/v1/chat/completions');
      expect(getEndpointUrl('http://localhost:11434/v1', 'ollama')).toBe('http://localhost:11434/v1/chat/completions');
      expect(getEndpointUrl('', 'gemini')).toBe('');
      expect(getEndpointUrl('https://custom.ai/v1/chat/completions', 'custom')).toBe('https://custom.ai/v1/chat/completions');
    });
  });

  describe('Cognitive Distortion Detector', () => {
    it('should detect generalization', () => {
      const res = detectDistortions('Siempre me equivoco en todo y nadie me apoya.');
      expect(res).toContain('generalization');
    });

    it('should detect self-deprecation', () => {
      const res = detectDistortions('Siento que soy un estorbo y no sirvo para nada.');
      expect(res).toContain('self-deprecation');
    });

    it('should detect catastrophizing', () => {
      const res = detectDistortions('Esto es un desastre y me voy a morir.');
      expect(res).toContain('catastrophizing');
    });

    it('should return empty list for neutral thoughts', () => {
      const res = detectDistortions('Hoy salí a caminar por la tarde con calma.');
      expect(res).toEqual([]);
    });
  });

  describe('Trigger Detector', () => {
    it('should trigger EMERGENCY_CONTACT for suicidal ideation', () => {
      const res = detectTriggers('Ya no quiero vivir, quiero terminar con todo.');
      expect(res).toBe('EMERGENCY_CONTACT');
    });

    it('should trigger PANIC_MODE for acute anxiety attack symptoms', () => {
      const res = detectTriggers('Siento que me ahogo, no puedo respirar y me da un ataque.');
      expect(res).toBe('PANIC_MODE');
    });

    it('should trigger VAULT for worthlessness crisis', () => {
      const res = detectTriggers('Nadie me quiere, soy basura.');
      expect(res).toBe('VAULT');
    });

    it('should return null for non-crisis messages', () => {
      const res = detectTriggers('Hola, hoy tuve un día normal en el trabajo.');
      expect(res).toBeNull();
    });
  });
});
