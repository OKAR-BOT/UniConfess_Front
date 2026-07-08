import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../service/api';
import { formatRelativeTime } from '../utils/formatTime';
import ConfirmModal from '../components/ConfirmModal';

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
  const [isBlocked, setIsBlocked] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError('');
    Promise.all([
      apiRequest('GET', `/users/profile/${handle}`),
      apiRequest('GET', `/users/profile/${handle}/confessions`),
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
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen debe ser menor a 5MB.');
      return;
    }
    setUploadingAvatar(true);
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
      await createReport({ reportedUserId: profile.id, reason: confirmReport });
      setConfirmReport(null);
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
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="" className="w-16 h-16 rounded-full object-cover border border-theme" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-utp-red to-amber-500 flex items-center justify-center text-white text-2xl font-bold">
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
                  onClick={() => setConfirmReport(`Reportar usuario ${profile.displayName} (@${profile.handle})`)}
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

      <ConfirmModal
        open={!!confirmReport}
        title="Reportar usuario"
        message={confirmReport || 'Al reportar, un administrador revisara el perfil.'}
        confirmLabel="Reportar"
        cancelLabel="Cancelar"
        variant="warning"
        onConfirm={handleReportUser}
        onCancel={() => setConfirmReport(null)}
      />

      {filtered.length === 0 ? (
        <p className="text-center text-theme-muted py-8">
          {tab === 'confessions' ? 'No hay confesiones aún.' : 'No hay reposts aún.'}
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <div key={c.id} className={`bg-theme-bg-secondary rounded-xl border p-4 ${c.isPinned ? 'border-amber-500' : 'border-theme-border'}`}>
              <div className="flex items-center gap-2 mb-2">
                {c.isPinned && <span className="text-xs text-amber-500 font-semibold">📌 Fijado</span>}
                <span className="text-xs text-theme-muted">
                  {formatRelativeTime(c.createdAt)}
                </span>
                <span className="category-pill">{c.category}</span>
                {c.isRepost && <span className="text-xs text-theme-muted">(repost)</span>}
              </div>
              <Link to={`/confession/${c.id}`} className="text-sm text-theme hover:text-utp-red transition-colors">
                {c.title && <h3 className="font-semibold mb-1">{c.title}</h3>}
                <p className="whitespace-pre-wrap break-words">{c.body}</p>
              </Link>
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
    </div>
  );
}
