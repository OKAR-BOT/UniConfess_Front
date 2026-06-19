const KEY = 'uconfess_interactions_v1';

/** @typedef {{ id: string, userId: string, displayName: string, handle: string, body: string, createdAt: string }} ConfessionComment */

function readAll() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

function ensurePost(bucket, postId) {
  if (!bucket[postId]) {
    bucket[postId] = { likes: {}, reposts: {}, comments: [] };
  }
  return bucket[postId];
}

/** @param {string} postId */
export function getPostInteractions(postId) {
  const all = readAll();
  const p = all[postId];
  if (!p) {
    return { likeCount: 0, repostCount: 0, commentCount: 0, comments: [] };
  }
  const likes = p.likes && typeof p.likes === 'object' ? p.likes : {};
  const reposts = p.reposts && typeof p.reposts === 'object' ? p.reposts : {};
  const comments = Array.isArray(p.comments) ? p.comments : [];
  return {
    likeCount: Object.keys(likes).length,
    repostCount: Object.keys(reposts).length,
    commentCount: comments.length,
    comments,
  };
}

/** @param {string} postId @param {string} userId */
export function userLiked(postId, userId) {
  const all = readAll();
  const p = all[postId];
  if (!p || !p.likes) return false;
  return Boolean(p.likes[userId]);
}

/** @param {string} postId @param {string} userId */
export function userReposted(postId, userId) {
  const all = readAll();
  const p = all[postId];
  if (!p || !p.reposts) return false;
  return Boolean(p.reposts[userId]);
}

/** @param {string} postId @param {string} userId */
export function toggleLike(postId, userId) {
  const all = readAll();
  const p = ensurePost(all, postId);
  if (p.likes[userId]) {
    delete p.likes[userId];
  } else {
    p.likes[userId] = true;
  }
  writeAll(all);
  return userLiked(postId, userId);
}

/** @param {string} postId @param {string} userId */
export function toggleRepost(postId, userId) {
  const all = readAll();
  const p = ensurePost(all, postId);
  if (p.reposts[userId]) {
    delete p.reposts[userId];
  } else {
    p.reposts[userId] = true;
  }
  writeAll(all);
  return userReposted(postId, userId);
}

/**
 * @param {string} postId
 * @param {{ userId: string, displayName: string, handle: string, body: string }} input
 * @returns {ConfessionComment}
 */
/**
 * @param {string[]} postIds
 * @param {string | null} currentUserId
 */
export function getInteractionsForPosts(postIds, currentUserId) {
  const all = readAll();
  /** @type {Record<string, any>} */
  const out = {};
  for (const postId of postIds) {
    const p = all[postId];
    const likes = p?.likes && typeof p.likes === 'object' ? p.likes : {};
    const reposts = p?.reposts && typeof p.reposts === 'object' ? p.reposts : {};
    const comments = Array.isArray(p?.comments) ? p.comments : [];
    out[postId] = {
      likeCount: Object.keys(likes).length,
      repostCount: Object.keys(reposts).length,
      commentCount: comments.length,
      comments,
      liked: currentUserId ? Boolean(likes[currentUserId]) : false,
      reposted: currentUserId ? Boolean(reposts[currentUserId]) : false,
    };
  }
  return out;
}

export function addComment(postId, input) {
  const body = String(input.body || '').trim();
  if (body.length < 1) {
    throw new Error('El comentario no puede estar vacío.');
  }
  if (body.length > 1000) {
    throw new Error('Máximo 1000 caracteres.');
  }
  const all = readAll();
  const p = ensurePost(all, postId);
  const comment = /** @type {ConfessionComment} */ ({
    id:
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `c-${Date.now()}`,
    userId: input.userId,
    displayName: input.displayName,
    handle: input.handle,
    body,
    createdAt: new Date().toISOString(),
  });
  p.comments = [comment, ...(p.comments || [])];
  writeAll(all);
  return comment;
}
