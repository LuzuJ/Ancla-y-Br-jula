
export enum ModuleView {
  SPLASH = 'SPLASH',
  ONBOARDING = 'ONBOARDING',
  WELCOME = 'WELCOME',
  ANCLA = 'ANCLA',     // SOS Mode
  BRUJULA = 'BRUJULA', // Impulso
  ESPEJO = 'ESPEJO',   // Chatbot (via + button)
  BITACORA = 'BITACORA', // Home
  PROFILE = 'PROFILE',  // Perfil
}

export interface JournalEntry {
  id: string;
  date: string; // ISO String
  emotion: string; // e.g., 'calm', 'anxious', 'sad', 'happy'
  type: 'text' | 'photo'; // Simplified for this demo
  content: string;
  intensity: number; // 1-5
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export interface DailyContent {
  quote: string;
  author: string;
  action: string;
  curatedContent?: {
    songs: Array<{title: string, artist: string}>;
    art: Array<{title: string, artist: string}>;
    poem: {title: string, author: string, text: string};
  };
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}
