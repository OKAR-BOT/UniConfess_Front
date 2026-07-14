import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatRelativeTime } from '../../utils/formatTime';

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-2xl ${
      type === 'success' ? 'bg-green-600' : 'bg-utp-red'
    }`}>
      {message}
    </div>
  );
}

function ConfirmModal({ open, title, message, confirmLabel, cancelLabel, variant, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="card-utp p-6 rounded-2xl max-w-sm w-full border border-theme shadow-2xl animate-modal-in">
        <h3 className="font-bold text-theme text-center mb-2">{title}</h3>
        <p className="text-sm text-theme-muted text-center mb-4 whitespace-pre-wrap">{message}</p>
        <div className="flex justify-center gap-3">
          <button onClick={onCancel} className="btn-utp-secondary px-4 py-2 text-sm">{cancelLabel || 'Cancelar'}</button>
          <button onClick={onConfirm} className={`px-4 py-2 text-sm font-bold text-white rounded-xl transition ${
            variant === 'danger' ? 'bg-utp-red hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
          }`}>{confirmLabel || 'Confirmar'}</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminReports() {
  const { getReports, reviewReport } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState(null);
  const [toast, setToast] = useState(null);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getReports();
      setReports(data);
    } catch (err) {
      setToast({ message: 'Error al cargar reportes', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [getReports]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleReview = async () => {
    if (!confirmAction) return;
    try {
      await reviewReport(confirmAction.id, confirmAction.status);
      setToast({ message: `Reporte ${confirmAction.status === 'approved' ? 'aprobado' : 'rechazado'}`, type: 'success' });
      setConfirmAction(null);
      loadReports();
    } catch (err) {
      setToast({ message: err.message || 'Error al revisar reporte', type: 'error' });
    }
  };

  if (loading) {
    return <p className="text-theme-muted text-center py-8">Cargando reportes...</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-black text-theme mb-6">Reportes</h2>

      {reports.length === 0 ? (
        <p className="text-theme-muted text-center py-8">No hay reportes pendientes.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-theme-border text-theme-muted text-xs uppercase tracking-wider">
                <th className="py-3 px-2">Reportero</th>
                <th className="py-3 px-2">Reportado</th>
                <th className="py-3 px-2">Strikes</th>
                <th className="py-3 px-2">Tipo</th>
                <th className="py-3 px-2">Motivo</th>
                <th className="py-3 px-2">Estado</th>
                <th className="py-3 px-2">Fecha</th>
                <th className="py-3 px-2">Accion</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="border-b border-theme-border hover:bg-theme-bg/50 transition-colors">
                  <td className="py-3 px-2 text-theme font-medium">{r.reporter?.displayName || 'N/A'}</td>
                  <td className="py-3 px-2">
                    {r.reportedUser ? (
                      <span className="text-theme">{r.reportedUser.displayName}</span>
                    ) : r.confession ? (
                      <span className="text-theme-muted">Confesion #{r.confession.id?.slice(0, 8)}</span>
                    ) : (
                      <span className="text-theme-muted">N/A</span>
                    )}
                  </td>
                  <td className="py-3 px-2">
                    {r.reportedUser ? (
                      <span className={`text-xs font-bold ${(r.reportedUser.reportStrikes || 0) >= 10 ? 'text-utp-red' : 'text-theme-muted'}`}>
                        {r.reportedUser.reportStrikes || 0}/10
                      </span>
                    ) : (
                      <span className="text-theme-muted">-</span>
                    )}
                  </td>
                  <td className="py-3 px-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      r.reportedUserId ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {r.reportedUserId ? 'Usuario' : 'Confesion'}
                    </span>
                  </td>
                  <td className="py-3 px-2 max-w-xs">
                    <p className="truncate text-theme-muted" title={r.reason}>{r.reason}</p>
                  </td>
                  <td className="py-3 px-2">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      r.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      r.status === 'approved' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {r.status === 'pending' ? 'Pendiente' : r.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-theme-muted text-xs">{formatRelativeTime(r.createdAt)}</td>
                  <td className="py-3 px-2">
                    {r.status === 'pending' && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => setConfirmAction({ id: r.id, status: 'approved' })}
                          className="text-xs font-bold text-green-600 hover:underline"
                        >
                          Aprobar
                        </button>
                        <button
                          onClick={() => setConfirmAction({ id: r.id, status: 'rejected' })}
                          className="text-xs font-bold text-utp-red hover:underline"
                        >
                          Rechazar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        open={!!confirmAction}
        title={confirmAction?.status === 'approved' ? 'Aprobar reporte' : 'Rechazar reporte'}
        message={`¿Seguro que quieres ${confirmAction?.status === 'approved' ? 'aprobar' : 'rechazar'} este reporte?`}
        confirmLabel={confirmAction?.status === 'approved' ? 'Aprobar' : 'Rechazar'}
        cancelLabel="Cancelar"
        variant={confirmAction?.status === 'approved' ? 'success' : 'danger'}
        onConfirm={handleReview}
        onCancel={() => setConfirmAction(null)}
      />

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
