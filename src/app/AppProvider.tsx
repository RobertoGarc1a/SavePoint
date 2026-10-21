import { useCallback, useEffect, useReducer, useState, type ReactNode } from 'react';
import { browserRepository, type DemoRepository } from '../lib/demoRepository';
import { AppContext } from './AppContext';
import { appReducer } from './reducer';
import type { Action } from './reducer';
import { AccessProvider } from './AccessProvider';
import { useAccess } from './AccessContext';
import type { AccessRepository } from '../lib/accessRepository';

export function AppProvider({
  children,
  repository,
  accessRepository,
}: {
  children: ReactNode;
  repository?: (accountId: string) => DemoRepository;
  accessRepository?: AccessRepository;
}) {
  return (
    <AccessProvider repository={accessRepository}>
      <AccountScope repository={repository}>{children}</AccountScope>
    </AccessProvider>
  );
}

function AccountScope({
  children,
  repository,
}: {
  children: ReactNode;
  repository?: (accountId: string) => DemoRepository;
}) {
  const { account } = useAccess();
  const accountId = account?.id ?? 'guest';
  return (
    <PlayerProvider key={accountId} accountId={accountId} repository={repository?.(accountId)}>
      {children}
    </PlayerProvider>
  );
}

function PlayerProvider({
  children,
  repository,
  accountId,
}: {
  children: ReactNode;
  repository?: DemoRepository;
  accountId: string;
}) {
  const { account, settings } = useAccess();
  const [store] = useState(() => repository ?? browserRepository(accountId));
  const [initial] = useState(() => store.load());
  const [state, rawDispatch] = useReducer(appReducer, initial.state);
  const [storageWarning, setStorageWarning] = useState(initial.warning);
  const [toast, setToast] = useState<{ text: string; id: number } | null>(null);
  const notify = useCallback((text: string) => setToast({ text, id: Date.now() }), []);
  const dispatch = (action: Action) => {
    if (!account) return;
    if (action.type === 'seller/update' && account.role !== 'admin') return;
    if (
      !settings.marketplaceEnabled &&
      (action.type.startsWith('rules/') || action.type === 'market/simulate')
    )
      return;
    if (action.type === 'market/simulate' && !settings.simulationsEnabled) return;
    rawDispatch(action);
  };

  useEffect(() => {
    if (!account) return;
    if (!store.save(state))
      setStorageWarning(
        'No se pueden guardar cambios en este navegador. La demo continúa durante esta sesión.',
      );
  }, [state, store, account]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return (
    <AppContext.Provider value={{ state, dispatch, notify }}>
      {storageWarning && (
        <div className="storage-warning" role="status">
          {storageWarning}
          <button onClick={() => setStorageWarning(null)} aria-label="Cerrar aviso">
            ×
          </button>
        </div>
      )}
      {children}
      <div className={`toast ${toast ? 'visible' : ''}`} role="status" aria-live="polite">
        {toast?.text}
      </div>
    </AppContext.Provider>
  );
}
