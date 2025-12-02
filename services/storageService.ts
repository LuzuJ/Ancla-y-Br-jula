
import { JournalEntry } from '../types';

const STORAGE_KEYS = {
  JOURNAL: 'ancla_journal_entries',
  LAST_OPENED: 'ancla_last_opened',
  ONBOARDING: 'ancla_onboarding_completed',
};

export const saveEntry = (entry: JournalEntry): void => {
  const existingStr = localStorage.getItem(STORAGE_KEYS.JOURNAL);
  const existing: JournalEntry[] = existingStr ? JSON.parse(existingStr) : [];
  const updated = [entry, ...existing];
  localStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(updated));
};

export const getEntries = (): JournalEntry[] => {
  const existingStr = localStorage.getItem(STORAGE_KEYS.JOURNAL);
  return existingStr ? JSON.parse(existingStr) : [];
};

export const updateLastOpened = (): void => {
  localStorage.setItem(STORAGE_KEYS.LAST_OPENED, new Date().toISOString());
};

export const getLastOpened = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.LAST_OPENED);
};

export const getOnboardingStatus = (): boolean => {
  return localStorage.getItem(STORAGE_KEYS.ONBOARDING) === 'true';
};

export const setOnboardingCompleted = (): void => {
  localStorage.setItem(STORAGE_KEYS.ONBOARDING, 'true');
};
