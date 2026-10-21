import { describe, expect, it } from 'vitest';
import {
  adminSettingsSchema,
  authenticateDemo,
  defaultAdminSettings,
  demoAccounts,
} from '../domain/access';
import { ADMIN_SETTINGS_KEY, createAccessRepository, SESSION_KEY } from './accessRepository';
import { createDemoRepository, type StoragePort } from './demoRepository';
import { createInitialState } from '../domain/state';

function memoryStorage(): StoragePort {
  const items = new Map<string, string>();
  return {
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => {
      items.set(key, value);
    },
  };
}

describe('demo accounts and access persistence', () => {
  it('validates passwords exactly and normalizes usernames and email addresses', () => {
    expect(authenticateDemo(' ADMIN@SAVEPOINT.DEMO ', 'Admin123!')?.role).toBe('admin');
    expect(authenticateDemo('usuario', 'Usuario123!')?.role).toBe('user');
    expect(authenticateDemo('usuario', 'Admin123!')).toBeNull();
    expect(authenticateDemo('admin', 'admin123!')).toBeNull();
  });

  it('restores a session from a known account id and clears it on logout', () => {
    const local = memoryStorage();
    const session = memoryStorage();
    const repository = createAccessRepository(local, session);
    expect(repository.saveSession(demoAccounts[0])).toBe(true);
    expect(repository.load().account?.role).toBe('admin');
    expect(session.getItem(SESSION_KEY)).toBe('"admin"');
    expect(local.getItem(SESSION_KEY)).toBeNull();
    repository.saveSession(null);
    expect(repository.load().account).toBeNull();
    session.setItem(SESSION_KEY, JSON.stringify({ id: 'user', role: 'admin' }));
    expect(repository.load().account).toBeNull();
  });

  it('recovers safely from corrupt settings and sessions', () => {
    const storage = memoryStorage();
    storage.setItem(SESSION_KEY, '{broken');
    storage.setItem(ADMIN_SETTINGS_KEY, JSON.stringify({ marketplaceEnabled: 'yes' }));
    const loaded = createAccessRepository(storage, storage).load();
    expect(loaded.account).toBeNull();
    expect(loaded.settings).toEqual(defaultAdminSettings);
    expect(loaded.warning).not.toBeNull();
    expect(
      adminSettingsSchema.safeParse({ ...defaultAdminSettings, announcement: 'x'.repeat(181) })
        .success,
    ).toBe(false);
  });

  it('reports unavailable storage instead of crashing', () => {
    const blocked: StoragePort = {
      getItem() {
        throw new Error('blocked');
      },
      setItem() {
        throw new Error('full');
      },
    };
    const repository = createAccessRepository(blocked, null);
    expect(repository.load().warning).not.toBeNull();
    expect(repository.saveSession(demoAccounts[1])).toBe(false);
    expect(repository.saveSettings(defaultAdminSettings)).toBe(false);
  });

  it('isolates each account while preserving the existing player storage key', () => {
    const storage = memoryStorage();
    const player = createDemoRepository(storage);
    const admin = createDemoRepository(storage, 'admin');
    const changed = createInitialState();
    changed.preferences.privacy = 'Privado';
    player.save(changed);
    expect(admin.load().state.preferences.privacy).toBe('Solo amigos');
    expect(createDemoRepository(storage, 'user').load().state.preferences.privacy).toBe('Privado');
  });
});
