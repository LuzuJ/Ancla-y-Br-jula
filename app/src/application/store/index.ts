import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserProfile, JournalEntry, VaultEntry, ChatMessage, DailyContent } from '@/domain/models';
import { authService, journalService, vaultService, chatService, contentService, profileService } from '@/infrastructure/api/supabase';
import { offlineJournal, offlineVault, offlineChat, offlineContent, isOnline, syncWithSupabase } from '@/infrastructure/database/offline';

// ============= AUTH STORE =============
interface AuthStore {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  emailNotConfirmed: boolean;
  pendingEmail: string | null;
  
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  resendConfirmation: (email: string) => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  profile: null,
  loading: false,
  error: null,
  emailNotConfirmed: false,
  pendingEmail: null,

  signIn: async (email, password) => {
    set({ loading: true, error: null, emailNotConfirmed: false, pendingEmail: null });
    try {
      const result = await authService.signIn(email, password);
      const user = result.user;
      const profile = await profileService.getProfile(user.id);
      set({ user: user as any, profile, loading: false });
    } catch (error: any) {
      set({ 
        error: error.message, 
        loading: false,
        emailNotConfirmed: error.emailNotConfirmed || false,
        pendingEmail: error.email || null
      });
      throw error;
    }
  },

  signUp: async (email, password, name) => {
    set({ loading: true, error: null });
    try {
      const { user } = await authService.signUp(email, password, name);
      set({ user: user as any, loading: false });
    } catch (error: any) {
      set({ 
        error: error.message, 
        loading: false,
        emailNotConfirmed: error.emailNotConfirmed || false,
        pendingEmail: error.email || null
      });
      throw error;
    }
  },

  signOut: async () => {
    set({ loading: true, error: null });
    try {
      await authService.signOut();
      set({ user: null, profile: null, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  loadUser: async () => {
    set({ loading: true });
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        let profile = await profileService.getProfile(user.id);
        
        // Si el usuario existe pero no tiene perfil, crearlo
        if (!profile) {
          console.log('Perfil no encontrado, creando uno nuevo...');
          profile = await profileService.createProfile(user.id, user.user_metadata?.name);
        }
        
        set({ user: user as any, profile, loading: false });
      } else {
        set({ user: null, profile: null, loading: false });
      }
    } catch (error: any) {
      console.error('Error loading user:', error);
      set({ user: null, profile: null, loading: false, error: error.message });
    }
  },

  updateProfile: async (updates) => {
    const userId = get().user?.id;
    if (!userId) throw new Error('No user logged in');

    try {
      const updated = await profileService.updateProfile(userId, updates);
      set({ profile: updated });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  resendConfirmation: async (email) => {
    set({ loading: true, error: null });
    try {
      await authService.resendConfirmationEmail(email);
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
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
  syncEntries: () => Promise<void>;
}

export const useJournalStore = create<JournalStore>((set) => ({
  entries: [],
  loading: false,

  loadEntries: async () => {
    set({ loading: true });
    try {
      if (isOnline()) {
        const userId = useAuthStore.getState().user?.id;
        if (userId) {
          const entries = await journalService.getEntries(userId);
          set({ entries, loading: false });
          return;
        }
      }
      
      // Fallback to offline
      const entries = await offlineJournal.getAll();
      set({ entries, loading: false });
    } catch (error) {
      const entries = await offlineJournal.getAll();
      set({ entries, loading: false });
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

    // Always save offline first
    await offlineJournal.add(newEntry);
    set(state => ({ entries: [newEntry, ...state.entries] }));

    // Try to sync if online
    if (isOnline()) {
      try {
        await journalService.createEntry(newEntry);
      } catch (error) {
        console.warn('Failed to sync journal entry, will retry later:', error);
      }
    }
  },

  deleteEntry: async (id) => {
    await offlineJournal.delete(id);
    set(state => ({ entries: state.entries.filter(e => e.id !== id) }));

    if (isOnline()) {
      try {
        await journalService.deleteEntry(id);
      } catch (error) {
        console.warn('Failed to delete online, will retry later:', error);
      }
    }
  },

  syncEntries: async () => {
    if (!isOnline()) return;

    const userId = useAuthStore.getState().user?.id;
    if (!userId) return;

    try {
      // Upload pending changes
      await syncWithSupabase(async (item) => {
        if (item.action === 'create') {
          await journalService.createEntry(item.data);
        } else if (item.action === 'delete') {
          await journalService.deleteEntry(item.data.id);
        }
      });

      // Reload from server
      const entries = await journalService.getEntries(userId);
      set({ entries });
    } catch (error) {
      console.error('Sync failed:', error);
    }
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
      if (isOnline()) {
        const userId = useAuthStore.getState().user?.id;
        if (userId) {
          const entries = await vaultService.getEntries(userId);
          set({ entries, loading: false });
          return;
        }
      }
      
      const entries = await offlineVault.getAll();
      set({ entries, loading: false });
    } catch (error) {
      const entries = await offlineVault.getAll();
      set({ entries, loading: false });
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

    if (isOnline()) {
      try {
        await vaultService.addEntry(newEntry);
      } catch (error) {
        console.warn('Failed to sync vault entry:', error);
      }
    }
  },

  deleteEntry: async (id) => {
    await offlineVault.delete(id);
    set(state => ({ entries: state.entries.filter(e => e.id !== id) }));

    if (isOnline()) {
      try {
        await vaultService.deleteEntry(id);
      } catch (error) {
        console.warn('Failed to delete vault entry:', error);
      }
    }
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

    // Optionally save to cloud if online
    if (isOnline()) {
      const userId = useAuthStore.getState().user?.id;
      if (userId) {
        try {
          await chatService.saveMessage(userId, message);
        } catch (error) {
          console.warn('Failed to sync chat message:', error);
        }
      }
    }
  },

  clearMessages: async () => {
    await offlineChat.clear();
    set({ messages: [] });

    if (isOnline()) {
      const userId = useAuthStore.getState().user?.id;
      if (userId) {
        try {
          await chatService.clearHistory(userId);
        } catch (error) {
          console.warn('Failed to clear cloud history:', error);
        }
      }
    }
  }
}));

// ============= CONTENT STORE =============
interface ContentStore {
  dailyContent: DailyContent | null;
  loading: boolean;
  
  loadDailyContent: () => Promise<void>;
}

export const useContentStore = create<ContentStore>((set) => ({
  dailyContent: null,
  loading: false,

  loadDailyContent: async () => {
    set({ loading: true });
    try {
      // Try offline first for instant load
      const cached = await offlineContent.getToday();
      if (cached) {
        set({ dailyContent: cached, loading: false });
        return;
      }

      // Then try online
      if (isOnline()) {
        const content = await contentService.getTodayContent();
        if (content) {
          await offlineContent.save(content);
          set({ dailyContent: content, loading: false });
          return;
        }
      }

      set({ dailyContent: null, loading: false });
    } catch (error) {
      set({ dailyContent: null, loading: false });
    }
  }
}));

// ============= APP SETTINGS =============
interface AppSettings {
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  darkMode: boolean;
  
  toggleSound: () => void;
  toggleNotifications: () => void;
  toggleDarkMode: () => void;
}

export const useSettingsStore = create<AppSettings>()(
  persist(
    (set) => ({
      soundEnabled: true,
      notificationsEnabled: true,
      darkMode: true,

      toggleSound: () => set(state => ({ soundEnabled: !state.soundEnabled })),
      toggleNotifications: () => set(state => ({ notificationsEnabled: !state.notificationsEnabled })),
      toggleDarkMode: () => set(state => ({ darkMode: !state.darkMode }))
    }),
    {
      name: 'ancla-settings'
    }
  )
);
