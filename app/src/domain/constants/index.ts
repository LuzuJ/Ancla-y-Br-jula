/**
 * ==========================================
 * DOMAIN LAYER - Constants
 * ==========================================
 * Business logic constants and configuration
 */

// ============= EMERGENCY CONTACTS =============
export const EMERGENCY_CONTACTS = [
  {
    name: 'Línea de la Vida (México)',
    phone: '800 911 2000',
    description: 'Apoyo psicológico 24/7'
  },
  {
    name: 'Saptel',
    phone: '55 5259 8121',
    description: 'Atención psicológica telefónica'
  },
  {
    name: 'Emergencias',
    phone: '911',
    description: 'Servicios de emergencia'
  }
] as const;

// ============= MOOD OPTIONS =============
export const MOODS = [
  { value: 'calm', label: 'Tranquilo', emoji: '😌', color: '#4fd1c5' },
  { value: 'happy', label: 'Feliz', emoji: '😊', color: '#81e6d9' },
  { value: 'anxious', label: 'Ansioso', emoji: '😰', color: '#fbbf24' },
  { value: 'sad', label: 'Triste', emoji: '😢', color: '#60a5fa' },
  { value: 'angry', label: 'Enojado', emoji: '😠', color: '#f87171' },
  { value: 'mixed', label: 'Mixto', emoji: '😐', color: '#a78bfa' }
] as const;

// ============= VAULT CATEGORIES =============
export const VAULT_CATEGORIES = [
  { value: 'achievement', label: 'Logro', emoji: '🏆', description: 'Algo que conseguiste' },
  { value: 'compliment', label: 'Cumplido', emoji: '💝', description: 'Algo bonito que te dijeron' },
  { value: 'overcoming', label: 'Superación', emoji: '💪', description: 'Un obstáculo que venciste' },
  { value: 'skill', label: 'Habilidad', emoji: '✨', description: 'Algo que sabes hacer bien' }
] as const;

// ============= BREATHING EXERCISE =============
export const BREATHING_PHASES = [
  { name: 'Inhala', duration: 4, instruction: 'Respira profundo por la nariz' },
  { name: 'Sostén', duration: 4, instruction: 'Mantén el aire' },
  { name: 'Exhala', duration: 4, instruction: 'Suelta el aire por la boca' },
  { name: 'Sostén', duration: 4, instruction: 'Mantén vacío' }
] as const;

// ============= COGNITIVE DISTORTIONS =============
export const DISTORTION_LABELS: Record<string, string> = {
  'generalization': 'Generalización',
  'all-or-nothing': 'Todo o Nada',
  'catastrophizing': 'Catastrofización',
  'self-deprecation': 'Autodesprecio',
  'fortune-telling': 'Adivinación',
  'mind-reading': 'Lectura de Mente'
};

// ============= APP SCREENS =============
export const SCREENS = {
  ESPEJO: 'espejo',
  BOVEDA: 'boveda',
  ANCLA: 'ancla',
  BRUJULA: 'brujula',
  BITACORA: 'bitacora',
  PERFIL: 'perfil'
} as const;

// ============= STORAGE KEYS =============
export const STORAGE_KEYS = {
  AUTH_USER: 'ancla_auth_user',
  JOURNAL_ENTRIES: 'ancla_journal_entries',
  VAULT_ENTRIES: 'ancla_vault_entries',
  CHAT_MESSAGES: 'ancla_chat_messages',
  DAILY_CONTENT: 'ancla_daily_content',
  SETTINGS: 'ancla_settings'
} as const;

// ============= SYNC INTERVALS =============
export const SYNC_CONFIG = {
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // ms
  SYNC_INTERVAL: 30000, // 30 seconds
} as const;
