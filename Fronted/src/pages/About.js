import { Link } from 'react-router-dom';
import MeshBackground from '../components/MeshBackground';

const TEAM = [
  {
    name: 'Equipo Frontend',
    role: 'Interfaz, feed y experiencia de usuario',
    detail: 'React, Tailwind CSS, componentes de publicaciones e interacciones.',
    emoji: '🎨',
  },
  {
    name: 'Equipo Backend',
    role: 'API y persistencia (en integración)',
    detail: 'Servicios REST, autenticación y base de datos del proyecto UniConfess.',
    emoji: '⚙️',
  },
  {
    name: 'Equipo UTP',
    role: 'Producto y comunidad',
    detail: 'Definición de reglas, pruebas con estudiantes y alineación con la comunidad UTP.',
    emoji: '🎓',
  },
];

function About() {
  return (
    <div className="page-shell">
      <div className="relative mx-auto max-w-7xl px-6 py-16 sm:py-24 lg:px-8">
        <div className="relative isolate overflow-hidden rounded-[2rem] px-6 py-16 sm:px-12 lg:px-16">
          <MeshBackground variant="hero" />
          <div className="card-utp relative z-10 mx-auto max-w-3xl text-center lg:text-left">
            <p className="badge-live w-fit lg:mx-0 mx-auto">About us</p>
            <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              UConfess · <span className="text-gradient-utp">Confesiones UTP</span>
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-theme-secondary">
              Somos un proyecto estudiantil para la{' '}
              <strong className="text-utp-red">Universidad Tecnológica del Perú</strong>: una red
              social ligera donde compartir confesiones, chismes de campus y experiencias del día a
              día universitario, con respeto y sin exponer datos sensibles de terceros.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4 lg:justify-start">
              <Link to="/feed" className="btn-utp-primary px-5 py-2.5">
                Ver el feed
              </Link>
              <Link to="/" className="btn-utp-secondary px-5 py-2.5">
                Inicio
              </Link>
              <Link to="/register" className="btn-utp-ghost px-5 py-2.5">
                Crear cuenta
              </Link>
            </div>
          </div>
        </div>

        <section id="finalidad" className="mx-auto mt-16 max-w-3xl">
          <h2 className="text-2xl font-black text-theme">Finalidad del proyecto</h2>
          <ul className="mt-6 space-y-4 text-theme-secondary">
            {[
              'Ofrecer un espacio seguro y moderado para desahogarse y conectar con otros alumnos UTP.',
              'Publicar con identidad de cuenta (nombre y usuario), sin pseudónimos arbitrarios, para fomentar responsabilidad en lo que se comparte.',
              'Permitir interacción social: comentarios, me gusta y reposteos, similar a redes conocidas pero adaptado a la comunidad universitaria.',
            ].map((text) => (
              <li key={text} className="card-utp-interactive text-sm leading-relaxed">
                {text}
              </li>
            ))}
          </ul>
        </section>

        <section id="equipo" className="mx-auto mt-16 max-w-4xl">
          <h2 className="text-2xl font-black text-theme">Quiénes lo desarrollaron</h2>
          <p className="mt-2 text-theme-muted">
            Proyecto académico UniConfess. Actualiza los nombres de tu equipo en este archivo cuando
            lo entreguen oficialmente.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TEAM.map((member) => (
              <article key={member.name} className="card-utp-interactive group">
                <span className="text-3xl">{member.emoji}</span>
                <h3 className="mt-3 text-lg font-black text-utp-red">{member.name}</h3>
                <p className="mt-1 text-sm font-bold text-theme">{member.role}</p>
                <p className="mt-3 text-sm text-theme-secondary">{member.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="reglas" className="mx-auto mt-16 max-w-3xl">
          <h2 className="text-2xl font-black text-theme">Reglas básicas</h2>
          <p className="mt-4 text-theme-secondary">
            No acoso, amenazas, datos personales de otras personas ni contenido de odio. Las cuentas
            que incumplan pueden ser restringidas cuando exista moderación en servidor.
          </p>
        </section>

        <section id="privacidad" className="mx-auto mt-12 max-w-3xl pb-8">
          <h2 className="text-2xl font-black text-theme">Privacidad</h2>
          <p className="mt-4 text-theme-secondary">
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
