import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ConfessionsSection from '../components/ConfessionsSection';

function Feed() {
  const location = useLocation();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (location.state?.loginSuccess) {
      setShowSuccess(true);
      window.history.replaceState({}, document.title);
      const timer = setTimeout(() => setShowSuccess(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  return (
    <main className="page-shell">
      {showSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-6 py-3 text-sm font-semibold text-green-600 shadow-lg backdrop-blur-sm">
            Inicio de sesion exitoso
          </div>
        </div>
      )}
      <ConfessionsSection variant="feed" />
    </main>
  );
}

export default Feed;
