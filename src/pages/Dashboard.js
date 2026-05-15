import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-gray-950 px-4 py-10 text-white">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8 shadow-xl">
          <h1 className="text-3xl font-bold">Mi cuenta</h1>
          <p className="mt-2 italic text-gray-400">
            Sesión activa en UConfess. Tus publicaciones usan esta identidad.
          </p>

          <dl className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-700/50 bg-gray-800 p-4">
              <dt className="text-xs uppercase tracking-widest text-gray-500">Nombre</dt>
              <dd className="mt-1 font-medium text-white">{user.displayName}</dd>
            </div>
            <div className="rounded-lg border border-gray-700/50 bg-gray-800 p-4">
              <dt className="text-xs uppercase tracking-widest text-gray-500">Usuario</dt>
              <dd className="mt-1 font-mono text-indigo-400">@{user.handle}</dd>
            </div>
            <div className="rounded-lg border border-gray-700/50 bg-gray-800 p-4 sm:col-span-2">
              <dt className="text-xs uppercase tracking-widest text-gray-500">Correo</dt>
              <dd className="mt-1 font-medium text-white">{user.email}</dd>
            </div>
            <div className="rounded-lg border border-gray-700/50 bg-gray-800 p-4 sm:col-span-2">
              <dt className="text-xs uppercase tracking-widest text-gray-500">Carrera</dt>
              <dd className="mt-1 font-medium text-white">{user.career}</dd>
            </div>
          </dl>

          <Link
            to="/feed"
            className="mt-10 inline-flex rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Ir al feed
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
