import { apiRequest } from './api';

export async function getInteractionsForPosts(postIds, currentUserId) {
  if (!postIds || postIds.length === 0) return {};
  const ids = postIds.join(',');
  const query = currentUserId ? `ids=${ids}&userId=${currentUserId}` : `ids=${ids}`;
  return apiRequest('GET', `interactions/batch?${query}`);
}

export async function toggleLike(postId) {
  return apiRequest('POST', `interactions/${postId}/like`, {}, true);
}

export async function toggleRepost(postId) {
  return apiRequest('POST', `interactions/${postId}/repost`, {}, true);
}

export async function getComments(postId) {
  return apiRequest('GET', `confessions/${postId}/comments`);
}

export async function createComment(postId, { body, parentId }) {
  return apiRequest('POST', `confessions/${postId}/comments`, { body, parentId }, true);
}

export async function deleteComment(postId, commentId) {
  return apiRequest('DELETE', `confessions/${postId}/comments/${commentId}`, null, true);
}
