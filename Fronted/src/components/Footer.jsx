import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="footer-utp">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row">
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2">
              <span className="flex leading-none">
                <span className="logo-block--red text-base">U</span>
                <span className="logo-block--dark -ml-0.5 text-base">C</span>
              </span>
              <span className="text-xl font-black tracking-tight">onfess</span>
            </div>
            <p className="mt-3 max-w-sm text-center text-sm text-gray-400 md:text-left">
              El rincón donde los estudiantes UTP comparten secretos, anécdotas y pensamientos sin
              perder el estilo campus.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-5 text-sm font-semibold text-gray-300">
            <Link to="/" className="transition hover:text-utp-red">
              Inicio
            </Link>
            <Link to="/feed" className="transition hover:text-utp-red">
              Feed
            </Link>
            <Link to="/about" className="transition hover:text-utp-red">
              About us
            </Link>
            <Link to="/about#reglas" className="transition hover:text-utp-red">
              Reglas
            </Link>
            <Link to="/about#privacidad" className="transition hover:text-utp-red">
              Privacidad
            </Link>
            <Link to="/membership" className="transition hover:text-utp-red">
              Membresía
            </Link>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-gray-500 md:flex-row">
          <p>&copy; {new Date().getFullYear()} UConfess · Universidad Tecnológica del Perú</p>
          <p className="flex items-center gap-1.5">
            Hecho con <span className="animate-pulse text-utp-red">❤</span> para la comunidad UTP
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
