import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRealtime } from '../context/RealtimeContext';
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
      <div className="text-sm flex items-center gap-1">
        <Link to={`/profile/${comment.handle}`} className="font-bold text-theme hover:text-utp-red transition-colors">{comment.displayName}</Link>
        {(comment.role === 'premium' || comment.role === 'admin') && <span className="text-[10px] font-semibold text-amber-500 border border-amber-500 rounded px-0.5">PREMIUM</span>}
        <Link to={`/profile/${comment.handle}`} className="text-xs text-theme-muted ml-1 hover:text-utp-red transition-colors">@{comment.handle}</Link>
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
          <button
            type="button"
            onClick={() => { setShowReply(false); setReplyText(''); }}
            className="btn-utp-secondary shrink-0 px-3 py-1 text-xs"
          >
            Cancelar
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
  const { tabId, announceConfession } = useRealtime();
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [category, setCategory] = useState('General');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [postAnon, setPostAnon] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const focusId = params.get('focus');
    if (!focusId || loading || items.length === 0) return;
    const target = document.getElementById(`confession-${focusId}`);
    if (!target) return;
    window.setTimeout(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target.classList.add('ring-2', 'ring-utp-red', 'ring-offset-2', 'ring-offset-transparent');
      window.setTimeout(() => {
        target.classList.remove('ring-2', 'ring-utp-red', 'ring-offset-2', 'ring-offset-transparent');
      }, 2200);
    }, 0);
  }, [location.search, loading, items]);

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
          clientId: tabId,
        }
      );
      setItems((prev) => {
        const next = [created, ...prev.filter((x) => x.id !== created.id)];
        syncInteractions(next, user.id);
        return next;
      });
      announceConfession(created);
      setBody('');
      setCategory('General');
      setPostAnon(false);
      setIsFormOpen(false);
      setIsSuccessOpen(true);
      setTimeout(() => {
        setIsSuccessOpen(false);
      }, 3500);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'No se pudo publicar.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancelClick() {
    if (body.trim()) {
      setShowCancelConfirm(true);
    } else {
      setIsFormOpen(false);
    }
  }

  function confirmCancel() {
    setBody('');
    setCategory('General');
    setPostAnon(false);
    setShowCancelConfirm(false);
    setIsFormOpen(false);
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
            <>
              {/* Facebook-style Trigger Bar */}
              <div 
                className="card-utp p-4 flex items-center gap-3 cursor-pointer hover:bg-theme/5 transition duration-200" 
                onClick={() => setIsFormOpen(true)}
              >
                <img src={AVATAR} alt="" className="size-10 shrink-0 rounded-full border border-theme object-cover shadow-sm" />
                <div className="flex-1 bg-theme/5 border border-theme rounded-full px-4 py-2 text-sm text-theme-muted hover:bg-theme/10 transition duration-150 text-left">
                  ¿Qué quieres confesar hoy, {user.displayName}?
                </div>
              </div>

              {/* Form Modal */}
              {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                  <div className="card-utp w-full max-w-2xl p-7 relative border border-theme rounded-3xl shadow-2xl animate-modal-in min-h-[520px] max-h-[90vh] flex flex-col overflow-y-auto" style={{ background: 'var(--color-card-solid)', backdropFilter: 'none' }}>
                    <h3 className="text-base font-black text-theme text-center pb-2 border-b border-theme mb-3">Crear publicación</h3>
                    
                    <form onSubmit={handleSubmit} className="space-y-4 flex flex-col flex-1">
                      <div className="flex items-center gap-3">
                        <img src={AVATAR} alt="" className="size-9 shrink-0 rounded-full border border-theme object-cover shadow-sm" />
                        <div className="text-left min-w-0 flex-1">
                          <div className="text-sm font-bold text-theme truncate">{user.displayName}</div>
                          <div className="text-xs text-theme-muted truncate">@{user.handle} · {user.career}</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                        <div className="text-left">
                          <label htmlFor="cf-category" className="block text-[10px] font-bold text-theme-muted uppercase tracking-wider">Categoría</label>
                          <select id="cf-category" value={category} onChange={(e) => setCategory(e.target.value)} className="input-utp mt-1 text-xs w-full py-1.5 px-3.5">
                            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                          </select>
                        </div>
                        
                        {canPostAnonymously ? (
                          <label className="flex items-center gap-2 cursor-pointer select-none pb-2 w-fit">
                            <input type="checkbox" checked={postAnon} onChange={(e) => setPostAnon(e.target.checked)} className="size-3.5 accent-utp-red rounded" />
                            <span className="text-xs font-semibold text-theme-secondary">🎭 Anónimo</span>
                          </label>
                        ) : null}
                      </div>
                      
                      <div className="text-left">
                        <label htmlFor="cf-body" className="block text-[10px] font-bold text-theme-muted uppercase tracking-wider mb-1">Tu confesión</label>
                        <textarea id="cf-body" required rows={7} maxLength={4000} value={body} onChange={(e) => setBody(e.target.value)} className="input-utp resize-none px-3 py-3 text-sm w-full" placeholder={`¿Qué estás pensando, ${user.displayName}?`} />
                        <p className="mt-1 text-right text-[10px] text-theme-muted">{body.length} / 4000</p>
                      </div>
                      
                      {formError ? <p className="alert-error text-xs py-1.5 px-3">{formError}</p> : null}
                      
                      <div className="flex justify-end gap-3 pt-2 mt-auto">
                        <button type="button" onClick={handleCancelClick} className="btn-utp-secondary px-5 py-2 text-sm">
                          Cancelar
                        </button>
                        <button type="submit" disabled={submitting} className="btn-utp-primary px-6 py-2 text-sm font-bold">
                          {submitting ? 'Publicando...' : '✨ Publicar'}
                        </button>
                      </div>
                    </form>

                    {/* Confirm Cancel — overlaid INSIDE the modal card */}
                    {showCancelConfirm && (
                      <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-black/85 backdrop-blur-[2px] animate-fade-in">
                        <div className="w-full max-w-xs mx-6 p-6 text-center border border-theme rounded-2xl shadow-2xl animate-modal-in flex flex-col items-center" style={{ background: 'var(--color-card-solid)', backdropFilter: 'none' }}>
                          <div className="size-14 bg-amber-100 dark:bg-amber-950/50 text-amber-500 rounded-full flex items-center justify-center mb-4 border border-amber-200 dark:border-amber-800 shadow-inner">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          </div>
                          <h4 className="text-base font-black text-theme">¿Descartar publicación?</h4>
                          <p className="text-xs text-theme-secondary mt-2">Si cancelas ahora, perderás lo que has escrito.</p>
                          <div className="flex gap-3 mt-5 w-full">
                            <button
                              type="button"
                              onClick={() => setShowCancelConfirm(false)}
                              className="btn-utp-secondary flex-1 py-2 text-xs font-bold"
                            >
                              No, continuar
                            </button>
                            <button
                              type="button"
                              onClick={confirmCancel}
                              className="btn-utp-primary flex-1 py-2 text-xs font-bold"
                            >
                              Sí, cancelar
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}



              {/* Success Notification Modal */}
              {isSuccessOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
                  <div className="card-utp w-full max-w-sm p-6 text-center bg-[var(--color-card-solid)] border border-theme rounded-2xl shadow-2xl animate-success-pop flex flex-col items-center">
                    <div className="size-16 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-500 rounded-full flex items-center justify-center mb-4 border border-emerald-200 dark:border-emerald-800 shadow-inner animate-bounce-in">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h4 className="text-xl font-black text-theme">¡Publicado con éxito!</h4>
                    <p className="text-sm text-theme-secondary mt-2">Tu confesión ya está disponible en la comunidad de UConfess.</p>
                    <button
                      type="button"
                      onClick={() => setIsSuccessOpen(false)}
                      className="btn-utp-primary mt-5 px-6 py-2 w-full text-xs font-bold"
                    >
                      Entendido
                    </button>
                  </div>
                </div>
              )}
            </>
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
                  <li key={c.id} id={`confession-${c.id}`} className="post-card transition-all duration-300">
                    <article>
                      <div className="flex flex-wrap items-start gap-4">
                        <img src={AVATAR} alt="" className="size-10 shrink-0 !rounded-full border border-theme object-cover" />
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <Link to={`/profile/${c.handle}`} className="truncate text-sm font-bold text-theme hover:text-utp-red transition-colors">{c.displayName}</Link>
                            <Link to={`/profile/${c.handle}`} className="truncate text-xs text-theme-muted hover:text-utp-red transition-colors">@{c.handle}</Link>
                            {(c.authorRole === 'premium' || c.authorRole === 'admin') && <span className="text-[10px] font-semibold text-amber-500 border border-amber-500 rounded px-1">PREMIUM</span>}
                            {c.displayName === 'Anonimo UTP' ? <span className="shrink-0 text-xs" title="Anonimo">🎭</span> : null}
                            <time dateTime={c.createdAt} className="text-xs text-theme-muted ml-auto" title={c.createdAt}>
                              {formatRelativeTime(c.createdAt)}
                            </time>
                            <span className="category-pill">{c.category}</span>
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
