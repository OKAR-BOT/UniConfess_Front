import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-900 font-sans text-white">
      <section className="relative flex min-h-[calc(100vh-4.5rem)] flex-col justify-center overflow-hidden px-6 py-20">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-indigo-950/50 via-gray-900 to-gray-900"
          aria-hidden
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-indigo-400">
            Bienvenido a la comunidad
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">UConfess</h1>
          <p className="mt-6 text-lg leading-relaxed text-gray-300 sm:text-xl">
            El rincón de los estudiantes de la{' '}
            <span className="font-medium text-white">Universidad Tecnológica del Perú</span> para
            compartir confesiones, chismes de campus y vivencias universitarias con respeto.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/feed"
              className="inline-flex w-full max-w-xs items-center justify-center rounded-lg bg-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-indigo-500 hover:scale-[1.02] sm:w-auto"
            >
              Entrar al feed
            </Link>
            {!user ? (
              <Link
                to="/register"
                className="inline-flex w-full max-w-xs items-center justify-center rounded-lg border border-gray-600 px-8 py-3.5 text-sm font-semibold text-gray-200 transition hover:border-indigo-500 hover:text-white sm:w-auto"
              >
                Crear cuenta
              </Link>
            ) : (
              <Link
                to="/dashboard"
                className="inline-flex w-full max-w-xs items-center justify-center rounded-lg border border-indigo-500/50 px-8 py-3.5 text-sm font-semibold text-indigo-200 transition hover:bg-indigo-600/20 sm:w-auto"
              >
                Mi cuenta
              </Link>
            )}
          </div>
          {!user ? (
            <p className="mt-6 text-sm text-gray-500">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="text-indigo-400 hover:underline">
                Inicia sesión
              </Link>
            </p>
          ) : null}
        </div>
      </section>

      <section className="border-t border-gray-800 bg-gray-950/40 px-6 py-16">
        <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-3">
          <article className="rounded-2xl border border-gray-800 bg-gray-900/80 p-6 text-center">
            <h2 className="text-lg font-semibold text-indigo-300">Publica</h2>
            <p className="mt-2 text-sm text-gray-400">
              Comparte con tu nombre y usuario de cuenta. Sin pseudónimos a elección.
            </p>
          </article>
          <article className="rounded-2xl border border-gray-800 bg-gray-900/80 p-6 text-center">
            <h2 className="text-lg font-semibold text-indigo-300">Interactúa</h2>
            <p className="mt-2 text-sm text-gray-400">
              Comenta, da me gusta y repostea publicaciones de la comunidad UTP.
            </p>
          </article>
          <article className="rounded-2xl border border-gray-800 bg-gray-900/80 p-6 text-center">
            <h2 className="text-lg font-semibold text-indigo-300">Explora</h2>
            <p className="mt-2 text-sm text-gray-400">
              Desplázate por el feed de forma continua, como en una red social.
            </p>
          </article>
        </div>
        <p className="mx-auto mt-12 max-w-xl text-center text-sm text-gray-500">
          <Link to="/about" className="text-indigo-400 hover:underline">
            Conoce más sobre el proyecto
          </Link>
        </p>
      </section>
    </div>
  );
}

export default Home;
