import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLE_BADGES = {
  admin: { label: 'Admin', color: 'text-utp-red', bg: 'bg-utp-red/15', icon: '🛡️' },
  premium: { label: 'Premium', color: 'text-utp-green', bg: 'bg-utp-green/15', icon: '⭐' },
  user: { label: 'Usuario', color: 'text-theme-muted', bg: 'bg-white/5', icon: '👤' },
};

function Dashboard() {
  const { user, isAdmin } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const badge = ROLE_BADGES[user.role] || ROLE_BADGES.user;

  return (
    <div className="page-shell px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="card-utp p-8 shadow-xl">
          <div className="flex items-center justify-between gap-4">
            <p className="badge-live">Perfil activo</p>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${badge.bg} ${badge.color}`}>
              {badge.icon} {badge.label}
            </span>
          </div>
          <h1 className="mt-4 text-3xl font-black text-theme">Mi cuenta</h1>
          <p className="mt-2 text-theme-secondary">
            Sesión activa en UConfess. Tus publicaciones usan esta identidad.
          </p>

          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            {[
              { label: 'Nombre', value: user.displayName, mono: false },
              { label: 'Usuario', value: `@${user.handle}`, mono: true },
              { label: 'Correo', value: user.email, mono: false, span: 2 },
              { label: 'Carrera', value: user.career, mono: false, span: 2 },
            ].map((field) => (
              <div
                key={field.label}
                className={`rounded-2xl border border-theme p-4 ${field.span === 2 ? 'sm:col-span-2' : ''}`}
                style={{ background: 'var(--color-bg-soft)' }}
              >
                <dt className="text-xs font-bold uppercase tracking-widest text-theme-muted">
                  {field.label}
                </dt>
                <dd
                  className={`mt-1 font-semibold text-theme ${field.mono ? 'font-mono text-utp-red' : ''}`}
                >
                  {field.value}
                </dd>
              </div>
            ))}
          </dl>

          {user.role === 'premium' && user.membershipExpiresAt && (
            <div className="mt-6 rounded-2xl border border-utp-green/30 p-4 text-center" style={{ background: 'color-mix(in srgb, var(--color-utp-green) 8%, transparent)' }}>
              <p className="text-xs font-bold uppercase tracking-wider text-utp-green">Membresía activa</p>
              <p className="mt-1 text-sm text-theme-secondary">
                Válida hasta {new Date(user.membershipExpiresAt).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/feed" className="btn-utp-primary px-6 py-2.5 text-sm">
              Ir al feed →
            </Link>
            {isAdmin && (
              <Link to="/admin" className="btn-utp-secondary px-6 py-2.5 text-sm">
                🛡️ Panel Admin
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
