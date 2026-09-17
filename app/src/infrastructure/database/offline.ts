import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { UserProfile, JournalEntry, VaultEntry, ChatMessage, DailyContent } from '@/domain/models';

// ============= DATABASE SCHEMA =============
interface AnclaDB extends DBSchema {
  user_profiles: {
    key: string;
    value: UserProfile;
  };
  journal_entries: {
    key: string;
    value: JournalEntry;
    indexes: { 'by-date': string; 'by-user': string };
  };
  vault_entries: {
    key: string;
    value: VaultEntry;
    indexes: { 'by-user': string };
  };
  chat_messages: {
    key: string;
    value: ChatMessage;
    indexes: { 'by-timestamp': string };
  };
  daily_content: {
    key: string;
    value: DailyContent;
  };
}

let db: IDBPDatabase<AnclaDB> | null = null;

// ============= INITIALIZE DATABASE =============
export async function initDB(): Promise<IDBPDatabase<AnclaDB>> {
  if (db) return db;

  db = await openDB<AnclaDB>('ancla-y-brujula-local', 2, {
    upgrade(db, _oldVersion, _newVersion, _transaction) {
      if (!db.objectStoreNames.contains('user_profiles')) {
        db.createObjectStore('user_profiles', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('journal_entries')) {
        const journalStore = db.createObjectStore('journal_entries', { keyPath: 'id' });
        journalStore.createIndex('by-date', 'date');
        journalStore.createIndex('by-user', 'user_id');
      }

      if (!db.objectStoreNames.contains('vault_entries')) {
        const vaultStore = db.createObjectStore('vault_entries', { keyPath: 'id' });
        vaultStore.createIndex('by-user', 'user_id');
      }

      if (!db.objectStoreNames.contains('chat_messages')) {
        const chatStore = db.createObjectStore('chat_messages', { keyPath: 'id' });
        chatStore.createIndex('by-timestamp', 'timestamp');
      }

      if (!db.objectStoreNames.contains('daily_content')) {
        db.createObjectStore('daily_content', { keyPath: 'date' });
      }

      // Cleanup old sync queue if it existed from V1
      if (db.objectStoreNames.contains('pending_sync' as any)) {
        db.deleteObjectStore('pending_sync' as any);
      }
    },
  });

  return db;
}

// ============= PROFILE OFFLINE =============
export const offlineProfile = {
  async get(id: string = 'local_user'): Promise<UserProfile | undefined> {
    const database = await initDB();
    return database.get('user_profiles', id);
  },

  async save(profile: UserProfile): Promise<void> {
    const database = await initDB();
    await database.put('user_profiles', profile);
  }
};

// ============= JOURNAL OFFLINE =============
export const offlineJournal = {
  async getAll(): Promise<JournalEntry[]> {
    const database = await initDB();
    const entries = await database.getAll('journal_entries');
    return entries.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async getByDate(startDate: string, endDate: string): Promise<JournalEntry[]> {
    const database = await initDB();
    const all = await database.getAll('journal_entries');
    return all.filter(entry => entry.date >= startDate && entry.date <= endDate);
  },

  async add(entry: JournalEntry): Promise<void> {
    const database = await initDB();
    await database.put('journal_entries', entry);
  },

  async delete(id: string): Promise<void> {
    const database = await initDB();
    await database.delete('journal_entries', id);
  },

  async clear(): Promise<void> {
    const database = await initDB();
    await database.clear('journal_entries');
  }
};

// ============= VAULT OFFLINE =============
export const offlineVault = {
  async getAll(): Promise<VaultEntry[]> {
    const database = await initDB();
    const entries = await database.getAll('vault_entries');
    return entries.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  async add(entry: VaultEntry): Promise<void> {
    const database = await initDB();
    await database.put('vault_entries', entry);
  },

  async delete(id: string): Promise<void> {
    const database = await initDB();
    await database.delete('vault_entries', id);
  },

  async clear(): Promise<void> {
    const database = await initDB();
    await database.clear('vault_entries');
  }
};

// ============= CHAT OFFLINE =============
export const offlineChat = {
  async getAll(): Promise<ChatMessage[]> {
    const database = await initDB();
    const messages = await database.getAll('chat_messages');
    return messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  },

  async add(message: ChatMessage): Promise<void> {
    const database = await initDB();
    await database.put('chat_messages', message);
  },

  async clear(): Promise<void> {
    const database = await initDB();
    await database.clear('chat_messages');
  }
};

// ============= DAILY CONTENT OFFLINE =============
export const offlineContent = {
  async getToday(): Promise<DailyContent | undefined> {
    const database = await initDB();
    const today = new Date().toISOString().split('T')[0];
    return database.get('daily_content', today);
  },

  async save(content: DailyContent): Promise<void> {
    const database = await initDB();
    await database.put('daily_content', content);
  },

  async getByDate(date: string): Promise<DailyContent | undefined> {
    const database = await initDB();
    return database.get('daily_content', date);
  }
};

// ============= NETWORK STATUS (Kept for UI reasons) =============
export function isOnline(): boolean {
  return navigator.onLine;
}

export function onNetworkChange(callback: (online: boolean) => void): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}
