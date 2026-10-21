import { useState, type ReactNode } from 'react';
import { adminSettingsSchema, authenticateDemo, type AdminSettings } from '../domain/access';
import { browserAccessRepository, type AccessRepository } from '../lib/accessRepository';
import { AccessContext } from './AccessContext';

export function AccessProvider({
  children,
  repository,
}: {
  children: ReactNode;
  repository?: AccessRepository;
}) {
  const [store] = useState(() => repository ?? browserAccessRepository());
  const [initial] = useState(() => store.load());
  const [account, setAccount] = useState(initial.account);
  const [settings, setSettings] = useState(initial.settings);
  const [warning, setWarning] = useState(initial.warning);

  const login = (identifier: string, password: string) => {
    const next = authenticateDemo(identifier, password);
    if (!next) return false;
    if (!store.saveSession(next))
      setWarning('La sesión funciona en memoria. Al recargar tendrás que iniciar sesión otra vez.');
    setAccount(next);
    return true;
  };
  const logout = () => {
    if (!store.saveSession(null))
      setWarning('No se pudo borrar la sesión guardada. Cierra esta pestaña al terminar.');
    setAccount(null);
  };
  const updateSettings = (next: AdminSettings) => {
    const parsed = adminSettingsSchema.safeParse(next);
    if (account?.role !== 'admin' || !parsed.success) return false;
    setSettings(parsed.data);
    if (!store.saveSettings(parsed.data))
      setWarning('Los ajustes se aplican en memoria, pero no se guardarán al recargar.');
    return true;
  };

  return (
    <AccessContext.Provider value={{ account, settings, login, logout, updateSettings }}>
      {warning && (
        <div className="storage-warning" role="status">
          {warning}
          <button onClick={() => setWarning(null)} aria-label="Cerrar aviso de acceso">
            ×
          </button>
        </div>
      )}
      {children}
    </AccessContext.Provider>
  );
}
