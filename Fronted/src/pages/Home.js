import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MeshBackground from '../components/MeshBackground';

const FEATURES = [
  {
    emoji: '✍️',
    title: 'Publica',
    desc: 'Comparte con tu nombre y usuario. Sin pseudónimos — responsabilidad real.',
    accent: 'red',
  },
  {
    emoji: '💬',
    title: 'Interactúa',
    desc: 'Comenta, da me gusta y repostea. La UTP hablando en voz alta.',
    accent: 'green',
  },
  {
    emoji: '🔥',
    title: 'Explora',
    desc: 'Scroll infinito de confesiones, chismes y historias de campus.',
    accent: 'red',
  },
];

const STATS = [
  { value: '100%', label: 'Comunidad UTP' },
  { value: '24/7', label: 'Feed activo' },
  { value: '∞', label: 'Historias por contar' },
];

function Home() {
  const { user } = useAuth();

  return (
    <div className="page-shell">
      <section className="relative flex min-h-[calc(100vh-4.25rem)] flex-col justify-center overflow-hidden px-6 py-16 sm:py-24">
        <MeshBackground variant="hero" />

        <span className="floating-emoji left-[8%] top-[18%]" style={{ animationDelay: '0s' }}>
          🤫
        </span>
        <span className="floating-emoji right-[10%] top-[25%]" style={{ animationDelay: '-2s' }}>
          🎓
        </span>
        <span className="floating-emoji bottom-[20%] left-[15%]" style={{ animationDelay: '-4s' }}>
          💭
        </span>

        <div className="relative mx-auto max-w-4xl text-center">
          <div className="badge-live mx-auto w-fit">Comunidad en vivo</div>

          <div className="mt-8 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-4">
            <span className="flex text-5xl font-black leading-none sm:text-7xl">
              <span className="logo-block--red sm:px-3 sm:py-2">U</span>
              <span className="logo-block--dark -ml-1 sm:-ml-1.5 sm:px-3 sm:py-2">C</span>
            </span>
            <h1 className="text-5xl font-black tracking-tight sm:text-7xl">
              <span className="text-theme">on</span>
              <span className="text-gradient-utp">fess</span>
            </h1>
          </div>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-theme-secondary sm:text-xl">
            El espacio más real del campus UTP. Confesiones, chismes, crushes y anécdotas que solo
            entiende quien vive la{' '}
            <span className="font-bold text-utp-red">Universidad Tecnológica del Perú</span>.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/feed" className="btn-utp-primary w-full max-w-xs px-8 py-4 text-base sm:w-auto">
              🔥 Entrar al feed
            </Link>
            {!user ? (
              <Link to="/register" className="btn-utp-secondary w-full max-w-xs px-8 py-4 text-base sm:w-auto">
                Crear cuenta gratis
              </Link>
            ) : (
              <Link to={`/profile/${user.handle}`} className="btn-utp-ghost w-full max-w-xs px-8 py-4 sm:w-auto">
                Mi cuenta →
              </Link>
            )}
          </div>

          {!user ? (
            <p className="mt-6 text-sm text-theme-muted">
              ¿Ya tienes cuenta?{' '}
              <Link to="/login" className="font-bold text-utp-red hover:underline">
                Inicia sesión
              </Link>
            </p>
          ) : null}

          <div className="mx-auto mt-14 grid max-w-2xl grid-cols-3 gap-3 sm:gap-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="stat-chip">
                <p className="text-2xl font-black text-gradient-utp sm:text-3xl">{stat.value}</p>
                <p className="mt-1 text-xs font-semibold text-theme-muted">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-panel">
        <div className="relative mx-auto max-w-5xl">
          <p className="text-center text-sm font-bold uppercase tracking-widest text-utp-red">
            ¿Qué puedes hacer?
          </p>
          <h2 className="mt-2 text-center text-3xl font-black text-theme sm:text-4xl">
            Tu voz, tu campus, tu vibe
          </h2>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <article key={f.title} className="card-utp-interactive group text-center">
                <div
                  className={`mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl text-3xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${
                    f.accent === 'green'
                      ? 'bg-utp-green/15 shadow-[0_8px_24px_var(--color-glow-green)]'
                      : 'bg-utp-red/15 shadow-[0_8px_24px_var(--color-glow-red)]'
                  }`}
                >
                  {f.emoji}
                </div>
                <h3
                  className={`text-xl font-black ${f.accent === 'green' ? 'text-utp-green' : 'text-utp-red'}`}
                >
                  {f.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-theme-secondary">{f.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-20 pt-4">
        <div className="quote-strip mx-auto max-w-4xl">
          <p className="text-lg font-medium italic opacity-90 sm:text-xl">
            &ldquo;Lo que pasa en el campus no se queda en el campus… se confiesa aquí.&rdquo;
          </p>
          <p className="mt-4 text-sm font-bold uppercase tracking-widest opacity-70">
            — La comunidad UConfess
          </p>
          <Link
            to="/about"
            className="mt-6 inline-flex rounded-xl bg-white/15 px-5 py-2 text-sm font-bold backdrop-blur-sm transition hover:bg-white/25"
          >
            Conoce el proyecto →
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
