import { Link } from 'react-router-dom';

const TEAM = [
  {
    name: 'Equipo Frontend',
    role: 'Interfaz, feed y experiencia de usuario',
    detail: 'React, Tailwind CSS, componentes de publicaciones e interacciones.',
  },
  {
    name: 'Equipo Backend',
    role: 'API y persistencia (en integración)',
    detail: 'Servicios REST, autenticación y base de datos del proyecto UniConfess.',
  },
  {
    name: 'Equipo UTP',
    role: 'Producto y comunidad',
    detail: 'Definición de reglas, pruebas con estudiantes y alineación con la comunidad UTP.',
  },
];

function About() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
        <div className="relative isolate overflow-hidden rounded-3xl bg-gray-950 px-6 py-16 shadow-2xl ring-1 ring-gray-800 sm:px-12 lg:px-16">
          <div
            className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-indigo-900/40 via-gray-900 to-gray-950"
            aria-hidden
          />
          <div className="mx-auto max-w-3xl text-center lg:text-left">
            <p className="text-sm font-semibold uppercase tracking-widest text-indigo-400">
              About us
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              UConfess · Confesiones UTP
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-gray-300">
              Somos un proyecto estudiantil para la{' '}
              <strong className="text-white">Universidad Tecnológica del Perú</strong>: una red
              social ligera donde compartir confesiones, chismes de campus y experiencias del día a
              día universitario, con respeto y sin exponer datos sensibles de terceros.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4 lg:justify-start">
              <Link
                to="/feed"
                className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-500"
              >
                Ver el feed
              </Link>
              <Link
                to="/"
                className="rounded-lg border border-gray-600 px-5 py-2.5 text-sm font-semibold text-gray-200 hover:border-indigo-500 hover:text-white"
              >
                Inicio
              </Link>
              <Link
                to="/register"
                className="rounded-lg border border-gray-600 px-5 py-2.5 text-sm font-semibold text-gray-200 hover:border-indigo-500 hover:text-white"
              >
                Crear cuenta
              </Link>
            </div>
          </div>
        </div>

        <section id="finalidad" className="mx-auto mt-16 max-w-3xl">
          <h2 className="text-2xl font-semibold text-white">Finalidad del proyecto</h2>
          <ul className="mt-6 space-y-4 text-gray-300">
            <li className="rounded-xl border border-gray-800 bg-gray-950/60 p-4">
              Ofrecer un espacio seguro y moderado para desahogarse y conectar con otros alumnos
              UTP.
            </li>
            <li className="rounded-xl border border-gray-800 bg-gray-950/60 p-4">
              Publicar con identidad de cuenta (nombre y usuario), sin pseudónimos arbitrarios, para
              fomentar responsabilidad en lo que se comparte.
            </li>
            <li className="rounded-xl border border-gray-800 bg-gray-950/60 p-4">
              Permitir interacción social: comentarios, me gusta y reposteos, similar a redes
              conocidas pero adaptado a la comunidad universitaria.
            </li>
          </ul>
        </section>

        <section id="equipo" className="mx-auto mt-16 max-w-4xl">
          <h2 className="text-2xl font-semibold text-white">Quiénes lo desarrollaron</h2>
          <p className="mt-2 text-gray-400">
            Proyecto académico UniConfess. Actualiza los nombres de tu equipo en este archivo cuando
            lo entreguen oficialmente.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TEAM.map((member) => (
              <article
                key={member.name}
                className="rounded-2xl border border-gray-800 bg-gray-950/80 p-6 shadow-lg"
              >
                <h3 className="text-lg font-semibold text-indigo-300">{member.name}</h3>
                <p className="mt-1 text-sm font-medium text-white">{member.role}</p>
                <p className="mt-3 text-sm text-gray-400">{member.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="reglas" className="mx-auto mt-16 max-w-3xl">
          <h2 className="text-2xl font-semibold text-white">Reglas básicas</h2>
          <p className="mt-4 text-gray-400">
            No acoso, amenazas, datos personales de otras personas ni contenido de odio. Las cuentas
            que incumplan pueden ser restringidas cuando exista moderación en servidor.
          </p>
        </section>

        <section id="privacidad" className="mx-auto mt-12 max-w-3xl pb-8">
          <h2 className="text-2xl font-semibold text-white">Privacidad</h2>
          <p className="mt-4 text-gray-400">
            En esta versión de demostración, usuarios y publicaciones se guardan en el navegador
            (localStorage). Al conectar el backend, la política de datos se actualizará según lo que
            acuerden con la universidad.
          </p>
        </section>
      </div>
    </div>
  );
}

export default About;
