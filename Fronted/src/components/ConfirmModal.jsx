export default function ConfirmModal({
  open, title, message, confirmLabel, cancelLabel,
  onConfirm, onCancel, variant = 'danger',
}) {
  if (!open) return null;

  const iconColor = {
    danger: 'bg-red-100 dark:bg-red-950/50 text-red-500 border-red-200 dark:border-red-800',
    warning: 'bg-amber-100 dark:bg-amber-950/50 text-amber-500 border-amber-200 dark:border-amber-800',
    info: 'bg-blue-100 dark:bg-blue-950/50 text-blue-500 border-blue-200 dark:border-blue-800',
  }[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm mx-auto p-6 text-center border border-theme rounded-2xl shadow-2xl animate-modal-in flex flex-col items-center" style={{ background: 'var(--color-card-solid)', backdropFilter: 'none' }}>
        <div className={`size-14 rounded-full flex items-center justify-center mb-4 border shadow-inner ${iconColor}`}>
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            {variant === 'danger' ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : variant === 'warning' ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            )}
          </svg>
        </div>
        <h4 className="text-base font-black text-theme">{title}</h4>
        {message && <p className="text-xs text-theme-secondary mt-2">{message}</p>}
        <div className="flex gap-3 mt-5 w-full">
          <button
            type="button"
            onClick={onCancel}
            className="btn-utp-secondary flex-1 py-2 text-xs font-bold"
          >
            {cancelLabel || 'Cancelar'}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              variant === 'danger'
                ? 'bg-red-600 text-white hover:bg-red-700'
                : variant === 'warning'
                ? 'bg-amber-500 text-white hover:bg-amber-600'
                : 'bg-utp-red text-white hover:bg-utp-red/80'
            }`}
          >
            {confirmLabel || 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
}
