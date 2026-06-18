import { Link } from 'react-router-dom';

function UtpLogo({ className = '' }) {
  return (
    <Link to="/" className={`group inline-flex items-center gap-2.5 ${className}`}>
      <span className="flex leading-none" aria-hidden>
        <span className="logo-block--red transition-transform group-hover:-rotate-3">U</span>
        <span className="logo-block--dark -ml-0.5 transition-transform group-hover:rotate-3">C</span>
      </span>
      <span className="flex flex-col leading-tight text-white">
        <span className="text-base font-black tracking-tight sm:text-lg">onfess</span>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
          Comunidad UTP
        </span>
      </span>
    </Link>
  );
}

export default UtpLogo;
