import { createContext, useContext, type Dispatch } from 'react';
import type { AppState } from '../domain/state';
import type { Action } from './reducer';

export interface AppContextValue {
  state: AppState;
  dispatch: Dispatch<Action>;
  notify: (message: string) => void;
}
export const AppContext = createContext<AppContextValue | null>(null);
export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}
