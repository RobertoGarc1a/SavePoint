import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Settings2, ShieldCheck, ShoppingBag, Users } from 'lucide-react';
import { useAccess } from '../../app/AccessContext';
import { useApp } from '../../app/AppContext';
import { defaultAdminSettings, demoAccounts } from '../../domain/access';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/Button';

export default function AdminPage() {
  const { account, settings, updateSettings } = useAccess();
  const { notify } = useApp();
  const [draft, setDraft] = useState({ ...settings });
  const [error, setError] = useState('');
  if (account?.role !== 'admin') return null;
  const dirty = JSON.stringify(draft) !== JSON.stringify(settings);

  return (
    <>
      <PageHeader
        eyebrow="CONTROL DE LA PLATAFORMA"
        title="Panel de administración"
        description="Configura la experiencia y prepara los dos perfiles de la demo."
        actions={
          <Link className="button ghost" to="/">
            Ver como jugador
          </Link>
        }
      />
      <div className="stats-strip admin-stats">
        {[
          { icon: Users, value: '2', label: 'Cuentas de demostración' },
          { icon: ShieldCheck, value: '2', label: 'Roles: admin y jugador' },
          {
            icon: ShoppingBag,
            value: settings.marketplaceEnabled ? 'Activo' : 'En pausa',
            label: 'Marketplace',
          },
          {
            icon: Settings2,
            value: settings.simulationsEnabled ? 'Activas' : 'En pausa',
            label: 'Simulaciones de compra',
          },
        ].map(({ icon: Icon, value, label }) => (
          <div className="stat" key={label}>
            <span className="stat-icon">
              <Icon size={19} />
            </span>
            <div>
              <strong>{value}</strong>
              <small>{label}</small>
            </div>
          </div>
        ))}
      </div>
      <div className="two-columns admin-grid">
        <section className="panel">
          <h2>Ajustes generales</h2>
          <p className="body-copy muted">
            Se aplican a ambas cuentas en este navegador, también después de cerrar sesión.
          </p>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (!updateSettings(draft)) {
                setError('No se pudieron aplicar los ajustes. Revisa el aviso.');
                return;
              }
              setError('');
              setDraft({ ...draft, announcement: draft.announcement.trim() });
              notify('Ajustes de administración guardados.');
            }}
          >
            <div className="field">
              <label htmlFor="platform-announcement">Aviso de la plataforma</label>
              <textarea
                id="platform-announcement"
                aria-describedby="announcement-help"
                maxLength={180}
                value={draft.announcement}
                placeholder="Por ejemplo: Bienvenidos a la demo de SavePoint."
                onChange={(event) => setDraft({ ...draft, announcement: event.target.value })}
              />
              <small id="announcement-help">
                {draft.announcement.length}/180 · Déjalo vacío para ocultar el aviso.
              </small>
            </div>
            <label className="check-option admin-option">
              <input
                type="checkbox"
                checked={draft.marketplaceEnabled}
                onChange={(event) =>
                  setDraft({ ...draft, marketplaceEnabled: event.target.checked })
                }
              />
              <span>
                <strong>Marketplace habilitado</strong>
                <small>Permite consultar ofertas, agentes y pedidos.</small>
              </span>
            </label>
            <label className="check-option admin-option">
              <input
                type="checkbox"
                checked={draft.simulationsEnabled}
                onChange={(event) =>
                  setDraft({ ...draft, simulationsEnabled: event.target.checked })
                }
              />
              <span>
                <strong>Simulaciones de compra habilitadas</strong>
                <small>Permite ejecutar los agentes. No realiza compras reales.</small>
              </span>
            </label>
            {error && (
              <p role="alert" className="form-error">
                {error}
              </p>
            )}
            <div className="button-row">
              <Button variant="primary" type="submit" disabled={!dirty}>
                <Check size={16} /> Guardar ajustes
              </Button>
              <Button
                variant="ghost"
                type="button"
                onClick={() => {
                  setDraft({ ...defaultAdminSettings });
                  setError('');
                }}
              >
                Restaurar valores iniciales
              </Button>
            </div>
            <p className="fine-print">
              {dirty ? 'Tienes cambios sin guardar.' : 'Todos los ajustes están guardados.'}
            </p>
          </form>
        </section>
        <aside className="panel">
          <h2>Probar los permisos</h2>
          <p className="body-copy muted">
            Publica un aviso o pausa las compras, guarda y cierra sesión. Entra con el usuario
            normal para comprobar el resultado.
          </p>
          <p className="notice">
            El jugador no tiene acceso a este panel, ni entrando directamente en /admin.
          </p>
          <hr />
          <h3>Escenario del distribuidor</h3>
          <p className="body-copy muted">
            El administrador también puede probar precios e inventario en su propio escenario de
            marketplace. Cada cuenta conserva sus propios pedidos y stock de prueba.
          </p>
          <Link className="button ghost" to="/marketplace?tab=seller">
            Abrir panel del distribuidor
          </Link>
        </aside>
      </div>
      <section className="panel section">
        <h2>Cuentas de la demo</h2>
        <p className="body-copy muted">
          Dos perfiles fijos con datos independientes. Sus credenciales están disponibles en el
          login.
        </p>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th scope="col">Cuenta</th>
                <th scope="col">Correo</th>
                <th scope="col">Rol</th>
                <th scope="col">Acceso</th>
              </tr>
            </thead>
            <tbody>
              {demoAccounts.map((candidate) => (
                <tr key={candidate.id}>
                  <td>{candidate.name}</td>
                  <td>{candidate.email}</td>
                  <td>
                    <span className="pill">
                      {candidate.role === 'admin' ? 'Administrador' : 'Usuario normal'}
                    </span>
                  </td>
                  <td>
                    {candidate.role === 'admin'
                      ? 'Aplicación y administración'
                      : 'Aplicación de jugador'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
