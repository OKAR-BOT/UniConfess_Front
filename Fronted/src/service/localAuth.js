import { isValidUtpCareer } from '../data/utpCareers';

/** @returns {'user' | 'premium' | 'admin'} */
export function getUserRole(user) {
  return user?.role || 'user';
}

export function isAdmin(user) {
  return user?.role === 'admin';
}

export function isPremium(user) {
  return user?.role === 'premium';
}

export function canPostAnonymously(user) {
  return user?.role === 'premium' || user?.role === 'admin';
}

const USERS_KEY = 'uconfess_users_v1';
const SESSION_KEY = 'uconfess_session_v1';

/** @typedef {{ id: string, email: string, displayName: string, handle: string, career: string, passwordHash: string, role: 'user' | 'premium' | 'admin', isAnonymous: boolean, isBanned: boolean, membershipExpiresAt: string | null, createdAt: string }} UserRecord */

/** @typedef {{ id: string, email: string, displayName: string, handle: string, career: string, role: 'user' | 'premium' | 'admin', isAnonymous: boolean, isBanned: boolean, membershipExpiresAt: string | null, createdAt: string }} PublicUser */

async function hashPassword(password) {
  const enc = new TextEncoder().encode(password);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

const ADMIN_SEED = {
  id: 'admin-seed-1',
  email: 'george@utp.edu.pe',
  displayName: 'George Admin',
  handle: 'george_admin',
  career: 'Ingeniería de Sistemas',
  role: 'admin',
  isAnonymous: false,
  isBanned: false,
  membershipExpiresAt: null,
  createdAt: new Date().toISOString(),
};

async function seedAdmin(users) {
  const exists = users.some((u) => u.email === ADMIN_SEED.email);
  if (exists) return users;
  const passwordHash = await hashPassword('admin123');
  return [...users, { ...ADMIN_SEED, passwordHash }];
}

function readUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeUsers(list) {
  localStorage.setItem(USERS_KEY, JSON.stringify(list));
}

export async function ensureAdminSeeded() {
  const users = readUsers();
  const updated = await seedAdmin(users);
  if (updated.length !== users.length) {
    writeUsers(updated);
  }
}

/** @param {UserRecord} u */
function toPublic(u) {
  return {
    id: u.id,
    email: u.email,
    displayName: u.displayName,
    handle: u.handle,
    career: u.career,
    role: u.role || 'user',
    isAnonymous: u.isAnonymous || false,
    isBanned: u.isBanned || false,
    membershipExpiresAt: u.membershipExpiresAt || null,
    createdAt: u.createdAt,
  };
}

function normalizeEmail(email) {
  return String(email || '')
    .trim()
    .toLowerCase();
}

function normalizeHandle(handle) {
  return String(handle || '')
    .trim()
    .replace(/^@+/, '')
    .toLowerCase();
}

/**
 * @param {{ displayName: string, handle: string, email: string, password: string, career: string }} input
 * @returns {Promise<PublicUser>}
 */
export async function registerUser(input) {
  const displayName = String(input.displayName || '').trim();
  const handle = normalizeHandle(input.handle);
  const email = normalizeEmail(input.email);
  const password = String(input.password || '');
  const career = String(input.career || '').trim();

  if (displayName.length < 2 || displayName.length > 60) {
    throw new Error('El nombre debe tener entre 2 y 60 caracteres.');
  }
  if (!/^[a-z0-9_]{3,20}$/.test(handle)) {
    throw new Error('El usuario solo puede usar letras minúsculas, números y _. Entre 3 y 20 caracteres.');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Correo no válido.');
  }
  if (password.length < 6) {
    throw new Error('La contraseña debe tener al menos 6 caracteres.');
  }
  if (!isValidUtpCareer(career)) {
    throw new Error('Selecciona una carrera válida de la lista UTP.');
  }

  const users = readUsers();
  if (users.some((u) => u.email === email)) {
    throw new Error('Ya existe una cuenta con ese correo.');
  }
  if (users.some((u) => u.handle === handle)) {
    throw new Error('Ese nombre de usuario ya está en uso.');
  }

  const passwordHash = await hashPassword(password);
  const record = /** @type {UserRecord} */ ({
    id:
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `u-${Date.now()}`,
    email,
    displayName,
    handle,
    career,
    role: 'user',
    isAnonymous: false,
    isBanned: false,
    membershipExpiresAt: null,
    passwordHash,
    createdAt: new Date().toISOString(),
  });

  writeUsers([...users, record]);
  localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: record.id }));
  localStorage.removeItem('isAuthenticated');
  return toPublic(record);
}

/**
 * @returns {Promise<PublicUser>}
 */
export async function loginUser(email, password) {
  const e = normalizeEmail(email);
  const users = readUsers();
  const record = users.find((u) => u.email === e);
  if (!record) {
    throw new Error('Credenciales incorrectas.');
  }
  const hash = await hashPassword(password);
  if (hash !== record.passwordHash) {
    throw new Error('Credenciales incorrectas.');
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: record.id }));
  localStorage.removeItem('isAuthenticated');
  return toPublic(record);
}

export function logoutUser() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem('isAuthenticated');
}

/** @returns {PublicUser | null} */
export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const { userId } = JSON.parse(raw);
    if (!userId) return null;
    const users = readUsers();
    const record = users.find((u) => u.id === userId);
    return record ? toPublic(record) : null;
  } catch {
    return null;
  }
}

export function getAllUsers() {
  return readUsers().map(toPublic);
}

export function updateUserRole(userId, newRole) {
  const users = readUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) throw new Error('Usuario no encontrado.');
  users[idx].role = newRole;
  writeUsers(users);
  return toPublic(users[idx]);
}

export function toggleUserBan(userId) {
  const users = readUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) throw new Error('Usuario no encontrado.');
  users[idx].isBanned = !users[idx].isBanned;
  writeUsers(users);
  return toPublic(users[idx]);
}

export function deleteConfessionById(postId) {
  const key = 'uconfess_confessions_v1';
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return;
    const list = JSON.parse(raw);
    if (!Array.isArray(list)) return;
    const filtered = list.filter((c) => c.id !== postId);
    localStorage.setItem(key, JSON.stringify(filtered));
  } catch {}
}

export function setUserPremium(userId, expiryDate) {
  const users = readUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) throw new Error('Usuario no encontrado.');
  users[idx].role = 'premium';
  users[idx].membershipExpiresAt = expiryDate || new Date(Date.now() + 365 * 86400000).toISOString();
  writeUsers(users);
  return toPublic(users[idx]);
}
