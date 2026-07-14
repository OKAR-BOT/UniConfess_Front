import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiRequest, getImageUrl } from '../service/api';
import { formatRelativeTime } from '../utils/formatTime';
import ConfirmModal from '../components/ConfirmModal';
import ConfessionModal from '../components/ConfessionModal';
import { listConfessions } from '../service/confessionsApi';

export default function Profile() {
  const { handle } = useParams();
  const { user, logout, blockUser, unblockUser, createReport, uploadAvatar } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [confessions, setConfessions] = useState([]);
  const [tab, setTab] = useState('confessions');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [editBanner, setEditBanner] = useState('');
  const [editCareer, setEditCareer] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmBlock, setConfirmBlock] = useState(null);
  const [confirmReport, setConfirmReport] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [selectedConfession, setSelectedConfession] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError('');
    setAvatarError(false);
    Promise.all([
      apiRequest('GET', `/users/profile/${handle}`, null, true),
      apiRequest('GET', `/users/profile/${handle}/confessions`, null, true),
    ])
      .then(([profileRes, confessionsRes]) => {
        setProfile(profileRes);
        setConfessions(confessionsRes);
        setEditBio(profileRes.bio || '');
        setEditBanner(profileRes.bannerColor || '');
        setEditCareer(profileRes.career || '');
      })
      .catch((err) => setError(err.message || 'Error al cargar perfil'))
      .finally(() => setLoading(false));

    listConfessions().then((all) => {
      const userPosts = (all || []).filter((c) => c.handle === handle?.toLowerCase());
      setRecentActivity(userPosts.slice(0, 3));
    }).catch(() => {});
  }, [handle]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = { career: editCareer };
      if (isPremiumOrAdmin) {
        body.bio = editBio;
        body.bannerColor = editBanner;
      }
      const updated = await apiRequest('PUT', `/users/profile/${handle}`, body, true);
      setProfile(updated);
      setEditing(false);
    } catch (err) {
      alert(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert('La imagen debe ser menor a 10MB.');
      return;
    }
    setUploadingAvatar(true);
    setAvatarError(false);
    try {
      const updated = await uploadAvatar(handle, file);
      setProfile((prev) => ({ ...prev, avatarUrl: updated.avatarUrl }));
      if (user && user.handle.toLowerCase() === handle.toLowerCase()) {
        const storedUser = JSON.parse(localStorage.getItem('uconfess_user') || '{}');
        storedUser.avatarUrl = updated.avatarUrl;
        localStorage.setItem('uconfess_user', JSON.stringify(storedUser));
      }
    } catch (err) {
      alert(err.message || 'Error al subir avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleBlockUser = async () => {
    try {
      await blockUser(profile.id);
      setIsBlocked(true);
      setConfirmBlock(null);
    } catch (err) {
      alert(err.message || 'Error al bloquear');
    }
  };

  const handleUnblockUser = async () => {
    try {
      await unblockUser(profile.id);
      setIsBlocked(false);
    } catch (err) {
      alert(err.message || 'Error al desbloquear');
    }
  };

  const handleReportUser = async () => {
    try {
      await createReport({ reportedUserId: profile.id, reason: reportReason });
      setConfirmReport(null);
      setReportReason('');
    } catch (err) {
      alert(err.message || 'Error al reportar');
    }
  };

  const handlePinToggle = async (confessionId) => {
    try {
      const updated = await apiRequest('PUT', `/confessions/${confessionId}/pin`, {}, true);
      setConfessions((prev) =>
        prev.map((c) => (c.id === confessionId ? { ...c, isPinned: updated.isPinned } : c))
      );
    } catch (err) {
      alert(err.message || 'Error al cambiar pin');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-theme-muted">Cargando perfil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-utp-red">{error}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center p-12">
        <p className="text-theme-muted">Usuario no encontrado.</p>
      </div>
    );
  }

  const isOwner = user && user.handle.toLowerCase() === handle.toLowerCase();
  const isPremiumOrAdmin = user && (user.role === 'premium' || user.role === 'admin');
  const roleBadge = {
    admin: 'bg-red-600 text-white',
    premium: 'bg-amber-500 text-white',
    user: 'bg-gray-500 text-white',
  }[profile.role] || 'bg-gray-500 text-white';

  const filtered = confessions.filter((c) => {
    if (tab === 'confessions') return !c.isRepost;
    if (tab === 'reposts') return c.isRepost;
    return true;
  });

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className={`rounded-xl border border-theme-border overflow-hidden ${profile.bannerColor ? '' : ''}`}>
        {profile.bannerColor && (
          <div className="h-24" style={{ backgroundColor: profile.bannerColor }} />
        )}
        <div className="bg-theme-bg-secondary p-6">
          <div className="flex items-start gap-4">
            <div className={`relative shrink-0 ${profile.bannerColor ? '-mt-12 border-4 border-theme-bg-secondary' : ''}`}>
              {profile.avatarUrl && !avatarError ? (
                <img
                  src={getImageUrl(profile.avatarUrl)}
                  alt=""
                  className="w-20 h-20 rounded-full object-cover border border-theme"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-utp-red to-amber-500 flex items-center justify-center text-white text-2xl font-bold">
                  {profile.displayName.charAt(0).toUpperCase()}
                </div>
              )}
              {isOwner && isPremiumOrAdmin && (
                <div className="absolute -bottom-1 -right-1">
                  {uploadingAvatar ? (
                    <span className="flex size-6 items-center justify-center rounded-full bg-utp-red text-white text-[10px] font-bold animate-pulse">...</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex size-6 items-center justify-center rounded-full bg-utp-red text-white hover:bg-utp-red/80 transition shadow-md"
                      title="Cambiar avatar"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.gif,.webp"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-theme truncate">{profile.displayName}</h1>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded ${roleBadge}`}>
                  {profile.role}
                </span>
              </div>
              <p className="text-sm text-theme-muted">@{profile.handle}</p>
              {editing ? (
                <div className="space-y-2 mt-2">
                  {isPremiumOrAdmin ? (
                    <>
                      <textarea
                        value={editBio}
                        onChange={(e) => setEditBio(e.target.value)}
                        placeholder="Biografía..."
                        className="input-utp w-full text-sm"
                        rows={2}
                      />
                      <input
                        value={editBanner}
                        onChange={(e) => setEditBanner(e.target.value)}
                        placeholder="Color de banner (ej: #1e293b)"
                        className="input-utp w-full text-sm"
                      />
                    </>
                  ) : (
                    <p className="text-xs text-amber-500 mb-1">
                      Actualiza a premium para personalizar tu biografía y banner.
                    </p>
                  )}
                  <input
                    value={editCareer}
                    onChange={(e) => setEditCareer(e.target.value)}
                    placeholder="Carrera"
                    className="input-utp w-full text-sm"
                  />
                  <div className="flex gap-2">
                    <button onClick={handleSave} disabled={saving} className="btn-utp-primary text-xs px-3 py-1">
                      {saving ? '...' : 'Guardar'}
                    </button>
                    <button onClick={() => setEditing(false)} className="btn-utp-secondary text-xs px-3 py-1">
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {profile.bio && <p className="text-sm text-theme mt-1">{profile.bio}</p>}
                  <p className="text-sm text-theme mt-1">{profile.career}</p>
                  {isOwner && <p className="text-xs text-theme-muted mt-1">{profile.email}</p>}
                  <p className="text-xs text-theme-muted mt-1">
                    Se unió el {new Date(profile.createdAt).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                  {profile.role === 'premium' && profile.membershipExpiresAt && (
                    <p className="text-xs text-amber-500 mt-1 font-semibold">
                      Membresía premium hasta {new Date(profile.membershipExpiresAt).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  )}
                </>
              )}
            </div>
            {isOwner && !editing && (
              <div className="flex flex-col gap-1 shrink-0 mt-1">
                <button onClick={() => setEditing(true)} className="text-xs text-utp-red hover:underline">
                  Editar perfil
                </button>
                <button onClick={() => { logout(); navigate('/'); }} className="text-xs text-theme-muted hover:text-utp-red transition-colors">
                  Cerrar sesion
                </button>
              </div>
            )}
            {!isOwner && user && (
              <div className="flex flex-col gap-1 shrink-0 mt-1">
                {isBlocked ? (
                  <button onClick={handleUnblockUser} className="text-xs text-green-500 hover:underline">
                    Desbloquear
                  </button>
                ) : (
                  <button onClick={() => setConfirmBlock(profile.id)} className="text-xs text-utp-red hover:underline">
                    Bloquear
                  </button>
                )}
                <button
                  onClick={() => setConfirmReport(true)}
                  className="text-xs text-amber-500 hover:underline"
                >
                  Reportar
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-6 mt-4 pt-4 border-t border-theme-border">
            <div className="text-center">
              <p className="text-lg font-bold text-theme">{profile.stats.confessions}</p>
              <p className="text-xs text-theme-muted">Confesiones</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-theme">{profile.stats.comments}</p>
              <p className="text-xs text-theme-muted">Comentarios</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-theme">{profile.stats.likesGiven}</p>
              <p className="text-xs text-theme-muted">Likes dados</p>
            </div>
          </div>
          {isOwner && user?.role === 'admin' && (
            <div className="mt-4 pt-4 border-t border-theme-border">
              <Link to="/admin" className="text-xs font-semibold text-utp-red hover:underline">
                Panel de Administración
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="flex border-b border-theme-border mb-4">
        <button
          onClick={() => setTab('confessions')}
          className={`flex-1 py-2 text-sm font-semibold text-center transition-colors ${
            tab === 'confessions' ? 'text-utp-red border-b-2 border-utp-red' : 'text-theme-muted hover:text-theme'
          }`}
        >
          Confesiones
        </button>
        <button
          onClick={() => setTab('reposts')}
          className={`flex-1 py-2 text-sm font-semibold text-center transition-colors ${
            tab === 'reposts' ? 'text-utp-red border-b-2 border-utp-red' : 'text-theme-muted hover:text-theme'
          }`}
        >
          Reposts
        </button>
      </div>

      <ConfirmModal
        open={!!confirmBlock}
        title="Bloquear usuario"
        message={`¿Seguro que quieres bloquear a ${profile.displayName}? No podras ver sus publicaciones ni interactuar con el/ella.`}
        confirmLabel="Bloquear"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={handleBlockUser}
        onCancel={() => setConfirmBlock(null)}
      />

      {confirmReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="card-utp w-full max-w-md p-6 border border-theme rounded-2xl shadow-2xl animate-modal-in" style={{ background: 'var(--color-card-solid)', backdropFilter: 'none' }}>
            <h3 className="text-base font-black text-theme text-center mb-4">Reportar usuario</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleReportUser(); }}>
              <label className="block text-xs font-bold text-theme-muted uppercase tracking-wider mb-2">
                Motivo del reporte
              </label>
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder="Explica por que reportas a este usuario..."
                className="input-utp w-full text-sm resize-none"
                rows={4}
                minLength={10}
                required
              />
              <p className="text-[10px] text-theme-muted mt-1 mb-4">Minimo 10 caracteres.</p>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => { setConfirmReport(null); setReportReason(''); }} className="btn-utp-secondary px-4 py-2 text-sm">
                  Cancelar
                </button>
                <button type="submit" className="btn-utp-primary px-4 py-2 text-sm font-bold" disabled={reportReason.trim().length < 10}>
                  Reportar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isOwner && isPremiumOrAdmin && (
        <div className="mt-4 mb-4 p-4 rounded-xl border border-theme-border bg-theme-bg-secondary">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm font-bold text-theme">Foto de perfil</p>
              <p className="text-xs text-theme-muted">JPG, PNG o WebP. Maximo 10MB.</p>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="btn-utp-primary text-xs px-4 py-2"
            >
              {uploadingAvatar ? 'Subiendo...' : 'Cambiar foto'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.gif,.webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
        </div>
      )}

      {profile.bio || profile.avatarUrl ? null : isOwner && (
        <div className="mt-4 mb-4 p-4 rounded-xl border border-dashed border-amber-500/50 bg-amber-500/5">
          <p className="text-xs font-semibold text-amber-500">
            Tu perfil se ve vacio. Sube una foto de perfil y agrega una biografia para personalizarlo. (Premium)
          </p>
        </div>
      )}

      {recentActivity.length > 0 && (
        <div className="mt-4 mb-4 p-4 rounded-xl border border-theme-border bg-theme-bg-secondary">
          <p className="text-xs font-bold uppercase tracking-wider text-theme-muted mb-3">Actividad reciente</p>
          <div className="space-y-2">
            {recentActivity.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedConfession(c)}
                className="w-full text-left p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <p className="text-xs text-theme-muted">{c.category} &middot; {formatRelativeTime(c.createdAt)}</p>
                <p className="text-sm text-theme truncate">{c.body}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-center text-theme-muted py-8">
          {tab === 'confessions' ? (
            isOwner ? 'Aun no has publicado nada. Crea tu primera confesion en el feed.' : 'No hay confesiones aun.'
          ) : 'No hay reposts aun.'}
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <div key={c.id} className={`bg-theme-bg-secondary rounded-xl border p-4 ${c.isPinned ? 'border-amber-500' : 'border-theme-border'}`}>
              <div className="flex items-center gap-2 mb-2">
                {c.isPinned && <span className="text-xs text-amber-500 font-semibold">Fijado</span>}
                <span className="text-xs text-theme-muted">
                  {formatRelativeTime(c.createdAt)}
                </span>
                <span className="category-pill">{c.category}</span>
                {c.isRepost && <span className="text-xs text-theme-muted">(repost)</span>}
              </div>
              <button
                type="button"
                onClick={() => setSelectedConfession(c)}
                className="w-full text-left text-sm text-theme hover:text-utp-red transition-colors"
              >
                {c.title && <h3 className="font-semibold mb-1">{c.title}</h3>}
                <p className="whitespace-pre-wrap break-words">{c.body}</p>
              </button>
              {isOwner && isPremiumOrAdmin && tab === 'confessions' && (
                <button
                  onClick={() => handlePinToggle(c.id)}
                  className={`text-xs mt-2 transition-colors ${c.isPinned ? 'text-amber-500 hover:text-amber-600' : 'text-theme-muted hover:text-amber-500'}`}
                >
                  {c.isPinned ? 'Quitar pin' : 'Fijar en perfil'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedConfession && (
        <ConfessionModal
          confession={selectedConfession}
          onClose={() => setSelectedConfession(null)}
        />
      )}

      {uploadingAvatar && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70">
          <div className="card-utp p-8 rounded-2xl flex flex-col items-center gap-4 shadow-2xl">
            <svg className="animate-spin h-8 w-8 text-utp-red" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm font-bold text-theme">Comprimiendo y subiendo imagen...</p>
            <p className="text-xs text-theme-muted">Esto puede tomar unos segundos.</p>
          </div>
        </div>
      )}
    </div>
  );
}
