import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getComments, createComment, deleteComment as apiDeleteComment } from '../service/interactionsApi';
import { formatRelativeTime } from '../utils/formatTime';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../service/api';

function CommentThread({ comment, postId, depth, userId, isAdmin, onRefresh }) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyBody, setReplyBody] = useState('');

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyBody.trim()) return;
    try {
      await createComment(postId, { body: replyBody.trim(), parentId: comment.id });
      setReplyBody('');
      setShowReplyInput(false);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Eliminar comentario?')) return;
    try {
      await apiDeleteComment(postId, comment.id);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className={`${depth > 0 ? 'ml-6 pl-3 border-l-2 border-theme-border' : ''}`}>
      <div className="flex items-start gap-2 py-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <Link to={`/profile/${comment.handle}`} className="text-xs font-bold text-theme hover:text-utp-red">
              {comment.displayName}
            </Link>
            <span className="text-[10px] text-theme-muted">@{comment.handle}</span>
            <span className="text-[10px] text-theme-muted">{formatRelativeTime(comment.createdAt)}</span>
          </div>
          <p className="text-sm text-theme mt-0.5 whitespace-pre-wrap break-words">{comment.body}</p>
        </div>
        <div className="flex gap-1 shrink-0">
          {userId && (
            <button
              type="button"
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="text-[10px] text-theme-muted hover:text-utp-red transition-colors"
            >
              Responder
            </button>
          )}
          {(userId === comment.userId || isAdmin) && (
            <button
              type="button"
              onClick={handleDelete}
              className="text-[10px] text-utp-red hover:underline"
            >
              Eliminar
            </button>
          )}
        </div>
      </div>

      {showReplyInput && (
        <form onSubmit={handleSubmitReply} className="ml-6 mb-2 flex gap-2">
          <input
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            placeholder="Escribe una respuesta..."
            className="input-utp flex-1 text-sm"
            maxLength={1000}
            autoFocus
          />
          <button type="submit" className="btn-utp-primary text-xs px-3 py-1" disabled={!replyBody.trim()}>
            Responder
          </button>
        </form>
      )}

      {comment.replies?.map((reply) => (
        <CommentThread
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
  );
}

export default function ConfessionModal({ confession, onClose }) {
  const { user, isAdmin, deleteConfessionById } = useAuth();
  const [comments, setComments] = useState([]);
  const [commentBody, setCommentBody] = useState('');
  const [loadingComments, setLoadingComments] = useState(true);
  const overlayRef = useRef(null);

  const loadComments = useCallback(async () => {
    if (!confession) return;
    setLoadingComments(true);
    try {
      const data = await getComments(confession.id);
      setComments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingComments(false);
    }
  }, [confession]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentBody.trim()) return;
    try {
      await createComment(confession.id, { body: commentBody.trim() });
      setCommentBody('');
      await loadComments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteConfession = async () => {
    if (!window.confirm('Eliminar esta confesion permanentemente?')) return;
    try {
      await deleteConfessionById(confession.id);
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  if (!confession) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="card-utp w-full max-w-2xl max-h-[90vh] flex flex-col p-0 border border-theme rounded-2xl shadow-2xl animate-modal-in" style={{ background: 'var(--color-card-solid)', backdropFilter: 'none' }}>
        <div className="flex items-center justify-between p-4 border-b border-theme-border shrink-0">
          <h2 className="text-base font-bold text-theme">Publicacion</h2>
          <button
            type="button"
            onClick={onClose}
            className="size-8 flex items-center justify-center rounded-full hover:bg-black/10 transition text-theme-muted"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="overflow-y-auto p-4 flex-1">
          <div className="flex items-center gap-2 mb-2">
            {confession.authorAvatarUrl ? (
              <img
                src={getImageUrl(confession.authorAvatarUrl)}
                alt=""
                className="w-6 h-6 rounded-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  const fallback = e.target.parentNode.querySelector('.cm-avatar-fallback');
                  if (fallback) fallback.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`w-6 h-6 rounded-full bg-gradient-to-br from-utp-red to-amber-500 flex items-center justify-center text-white text-[10px] font-bold ${confession.authorAvatarUrl ? 'cm-avatar-fallback hidden' : ''}`}>
              {confession.displayName?.charAt(0).toUpperCase()}
            </div>
            <Link to={`/profile/${confession.handle}`} className="text-xs font-bold text-theme hover:text-utp-red">
              {confession.displayName}
            </Link>
            <span className="text-[10px] text-theme-muted">@{confession.handle}</span>
            <span className="text-[10px] text-theme-muted">{formatRelativeTime(confession.createdAt)}</span>
            <span className="category-pill">{confession.category}</span>
          </div>

          {confession.title && (
            <h3 className="font-bold text-theme mb-2">{confession.title}</h3>
          )}
          <p className="text-sm text-theme whitespace-pre-wrap break-words mb-3">{confession.body}</p>

          {user && (user.id === confession.userId || isAdmin) && (
            <button
              type="button"
              onClick={handleDeleteConfession}
              className="text-xs text-utp-red hover:underline mb-4 inline-block"
            >
              Eliminar publicacion
            </button>
          )}

          <div className="border-t border-theme-border pt-3 mt-2">
            <h4 className="text-xs font-bold text-theme mb-3 uppercase tracking-wider">
              Comentarios ({comments.length})
            </h4>

            {user && (
              <form onSubmit={handleSubmitComment} className="flex gap-2 mb-4">
                <input
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                  placeholder="Escribe un comentario..."
                  className="input-utp flex-1 text-sm"
                  maxLength={1000}
                />
                <button type="submit" className="btn-utp-primary text-xs px-4 py-2" disabled={!commentBody.trim()}>
                  Comentar
                </button>
              </form>
            )}

            {!user && (
              <p className="text-xs text-theme-muted mb-4">
                <Link to="/login" className="font-bold text-utp-red hover:underline">Entra</Link> para comentar.
              </p>
            )}

            {loadingComments ? (
              <p className="text-xs text-theme-muted text-center py-4">Cargando comentarios...</p>
            ) : comments.length === 0 ? (
              <p className="text-xs text-theme-muted text-center py-4">Sin comentarios aun.</p>
            ) : (
              <div className="space-y-1">
                {comments.map((comment) => (
                  <CommentThread
                    key={comment.id}
                    comment={comment}
                    postId={confession.id}
                    depth={0}
                    userId={user?.id}
                    isAdmin={isAdmin}
                    onRefresh={loadComments}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
