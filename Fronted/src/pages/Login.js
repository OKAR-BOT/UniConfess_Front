import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MeshBackground from '../components/MeshBackground';

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
      const u = await login(email, password);
      if (u.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/feed', { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesion.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-[calc(100vh-4.25rem)] items-center justify-center px-4 py-12">
      <MeshBackground variant="auth" />
      <form onSubmit={handleLogin} className="card-utp relative z-10 w-full max-w-md p-8 shadow-xl">
        <div className="mb-6 flex justify-center">
          <span className="flex leading-none">
            <span className="logo-block--red text-base">U</span>
            <span className="logo-block--dark -ml-0.5 text-base">C</span>
          </span>
        </div>
        <h1 className="text-center text-2xl font-black text-theme">Entrar a UConfess</h1>
        <p className="mt-2 text-center text-sm text-theme-secondary">
          Tu pass al feed mas real del campus UTP.
        </p>

        <div className="mt-8 space-y-4">
          <input
            type="email"
            required
            placeholder="correo@ejemplo.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-utp p-3"
          />
          <input
            type="password"
            required
            placeholder="Contrasena"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-utp p-3"
          />
        </div>

        {error ? <p className="alert-error mt-4">{error}</p> : null}

        <button type="submit" disabled={loading} className="btn-utp-primary mt-6 w-full py-3.5">
          {loading ? 'Entrando...' : 'Entrar al campus →'}
        </button>

        <p className="mt-6 text-center text-sm text-theme-muted">
          ¿No tienes cuenta?{' '}
          <Link to="/register" className="font-bold text-utp-red hover:underline">
            Registrate
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
