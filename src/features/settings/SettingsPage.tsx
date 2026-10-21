import { useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Play, RefreshCw } from 'lucide-react';
import { useApp } from '../../app/AppContext';
import { Avatar } from '../../components/Avatar';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/Button';
import { Dialog } from '../../components/Dialog';
import { useAccess } from '../../app/AccessContext';

export default function SettingsPage() {
  const { state, dispatch, notify } = useApp();
  const { account } = useAccess();
  const { startTour } = useOutletContext<{ startTour: () => void }>();
  const [confirmReset, setConfirmReset] = useState(false);
  const navigate = useNavigate();
  return (
    <>
      <PageHeader
        title="Tu espacio, a tu manera."
        description="Configura tu perfil y prepara el prototipo para la presentación."
      />
      <div className="two-columns">
        <section className="panel">
          <h2>Perfil del jugador</h2>
          <div className="person-header profile-header">
            <Avatar
              large
              friend={{ initials: account?.initials ?? 'RG', color: 'amber', online: false }}
            />
            <div>
              <h3>{account?.name}</h3>
              <small>
                {account?.email} · {account?.role === 'admin' ? 'Administrador' : 'Usuario normal'}
              </small>
            </div>
          </div>
          <label className="field">
            ¿Quién puede ver mi biblioteca?
            <select
              value={state.preferences.privacy}
              onChange={(event) => {
                const privacy = (['Público', 'Solo amigos', 'Privado'] as const).find(
                  (value) => value === event.target.value,
                );
                if (privacy) dispatch({ type: 'preferences/update', patch: { privacy } });
              }}
            >
              <option>Público</option>
              <option>Solo amigos</option>
              <option>Privado</option>
            </select>
            <small>Preferencia de demostración; no existe un perfil público ni un servidor.</small>
          </label>
          <label className="check-option">
            <input
              type="checkbox"
              checked={state.preferences.personalization}
              onChange={(event) =>
                dispatch({
                  type: 'preferences/update',
                  patch: { personalization: event.target.checked },
                })
              }
            />
            <span>Permitir personalización por contexto</span>
          </label>
          <p className="notice">
            Tus cambios se guardan en este navegador. Las puntuaciones de afinidad son ejemplos, sin
            IA en ejecución.
          </p>
          <details className="about-demo">
            <summary>Qué representa esta demo</summary>
            <p>
              Biblioteca universal, red social contextual y marketplace inteligente, basados en
              PrimeraEntregaSavePoint.docx.
            </p>
            <p>
              Solo frontend. Sin autenticación real, conexiones de cuentas, chat o voz en tiempo
              real, pagos ni claves de activación.
            </p>
          </details>
        </section>
        <aside className="panel">
          <h2>Todo listo para presentar</h2>
          <p className="body-copy muted">
            Un recorrido de 5 pasos conecta biblioteca, afinidad, experiencia adaptativa y compra
            delegada.
          </p>
          <Button variant="primary" onClick={startTour}>
            <Play size={16} />
            Iniciar recorrido guiado
          </Button>
          <hr />
          <h3>Volver al punto de partida</h3>
          <p className="body-copy muted">
            Restaura colección, recomendaciones, agentes, pedidos, conexiones y mensajes de esta
            cuenta. Los ajustes generales del administrador se conservan.
          </p>
          <Button variant="ghost" onClick={() => setConfirmReset(true)}>
            <RefreshCw size={15} />
            Restablecer demo
          </Button>
        </aside>
      </div>
      <Dialog
        open={confirmReset}
        title="¿Volvemos al punto de guardado?"
        onClose={() => setConfirmReset(false)}
      >
        <p>
          Se restaurarán los datos iniciales de tu cuenta en este navegador. Tus mensajes y pedidos
          ficticios se eliminarán. La otra cuenta y los ajustes de administración se conservan.
        </p>
        <div className="button-row">
          <Button variant="ghost" onClick={() => setConfirmReset(false)}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              dispatch({ type: 'demo/reset' });
              setConfirmReset(false);
              notify('Demo restaurada. Todo preparado para empezar.');
              void navigate('/');
            }}
          >
            Restablecer demo
          </Button>
        </div>
      </Dialog>
    </>
  );
}
