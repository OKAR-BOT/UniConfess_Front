import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createConfession, listConfessions } from '../service/confessionsApi';
import {
  getInteractionsForPosts,
  toggleLike as apiToggleLike,
  toggleRepost as apiToggleRepost,
  getComments,
  createComment,
  deleteComment as apiDeleteComment,
} from '../service/interactionsApi';
import { formatRelativeTime } from '../utils/formatTime';

const CATEGORIES = [
  { value: 'General', label: 'General' },
  { value: 'Confesion', label: 'Confesion' },
  { value: 'Chisme', label: 'Chisme' },
  { value: 'Campus', label: 'Campus / UTP' },
  { value: 'Crush', label: 'Crush' },
  { value: 'Otro', label: 'Otro' },
];

const AVATAR = 'https://img.freepik.com/vector-premium/ilustracion-plana-vectorial-escala-grises-icono-perfil-usuario-avatar-persona-imagen-perfil-silueta-genero-neutral-apto-perfiles-redes-sociales-iconos-protectores-pantalla-como-plantillax9xa_719432-2210.jpg?semt=ais_hybrid&w=740&q=80';

function IconHeart({ filled }) {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" aria-hidden>
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

function ReplyThread({ comment, postId, depth, userId, isAdmin, onRefresh }) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  async function handleReply() {
    if (!replyText.trim()) return;
    setReplying(true);
    try {
      await createComment(postId, { body: replyText, parentId: comment.id });
      setReplyText('');
      setShowReply(false);
      onRefresh();
    } catch {}
    setReplying(false);
  }

  async function handleDelete() {
    await apiDeleteComment(postId, comment.id);
    onRefresh();
  }

  const maxDepth = 3;

  return (
    <div className="border-l-2 border-theme/20 pl-3 ml-2 mt-2">
      <div className="text-sm">
        <span className="font-bold text-theme">{comment.displayName}</span>{' '}
        <span className="text-utp-red/80">@{comment.handle}</span>
      </div>
      <p className="mt-0.5 text-sm text-theme-secondary break-words">{comment.body}</p>
      <div className="flex gap-3 mt-1">
        {userId && depth < maxDepth && (
          <button
            type="button"
            onClick={() => setShowReply(!showReply)}
            className="text-xs font-semibold text-theme-muted hover:text-utp-red"
          >
            Responder
          </button>
        )}
        {(userId === comment.userId || isAdmin) && (
          <button
            type="button"
            onClick={handleDelete}
            className="text-xs font-semibold text-utp-red hover:text-utp-red/70"
          >
            Eliminar
          </button>
        )}
      </div>
      {showReply && (
        <div className="flex gap-2 mt-2">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Escribe una respuesta..."
            className="input-utp flex-1 text-xs"
          />
          <button
            type="button"
            disabled={replying || !replyText.trim()}
            onClick={handleReply}
            className="btn-utp-primary shrink-0 px-3 py-1 text-xs"
          >
            {replying ? '...' : 'Responder'}
          </button>
        </div>
      )}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-1">
          {comment.replies.map((reply) => (
            <ReplyThread
              key={reply.id}
              comment={reply}
              postId={postId}
              depth={depth + 1}
              userId={userId}
              isAdmin={isAdmin}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CommentsSection({ postId, userId, isAdmin }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);

  const loadComments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getComments(postId);
      setComments(Array.isArray(data) ? data : []);
    } catch {
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  async function handlePostComment() {
    if (!newComment.trim()) return;
    setPosting(true);
    try {
      await createComment(postId, { body: newComment });
      setNewComment('');
      loadComments();
    } catch {}
    setPosting(false);
  }

  return (
    <div className="mt-4 rounded-2xl border border-theme p-4" style={{ background: 'var(--color-bg-soft)' }}>
      <p className="text-xs font-bold uppercase tracking-wide text-theme-muted">Comentarios</p>
      {loading ? (
        <p className="mt-3 text-xs text-theme-muted">Cargando...</p>
      ) : comments.length === 0 ? (
        <p className="mt-3 text-xs text-theme-muted">Sin comentarios aun.</p>
      ) : (
        <div className="mt-3 max-h-80 overflow-y-auto space-y-1">
          {comments.map((c) => (
            <ReplyThread
              key={c.id}
              comment={c}
              postId={postId}
              depth={0}
              userId={userId}
              isAdmin={isAdmin}
              onRefresh={loadComments}
            />
          ))}
        </div>
      )}
      {userId && (
        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escribe un comentario..."
            className="input-utp min-w-0 flex-1 text-sm"
          />
          <button
            type="button"
            disabled={posting || !newComment.trim()}
            onClick={handlePostComment}
            className="btn-utp-primary shrink-0 px-4 py-2 text-xs"
          >
            {posting ? '...' : 'Comentar'}
          </button>
        </div>
      )}
    </div>
  );
}

function ConfessionsSection({ variant = 'default' }) {
  const isFeed = variant === 'feed';
  const { user, isAdmin, canPostAnonymously, deleteConfessionById } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [category, setCategory] = useState('General');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [postAnon, setPostAnon] = useState(false);

  const [interactionMap, setInteractionMap] = useState({});
  const [openComments, setOpenComments] = useState({});

  const syncInteractions = useCallback(async (list, uid) => {
    if (!list || list.length === 0) {
      setInteractionMap({});
      return;
    }
    try {
      const data = await getInteractionsForPosts(list.map((c) => c.id), uid);
      setInteractionMap(data || {});
    } catch {
      setInteractionMap({});
    }
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
      const anon = postAnon && canPostAnonymously;
      const created = await createConfession(
        { body, category },
        {
          userId: user.id,
          displayName: anon ? 'Anonimo UTP' : user.displayName,
          handle: anon ? 'anonimo_utp' : user.handle,
          career: anon ? '' : user.career,
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

  async function onToggleLike(postId) {
    if (!user) return;
    await apiToggleLike(postId);
    syncInteractions(items, user.id);
  }

  async function onToggleRepost(postId) {
    if (!user) return;
    await apiToggleRepost(postId);
    syncInteractions(items, user.id);
  }

  return (
    <section id="publicar" className={`scroll-mt-24 ${isFeed ? 'pb-32 pt-2' : 'border-t border-theme pb-24 pt-10 sm:pt-16'}`}>
      <div className={`mx-auto px-4 sm:px-6 ${isFeed ? 'max-w-3xl lg:max-w-4xl' : 'max-w-6xl lg:px-8'}`}>
        {isFeed ? (
          <header className="feed-header">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔥</span>
              <div>
                <h1 className="text-lg font-black text-utp-red">Comunidad UTP</h1>
                <p className="text-xs text-theme-muted">Publicaciones · desplazate para ver mas</p>
              </div>
            </div>
          </header>
        ) : (
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-black tracking-tight text-theme sm:text-3xl">Publicaciones de la comunidad</h2>
            <p className="mt-2 text-base text-theme-secondary">Comparte, reacciona y comenta con respeto hacia la comunidad UTP.</p>
          </div>
        )}

        <div className={`mx-auto ${isFeed ? 'mt-4 max-w-full' : 'mt-10 max-w-4xl'}`}>
          {user ? (
            <form onSubmit={handleSubmit} className="card-utp p-6 sm:p-8">
              <div className="flex gap-4">
                <img src={AVATAR} alt="" className="size-12 shrink-0 rounded-2xl border border-theme object-cover shadow-sm" />
                <div className="min-w-0 flex-1 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-theme">{user.displayName}</span>
                    <span className="text-sm font-semibold text-utp-red">@{user.handle}</span>
                    <span className="text-xs text-theme-muted">· {user.career}</span>
                  </div>
                  <div>
                    <label htmlFor="cf-category" className="block text-sm font-bold text-theme-secondary">Tipo de publicacion</label>
                    <select id="cf-category" value={category} onChange={(e) => setCategory(e.target.value)} className="input-utp mt-1.5 text-sm">
                      {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                  </div>
                  {canPostAnonymously ? (
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input type="checkbox" checked={postAnon} onChange={(e) => setPostAnon(e.target.checked)} className="size-4 accent-utp-red rounded" />
                      <span className="text-sm font-medium text-theme-secondary">🎭 Publicar anonimamente</span>
                    </label>
                  ) : null}
                  <div>
                    <label htmlFor="cf-body" className="block text-sm font-bold text-theme-secondary">Tu confesion</label>
                    <textarea id="cf-body" required rows={5} maxLength={4000} value={body} onChange={(e) => setBody(e.target.value)} className="input-utp mt-1.5 resize-y px-4 py-3 text-sm" placeholder="Escribe aqui..." />
                    <p className="mt-1 text-right text-xs text-theme-muted">{body.length} / 4000</p>
                  </div>
                  {formError ? <p className="alert-error">{formError}</p> : null}
                  <button type="submit" disabled={submitting} className="btn-utp-primary w-full py-3 sm:w-auto sm:px-8">
                    {submitting ? 'Publicando...' : '✨ Publicar confesion'}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="card-utp p-8 text-center">
              <p className="text-4xl">👋</p>
              <p className="mt-3 text-theme-secondary">
                <Link to="/login" className="font-bold text-utp-red hover:underline">Inicia sesion</Link>{' '}o{' '}
                <Link to="/register" className="font-bold text-utp-red hover:underline">registrate</Link>{' '}para publicar con tu cuenta.
              </p>
            </div>
          )}
        </div>

        <div className={`mx-auto mt-8 ${isFeed ? 'max-w-full' : 'mt-12 max-w-5xl'}`}>
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-lg font-black text-theme">Ultimas en la comunidad</h3>
              <p className="text-sm text-theme-muted">Historias de alumnos de la Universidad Tecnologica del Peru</p>
            </div>
            <button type="button" onClick={refresh} className="btn-utp-secondary self-start px-4 py-2 text-xs sm:self-auto">↻ Actualizar</button>
          </div>

          {loadError ? <p className="alert-warn mb-6">{loadError}</p> : null}

          {loading ? (
            <div className="card-utp flex items-center justify-center gap-3 py-16">
              <span className="h-8 w-8 animate-spin rounded-full border-2 border-utp-red border-t-transparent" />
              <span className="text-sm text-theme-muted">Cargando confesiones...</span>
            </div>
          ) : items.length === 0 ? (
            <p className="card-utp py-12 text-center text-sm text-theme-muted">Aun no hay publicaciones. ¡Se el primero en compartir! 🚀</p>
          ) : (
            <ul className="space-y-6">
              {items.map((c) => {
                const ix = interactionMap[c.id] || { likeCount: 0, repostCount: 0, commentCount: 0, liked: false, reposted: false };
                const commentsOpen = openComments[c.id];

                return (
                  <li key={c.id} className="post-card">
                    <article>
                      <div className="flex flex-wrap items-start gap-4">
                        <img src={AVATAR} alt="" className="size-10 shrink-0 rounded-xl border border-theme object-cover" />
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <p className="truncate text-sm font-bold text-theme">{c.displayName}</p>
                            {c.displayName === 'Anonimo UTP' ? <span className="shrink-0 text-xs" title="Anonimo">🎭</span> : null}
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
                            >
                              <IconBubble />
                              <span className="tabular-nums">{ix.commentCount}</span>
                            </button>
                            <button
                              type="button"
                              disabled={!user}
                              onClick={() => onToggleRepost(c.id)}
                              className={`flex items-center gap-2 text-sm transition disabled:opacity-40 ${ix.reposted ? 'text-utp-green' : 'text-theme-muted hover:text-utp-green'}`}
                            >
                              <IconRepost />
                              <span className="tabular-nums">{ix.repostCount}</span>
                            </button>
                            <button
                              type="button"
                              disabled={!user}
                              onClick={() => onToggleLike(c.id)}
                              className={`flex items-center gap-2 text-sm transition disabled:opacity-40 ${ix.liked ? 'text-utp-red' : 'text-theme-muted hover:text-utp-red'}`}
                            >
                              <IconHeart filled={ix.liked} />
                              <span className="tabular-nums">{ix.likeCount}</span>
                            </button>
                            {isAdmin ? (
                              <button
                                type="button"
                                onClick={async () => { await deleteConfessionById(c.id); refresh(); }}
                                className="ml-auto flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-utp-red transition hover:bg-utp-red/10"
                              >
                                🗑️ Eliminar
                              </button>
                            ) : null}
                          </div>

                          {!user ? (
                            <p className="mt-3 text-xs text-theme-muted">
                              <Link to="/login" className="font-bold text-utp-red hover:underline">Entra</Link> para interactuar.
                            </p>
                          ) : null}

                          {commentsOpen && (
                            <CommentsSection
                              postId={c.id}
                              userId={user?.id}
                              isAdmin={isAdmin}
                            />
                          )}
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
