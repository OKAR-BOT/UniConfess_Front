import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-900 font-sans text-white">
      {/* Fondo con gradiente idéntico a tu Landing */}
      <section className="relative flex min-h-screen flex-col justify-center overflow-hidden px-6 py-20">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-indigo-950/50 via-gray-900 to-gray-900"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-3xl text-center">
          {/* Código de error con estilo destacado */}
          <p className="text-6xl font-bold text-indigo-500 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">
            404
          </p>
          
          <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl">
            ¿Te perdiste en el campus?
          </h1>
          
          <p className="mt-6 text-lg leading-relaxed text-gray-300 sm:text-xl">
            Parece que esta confesión fue borrada o la página que buscas no existe en los pasillos de <span className="font-medium text-white">UConfess</span>.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              to="/feed"
              className="inline-flex w-full max-w-xs items-center justify-center rounded-lg bg-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-indigo-500 hover:scale-[1.02] sm:w-auto"
            >
              Volver al feed
            </Link>
            
            <Link
              to="/"
              className="inline-flex w-full max-w-xs items-center justify-center rounded-lg border border-gray-600 px-8 py-3.5 text-sm font-semibold text-gray-200 transition hover:border-indigo-500 hover:text-white sm:w-auto"
            >
              Ir al inicio
            </Link>
          </div>

          <p className="mt-12 text-sm text-gray-500">
            Si crees que esto es un error del sistema,{' '}
            <Link to="/support" className="text-indigo-400 hover:underline">
              contáctanos
            </Link>
          </p>
        </div>
      </section>

      {/* Footer minimalista estilo UConfess */}
      <footer className="border-t border-gray-800 bg-gray-950/40 px-6 py-8 text-center">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} UConfess - Comunidad UTP
        </p>
      </footer>
    </div>
  );
};

export default NotFound;