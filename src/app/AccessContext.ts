import { createContext, useContext } from 'react';
import type { AdminSettings, DemoAccount } from '../domain/access';

export interface AccessContextValue {
  account: DemoAccount | null;
  settings: AdminSettings;
  login: (identifier: string, password: string) => boolean;
  logout: () => void;
  updateSettings: (settings: AdminSettings) => boolean;
}

export const AccessContext = createContext<AccessContextValue | null>(null);

export function useAccess() {
  const context = useContext(AccessContext);
  if (!context) throw new Error('useAccess must be used inside AccessProvider');
  return context;
}
