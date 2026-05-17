import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-800 bg-indigo-900 px-6 py-4 font-sans text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Link to="/" className="text-xl font-bold tracking-wide hover:text-indigo-200">
          UConfess
        </Link>

        <div className="flex flex-wrap items-center gap-5 text-sm font-medium">
          <Link to="/" className="hover:text-indigo-300">
            Inicio
          </Link>
          <Link to="/feed" className="hover:text-indigo-300">
            Feed
          </Link>
          <Link to="/about" className="hover:text-indigo-300">
            About us
          </Link>
          <Link to="/membership" className="hover:text-indigo-300">
            Membresía
          </Link>

          {user ? (
            <>
              <span className="hidden max-w-[120px] truncate text-indigo-200 sm:inline">
                @{user.handle}
              </span>
              <Link to="/dashboard" className="font-semibold text-indigo-300 hover:text-white">
                Mi cuenta
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded border border-red-500/30 bg-red-500/10 px-3 py-1 text-red-300 transition hover:bg-red-500 hover:text-white"
              >
                Salir
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-lg bg-indigo-600 px-4 py-2 transition hover:bg-indigo-500"
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
