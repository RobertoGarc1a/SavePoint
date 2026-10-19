import { Link2, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../../app/AppContext';
import { PageHeader } from '../../components/PageHeader';
import { Button } from '../../components/Button';
import { platforms } from '../../domain/types';
import { visibleCollection } from '../../domain/library';
import { formatDate } from '../../lib/format';

export default function PlatformsPage() {
  const { state, dispatch, notify } = useApp();
  return (
    <>
      <PageHeader
        title="Tus plataformas. Una sola identidad."
        description="Centraliza tu colección y olvídate de las fronteras."
        actions={
          <Button
            variant="primary"
            onClick={() => {
              dispatch({ type: 'platform/sync', now: new Date().toISOString() });
              notify('Sincronización de demostración completada.');
            }}
          >
            <RefreshCw size={15} />
            Sincronizar todo
          </Button>
        }
      />
      <div className="banner">
        <Link2 />
        <div>
          <strong>
            {state.connectedPlatforms.length} plataformas conectadas ·{' '}
            {visibleCollection(state).length} juegos únicos
          </strong>
          <p>Conexiones simuladas. No se solicitan contraseñas ni se accede a cuentas reales.</p>
        </div>
      </div>
      <div className="two-columns">
        <section className="panel">
          {platforms.map((platform) => {
            const connected = state.connectedPlatforms.includes(platform);
            return (
              <div className="integration-row" key={platform}>
                <span className="platform-logo">
                  {platform === 'PlayStation'
                    ? 'PS'
                    : platform === 'Epic Games'
                      ? 'EP'
                      : platform.slice(0, 2).toUpperCase()}
                </span>
                <div>
                  <h3>{platform}</h3>
                  <small>
                    {connected
                      ? `${state.collection.filter((entry) => entry.platforms.includes(platform)).length} juegos · Perfil demo vinculado`
                      : 'Sin vincular'}
                  </small>
                </div>
                <Button
                  size="small"
                  variant={connected ? 'ghost' : 'primary'}
                  onClick={() => {
                    dispatch({ type: 'platform/toggle', platform });
                    notify('Conexión simulada actualizada.');
                  }}
                >
                  {connected ? 'Desvincular' : 'Vincular demo'}
                </Button>
              </div>
            );
          })}
        </section>
        <aside className="panel">
          <h3>Una entrada por juego.</h3>
          <p className="body-copy muted">
            Hades aparece una sola vez aunque esté en Steam y Epic. Al desvincular una plataforma,
            sus juegos exclusivos se ocultan sin borrar tu progreso.
          </p>
          <p className="notice">
            Última sincronización:
            <br />
            {state.syncedAt ? formatDate(state.syncedAt) : 'Datos de demostración preparados'}
          </p>
          <Link to="/library" className="text-link">
            Explorar mi biblioteca →
          </Link>
        </aside>
      </div>
    </>
  );
}
