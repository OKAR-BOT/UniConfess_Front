import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function SkeletonStat() {
  return (
    <div className="stat-chip animate-pulse">
      <div className="mx-auto h-8 w-20 rounded bg-white/10" />
      <div className="mx-auto mt-3 h-4 w-24 rounded bg-white/10" />
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 border-b py-4 animate-pulse" style={{ borderColor: 'var(--color-border)' }}>
      <div className="size-10 rounded-xl bg-white/10" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 rounded bg-white/10" />
        <div className="h-3 w-24 rounded bg-white/10" />
      </div>
      <div className="h-4 w-20 rounded bg-white/10" />
    </div>
  );
}

function AdminDashboard() {
  const { getAllUsers } = useAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [counts, setCounts] = useState({ total: 0, premium: 0, admin: 0, banned: 0, confessions: 0 });

  useEffect(() => {
    const timer = setTimeout(() => {
      const all = getAllUsers();
      setUsers(all);
      const confKey = 'uconfess_confessions_v1';
      let confCount = 0;
      try {
        const raw = localStorage.getItem(confKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) confCount = parsed.length;
        }
      } catch {}
      setCounts({
        total: all.length,
        premium: all.filter((u) => u.role === 'premium').length,
        admin: all.filter((u) => u.role === 'admin').length,
        banned: all.filter((u) => u.isBanned).length,
        confessions: confCount,
      });
      setLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [getAllUsers]);

  const recentUsers = users.slice(-5).reverse();

  if (loading) {
    return (
      <div className="p-6 sm:p-8">
        <div className="mb-8">
          <div className="h-8 w-48 rounded bg-white/10 animate-pulse" />
          <div className="mt-2 h-4 w-72 rounded bg-white/10 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonStat key={i} />)}
        </div>
        <div className="card-utp mt-8 p-6">
          <div className="h-5 w-36 rounded bg-white/10 animate-pulse" />
          <div className="mt-6 space-y-1">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  const STAT_CARDS = [
    { label: 'Usuarios totales', value: counts.total, icon: '👥', color: 'text-utp-red' },
    { label: 'Premium', value: counts.premium, icon: '⭐', color: 'text-utp-green' },
    { label: 'Confesiones', value: counts.confessions, icon: '📝', color: 'text-utp-red' },
    { label: 'Baneados', value: counts.banned, icon: '🚫', color: 'text-theme-muted' },
  ];

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-theme sm:text-3xl">Panel de Administración</h1>
        <p className="mt-1 text-sm text-theme-secondary">Resumen general de la plataforma UConfess</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((stat) => (
          <div key={stat.label} className="stat-chip">
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl">{stat.icon}</span>
              <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
            </div>
            <p className="mt-2 text-xs font-semibold text-theme-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Link to="/admin/users" className="card-utp-interactive group flex items-center justify-between p-6">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-theme-muted">Gestionar</p>
            <p className="text-xl font-black text-theme group-hover:text-utp-red transition-colors">Usuarios</p>
          </div>
          <span className="text-3xl transition-transform group-hover:translate-x-1">→</span>
        </Link>
        <Link to="/admin/confessions" className="card-utp-interactive group flex items-center justify-between p-6">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-theme-muted">Gestionar</p>
            <p className="text-xl font-black text-theme group-hover:text-utp-red transition-colors">Confesiones</p>
          </div>
          <span className="text-3xl transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </div>

      <div className="card-utp mt-8 p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-theme-muted">Últimos registrados</h2>
        {recentUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <span className="text-4xl opacity-30">👥</span>
            <p className="mt-3 text-sm text-theme-muted">No hay usuarios registrados aún.</p>
            <p className="text-xs text-theme-muted">Los usuarios aparecerán aquí cuando se registren.</p>
          </div>
        ) : (
          <div className="mt-4 divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {recentUsers.map((u) => (
              <div key={u.id} className="flex items-center gap-4 py-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl font-bold text-sm" style={{ background: 'color-mix(in srgb, var(--color-utp-red) 15%, transparent)', color: 'var(--color-utp-red)' }}>
                  {u.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-theme">{u.displayName}</p>
                  <p className="truncate text-xs text-theme-muted">@{u.handle}</p>
                </div>
                <span className={`shrink-0 text-xs font-bold uppercase tracking-wider ${
                  u.role === 'admin' ? 'text-utp-red' : u.role === 'premium' ? 'text-utp-green' : 'text-theme-muted'
                }`}>
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
