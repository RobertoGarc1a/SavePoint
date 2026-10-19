import { useCallback, useEffect, useReducer, useState, type ReactNode } from 'react';
import { browserRepository, type DemoRepository } from '../lib/demoRepository';
import { AppContext } from './AppContext';
import { appReducer } from './reducer';

export function AppProvider({
  children,
  repository,
}: {
  children: ReactNode;
  repository?: DemoRepository;
}) {
  const [store] = useState(() => repository ?? browserRepository());
  const [initial] = useState(() => store.load());
  const [state, dispatch] = useReducer(appReducer, initial.state);
  const [storageWarning, setStorageWarning] = useState(initial.warning);
  const [toast, setToast] = useState<{ text: string; id: number } | null>(null);
  const notify = useCallback((text: string) => setToast({ text, id: Date.now() }), []);

  useEffect(() => {
    if (!store.save(state))
      setStorageWarning(
        'No se pueden guardar cambios en este navegador. La demo continúa durante esta sesión.',
      );
  }, [state, store]);
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
