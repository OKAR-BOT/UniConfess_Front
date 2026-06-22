import { createPortal } from 'react-dom';
import { useRealtime } from '../context/RealtimeContext';

export default function NotificationTray() {
  const { notifications, dismissNotification, connected } = useRealtime();
  const trayStyle = {
    top: '10rem',
    right: '1rem',
    left: 'auto',
    width: 'min(32rem, calc(100vw - 2rem))',
    maxHeight: 'calc(100vh - 11rem)',
  };

  if (!connected && notifications.length === 0) {
    return null;
  }

  const tray = (
    <div
      className="fixed z-[9999] flex flex-col gap-3 overflow-y-auto"
      style={trayStyle}
    >
      {notifications.map((item) => (
        <article
          key={item.id}
          className="relative min-h-[7rem] w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-900/10 backdrop-blur-md transition hover:shadow-xl"
          style={{ backgroundColor: '#ffffff', color: '#111827' }}
        >
          <div className="grid grid-cols-[1fr_auto] items-start gap-3">
            <div className="min-w-0">
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 size-2.5 shrink-0 rounded-full ${item.type === 'otp' ? 'bg-amber-500' : 'bg-utp-red'}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black leading-tight" style={{ color: '#111827' }}>
                    {item.title || 'Notificacion'}
                  </p>
                  <p className="mt-1 break-words text-sm leading-5" style={{ color: '#111827' }}>
                    {item.message || (item.type === 'confession' ? 'Nueva publicacion disponible.' : 'Notificacion disponible.')}
                  </p>
                </div>
              </div>

              {item.code ? (
                <div className="mt-3 flex items-center gap-2">
                  <code className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-1.5 text-sm font-bold tracking-[0.35em] text-amber-500">
                    {item.code}
                  </code>
                  <button
                    type="button"
                    onClick={async (e) => {
                      e.stopPropagation();
                      try {
                        await navigator.clipboard.writeText(item.code);
                      } catch {
                        // ignore clipboard failures
                      }
                    }}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold transition hover:border-utp-red hover:text-utp-red"
                    style={{ color: '#111827' }}
                  >
                    Copiar
                  </button>
                </div>
              ) : null}

              <div className="mt-3 flex items-center justify-between gap-3">
                {item.link ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      dismissNotification(item.id);
                      window.location.assign(item.link);
                    }}
                    className="inline-flex items-center rounded-lg border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-semibold transition hover:border-utp-red hover:bg-white hover:text-utp-red"
                    style={{ color: '#111827' }}
                  >
                    Abrir publicacion
                  </button>
                ) : (
                  <span />
                )}

                <span className="text-[11px]" style={{ color: '#374151' }}>
                  {new Date(item.createdAt).toLocaleTimeString('es-PE', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                dismissNotification(item.id);
              }}
              className="shrink-0 rounded-full bg-white px-2 py-0.5 text-lg leading-none text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
              style={{ color: '#111827' }}
              aria-label="Cerrar notificacion"
            >
              &times;
            </button>
          </div>
        </article>
      ))}
    </div>
  );

  if (typeof document === 'undefined') {
    return tray;
  }

  return createPortal(tray, document.body);
}
