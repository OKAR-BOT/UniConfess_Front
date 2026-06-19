import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UtpLogo from './UtpLogo';
import ThemeToggle from './ThemeToggle';
import 'animate.css';

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
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="nav-utp">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div
          style={{ '--animate-duration': '0.5s' }}
          onClick={(e) => playAnimation(e.currentTarget, 'animate__bounce')}
        >
          <UtpLogo />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-1 sm:gap-2">
          <Link
            to="/"
            className="nav-link hidden sm:inline-flex"
            style={{ '--animate-duration': '0.4s' }}
            onClick={(e) => playAnimation(e.currentTarget, 'animate__rubberBand')}
          >
            Inicio
          </Link>

          <Link
            to="/feed"
            className="nav-link"
            style={{ '--animate-duration': '0.4s' }}
            onClick={(e) => playAnimation(e.currentTarget, 'animate__rubberBand')}
          >
            Feed
          </Link>

          <Link
            to="/about"
            className="nav-link hidden md:inline-flex"
            style={{ '--animate-duration': '0.4s' }}
            onClick={(e) => playAnimation(e.currentTarget, 'animate__rubberBand')}
          >
            About
          </Link>

          <Link
            to="/membership"
            className="nav-link hidden lg:inline-flex"
            style={{ '--animate-duration': '0.4s' }}
            onClick={(e) => playAnimation(e.currentTarget, 'animate__rubberBand')}
          >
            Membresía
          </Link>

          <ThemeToggle className="ml-1" />

          {user ? (
            <>
              <span className="hidden max-w-[100px] truncate px-2 text-xs text-white/75 sm:inline lg:max-w-[120px]">
                @{user.handle}
                {user.role === 'premium' ? <span className="ml-1" title="Premium">⭐</span> : null}
                {isAdmin ? <span className="ml-1" title="Admin">🛡️</span> : null}
              </span>

              <Link
                to="/dashboard"
                className="nav-link font-semibold"
                style={{ '--animate-duration': '0.4s' }}
                onClick={(e) => playAnimation(e.currentTarget, 'animate__rubberBand')}
              >
                Cuenta
              </Link>

              {isAdmin ? (
                <Link
                  to="/admin"
                  className="nav-link font-semibold"
                  style={{ '--animate-duration': '0.4s' }}
                  onClick={(e) => playAnimation(e.currentTarget, 'animate__rubberBand')}
                >
                  Panel Admin
                </Link>
              ) : null}

              <button
                type="button"
                onClick={(e) => {
                  playAnimation(e.currentTarget, 'animate__headShake');
                  setTimeout(handleLogout, 400);
                }}
                className="rounded-xl border border-white/25 bg-white/10 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-white hover:text-utp-red"
                style={{ '--animate-duration': '0.4s' }}
              >
                Salir
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="ml-1 rounded-xl bg-white px-4 py-2 text-sm font-bold text-utp-red shadow-lg transition hover:scale-105 hover:shadow-xl"
              style={{ '--animate-duration': '0.4s' }}
              onClick={(e) => playAnimation(e.currentTarget, 'animate__pulse')}
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
