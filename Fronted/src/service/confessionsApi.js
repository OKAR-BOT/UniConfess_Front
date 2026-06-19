const STORAGE_KEY = 'uconfess_confessions_v1';

/**
 * @typedef {{
 *   id: string,
 *   userId: string,
 *   displayName: string,
 *   handle: string,
 *   career: string,
 *   body: string,
 *   category: string,
 *   createdAt: string
 * }} Confession
 */

/** @param {string} s */
function slugHandle(s) {
  const t = String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '')
    .slice(0, 15);
  return t || 'usuario';
}

/** @param {any} item */
function mapLegacyToConfession(item) {
  if (item && item.handle) return /** @type {Confession} */ (item);
  return {
    id: String(item.id),
    userId: String(item.userId || 'legacy'),
    displayName: String(item.displayName || item.nickname || 'Usuario'),
    handle: String(item.handle || slugHandle(item.nickname || 'usuario')),
    career: String(item.career ?? ''),
    body: String(item.body ?? ''),
    category: String(item.category ?? 'General'),
    createdAt: String(item.createdAt ?? new Date().toISOString()),
  };
}

const SEED = /** @type {Confession[]} */ (
  [
    {
      id: 'seed-1',
      userId: 'seed-u1',
      displayName: 'Noche de lab',
      handle: 'noche_lab',
      career: 'Ingeniería de Sistemas',
      category: 'Campus',
      body: 'Confieso que los mejores avances de mis proyectos los hago en los labs del campus cuando ya casi no queda nadie. El café del kiosko me salvó más de un parcial.',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
    {
      id: 'seed-2',
      userId: 'seed-u2',
      displayName: 'Anónimo UTP',
      handle: 'anonimo_utp',
      career: 'Administración',
      category: 'Confesión',
      body: 'Nunca le dije a nadie que cambié de carrera por miedo al qué dirán. Aquí en la UTP conocí gente que pasó lo mismo y me sentí menos solo.',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'seed-3',
      userId: 'seed-u3',
      displayName: 'Pasillo 7',
      handle: 'pasillo7',
      career: 'Psicología',
      category: 'Chisme',
      body: 'El chisme del día: el profe llegó con la misma polera dos evaluaciones seguidas y medio salón lo notó. Leyenda.',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ].map(mapLegacyToConfession)
);

function apiBase() {
  const raw = process.env.REACT_APP_API_URL;
  return raw ? raw.replace(/\/$/, '') : '';
}

function readLocal() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.map(mapLegacyToConfession);
  } catch {
    return null;
  }
}

function writeLocal(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

/** @param {any} item */
function normalizeFromApi(item) {
  if (!item || typeof item !== 'object') return null;
  const id = String(item.id ?? item._id ?? '');
  const createdAt = item.createdAt || item.created_at || new Date().toISOString();
  const mapped = mapLegacyToConfession({
    id: id || `api-${Date.now()}`,
    userId: item.userId ?? item.user_id,
    displayName: item.displayName ?? item.display_name ?? item.nickname,
    handle: item.handle ?? item.username,
    career: item.career ?? item.carrera ?? '',
    body: item.body ?? item.content ?? item.texto ?? '',
    category: item.category ?? item.tag ?? 'General',
    createdAt,
  });
  return mapped;
}

/**
 * @returns {Promise<Confession[]>}
 */
export async function listConfessions() {
  const base = apiBase();
  if (base) {
    const res = await fetch(`${base}/confessions`);
    if (!res.ok) {
      throw new Error('No se pudieron cargar las confesiones. Revisa la API o tu conexión.');
    }
    const data = await res.json();
    const rows = Array.isArray(data) ? data : data?.data ?? data?.items ?? [];
    return rows.map(normalizeFromApi).filter(Boolean);
  }

  let local = readLocal();
  if (!local || local.length === 0) {
    writeLocal(SEED);
    local = SEED;
  }
  return [...local].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * @param {{ body: string, category?: string }} input
 * @param {{ userId: string, displayName: string, handle: string, career: string }} author
 * @returns {Promise<Confession>}
 */
export async function createConfession(input, author) {
  const body = (input.body ?? '').trim();
  const category = (input.category ?? 'General').trim() || 'General';

  if (body.length < 10) {
    throw new Error('Tu publicación debe tener al menos 10 caracteres.');
  }
  if (body.length > 4000) {
    throw new Error('Máximo 4000 caracteres.');
  }

  const payload = {
    userId: author.userId,
    displayName: author.displayName,
    handle: author.handle,
    career: author.career,
    body,
    category,
  };

  const base = apiBase();
  if (base) {
    const res = await fetch(`${base}/confessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const hint = await res.text().catch(() => '');
      throw new Error(
        hint || 'No se pudo publicar. Intenta de nuevo o contacta al equipo.'
      );
    }
    const data = await res.json().catch(() => ({}));
    const normalized = normalizeFromApi(
      data.id || data._id ? data : { ...data, ...payload, createdAt: new Date().toISOString() }
    );
    if (normalized && normalized.body) return normalized;
    return {
      id: String(data.id ?? Date.now()),
      ...payload,
      createdAt: new Date().toISOString(),
    };
  }

  const item = /** @type {Confession} */ ({
    id:
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `local-${Date.now()}`,
    ...payload,
    createdAt: new Date().toISOString(),
  });

  const list = readLocal() || [];
  writeLocal([item, ...list]);
  return item;
}
