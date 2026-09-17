import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile, JournalEntry, VaultEntry, ChatMessage, DailyContent } from '@/domain/models';
import { offlineJournal, offlineVault, offlineChat, offlineContent, offlineProfile } from '@/infrastructure/database/offline';

// ============= AUTH STORE (LOCAL PROFILE) =============
interface AuthStore {
  user: { id: string; name: string } | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  
  signUpLocal: (name: string) => Promise<void>;
  signOut: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  profile: null,
  loading: false,
  error: null,

  signUpLocal: async (name) => {
    set({ loading: true, error: null });
    try {
      const newProfile: UserProfile = {
        id: 'local_user',
        user_id: 'local_user',
        daily_check_in_streak: 0,
        favorite_exercises: [],
        preferences: {
          notifications: true,
          darkMode: true,
          soundEnabled: true
        },
        updated_at: new Date().toISOString(),
      };
      await offlineProfile.save(newProfile);
      // We store a simple user object in memory and localStorage for ease
      const simpleUser = { id: 'local_user', name };
      localStorage.setItem('local_user_name', name);
      
      set({ user: simpleUser, profile: newProfile, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  signOut: async () => {
    set({ loading: true, error: null });
    try {
      // In a pure local app, sign out could mean wiping data, but for now we just clear session
      // To really clear, the user should clear browser data.
      localStorage.removeItem('local_user_name');
      set({ user: null, profile: null, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  loadUser: async () => {
    set({ loading: true });
    try {
      const savedName = localStorage.getItem('local_user_name');
      if (savedName) {
        let profile = await offlineProfile.get('local_user');
        
        if (!profile) {
          profile = {
            id: 'local_user',
            user_id: 'local_user',
            daily_check_in_streak: 0,
            favorite_exercises: [],
            preferences: {
              notifications: true,
              darkMode: true,
              soundEnabled: true
            },
            updated_at: new Date().toISOString(),
          };
          await offlineProfile.save(profile);
        }
        
        set({ user: { id: 'local_user', name: savedName }, profile, loading: false });
      } else {
        set({ user: null, profile: null, loading: false });
      }
    } catch (error: any) {
      set({ user: null, profile: null, loading: false, error: error.message });
    }
  },

  updateProfile: async (updates) => {
    const currentProfile = get().profile;
    if (!currentProfile) throw new Error('No profile loaded');

    try {
      const updated = { ...currentProfile, ...updates, updated_at: new Date().toISOString() };
      await offlineProfile.save(updated);
      set({ profile: updated });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  }
}));

// ============= JOURNAL STORE =============
interface JournalStore {
  entries: JournalEntry[];
  loading: boolean;
  
  loadEntries: () => Promise<void>;
  addEntry: (entry: Omit<JournalEntry, 'id' | 'created_at'>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
}

export const useJournalStore = create<JournalStore>((set) => ({
  entries: [],
  loading: false,

  loadEntries: async () => {
    set({ loading: true });
    try {
      const entries = await offlineJournal.getAll();
      set({ entries, loading: false });
    } catch (error) {
      set({ entries: [], loading: false });
    }
  },

  addEntry: async (entry) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) throw new Error('No user logged in');

    const newEntry: JournalEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      created_at: new Date().toISOString()
    };

    await offlineJournal.add(newEntry);
    set(state => ({ entries: [newEntry, ...state.entries] }));
  },

  deleteEntry: async (id) => {
    await offlineJournal.delete(id);
    set(state => ({ entries: state.entries.filter(e => e.id !== id) }));
  }
}));

// ============= VAULT STORE =============
interface VaultStore {
  entries: VaultEntry[];
  loading: boolean;
  
  loadEntries: () => Promise<void>;
  addEntry: (entry: Omit<VaultEntry, 'id' | 'created_at'>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
}

export const useVaultStore = create<VaultStore>((set) => ({
  entries: [],
  loading: false,

  loadEntries: async () => {
    set({ loading: true });
    try {
      const entries = await offlineVault.getAll();
      set({ entries, loading: false });
    } catch (error) {
      set({ entries: [], loading: false });
    }
  },

  addEntry: async (entry) => {
    const userId = useAuthStore.getState().user?.id;
    if (!userId) throw new Error('No user logged in');

    const newEntry: VaultEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      created_at: new Date().toISOString()
    };

    await offlineVault.add(newEntry);
    set(state => ({ entries: [newEntry, ...state.entries] }));
  },

  deleteEntry: async (id) => {
    await offlineVault.delete(id);
    set(state => ({ entries: state.entries.filter(e => e.id !== id) }));
  }
}));

// ============= CHAT STORE =============
interface ChatStore {
  messages: ChatMessage[];
  loading: boolean;
  
  loadMessages: () => Promise<void>;
  addMessage: (message: ChatMessage) => Promise<void>;
  clearMessages: () => Promise<void>;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
  loading: false,

  loadMessages: async () => {
    set({ loading: true });
    try {
      const messages = await offlineChat.getAll();
      set({ messages, loading: false });
    } catch (error) {
      set({ messages: [], loading: false });
    }
  },

  addMessage: async (message) => {
    await offlineChat.add(message);
    set(state => ({ messages: [...state.messages, message] }));
  },

  clearMessages: async () => {
    await offlineChat.clear();
    set({ messages: [] });
  }
}));

// ============= CONTENT STORE =============
interface ContentStore {
  dailyContent: DailyContent | null;
  loading: boolean;
  
  loadDailyContent: () => Promise<void>;
  setDailyContent: (content: DailyContent) => Promise<void>;
}

export const useContentStore = create<ContentStore>((set) => ({
  dailyContent: null,
  loading: false,

  loadDailyContent: async () => {
    set({ loading: true });
    try {
      const cached = await offlineContent.getToday();
      if (cached) {
        set({ dailyContent: cached, loading: false });
      } else {
        set({ dailyContent: null, loading: false });
      }
    } catch (error) {
      set({ dailyContent: null, loading: false });
    }
  },

  setDailyContent: async (content: DailyContent) => {
    await offlineContent.save(content);
    set({ dailyContent: content });
  }
}));

import type { AIProvider } from '@/domain/constants';
import { AI_PROVIDERS } from '@/domain/constants';

// ============= APP SETTINGS (INCLUDES BYOK) =============
interface AppSettings {
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  darkMode: boolean;
  
  // BYOK Settings
  aiProvider: AIProvider;
  aiApiKey: string;
  aiModel: string;
  aiBaseUrl: string;

  toggleSound: () => void;
  toggleNotifications: () => void;
  toggleDarkMode: () => void;
  updateAiSettings: (provider: AIProvider, apiKey: string, model: string, baseUrl?: string) => void;
}

const defaultEnvDeepSeek = import.meta.env.VITE_DEEPSEEK_API_KEY || '';
const defaultEnvGemini = import.meta.env.VITE_GEMINI_API_KEY || '';

const initialProvider: AIProvider = defaultEnvDeepSeek ? 'deepseek' : (defaultEnvGemini ? 'gemini' : 'deepseek');
const initialKey = defaultEnvDeepSeek || defaultEnvGemini || '';
const initialModel = AI_PROVIDERS[initialProvider]?.defaultModel || 'deepseek-chat';
const initialBaseUrl = AI_PROVIDERS[initialProvider]?.defaultBaseUrl || 'https://api.deepseek.com/v1';

export const useSettingsStore = create<AppSettings>()(
  persist(
    (set) => ({
      soundEnabled: true,
      notificationsEnabled: true,
      darkMode: true,

      aiProvider: initialProvider,
      aiApiKey: initialKey,
      aiModel: initialModel,
      aiBaseUrl: initialBaseUrl,

      toggleSound: () => set(state => ({ soundEnabled: !state.soundEnabled })),
      toggleNotifications: () => set(state => ({ notificationsEnabled: !state.notificationsEnabled })),
      toggleDarkMode: () => set(state => ({ darkMode: !state.darkMode })),
      
      updateAiSettings: (provider, apiKey, model, baseUrl) => {
        const config = AI_PROVIDERS[provider];
        const finalBaseUrl = baseUrl !== undefined ? baseUrl : (config?.defaultBaseUrl || '');
        set({ 
          aiProvider: provider, 
          aiApiKey: apiKey, 
          aiModel: model || config?.defaultModel || 'deepseek-chat',
          aiBaseUrl: finalBaseUrl
        });
      }
    }),
    {
      name: 'ancla-settings'
    }
  )
);

