import { openDB, DBSchema, IDBPDatabase } from 'idb';
import type { JournalEntry, VaultEntry, ChatMessage, DailyContent } from '@/domain/models';

// ============= DATABASE SCHEMA =============
interface AnclaDB extends DBSchema {
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
  pending_sync: {
    key: string;
    value: {
      id: string;
      table: string;
      action: 'create' | 'update' | 'delete';
      data: any;
      timestamp: string;
    };
  };
}

let db: IDBPDatabase<AnclaDB> | null = null;

// ============= INITIALIZE DATABASE =============
export async function initDB(): Promise<IDBPDatabase<AnclaDB>> {
  if (db) return db;

  db = await openDB<AnclaDB>('ancla-y-brujula', 1, {
    upgrade(db) {
      // Journal entries
      if (!db.objectStoreNames.contains('journal_entries')) {
        const journalStore = db.createObjectStore('journal_entries', { keyPath: 'id' });
        journalStore.createIndex('by-date', 'date');
        journalStore.createIndex('by-user', 'user_id');
      }

      // Vault entries
      if (!db.objectStoreNames.contains('vault_entries')) {
        const vaultStore = db.createObjectStore('vault_entries', { keyPath: 'id' });
        vaultStore.createIndex('by-user', 'user_id');
      }

      // Chat messages
      if (!db.objectStoreNames.contains('chat_messages')) {
        const chatStore = db.createObjectStore('chat_messages', { keyPath: 'id' });
        chatStore.createIndex('by-timestamp', 'timestamp');
      }

      // Daily content
      if (!db.objectStoreNames.contains('daily_content')) {
        db.createObjectStore('daily_content', { keyPath: 'date' });
      }

      // Pending sync queue
      if (!db.objectStoreNames.contains('pending_sync')) {
        db.createObjectStore('pending_sync', { keyPath: 'id' });
      }
    },
  });

  return db;
}

// ============= JOURNAL OFFLINE =============
export const offlineJournal = {
  async getAll(): Promise<JournalEntry[]> {
    const database = await initDB();
    return database.getAll('journal_entries');
  },

  async getByDate(startDate: string, endDate: string): Promise<JournalEntry[]> {
    const database = await initDB();
    const all = await database.getAll('journal_entries');
    return all.filter(entry => entry.date >= startDate && entry.date <= endDate);
  },

  async add(entry: JournalEntry): Promise<void> {
    const database = await initDB();
    await database.add('journal_entries', entry);
    
    // Add to sync queue
    await database.add('pending_sync', {
      id: `journal-${entry.id}`,
      table: 'journal_entries',
      action: 'create',
      data: entry,
      timestamp: new Date().toISOString()
    });
  },

  async delete(id: string): Promise<void> {
    const database = await initDB();
    await database.delete('journal_entries', id);

    await database.add('pending_sync', {
      id: `journal-delete-${id}`,
      table: 'journal_entries',
      action: 'delete',
      data: { id },
      timestamp: new Date().toISOString()
    });
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
    return database.getAll('vault_entries');
  },

  async add(entry: VaultEntry): Promise<void> {
    const database = await initDB();
    await database.add('vault_entries', entry);

    await database.add('pending_sync', {
      id: `vault-${entry.id}`,
      table: 'vault_entries',
      action: 'create',
      data: entry,
      timestamp: new Date().toISOString()
    });
  },

  async delete(id: string): Promise<void> {
    const database = await initDB();
    await database.delete('vault_entries', id);

    await database.add('pending_sync', {
      id: `vault-delete-${id}`,
      table: 'vault_entries',
      action: 'delete',
      data: { id },
      timestamp: new Date().toISOString()
    });
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
    return database.getAll('chat_messages');
  },

  async add(message: ChatMessage): Promise<void> {
    const database = await initDB();
    await database.add('chat_messages', message);
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

// ============= SYNC QUEUE =============
export const syncQueue = {
  async getPending(): Promise<any[]> {
    const database = await initDB();
    return database.getAll('pending_sync');
  },

  async remove(id: string): Promise<void> {
    const database = await initDB();
    await database.delete('pending_sync', id);
  },

  async clear(): Promise<void> {
    const database = await initDB();
    await database.clear('pending_sync');
  }
};

// ============= SYNC MANAGER =============
export async function syncWithSupabase(
  uploadFn: (item: any) => Promise<void>
): Promise<{ synced: number; failed: number }> {
  const pending = await syncQueue.getPending();
  let synced = 0;
  let failed = 0;

  for (const item of pending) {
    try {
      await uploadFn(item);
      await syncQueue.remove(item.id);
      synced++;
    } catch (error) {
      console.error(`Sync failed for ${item.id}:`, error);
      failed++;
    }
  }

  return { synced, failed };
}

// ============= NETWORK STATUS =============
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
