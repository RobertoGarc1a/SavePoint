import {
  ArrowRight,
  BookOpen,
  Clock,
  Gamepad2,
  Play,
  Plus,
  Sparkles,
  Trophy,
  Users,
  Volume2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../../app/AppContext';
import { Avatar } from '../../components/Avatar';
import { Button } from '../../components/Button';
import { GameCard } from '../../components/GameCard';
import { GameCover } from '../../components/GameCover';
import { PageHeader } from '../../components/PageHeader';
import { SectionHeader } from '../../components/SectionHeader';
import { getGame } from '../../data/games';
import { visibleCollection } from '../../domain/library';
import { activeFriends } from '../../domain/social';
import { useSocialActions } from '../social/useSocialActions';

export default function DashboardPage() {
  const { state, dispatch, notify } = useApp();
  const { invite } = useSocialActions();
  const online = activeFriends(state).filter((friend) => friend.online);
  const collection = visibleCollection(state);
  const playing = state.preferences.context === 'playing';
  const date = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/Madrid',
  }).format(new Date());
  return (
    <>
      <PageHeader
        title="Tu próxima partida empieza aquí."
        description="Todos tus juegos. Toda tu gente. Un solo lugar."
        eyebrow={`${date} · Hola, Roberto`}
        actions={
          <label className="context-control">
            <Sparkles size={15} />
            <span>Tu contexto</span>
            <select
              aria-label="Contexto de actividad"
              value={state.preferences.context}
              onChange={(event) =>
                dispatch({
                  type: 'preferences/update',
                  patch: {
                    context: event.target.value === 'playing' ? 'playing' : 'exploring',
                    voice: false,
                  },
                })
              }
            >
              <option value="exploring">Explorando</option>
              <option value="playing">En partida</option>
            </select>
          </label>
        }
      />
      <div className="hero-grid">
        <section className={`hero ${playing ? 'session-hero' : ''}`}>
          {!playing && <GameCover game={getGame('elden')} className="hero-art" eager />}
          <div className="hero-content">
            <span className="pill">
              <Sparkles size={12} />
              {playing ? 'EXPERIENCIA ADAPTATIVA · EN PARTIDA' : 'TU SIGUIENTE GRAN AVENTURA'}
            </span>
            <h2>
              {playing ? (
                <>
                  Menos ruido.
                  <br />
                  Más aventura.
                </>
              ) : (
                <>
                  Vuelve a las
                  <br />
                  Tierras Intermedias.
                </>
              )}
            </h2>
            <p>
              {playing
                ? 'Jugando a Elden Ring. Tu escuadrón y las herramientas de sesión pasan al primer plano.'
                : 'Tu mundo aún tiene historias por contar. Y esta vez, no tienes por qué explorarlo solo.'}
            </p>
            <div className="button-row">
              {playing ? (
                <>
                  <Button
                    variant="primary"
                    onClick={() => {
                      dispatch({
                        type: 'preferences/update',
                        patch: { voice: !state.preferences.voice },
                      });
                      notify('Canal de voz simulado. No se usa el micrófono.');
                    }}
                  >
                    <Volume2 size={15} />
                    {state.preferences.voice ? 'Salir del canal' : 'Unirse al canal'}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() =>
                      dispatch({
                        type: 'preferences/update',
                        patch: { context: 'exploring', voice: false },
                      })
                    }
                  >
                    Terminar sesión
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="primary"
                    onClick={() => {
                      dispatch({ type: 'preferences/update', patch: { context: 'playing' } });
                      notify('Modo en partida activado. El juego no se ejecuta desde la demo.');
                    }}
                  >
                    <Play size={15} />
                    Continuar aventura
                  </Button>
                  <Link className="button ghost" to="/games/elden">
                    Ver juego
                  </Link>
                </>
              )}
            </div>
            <div className="hero-social">
              <span className="avatar-stack">
                {online.slice(0, 3).map((friend) => (
                  <Avatar key={friend.id} friend={friend} />
                ))}
              </span>
              <span>
                {playing ? 'Tu escuadrón, siempre a mano' : 'Una aventura que merece compartirse'}
              </span>
            </div>
          </div>
        </section>
        <section className="panel party-panel">
          <SectionHeader title={playing ? 'Tu escuadrón' : 'Tu gente, en juego'} />
          <span className="online-label">
            <i className="status-dot" />
            {online.length} amigos online
          </span>
          <div className="friend-rows">
            {online.slice(0, 3).map((friend) => (
              <div className="friend-row" key={friend.id}>
                <Avatar friend={friend} />
                <div>
                  <strong>{friend.name}</strong>
                  <small>
                    {getGame(friend.playing).name} · {friend.platform}
                  </small>
                </div>
                <button
                  className="icon-button"
                  onClick={() => invite([friend.id], playing ? 'elden' : null)}
                  aria-label={`Invitar a ${friend.name}`}
                >
                  <Plus size={16} />
                </button>
              </div>
            ))}
          </div>
          <Link className="button ghost" to="/friends">
            <Users size={15} />
            Encontrar compañeros
          </Link>
        </section>
      </div>
      <div className="stats-strip">
        {[
          { icon: BookOpen, value: collection.length, label: 'Juegos en tu biblioteca' },
          {
            icon: Trophy,
            value: collection.filter((entry) => entry.status === 'Completado').length,
            label: 'Aventuras completadas',
          },
          {
            icon: Clock,
            value: collection.reduce((sum, entry) => sum + entry.hours, 0),
            label: 'Horas bien invertidas',
          },
          { icon: Users, value: online.length, label: 'Amigos conectados' },
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
      <section className="section">
        <SectionHeader
          title="Una partida más, juntos"
          description="Aventuras de tu biblioteca para volver a conectar."
          to="/library"
          linkText="Ver biblioteca"
        />
        <div className="games-grid">
          {['baldurs', 'hades', 'it-takes', 'stardew']
            .map((id) => collection.find((entry) => entry.gameId === id))
            .filter((entry) => entry !== undefined)
            .map((entry) => (
              <GameCard key={entry.gameId} game={getGame(entry.gameId)} />
            ))}
        </div>
        {collection.length === 0 && (
          <p className="muted">Conecta una plataforma para ver tu colección.</p>
        )}
      </section>
      <div className="home-bottom">
        <section className="panel">
          <SectionHeader
            title="Al otro lado de la pantalla"
            to="/recommendations"
            linkText="Ver actividad"
          />
          <div className="activity-row">
            <Avatar friend={online[0]} />
            <p>
              <strong>Jaime</strong> ha empezado <strong>Baldur’s Gate 3</strong>
              <small>Actividad de ejemplo · Steam</small>
            </p>
            <Gamepad2 size={19} />
          </div>
          <div className="activity-row">
            <Avatar friend={online[1]} />
            <p>
              <strong>Pablo</strong> te recomienda <strong>Hades</strong>
              <small>«Creo que este te va a encantar»</small>
            </p>
            <Trophy size={19} />
          </div>
        </section>
        <section className="panel">
          <SectionHeader title="Buen juego. Mejor precio." />
          <div className="featured-offer">
            <GameCover game={getGame('portal')} />
            <div>
              <span className="pill">−80% · Oferta de ejemplo</span>
              <h3>Portal 2</h3>
              <p className="price">
                1,95 € <del>9,75 €</del>
              </p>
              <Link to="/marketplace?tab=agents" className="text-link">
                Tu agente espera el momento <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
