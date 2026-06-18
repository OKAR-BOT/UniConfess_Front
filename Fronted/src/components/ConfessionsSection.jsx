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
      className={`scroll-mt-24 bg-gray-900 ${
        isFeed ? 'pb-32 pt-4' : 'border-t border-gray-700 pb-24 pt-10 sm:pt-16'
      }`}
    >
      <div
        className={`mx-auto px-4 sm:px-6 ${isFeed ? 'max-w-3xl lg:max-w-4xl' : 'max-w-6xl lg:px-8'}`}
      >
        {isFeed ? (
          <header className="sticky top-[4.5rem] z-40 -mx-4 border-b border-gray-800 bg-gray-900/95 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
            <h1 className="text-lg font-bold text-white">Comunidad UTP</h1>
            <p className="text-xs text-gray-500">Publicaciones · desplázate para ver más</p>
          </header>
        ) : (
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Publicaciones de la comunidad
            </h2>
            <p className="mt-2 text-base text-gray-400">
              Comparte, reacciona y comenta con respeto hacia la comunidad UTP.
            </p>
          </div>
        )}

        {/* 1. Compositor (mismo orden que antes) */}
        <div className={`mx-auto ${isFeed ? 'mt-4 max-w-full' : 'mt-10 max-w-4xl'}`}>
          {user ? (
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-gray-700 bg-gray-950/80 p-6 shadow-lg backdrop-blur-sm sm:p-8"
            >
              <div className="flex gap-4">
                <img
                  src={AVATAR}
                  alt=""
                  className="size-12 shrink-0 rounded-full bg-gray-800 object-cover"
                />
                <div className="min-w-0 flex-1 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-white">{user.displayName}</span>
                    <span className="text-sm text-indigo-300">@{user.handle}</span>
                    <span className="text-xs text-gray-500">· {user.career}</span>
                  </div>
                  <div>
                    <label htmlFor="cf-category" className="block text-sm font-semibold text-gray-200">
                      Tipo de publicación
                    </label>
                    <select
                      id="cf-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="mt-1.5 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="cf-body" className="block text-sm font-semibold text-gray-200">
                      Tu confesión
                    </label>
                    <textarea
                      id="cf-body"
                      required
                      rows={5}
                      maxLength={4000}
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      className="mt-1.5 w-full resize-y rounded-lg border border-gray-600 bg-gray-900 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                      placeholder="Escribe aquí… sin datos personales de terceros ni amenazas."
                    />
                    <p className="mt-1 text-right text-xs text-gray-500">{body.length} / 4000</p>
                  </div>
                  {formError ? (
                    <p className="rounded-lg border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm text-red-200">
                      {formError}
                    </p>
                  ) : null}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-8"
                  >
                    {submitting ? 'Publicando…' : 'Publicar confesión'}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="rounded-2xl border border-gray-700 bg-gray-950/80 p-8 text-center shadow-lg">
              <p className="text-gray-300">
                <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300">
                  Inicia sesión
                </Link>{' '}
                o{' '}
                <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300">
                  regístrate
                </Link>{' '}
                para publicar con tu cuenta.
              </p>
            </div>
          )}
        </div>

        {/* 2. Feed en tarjetas separadas */}
        <div className={`mx-auto mt-8 ${isFeed ? 'max-w-full' : 'mt-12 max-w-5xl'}`}>
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Últimas en la comunidad</h3>
              <p className="text-sm text-gray-400">
                Historias de alumnos de la Universidad Tecnológica del Perú
              </p>
            </div>
            <button
              type="button"
              onClick={refresh}
              className="self-start rounded-lg border border-gray-600 px-4 py-2 text-xs font-medium text-gray-200 transition hover:border-indigo-500 hover:text-indigo-300 sm:self-auto"
            >
              Actualizar
            </button>
          </div>

          {loadError ? (
            <p className="mb-6 rounded-xl border border-amber-500/30 bg-amber-950/30 px-4 py-3 text-sm text-amber-100">
              {loadError}
            </p>
          ) : null}

          {loading ? (
            <div className="flex items-center justify-center gap-3 rounded-2xl border border-gray-800 bg-gray-950/50 py-16">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
              <span className="text-sm text-gray-400">Cargando confesiones…</span>
            </div>
          ) : items.length === 0 ? (
            <p className="rounded-2xl border border-gray-800 bg-gray-950/50 py-12 text-center text-sm text-gray-400">
              Aún no hay publicaciones. ¡Sé el primero en compartir!
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
                  <li
                    key={c.id}
                    className="rounded-2xl border border-gray-800 bg-gray-950/60 p-6 shadow-lg transition hover:border-gray-700"
                  >
                    <article>
                      <div className="flex flex-wrap items-start gap-4">
                        <img
                          src={AVATAR}
                          alt=""
                          className="size-10 shrink-0 rounded-full bg-gray-800 object-cover"
                        />
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <p className="truncate text-sm font-semibold text-white">
                              {c.displayName}
                            </p>
                            <p className="truncate text-sm text-indigo-300">@{c.handle}</p>
                            <time
                              dateTime={c.createdAt}
                              className="text-xs text-gray-500"
                              title={c.createdAt}
                            >
                              {formatRelativeTime(c.createdAt)}
                            </time>
                            <span className="ml-auto shrink-0 rounded-full bg-gray-800/80 px-3 py-1 text-xs font-medium text-indigo-200">
                              {c.category}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-gray-400">{c.career}</p>
                          <p className="mt-4 break-words text-sm leading-relaxed text-gray-300 [overflow-wrap:anywhere] whitespace-pre-wrap">
                            {c.body}
                          </p>

                          <div className="mt-5 flex flex-wrap items-center gap-6 border-t border-gray-800/80 pt-4">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenComments((prev) => ({ ...prev, [c.id]: !prev[c.id] }))
                              }
                              className="flex items-center gap-2 text-sm text-gray-400 transition hover:text-indigo-400"
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
                                ix.reposted
                                  ? 'text-emerald-400'
                                  : 'text-gray-400 hover:text-emerald-400'
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
                                ix.liked ? 'text-pink-400' : 'text-gray-400 hover:text-pink-400'
                              }`}
                              aria-label="Me gusta"
                            >
                              <IconHeart filled={ix.liked} />
                              <span className="tabular-nums">{ix.likeCount}</span>
                            </button>
                          </div>

                          {!user ? (
                            <p className="mt-3 text-xs text-gray-500">
                              <Link to="/login" className="text-indigo-400 hover:underline">
                                Entra
                              </Link>{' '}
                              para interactuar.
                            </p>
                          ) : null}

                          {commentsOpen ? (
                            <div className="mt-4 rounded-xl border border-gray-700/80 bg-gray-900/60 p-4">
                              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                                Comentarios
                              </p>
                              <ul className="mt-3 max-h-52 space-y-3 overflow-y-auto">
                                {ix.comments.length === 0 ? (
                                  <li className="text-xs text-gray-500">Sin comentarios aún.</li>
                                ) : (
                                  ix.comments.map((cm) => (
                                    <li key={cm.id} className="text-sm">
                                      <span className="font-semibold text-white">
                                        {cm.displayName}
                                      </span>{' '}
                                      <span className="text-indigo-300/80">@{cm.handle}</span>
                                      <p className="mt-1 break-words text-gray-400 [overflow-wrap:anywhere]">
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
                                    className="min-w-0 flex-1 rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => onSubmitComment(c.id)}
                                    className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
                                  >
                                    Comentar
                                  </button>
                                </div>
                              ) : null}
                              {commentError[c.id] ? (
                                <p className="mt-2 text-xs text-red-400">{commentError[c.id]}</p>
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
