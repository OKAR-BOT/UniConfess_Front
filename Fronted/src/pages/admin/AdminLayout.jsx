import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const SIDEBAR_LINKS = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/users', label: 'Usuarios', icon: '👥' },
  { to: '/admin/confessions', label: 'Confesiones', icon: '📝' },
];

function AdminSidebar() {
  const location = useLocation();
  const isActive = (path, end) =>
    end ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <aside className="flex w-56 shrink-0 flex-col gap-1 px-3 py-6 max-lg:hidden" style={{ background: 'var(--color-footer)' }}>
      <div className="mb-6 px-3">
        <p className="text-xs font-bold uppercase tracking-widest text-white/40">Admin Panel</p>
      </div>
      {SIDEBAR_LINKS.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
            isActive(link.to, link.end)
              ? 'bg-utp-red/20 text-white shadow-[0_0_20px_var(--color-glow-red)]'
              : 'text-white/60 hover:bg-white/5 hover:text-white/90'
          }`}
        >
          <span className="text-lg">{link.icon}</span>
          {link.label}
        </NavLink>
      ))}
      <div className="mt-auto pt-6">
        <NavLink
          to="/feed"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/40 transition-all duration-200 hover:bg-white/5 hover:text-white/70"
        >
          <span className="text-lg">←</span>
          Volver al feed
        </NavLink>
      </div>
    </aside>
  );
}

function AdminLayout() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-[calc(100vh-4.25rem)]" style={{ background: 'var(--color-bg)' }}>
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b px-4 py-2.5 sm:px-6 lg:hidden" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-soft)' }}>
          <span className="text-xs font-bold uppercase tracking-widest text-utp-red">Admin</span>
          {SIDEBAR_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-theme-muted transition hover:text-utp-red"
              style={({ isActive }) => isActive ? { color: 'var(--color-utp-red)' } : {}}
            >
              {link.label}
            </NavLink>
          ))}
          <NavLink to="/feed" className="ml-auto text-xs text-theme-muted hover:text-utp-red">
            ← Feed
          </NavLink>
        </div>
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
