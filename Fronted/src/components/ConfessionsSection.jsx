import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createConfession, listConfessions } from '../service/confessionsApi';
import {
  addComment,
  getInteractionsForPosts,
  toggleLike,
  toggleRepost,
} from '../service/confessionInteractions';
import { formatRelativeTime } from '../utils/formatTime';

const CATEGORIES = [
  { value: 'General', label: 'General' },
  { value: 'Confesión', label: 'Confesión' },
  { value: 'Chisme', label: 'Chisme' },
  { value: 'Campus', label: 'Campus / UTP' },
  { value: 'Crush', label: 'Crush' },
  { value: 'Otro', label: 'Otro' },
];

const AVATAR =
  'https://img.freepik.com/vector-premium/ilustracion-plana-vectorial-escala-grises-icono-perfil-usuario-avatar-persona-imagen-perfil-silueta-genero-neutral-apto-perfiles-redes-sociales-iconos-protectores-pantalla-como-plantillax9xa_719432-2210.jpg?semt=ais_hybrid&w=740&q=80';

function IconHeart({ filled }) {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
    >
      <path d="M12 21s-6.716-4.432-9-8.5C.5 8.5 3 5 7.5 5c2.5 0 4.5 2 4.5 2S14 5 16.5 5 23.5 8.5 21 12.5 12 21 12 21z" />
    </svg>
  );
}

function IconBubble() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M21 12a8 8 0 10-14 5.5L4 20l2.5-3A8 8 0 0021 12z" />
    </svg>
  );
}

function IconRepost() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M4 9V5h7M20 15v4h-7M5 5l3 3M19 19l-3-3M4 15h16M20 9H4" />
    </svg>
  );
}

/**
 * @param {{ variant?: 'default' | 'feed' }} props
 */
function ConfessionsSection({ variant = 'default' }) {
  const isFeed = variant === 'feed';
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [category, setCategory] = useState('General');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const [interactionMap, setInteractionMap] = useState({});
  const [openComments, setOpenComments] = useState({});
  const [commentDraft, setCommentDraft] = useState({});
  const [commentError, setCommentError] = useState({});

  const syncInteractions = useCallback((list, uid) => {
    setInteractionMap(getInteractionsForPosts(list.map((c) => c.id), uid));
  }, []);

  const refresh = useCallback(async () => {
    setLoadError(null);
    setLoading(true);
    try {
      const data = await listConfessions();
      setItems(data);
      syncInteractions(data, user?.id ?? null);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : 'Error al cargar.');
    } finally {
      setLoading(false);
    }
  }, [syncInteractions, user?.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!loading && items.length) {
      syncInteractions(items, user?.id ?? null);
    }
  }, [user?.id, loading, items, syncInteractions]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user) return;
    setFormError(null);
    setSubmitting(true);
    try {
      const created = await createConfession(
        { body, category },
        {
          userId: user.id,
          displayName: user.displayName,
          handle: user.handle,
          career: user.career,
        }
      );
      setItems((prev) => {
        const next = [created, ...prev.filter((x) => x.id !== created.id)];
        syncInteractions(next, user.id);
        return next;
      });
      setBody('');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No se pudo publicar.');
    } finally {
      setSubmitting(false);
    }
  }

  function onToggleLike(postId) {
    if (!user) return;
    toggleLike(postId, user.id);
    syncInteractions(items, user.id);
  }

  function onToggleRepost(postId) {
    if (!user) return;
    toggleRepost(postId, user.id);
    syncInteractions(items, user.id);
  }

  function onSubmitComment(postId) {
    if (!user) return;
    const text = commentDraft[postId] ?? '';
    setCommentError((prev) => ({ ...prev, [postId]: null }));
    try {
      addComment(postId, {
        userId: user.id,
        displayName: user.displayName,
        handle: user.handle,
        body: text,
      });
      setCommentDraft((prev) => ({ ...prev, [postId]: '' }));
      syncInteractions(items, user.id);
    } catch (err) {
      setCommentError((prev) => ({
        ...prev,
        [postId]: err instanceof Error ? err.message : 'Error',
      }));
    }
  }

  return (
    <section
      id="publicar"
      className={`scroll-mt-24 ${isFeed ? 'pb-32 pt-2' : 'border-t border-theme pb-24 pt-10 sm:pt-16'}`}
    >
      <div
        className={`mx-auto px-4 sm:px-6 ${isFeed ? 'max-w-3xl lg:max-w-4xl' : 'max-w-6xl lg:px-8'}`}
      >
        {isFeed ? (
          <header className="feed-header">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔥</span>
              <div>
                <h1 className="text-lg font-black text-utp-red">Comunidad UTP</h1>
                <p className="text-xs text-theme-muted">Publicaciones · desplázate para ver más</p>
              </div>
            </div>
          </header>
        ) : (
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-black tracking-tight text-theme sm:text-3xl">
              Publicaciones de la comunidad
            </h2>
            <p className="mt-2 text-base text-theme-secondary">
              Comparte, reacciona y comenta con respeto hacia la comunidad UTP.
            </p>
          </div>
        )}

        <div className={`mx-auto ${isFeed ? 'mt-4 max-w-full' : 'mt-10 max-w-4xl'}`}>
          {user ? (
            <form onSubmit={handleSubmit} className="card-utp p-6 sm:p-8">
              <div className="flex gap-4">
                <img
                  src={AVATAR}
                  alt=""
                  className="size-12 shrink-0 rounded-2xl border border-theme object-cover shadow-sm"
                />
                <div className="min-w-0 flex-1 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-theme">{user.displayName}</span>
                    <span className="text-sm font-semibold text-utp-red">@{user.handle}</span>
                    <span className="text-xs text-theme-muted">· {user.career}</span>
                  </div>
                  <div>
                    <label htmlFor="cf-category" className="block text-sm font-bold text-theme-secondary">
                      Tipo de publicación
                    </label>
                    <select id="cf-category" value={category} onChange={(e) => setCategory(e.target.value)} className="input-utp mt-1.5 text-sm">
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="cf-body" className="block text-sm font-bold text-theme-secondary">
                      Tu confesión
                    </label>
                    <textarea
                      id="cf-body"
                      required
                      rows={5}
                      maxLength={4000}
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      className="input-utp mt-1.5 resize-y px-4 py-3 text-sm"
                      placeholder="Escribe aquí… sin datos personales de terceros ni amenazas."
                    />
                    <p className="mt-1 text-right text-xs text-theme-muted">{body.length} / 4000</p>
                  </div>
                  {formError ? <p className="alert-error">{formError}</p> : null}
                  <button type="submit" disabled={submitting} className="btn-utp-primary w-full py-3 sm:w-auto sm:px-8">
                    {submitting ? 'Publicando…' : '✨ Publicar confesión'}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="card-utp p-8 text-center">
              <p className="text-4xl">👋</p>
              <p className="mt-3 text-theme-secondary">
                <Link to="/login" className="font-bold text-utp-red hover:underline">
                  Inicia sesión
                </Link>{' '}
                o{' '}
                <Link to="/register" className="font-bold text-utp-red hover:underline">
                  regístrate
                </Link>{' '}
                para publicar con tu cuenta.
              </p>
            </div>
          )}
        </div>

        <div className={`mx-auto mt-8 ${isFeed ? 'max-w-full' : 'mt-12 max-w-5xl'}`}>
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-lg font-black text-theme">Últimas en la comunidad</h3>
              <p className="text-sm text-theme-muted">
                Historias de alumnos de la Universidad Tecnológica del Perú
              </p>
            </div>
            <button type="button" onClick={refresh} className="btn-utp-secondary self-start px-4 py-2 text-xs sm:self-auto">
              ↻ Actualizar
            </button>
          </div>

          {loadError ? <p className="alert-warn mb-6">{loadError}</p> : null}

          {loading ? (
            <div className="card-utp flex items-center justify-center gap-3 py-16">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-utp-red border-t-transparent" />
              <span className="text-sm text-theme-muted">Cargando confesiones…</span>
            </div>
          ) : items.length === 0 ? (
            <p className="card-utp py-12 text-center text-sm text-theme-muted">
              Aún no hay publicaciones. ¡Sé el primero en compartir! 🚀
            </p>
          ) : (
            <ul className="space-y-6">
              {items.map((c) => {
                const ix = interactionMap[c.id] || {
                  likeCount: 0,
                  repostCount: 0,
                  commentCount: 0,
                  comments: [],
                  liked: false,
                  reposted: false,
                };
                const commentsOpen = openComments[c.id];

                return (
                  <li key={c.id} className="post-card">
                    <article>
                      <div className="flex flex-wrap items-start gap-4">
                        <img
                          src={AVATAR}
                          alt=""
                          className="size-10 shrink-0 rounded-xl border border-theme object-cover"
                        />
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <p className="truncate text-sm font-bold text-theme">{c.displayName}</p>
                            <p className="truncate text-sm font-semibold text-utp-red">@{c.handle}</p>
                            <time dateTime={c.createdAt} className="text-xs text-theme-muted" title={c.createdAt}>
                              {formatRelativeTime(c.createdAt)}
                            </time>
                            <span className="category-pill ml-auto">{c.category}</span>
                          </div>
                          <p className="mt-0.5 text-xs text-theme-muted">{c.career}</p>
                          <p className="mt-4 break-words text-sm leading-relaxed text-theme-secondary [overflow-wrap:anywhere] whitespace-pre-wrap">
                            {c.body}
                          </p>

                          <div className="mt-5 flex flex-wrap items-center gap-6 border-t border-theme pt-4">
                            <button
                              type="button"
                              onClick={() => setOpenComments((prev) => ({ ...prev, [c.id]: !prev[c.id] }))}
                              className="flex items-center gap-2 text-sm text-theme-muted transition hover:text-utp-red"
                              aria-label="Comentarios"
                            >
                              <IconBubble />
                              <span className="tabular-nums">{ix.commentCount}</span>
                            </button>
                            <button
                              type="button"
                              disabled={!user}
                              onClick={() => onToggleRepost(c.id)}
                              className={`flex items-center gap-2 text-sm transition disabled:opacity-40 ${
                                ix.reposted ? 'text-utp-green' : 'text-theme-muted hover:text-utp-green'
                              }`}
                              aria-label="Repost"
                            >
                              <IconRepost />
                              <span className="tabular-nums">{ix.repostCount}</span>
                            </button>
                            <button
                              type="button"
                              disabled={!user}
                              onClick={() => onToggleLike(c.id)}
                              className={`flex items-center gap-2 text-sm transition disabled:opacity-40 ${
                                ix.liked ? 'text-utp-red' : 'text-theme-muted hover:text-utp-red'
                              }`}
                              aria-label="Me gusta"
                            >
                              <IconHeart filled={ix.liked} />
                              <span className="tabular-nums">{ix.likeCount}</span>
                            </button>
                          </div>

                          {!user ? (
                            <p className="mt-3 text-xs text-theme-muted">
                              <Link to="/login" className="font-bold text-utp-red hover:underline">
                                Entra
                              </Link>{' '}
                              para interactuar.
                            </p>
                          ) : null}

                          {commentsOpen ? (
                            <div className="mt-4 rounded-2xl border border-theme p-4" style={{ background: 'var(--color-bg-soft)' }}>
                              <p className="text-xs font-bold uppercase tracking-wide text-theme-muted">
                                Comentarios
                              </p>
                              <ul className="mt-3 max-h-52 space-y-3 overflow-y-auto">
                                {ix.comments.length === 0 ? (
                                  <li className="text-xs text-theme-muted">Sin comentarios aún.</li>
                                ) : (
                                  ix.comments.map((cm) => (
                                    <li key={cm.id} className="text-sm">
                                      <span className="font-bold text-theme">{cm.displayName}</span>{' '}
                                      <span className="text-utp-red/80">@{cm.handle}</span>
                                      <p className="mt-1 break-words text-theme-secondary [overflow-wrap:anywhere]">
                                        {cm.body}
                                      </p>
                                    </li>
                                  ))
                                )}
                              </ul>
                              {user ? (
                                <div className="mt-4 flex gap-2">
                                  <input
                                    type="text"
                                    value={commentDraft[c.id] ?? ''}
                                    onChange={(e) =>
                                      setCommentDraft((prev) => ({
                                        ...prev,
                                        [c.id]: e.target.value,
                                      }))
                                    }
                                    placeholder="Escribe un comentario…"
                                    className="input-utp min-w-0 flex-1 text-sm"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => onSubmitComment(c.id)}
                                    className="btn-utp-primary shrink-0 px-4 py-2 text-xs"
                                  >
                                    Comentar
                                  </button>
                                </div>
                              ) : null}
                              {commentError[c.id] ? (
                                <p className="mt-2 text-xs text-utp-red">{commentError[c.id]}</p>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

export default ConfessionsSection;
