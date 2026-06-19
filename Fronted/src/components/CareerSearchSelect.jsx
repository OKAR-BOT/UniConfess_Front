import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { UTP_CAREERS } from '../data/utpCareers';

/**
 * @param {{
 *   value: string,
 *   onChange: (name: string) => void,
 *   required?: boolean,
 *   id?: string,
 *   label?: string,
 * }} props
 */
export default function CareerSearchSelect({
  value,
  onChange,
  required = false,
  id: idProp,
  label = 'Carrera UTP',
}) {
  const autoId = useId();
  const inputId = idProp || `career-${autoId}`;
  const listId = `${inputId}-listbox`;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return UTP_CAREERS;
    return UTP_CAREERS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) || c.faculty.toLowerCase().includes(q)
    );
  }, [query]);

  useEffect(() => {
    setHighlight(0);
  }, [query, open]);

  useEffect(() => {
    function onDocClick(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
        setQuery(value);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [value]);

  function pick(name) {
    onChange(name);
    setQuery(name);
    setOpen(false);
  }

  function onKeyDown(e) {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setOpen(true);
      return;
    }
    if (!open) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[highlight]) {
      e.preventDefault();
      pick(filtered[highlight].name);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setQuery(value);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <label htmlFor={inputId} className="block text-xs font-bold text-theme-secondary">
        {label}
      </label>
      <input
        id={inputId}
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        required={required}
        autoComplete="off"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          if (!e.target.value) onChange('');
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Busca tu carrera… ej. Software, Psicología"
        className="input-utp mt-1"
      />
      <p className="mt-1 text-xs text-theme-muted">
        Escribe para filtrar · {UTP_CAREERS.length} carreras UTP
      </p>

      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-theme py-1 shadow-xl"
          style={{ background: 'var(--color-card-solid)' }}
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-theme-muted">Sin resultados. Prueba otro término.</li>
          ) : (
            filtered.map((c, index) => (
              <li
                key={c.name}
                role="option"
                aria-selected={value === c.name}
                onMouseEnter={() => setHighlight(index)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(c.name)}
                className={`cursor-pointer px-3 py-2 text-sm ${
                  index === highlight || value === c.name
                    ? 'bg-utp-red/10 font-semibold text-utp-red'
                    : 'text-theme hover:bg-utp-red/5'
                }`}
              >
                <span className="block font-medium">{c.name}</span>
                <span className="block text-xs text-theme-muted">{c.faculty}</span>
              </li>
            ))
          )}
        </ul>
      )}

      {required && !value ? (
        <input
          tabIndex={-1}
          required
          value=""
          onChange={() => {}}
          className="pointer-events-none absolute h-0 w-0 opacity-0"
          aria-hidden
        />
      ) : null}
    </div>
  );
}
