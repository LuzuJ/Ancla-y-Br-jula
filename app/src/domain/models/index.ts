// ============= USER & AUTH =============
export interface User {
  id: string;
  email: string;
  name: string;
  onboarding_completed: boolean;
  created_at: string;
  last_login?: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  daily_check_in_streak: number;
  favorite_exercises: string[];
  preferences: {
    notifications: boolean;
    darkMode: boolean;
    soundEnabled: boolean;
  };
  updated_at: string;
}

// ============= JOURNAL =============
export interface JournalEntry {
  id: string;
  user_id: string;
  date: string;
  emotion: 'calm' | 'happy' | 'anxious' | 'sad' | 'angry' | 'mixed';
  intensity: number; // 1-5
  type: 'text' | 'voice' | 'challenge';
  content: string;
  tags?: string[];
  created_at: string;
}

// ============= ANCLA TCC =============
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  trigger?: 'VAULT' | 'PANIC_MODE' | 'EMERGENCY_CONTACT';
  distortions?: CognitiveDistortion[];
}

export type CognitiveDistortion =
  | 'generalization' // "Siempre", "Nunca", "Todo"
  | 'all-or-nothing' // Pensamiento todo/nada
  | 'catastrophizing' // "Me voy a morir", "Es el fin"
  | 'self-deprecation' // "No valgo nada", "Soy un estorbo"
  | 'fortune-telling' // "Sé que va a salir mal"
  | 'mind-reading'; // "Todos piensan que..."

export interface VaultEntry {
  id: string;
  user_id: string;
  title: string;
  evidence: string; // Prueba de autoestima (logro, cumplido, evidencia positiva)
  date: string;
  category: 'achievement' | 'compliment' | 'overcoming' | 'skill';
  created_at: string;
}

// ============= CONTENT =============
export interface DailyContent {
  id: string;
  date: string;
  quote: string;
  author: string;
  micro_action: string;
  curated_songs: Array<{ title: string; artist: string; url?: string }>;
  curated_art: Array<{ title: string; artist: string; image_url?: string }>;
  poem: { title: string; author: string; text: string };
  created_at: string;
}

// ============= UI STATES =============
export enum LoadingState {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error'
}

export interface BreathingPhase {
  label: string;
  duration: number;
  color: string;
  animation: string;
}

// ============= EMERGENCY =============
export interface EmergencyContact {
  country: string;
  hotline: string;
  name: string;
  available: string;
}

export const EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    country: 'México',
    hotline: '800-290-0024',
    name: 'Línea de la Vida',
    available: '24/7'
  },
  {
    country: 'España',
    hotline: '024',
    name: 'Línea de Atención Emocional',
    available: '24/7'
  },
  {
    country: 'Argentina',
    hotline: '135',
    name: 'Centro de Atención al Suicida',
    available: '24/7'
  },
  {
    country: 'Colombia',
    hotline: '106',
    name: 'Línea de Emergencias',
    available: '24/7'
  },
  {
    country: 'Internacional',
    hotline: 'https://findahelpline.com',
    name: 'Find a Helpline',
    available: 'Online'
  }
];
