import { useEffect, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Gamepad2, ShieldCheck, UserRound } from 'lucide-react';
import { useAccess } from '../../app/AccessContext';
import { demoAccounts } from '../../domain/access';
import { Button } from '../../components/Button';

export default function LoginPage() {
  const { account, login } = useAccess();
  const location = useLocation();
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const from: unknown = (location.state as { from?: unknown } | null)?.from;
  const destination = (role: 'admin' | 'user') =>
    typeof from === 'string' &&
    from.startsWith('/') &&
    !from.startsWith('//') &&
    from !== '/login' &&
    from !== '/'
      ? from
      : role === 'admin'
        ? '/admin'
        : '/';

  useEffect(() => {
    document.title = 'SavePoint — Iniciar sesión';
  }, []);
  if (account) return <Navigate to={destination(account.role)} replace />;

  return (
    <main className="login-page">
      <section className="login-story" aria-labelledby="welcome-title">
        <div className="brand">
          <img src="/assets/mark.svg" alt="" />
          <span>
            save<span>point</span>
          </span>
        </div>
        <div className="login-intro">
          <span className="pill">
            <Gamepad2 size={15} /> TU PUNTO DE ENCUENTRO
          </span>
          <h1 id="welcome-title">
            Todos tus mundos.
            <br />
            <span>Un solo lugar.</span>
          </h1>
          <p>Tu biblioteca, tu gente y tu próxima aventura empiezan en SavePoint.</p>
          <div className="login-features">
            <p>
              <UserRound size={20} />
              <span>
                <strong>Tu espacio de jugador</strong>Explora juegos, conecta con amigos y prueba
                tus agentes.
              </span>
            </p>
            <p>
              <ShieldCheck size={20} />
              <span>
                <strong>El control de la plataforma</strong>Entra como administrador para configurar
                la experiencia.
              </span>
            </p>
          </div>
        </div>
        <p className="fine-print">SavePoint · Demo interactiva</p>
      </section>
      <section className="login-form-panel" aria-labelledby="login-title">
        <p className="eyebrow">BIENVENIDO A SAVEPOINT</p>
        <h2 id="login-title">Iniciar sesión</h2>
        <p className="body-copy muted">Elige una cuenta de demo o introduce sus credenciales.</p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (!login(identifier, password)) {
              setError('Usuario o contraseña incorrectos. Prueba una de las cuentas de demo.');
              return;
            }
            const next = demoAccounts.find(
              (candidate) =>
                candidate.email === identifier.trim().toLowerCase() ||
                candidate.username === identifier.trim().toLowerCase(),
            );
            void navigate(destination(next?.role ?? 'user'), { replace: true });
          }}
        >
          <label className="field">
            Usuario o correo electrónico
            <input
              name="username"
              autoComplete="username"
              value={identifier}
              required
              onChange={(event) => {
                setIdentifier(event.target.value);
                setError('');
              }}
            />
          </label>
          <label className="field">
            Contraseña
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              required
              onChange={(event) => {
                setPassword(event.target.value);
                setError('');
              }}
            />
          </label>
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" variant="primary">
            Entrar a SavePoint <ArrowRight size={16} />
          </Button>
        </form>
        <div className="demo-accounts">
          <h3>Dos perfiles para explorar</h3>
          {demoAccounts.map((candidate) => (
            <button
              className="demo-account"
              key={candidate.id}
              type="button"
              aria-label={`Usar cuenta ${candidate.role === 'admin' ? 'administrador' : 'normal'}`}
              onClick={() => {
                setIdentifier(candidate.email);
                setPassword(candidate.password);
                setError('');
              }}
            >
              {candidate.role === 'admin' ? <ShieldCheck size={22} /> : <UserRound size={22} />}
              <span>
                <strong>{candidate.role === 'admin' ? 'Administrador' : 'Usuario normal'}</strong>
                <small>{candidate.email}</small>
                <small>Contraseña: {candidate.password}</small>
              </span>
              <ArrowRight size={16} />
            </button>
          ))}
        </div>
        <p className="notice">
          Acceso simulado para la presentación. Usa estas cuentas ficticias; los datos se guardan
          solo en este navegador.
        </p>
      </section>
    </main>
  );
}
