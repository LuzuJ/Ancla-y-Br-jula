import { describe, it, expect } from 'vitest';
import { 
  detectTriggers, 
  detectDistortions, 
  VALID_GENERIC_MODELS, 
  DEFAULT_GENERIC_MODEL 
} from './aiClient';

describe('AI Client & Cognitive Diagnostics', () => {
  describe('Model Configurations', () => {
    it('should include deepseek v4 flash as active model', () => {
      expect(VALID_GENERIC_MODELS).toContain('deepseek-ai/deepseek-v4-flash-0731');
      expect(DEFAULT_GENERIC_MODEL).toBe('deepseek-ai/deepseek-v4-flash-0731');
    });

    it('should not contain deprecated Llama 3.1 models in valid list', () => {
      expect(VALID_GENERIC_MODELS).not.toContain('meta/llama-3.1-8b-instruct');
      expect(VALID_GENERIC_MODELS).not.toContain('meta/llama-3.1-70b-instruct');
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
      const res = detectTriggers('Hoy tuve un día muy ocupado en el trabajo.');
      expect(res).toBeNull();
    });
  });
});
