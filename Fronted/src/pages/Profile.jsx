import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../service/api';
import { formatRelativeTime } from '../utils/formatTime';

export default function Profile() {
  const { handle } = useParams();
  const { user } = useAuth();
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
      const updated = await apiRequest('PUT', `/users/profile/${handle}`, {
        bio: editBio,
        bannerColor: editBanner,
        career: editCareer,
      }, true);
      setProfile(updated);
      setEditing(false);
    } catch (err) {
      alert(err.message || 'Error al guardar');
    } finally {
      setSaving(false);
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
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-utp-red to-amber-500 flex items-center justify-center text-white text-2xl font-bold shrink-0 ${profile.bannerColor ? '-mt-12 border-4 border-theme-bg-secondary' : ''}`}>
              {profile.displayName.charAt(0).toUpperCase()}
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
                  <p className="text-xs text-theme-muted mt-1">
                    Se unió el {new Date(profile.createdAt).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </>
              )}
            </div>
            {isOwner && !editing && (
              <button onClick={() => setEditing(true)} className="text-xs text-utp-red hover:underline shrink-0 mt-1">
                Editar perfil
              </button>
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
