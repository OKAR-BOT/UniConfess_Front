import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CareerSearchSelect from '../components/CareerSearchSelect';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [handle, setHandle] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [career, setCareer] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!career) {
      setError('Selecciona tu carrera de la lista UTP.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await register({ displayName, handle, email, password, career });
      navigate('/feed', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-gray-950 px-4 py-12">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 p-8 shadow-xl"
      >
        <h1 className="text-2xl font-bold text-white">Crear cuenta</h1>
        <p className="mt-1 text-sm text-gray-400">
          Tu nombre y usuario serán visibles en tus publicaciones.
        </p>

        <div className="mt-8 space-y-4">
          <div>
            <label htmlFor="reg-name" className="block text-xs font-medium text-gray-400">
              Nombre para mostrar
            </label>
            <input
              id="reg-name"
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-white focus:border-indigo-500 focus:outline-none"
              placeholder="Ej. María Pérez"
              autoComplete="name"
            />
          </div>
          <div>
            <label htmlFor="reg-handle" className="block text-xs font-medium text-gray-400">
              Usuario (sin @)
            </label>
            <input
              id="reg-handle"
              required
              value={handle}
              onChange={(e) => setHandle(e.target.value.replace(/\s/g, ''))}
              className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-white focus:border-indigo-500 focus:outline-none"
              placeholder="maria_utp"
              autoComplete="username"
            />
          </div>
          <div>
            <label htmlFor="reg-email" className="block text-xs font-medium text-gray-400">
              Correo
            </label>
            <input
              id="reg-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-white focus:border-indigo-500 focus:outline-none"
              placeholder="tu@utp.edu.pe"
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="reg-pass" className="block text-xs font-medium text-gray-400">
              Contraseña
            </label>
            <input
              id="reg-pass"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-white focus:border-indigo-500 focus:outline-none"
              autoComplete="new-password"
            />
          </div>
          <CareerSearchSelect
            id="reg-career"
            value={career}
            onChange={setCareer}
            required
          />
        </div>

        {error ? (
          <p className="mt-4 rounded-lg border border-red-500/40 bg-red-950/50 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-indigo-600 py-3 text-sm font-bold text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Creando…' : 'Registrarse'}
        </button>

        <p className="mt-6 text-center text-sm text-gray-500">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-indigo-400 hover:underline">
            Entrar
          </Link>
        </p>
      </form>
    </div>
  );
}
