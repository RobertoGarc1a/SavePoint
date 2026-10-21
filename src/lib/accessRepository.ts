import {
  adminSettingsSchema,
  defaultAdminSettings,
  demoAccounts,
  type AdminSettings,
  type DemoAccount,
} from '../domain/access';
import type { StoragePort } from './demoRepository';

export const SESSION_KEY = 'savepoint:session:v1';
export const ADMIN_SETTINGS_KEY = 'savepoint:admin:v1';

export interface AccessRepository {
  load(): { account: DemoAccount | null; settings: AdminSettings; warning: string | null };
  saveSession(account: DemoAccount | null): boolean;
  saveSettings(settings: AdminSettings): boolean;
}

export function createAccessRepository(
  local: StoragePort | null,
  session: StoragePort | null,
): AccessRepository {
  const save = (storage: StoragePort | null, key: string, value: unknown) => {
    try {
      if (!storage) return false;
      storage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  };
  return {
    load() {
      let account: DemoAccount | null = null;
      let settings = { ...defaultAdminSettings };
      let warning: string | null = null;
      try {
        if (!session) throw new Error('Session unavailable');
        const saved = JSON.parse(session.getItem(SESSION_KEY) ?? 'null') as unknown;
        account = demoAccounts.find((candidate) => candidate.id === saved) ?? null;
      } catch {
        warning = 'No se pudo recuperar la sesión. Inicia sesión para continuar.';
      }
      try {
        if (!local) throw new Error('Storage unavailable');
        const saved = local.getItem(ADMIN_SETTINGS_KEY);
        if (saved) settings = adminSettingsSchema.parse(JSON.parse(saved));
      } catch {
        warning = 'No se pudieron recuperar los ajustes de administración. Se usan los iniciales.';
      }
      return { account, settings, warning };
    },
    saveSession: (account) => save(session, SESSION_KEY, account?.id ?? null),
    saveSettings: (settings) => save(local, ADMIN_SETTINGS_KEY, settings),
  };
}

export function browserAccessRepository(): AccessRepository {
  let local: StoragePort | null = null;
  let session: StoragePort | null = null;
  try {
    local = window.localStorage;
  } catch {
    // Continue in memory when storage is blocked.
  }
  try {
    session = window.sessionStorage;
  } catch {
    // A session can still be used until the page reloads.
  }
  return createAccessRepository(local, session);
}
