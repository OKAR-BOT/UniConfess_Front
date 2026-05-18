import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/feed', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-gray-950 px-4 py-12">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 p-8 shadow-xl"
      >
        <h1 className="text-center text-2xl font-bold text-white">Entrar a UConfess</h1>
        <p className="mt-2 text-center text-sm text-gray-400">
          Usa el correo y la contraseña de tu cuenta.
        </p>

        <div className="mt-8 space-y-4">
          <input
            type="email"
            required
            placeholder="correo@ejemplo.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 p-3 text-white outline-none focus:border-indigo-500"
          />
          <input
            type="password"
            required
            placeholder="Contraseña"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 p-3 text-white outline-none focus:border-indigo-500"
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
          className="mt-6 w-full rounded-lg bg-indigo-600 py-3 font-bold text-white transition hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Entrando…' : 'Entrar'}
        </button>

        <p className="mt-6 text-center text-sm text-gray-500">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="text-indigo-400 hover:underline">
            Regístrate
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
