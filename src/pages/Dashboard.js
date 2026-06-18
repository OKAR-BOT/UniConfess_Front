import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="page-shell px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="card-utp p-8 shadow-xl">
          <p className="badge-live w-fit">Perfil activo</p>
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

          <Link to="/feed" className="btn-utp-primary mt-10">
            Ir al feed →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
