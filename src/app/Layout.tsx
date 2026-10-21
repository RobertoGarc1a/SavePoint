import { Suspense, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  BookOpen,
  Compass,
  Heart,
  Home,
  Inbox,
  Link2,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { useApp } from './AppContext';
import { Avatar } from '../components/Avatar';
import { Tour } from './Tour';
import { activeFriends } from '../domain/social';
import { useAccess } from './AccessContext';

const primary = [
  { to: '/', label: 'Mi espacio', icon: Home },
  { to: '/library', label: 'Mi biblioteca', icon: BookOpen },
  { to: '/discover', label: 'Descubrir', icon: Compass },
  { to: '/friends', label: 'Amigos', icon: Users },
  { to: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
];
const collection = [
  { to: '/wishlist', label: 'Lista de deseos', icon: Heart },
  { to: '/recommendations', label: 'Recomendaciones', icon: Inbox },
  { to: '/platforms', label: 'Mis plataformas', icon: Link2 },
];
export function Layout() {
  const { state } = useApp();
  const { account, settings, logout } = useAccess();
  const [menuOpen, setMenuOpen] = useState(false);
  const [tour, setTour] = useState(false);
  const [query, setQuery] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const online = activeFriends(state).filter((friend) => friend.online).length;
  const currentTitle =
    [
      ...primary,
      ...collection,
      { to: '/settings', label: 'Configuración' },
      { to: '/admin', label: 'Administración' },
    ].find((item) => item.to === location.pathname)?.label ?? 'Ficha de juego';

  useEffect(() => {
    document.title = `SavePoint — ${currentTitle}`;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname, currentTitle]);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchRef.current?.focus();
      }
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
  return (
    <>
      <a className="skip-link" href="#main-content">
        Saltar al contenido
      </a>
      {menuOpen && (
        <button
          className="menu-shade"
          aria-label="Cerrar navegación"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <Link to="/" className="brand" onClick={() => setMenuOpen(false)}>
          <img src="/assets/mark.svg" alt="" />
          <span>
            save<span>point</span>
          </span>
        </Link>
        <button
          className="icon-button close-menu"
          onClick={() => setMenuOpen(false)}
          aria-label="Cerrar menú"
        >
          <X />
        </button>
        <nav aria-label="Navegación principal">
          <p className="nav-label">TU UNIVERSO GAMING</p>
          {primary.map(({ to, label, icon: Icon }) => (
            <NavLink
              end={to === '/'}
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className="nav-item"
            >
              <Icon size={19} />
              {label}
              {to === '/friends' && <span className="nav-count">{online}</span>}
            </NavLink>
          ))}
          <p className="nav-label">TU COLECCIÓN</p>
          {collection.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={() => setMenuOpen(false)} className="nav-item">
              <Icon size={19} />
              {label}
              {to === '/wishlist' && <span className="nav-count">{state.wishlist.length}</span>}
            </NavLink>
          ))}
          {account?.role === 'admin' && (
            <>
              <p className="nav-label">CONTROL DE LA PLATAFORMA</p>
              <NavLink to="/admin" className="nav-item" onClick={() => setMenuOpen(false)}>
                <ShieldCheck size={19} /> Administración
              </NavLink>
            </>
          )}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-promo">
            <Sparkles size={18} />
            <strong>Una demo, todo SavePoint.</strong>
            <p>Qué jugar, con quién y a qué precio.</p>
            <button
              className="text-link"
              onClick={() => {
                setTour(true);
                setMenuOpen(false);
              }}
            >
              Iniciar recorrido →
            </button>
          </div>
          <NavLink to="/settings" className="nav-item" onClick={() => setMenuOpen(false)}>
            <Settings size={19} />
            Configuración
          </NavLink>
          <Link to="/settings" className="sidebar-user">
            <Avatar
              friend={{ initials: account?.initials ?? 'RG', color: 'amber', online: false }}
            />
            <div>
              <strong>{account?.name}</strong>
              <small>{account?.role === 'admin' ? 'Administrador' : 'Usuario normal'} · Demo</small>
            </div>
          </Link>
          <button
            className="nav-item logout-button"
            onClick={() => {
              logout();
              void navigate('/login', { replace: true });
            }}
          >
            <LogOut size={17} /> Cerrar sesión
          </button>
        </div>
      </aside>
      <div className="app-shell">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            aria-label="Abrir menú"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <Menu />
          </button>
          <p className="breadcrumb">
            Tu universo <span>/</span> <strong>{currentTitle}</strong>
          </p>
          <div className="topbar-actions">
            <form
              className="search-input global-search"
              role="search"
              onSubmit={(event) => {
                event.preventDefault();
                void navigate(`/library?q=${encodeURIComponent(query.trim())}`);
                setQuery('');
              }}
            >
              <Search size={16} />
              <input
                ref={searchRef}
                aria-label="Buscar en mi biblioteca"
                placeholder="Buscar en mi biblioteca…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <kbd>⌘ K</kbd>
            </form>
            <Link className="demo-badge" to="/settings">
              <i /> MODO DEMO
            </Link>
            <Link className="icon-button" to="/recommendations" aria-label="Ver recomendaciones">
              <Bell size={19} />
            </Link>
          </div>
        </header>
        <main id="main-content" className="main-content" tabIndex={-1}>
          {settings.announcement && (
            <div className="banner platform-announcement" role="status">
              <Bell size={20} />
              <div>
                <strong>Aviso de la plataforma</strong>
                <p>{settings.announcement}</p>
              </div>
            </div>
          )}
          <Suspense
            fallback={
              <p role="status" className="route-loading">
                Cargando tu espacio…
              </p>
            }
          >
            <Outlet context={{ startTour: () => setTour(true) }} />
          </Suspense>
        </main>
        <footer className="app-footer">
          <span>
            <i className="status-dot" /> Todos tus mundos, un mismo lugar.
          </span>
          <span>SavePoint © {new Date().getFullYear()} · Demo frontend</span>
        </footer>
      </div>
      {tour && <Tour onClose={() => setTour(false)} />}
    </>
  );
}
