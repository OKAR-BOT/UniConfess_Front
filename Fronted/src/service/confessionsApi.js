import { apiRequest } from './api';

export async function listConfessions() {
  const data = await apiRequest('GET', 'confessions');
  return Array.isArray(data) ? data : [];
}

export async function createConfession(input, author) {
  const body = (input.body ?? '').trim();
  if (body.length < 10) {
    throw new Error('Tu publicacion debe tener al menos 10 caracteres.');
  }
  if (body.length > 4000) {
    throw new Error('Maximo 4000 caracteres.');
  }
  const payload = {
    userId: author.userId,
    displayName: author.displayName,
    handle: author.handle,
    career: author.career,
    body,
    category: input.category || 'General',
  };
  return apiRequest('POST', 'confessions', payload, true);
}
