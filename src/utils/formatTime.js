/** @param {string} iso */
export function formatRelativeTime(iso) {
  try {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const sec = Math.floor(diff / 1000);
    if (sec < 60) return 'ahora';
    const min = Math.floor(sec / 60);
    if (min < 60) return `hace ${min} min`;
    const h = Math.floor(min / 60);
    if (h < 24) return `hace ${h} h`;
    const days = Math.floor(h / 24);
    if (days < 7) return `hace ${days} d`;
    return new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium' }).format(d);
  } catch {
    return iso;
  }
}
