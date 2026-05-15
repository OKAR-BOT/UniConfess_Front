import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-800 bg-indigo-900 py-8 font-sans text-white">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex flex-col items-center md:items-start">
            <span className="text-xl font-bold tracking-wide">Confesiones UTP</span>
            <p className="mt-2 max-w-sm text-center text-sm text-indigo-200 md:text-left">
              El rincón donde los estudiantes comparten sus secretos, anécdotas y pensamientos.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-indigo-100">
            <Link to="/" className="transition-colors hover:text-indigo-300">
              Inicio
            </Link>
            <Link to="/feed" className="transition-colors hover:text-indigo-300">
              Feed
            </Link>
            <Link to="/about" className="transition-colors hover:text-indigo-300">
              About us
            </Link>
            <Link to="/about#reglas" className="transition-colors hover:text-indigo-300">
              Reglas
            </Link>
            <Link to="/about#privacidad" className="transition-colors hover:text-indigo-300">
              Privacidad
            </Link>
            <Link to="/membership" className="transition-colors hover:text-indigo-300">
              Membresía
            </Link>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-gray-800/50 pt-6 text-xs text-indigo-300 md:flex-row">
          <p>&copy; {new Date().getFullYear()} Confesiones UTP. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1">
            Hecho con <span className="animate-pulse text-red-500">❤️</span> para la comunidad UTP
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
