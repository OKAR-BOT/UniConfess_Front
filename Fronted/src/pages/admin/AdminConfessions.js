import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { listConfessions } from '../../service/confessionsApi';
import { formatRelativeTime } from '../../utils/formatTime';

const CATEGORIES = [
  'Todas',
  'General',
  'Confesion',
  'Chisme',
  'Campus / UTP',
  'Crush',
  'Otro',
];

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-2xl ${
      type === 'success' ? 'bg-utp-green' : 'bg-utp-red'
    }`}>
      <span>{type === 'success' ? '✅' : '❌'}</span>
      {message}
    </div>
  );
}

function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="card-utp w-full max-w-md p-6">
        <h3 className="text-lg font-black text-theme">{title}</h3>
        <p className="mt-2 text-sm text-theme-secondary">{message}</p>
        <div className="mt-6 flex gap-3 justify-end">
          <button type="button" onClick={onCancel} className="btn-utp-secondary px-4 py-2 text-xs">Cancelar</button>
          <button type="button" onClick={onConfirm} className="btn-utp-primary px-4 py-2 text-xs">Eliminar</button>
        </div>
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 border-b py-4 animate-pulse" style={{ borderColor: 'var(--color-border)' }}>
      <div className="flex-1 space-y-2">
        <div className="h-4 w-48 rounded bg-white/10" />
        <div className="h-3 w-64 rounded bg-white/10" />
      </div>
      <div className="h-4 w-16 rounded bg-white/10" />
      <div className="h-4 w-20 rounded bg-white/10" />
      <div className="h-8 w-20 rounded bg-white/10" />
    </div>
  );
}

function AdminConfessions() {
  const { deleteConfessionById, refresh } = useAuth();

  const [allConfessions, setAllConfessions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('Todas');
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState({});
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const perPage = 10;

  const showToast = useCallback((message, type) => {
    setToast({ message, type });
  }, []);

  const loadConfessions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listConfessions();
      setAllConfessions(data);
    } catch {
      setAllConfessions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfessions();
  }, [loadConfessions]);

  const filtered = useMemo(() => {
    let list = allConfessions;
    const q = search.toLowerCase().trim();
    if (q) {
      list = list.filter(
        (c) =>
          c.body.toLowerCase().includes(q) ||
          c.displayName.toLowerCase().includes(q) ||
          c.handle.toLowerCase().includes(q)
      );
    }
    if (filterCategory !== 'Todas') {
      list = list.filter((c) => c.category === filterCategory);
    }
    return list;
  }, [allConfessions, search, filterCategory]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * perPage, safePage * perPage);

  useEffect(() => {
    if (safePage !== page) setPage(safePage);
  }, [safePage, page]);

  function handleDelete(postId) {
    setConfirm({
      title: 'Eliminar confesion',
      message: '¿Estas seguro de eliminar esta confesion? Esta accion no se puede deshacer.',
      onConfirm: async () => {
        try {
          await deleteConfessionById(postId);
          setAllConfessions((prev) => prev.filter((c) => c.id !== postId));
          showToast('Confesion eliminada', 'success');
          refresh();
        } catch (e) {
          showToast(e.message || 'Error al eliminar', 'error');
        }
        setConfirm(null);
      },
    });
  }

  function toggleExpand(postId) {
    setExpanded((prev) => ({ ...prev, [postId]: !prev[postId] }));
  }

  return (
    <div className="p-6 sm:p-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {confirm && <ConfirmModal {...confirm} onCancel={() => setConfirm(null)} />}

      <div className="mb-6">
        <h1 className="text-2xl font-black text-theme">Gestion de Confesiones</h1>
        <p className="mt-1 text-sm text-theme-secondary">
          {filtered.length} confesion{filtered.length !== 1 ? 'es' : ''}
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Buscar por contenido o autor..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="input-utp flex-1 px-4 py-2.5 text-sm"
        />
        <select
          value={filterCategory}
          onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
          className="input-utp w-full sm:w-48 px-4 py-2.5 text-sm"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="card-utp p-6">
          <div className="space-y-1">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-utp flex flex-col items-center justify-center py-16 text-center">
          <span className="text-5xl opacity-30">📭</span>
          <p className="mt-4 text-lg font-bold text-theme">
            {search || filterCategory !== 'Todas' ? 'Sin resultados' : 'No hay confesiones'}
          </p>
          <p className="mt-1 text-sm text-theme-muted">
            {search || filterCategory !== 'Todas'
              ? 'Intenta con otros terminos o filtros.'
              : 'Aun no se ha publicado ninguna confesion.'}
          </p>
          {(search || filterCategory !== 'Todas') && (
            <button
              type="button"
              onClick={() => { setSearch(''); setFilterCategory('Todas'); }}
              className="btn-utp-ghost mt-4 px-4 py-2 text-xs"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="card-utp overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider text-theme-muted text-xs">Autor</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider text-theme-muted text-xs">Categoria</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider text-theme-muted text-xs">Contenido</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider text-theme-muted text-xs hidden sm:table-cell">Fecha</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider text-theme-muted text-xs">Accion</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                {paginated.map((c) => {
                  const isExpanded = expanded[c.id];
                  const truncated = c.body.length > 80;
                  return (
                    <tr key={c.id} className="transition-colors hover:bg-white/5">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-theme">{c.displayName}</p>
                        <p className="text-xs text-utp-red">@{c.handle}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="category-pill text-[10px]">{c.category}</span>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <p className="text-theme-secondary break-words">
                          {isExpanded || !truncated ? c.body : `${c.body.slice(0, 80)}…`}
                        </p>
                        {truncated && (
                          <button
                            type="button"
                            onClick={() => toggleExpand(c.id)}
                            className="mt-1 text-xs font-bold text-utp-red hover:underline"
                          >
                            {isExpanded ? 'Ver menos' : 'Ver completo'}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-theme-muted hidden sm:table-cell" title={c.createdAt}>
                        {formatRelativeTime(c.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => handleDelete(c.id)}
                          className="btn-utp-ghost px-3 py-1.5 text-xs"
                        >
                          🗑️ Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && filtered.length > perPage && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="btn-utp-secondary px-4 py-2 text-xs disabled:opacity-30"
          >
            ← Anterior
          </button>
          <span className="text-sm font-bold text-theme">
            {safePage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="btn-utp-secondary px-4 py-2 text-xs disabled:opacity-30"
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminConfessions;
