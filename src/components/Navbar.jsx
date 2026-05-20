import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import 'animate.css';

/* ── Helper: dispara la animación y la limpia al terminar ────────────────
   Así puede re-dispararse en cada click sin tener que recargar la página */
const playAnimation = (el, animationClass) => {
  if (!el) return;
  el.classList.add('animate__animated', animationClass);
  el.addEventListener(
    'animationend',
    () => el.classList.remove('animate__animated', animationClass),
    { once: true }
  );
};

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-800 bg-indigo-900 px-6 py-4 font-sans text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between">

        {/* Logo: rebota al hacer click */}
        <Link
          to="/"
          className="text-xl font-bold tracking-wide hover:text-indigo-200"
          style={{ '--animate-duration': '0.5s' }}
          onClick={(e) => playAnimation(e.currentTarget, 'animate__bounce')} // bounce — rebota hacia arriba y vuelve
        >
          UConfess
        </Link>

        <div className="flex flex-wrap items-center gap-5 text-sm font-medium">

          <Link
            to="/"
            className="hover:text-indigo-300"
            style={{ '--animate-duration': '0.4s' }}
            onClick={(e) => playAnimation(e.currentTarget, 'animate__rubberBand')} // rubberBand — se estira y encoge como liga
          >
            Inicio
          </Link>

          <Link
            to="/feed"
            className="hover:text-indigo-300"
            style={{ '--animate-duration': '0.4s' }}
            onClick={(e) => playAnimation(e.currentTarget, 'animate__rubberBand')} // rubberBand — se estira y encoge como liga
          >
            Feed
          </Link>

          <Link
            to="/about"
            className="hover:text-indigo-300"
            style={{ '--animate-duration': '0.4s' }}
            onClick={(e) => playAnimation(e.currentTarget, 'animate__rubberBand')} // rubberBand — se estira y encoge como liga
          >
            About us
          </Link>

          <Link
            to="/membership"
            className="hover:text-indigo-300"
            style={{ '--animate-duration': '0.4s' }}
            onClick={(e) => playAnimation(e.currentTarget, 'animate__rubberBand')} // rubberBand — se estira y encoge como liga
          >
            Membresía
          </Link>

          {user ? (
            <>
              <span className="hidden max-w-[120px] truncate text-indigo-200 sm:inline">
                @{user.handle}
              </span>

              <Link
                to="/dashboard"
                className="font-semibold text-indigo-300 hover:text-white"
                style={{ '--animate-duration': '0.4s' }}
                onClick={(e) => playAnimation(e.currentTarget, 'animate__rubberBand')} // rubberBand — se estira y encoge como liga
              >
                Mi cuenta
              </Link>

              {/* Botón Salir: headShake — se sacude como diciendo "no" antes de salir */}
              <button
                type="button"
                onClick={(e) => {
                  playAnimation(e.currentTarget, 'animate__headShake'); // headShake — se sacude de lado antes de cerrar sesión
                  setTimeout(handleLogout, 400);
                }}
                className="rounded border border-red-500/30 bg-red-500/10 px-3 py-1 text-red-300 transition hover:bg-red-500 hover:text-white"
                style={{ '--animate-duration': '0.4s' }}
              >
                Salir
              </button>
            </>
          ) : (
            /* Login: pulse — llama la atención brevemente */
            <Link
              to="/login"
              className="rounded-lg bg-indigo-600 px-4 py-2 transition hover:bg-indigo-500"
              style={{ '--animate-duration': '0.4s' }}
              onClick={(e) => playAnimation(e.currentTarget, 'animate__pulse')} // pulse — pulso rápido de escala
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
