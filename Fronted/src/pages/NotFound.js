import { Link } from 'react-router-dom';
import MeshBackground from '../components/MeshBackground';

const NotFound = () => {
  return (
    <div className="page-shell">
      <section className="relative flex min-h-[calc(100vh-4.25rem)] flex-col justify-center overflow-hidden px-6 py-20">
        <MeshBackground variant="hero" />

        <div className="relative mx-auto max-w-3xl text-center">
          <p className="text-7xl font-black text-gradient-utp sm:text-8xl">404</p>

          <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">
            ¿Te perdiste en el campus?
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-theme-secondary sm:text-xl">
            Parece que esta confesión fue borrada o la página que buscas no existe en los pasillos de{' '}
            <span className="font-bold text-utp-red">UConfess</span>.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/feed" className="btn-utp-primary w-full max-w-xs px-8 py-3.5 sm:w-auto">
              Volver al feed
            </Link>
            <Link to="/" className="btn-utp-secondary w-full max-w-xs px-8 py-3.5 sm:w-auto">
              Ir al inicio
            </Link>
          </div>

          <p className="mt-12 text-sm text-theme-muted">
            Si crees que esto es un error del sistema,{' '}
            <Link to="/about" className="font-bold text-utp-red hover:underline">
              contáctanos
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
};

export default NotFound;
