import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-2xl animate-bounce-in ${
      type === 'success' ? 'bg-utp-green' : 'bg-utp-red'
    }`}>
      <span>{type === 'success' ? '✅' : '❌'}</span>
      {message}
    </div>
  );
}

function ConfirmModal({ title, message, confirmLabel, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="card-utp w-full max-w-md p-6">
        <h3 className="text-lg font-black text-theme">{title}</h3>
        <p className="mt-2 text-sm text-theme-secondary">{message}</p>
        <div className="mt-6 flex gap-3 justify-end">
          <button type="button" onClick={onCancel} className="btn-utp-secondary px-4 py-2 text-xs">Cancelar</button>
          <button type="button" onClick={onConfirm} className="btn-utp-primary px-4 py-2 text-xs">{confirmLabel || 'Confirmar'}</button>
        </div>
      </div>
    </div>
  );
}

function SkeletonTable() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 animate-pulse">
          <div className="size-10 rounded-xl bg-white/10" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-36 rounded bg-white/10" />
            <div className="h-3 w-24 rounded bg-white/10" />
          </div>
          <div className="h-4 w-16 rounded bg-white/10" />
          <div className="h-4 w-20 rounded bg-white/10" />
          <div className="h-8 w-24 rounded bg-white/10" />
        </div>
      ))}
    </div>
  );
}

function AdminUsers() {
  const { getAllUsers, updateUserRole, toggleUserBan, refresh } = useAuth();

  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [page, setPage] = useState(1);
  const perPage = 8;

  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const showToast = useCallback((message, type) => {
    setToast({ message, type });
  }, []);

  const loadUsers = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setAllUsers(getAllUsers());
      setLoading(false);
    }, 400);
  }, [getAllUsers]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filtered = useMemo(() => {
    let list = allUsers;
    const q = search.toLowerCase().trim();
    if (q) {
      list = list.filter((u) =>
        u.displayName.toLowerCase().includes(q) ||
        u.handle.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    }
    if (filterRole !== 'all') {
      list = list.filter((u) => u.role === filterRole);
    }
    return list;
  }, [allUsers, search, filterRole]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * perPage, safePage * perPage);

  useEffect(() => {
    if (safePage !== page) setPage(safePage);
  }, [safePage, page]);

  function handleRoleChange(userId, newRole) {
    setConfirm({
      title: 'Cambiar rol',
      message: `¿Estás seguro de cambiar el rol de este usuario a "${newRole}"?`,
      confirmLabel: 'Cambiar',
      onConfirm: () => {
        try {
          updateUserRole(userId, newRole);
          showToast(`Rol actualizado a ${newRole}`, 'success');
          loadUsers();
          refresh();
        } catch (e) {
          showToast(e.message, 'error');
        }
        setConfirm(null);
      },
    });
  }

  function handleBanToggle(userId, currentBanned) {
    const action = currentBanned ? 'desbanear' : 'banear';
    setConfirm({
      title: `${currentBanned ? 'Desbanear' : 'Banear'} usuario`,
      message: `¿Estás seguro de ${action} a este usuario?`,
      confirmLabel: currentBanned ? 'Desbanear' : 'Banear',
      onConfirm: () => {
        try {
          toggleUserBan(userId);
          showToast(`Usuario ${currentBanned ? 'desbaneado' : 'baneado'}`, 'success');
          loadUsers();
          refresh();
        } catch (e) {
          showToast(e.message, 'error');
        }
        setConfirm(null);
      },
    });
  }

  return (
    <div className="p-6 sm:p-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {confirm && <ConfirmModal {...confirm} onCancel={() => setConfirm(null)} />}

      <div className="mb-6">
        <h1 className="text-2xl font-black text-theme">Gestión de Usuarios</h1>
        <p className="mt-1 text-sm text-theme-secondary">
          {filtered.length} usuario{filtered.length !== 1 ? 's' : ''}{search || filterRole !== 'all' ? ' filtrados' : ''}
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          placeholder="Buscar por nombre, usuario o correo…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="input-utp flex-1 px-4 py-2.5 text-sm"
        />
        <select
          value={filterRole}
          onChange={(e) => { setFilterRole(e.target.value); setPage(1); }}
          className="input-utp w-full sm:w-44 px-4 py-2.5 text-sm"
        >
          <option value="all">Todos los roles</option>
          <option value="user">Usuario</option>
          <option value="premium">Premium</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {loading ? (
        <div className="card-utp p-6">
          <SkeletonTable />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-utp flex flex-col items-center justify-center py-16 text-center">
          <span className="text-5xl opacity-30">🔍</span>
          <p className="mt-4 text-lg font-bold text-theme">
            {search || filterRole !== 'all' ? 'Sin resultados' : 'No hay usuarios'}
          </p>
          <p className="mt-1 text-sm text-theme-muted">
            {search || filterRole !== 'all'
              ? 'Intenta con otros términos o filtros.'
              : 'Aún no se ha registrado ningún usuario.'}
          </p>
          {(search || filterRole !== 'all') && (
            <button
              type="button"
              onClick={() => { setSearch(''); setFilterRole('all'); }}
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
                  <th className="px-4 py-3 font-bold uppercase tracking-wider text-theme-muted text-xs">Usuario</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider text-theme-muted text-xs hidden sm:table-cell">Email</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider text-theme-muted text-xs hidden md:table-cell">Carrera</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider text-theme-muted text-xs">Rol</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider text-theme-muted text-xs hidden lg:table-cell">Estado</th>
                  <th className="px-4 py-3 font-bold uppercase tracking-wider text-theme-muted text-xs">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                {paginated.map((u) => (
                  <tr key={u.id} className="transition-colors hover:bg-white/5">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl font-bold text-xs" style={{ background: 'color-mix(in srgb, var(--color-utp-red) 15%, transparent)', color: 'var(--color-utp-red)' }}>
                          {u.displayName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-theme">{u.displayName}</p>
                          <p className="truncate text-xs text-utp-red">@{u.handle}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-theme-secondary hidden sm:table-cell">{u.email}</td>
                    <td className="px-4 py-3 text-theme-muted text-xs hidden md:table-cell">{u.career}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        u.role === 'admin'
                          ? 'bg-utp-red/15 text-utp-red'
                          : u.role === 'premium'
                          ? 'bg-utp-green/15 text-utp-green'
                          : 'text-theme-muted'
                      }`} style={u.role === 'user' ? { background: 'color-mix(in srgb, var(--color-text-muted) 12%, transparent)' } : {}}>
                        {u.role === 'premium' ? '⭐ Premium' : u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                        u.isBanned ? 'text-utp-red' : 'text-utp-green'
                      }`}>
                        <span className={`size-1.5 rounded-full ${u.isBanned ? 'bg-utp-red' : 'bg-utp-green'}`} />
                        {u.isBanned ? 'Baneado' : 'Activo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="rounded-lg border px-2 py-1 text-xs font-semibold cursor-pointer"
                          style={{ borderColor: 'var(--color-border-strong)', background: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                        >
                          <option value="user">User</option>
                          <option value="premium">Premium</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => handleBanToggle(u.id, u.isBanned)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                            u.isBanned
                              ? 'text-utp-green hover:bg-utp-green/10'
                              : 'text-utp-red hover:bg-utp-red/10'
                          }`}
                        >
                          {u.isBanned ? 'Desbanear' : 'Banear'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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

export default AdminUsers;
