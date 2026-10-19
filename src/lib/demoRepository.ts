import { appStateSchema, createInitialState, type AppState } from '../domain/state';

export const STORAGE_KEY = 'savepoint:demo:v2';
export interface StoragePort {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
export interface DemoRepository {
  load(): { state: AppState; warning: string | null };
  save(state: AppState): boolean;
}

/** Persistence boundary. Components never read browser storage directly. */
export function createDemoRepository(storage: StoragePort | null): DemoRepository {
  return {
    load() {
      try {
        if (!storage) throw new Error('Storage unavailable');
        const value = storage.getItem(STORAGE_KEY);
        if (!value) return { state: createInitialState(), warning: null };
        const result = appStateSchema.safeParse(JSON.parse(value));
        if (!result.success)
          return {
            state: createInitialState(),
            warning: 'Los datos locales eran incompatibles. Hemos cargado una demo nueva.',
          };
        return { state: result.data, warning: null };
      } catch {
        return {
          state: createInitialState(),
          warning: 'No se pudieron recuperar los datos locales. La demo continúa en esta sesión.',
        };
      }
    },
    save(state) {
      try {
        if (!storage) return false;
        storage.setItem(STORAGE_KEY, JSON.stringify(state));
        return true;
      } catch {
        return false;
      }
    },
  };
}

export function browserRepository(): DemoRepository {
  try {
    return createDemoRepository(window.localStorage);
  } catch {
    return createDemoRepository(null);
  }
}
