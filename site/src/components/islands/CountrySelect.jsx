// Searchable country picker used by every lead form.
//
// A native <select> with 200+ options is unusable on desktop (no search,
// a scroll list the height of the screen), so this is a combobox: type to
// filter, arrow keys to move, Enter to pick, Escape to close. It writes to
// a hidden input so plain FormData submission still works exactly as before
// and nothing downstream needs to know this is a React island.
import { useState, useRef, useEffect, useMemo } from 'react';
import { COUNTRIES, COUNTRY_BY_CODE, flagSrc, detectCountry } from '../../data/countries';

export default function CountrySelect({ name = 'country', id, required = true, initial = '', onValueChange }) {
  // Pre-select from the browser's own locale/timezone. Always overridable.
  const [code, setCode] = useState(initial || '');
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const boxRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (!initial) {
      const guess = detectCountry();
      if (guess) setCode(guess);
    }
  }, [initial]);

  // Controlled parents (the pricing calculators) read state rather than
  // FormData, so mirror every change out to them as the country's name.
  useEffect(() => {
    if (onValueChange) onValueChange(COUNTRY_BY_CODE[code] ? COUNTRY_BY_CODE[code].name : '');
  }, [code]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    // Name prefix first, then name contains, then dial code - so typing
    // "in" surfaces India before Argentina, and "+44" works too.
    const starts = [], has = [], dial = [];
    COUNTRIES.forEach((c) => {
      const n = c.name.toLowerCase();
      if (n.startsWith(q)) starts.push(c);
      else if (n.includes(q)) has.push(c);
      else if (c.dial.includes(q) || c.code.toLowerCase() === q) dial.push(c);
    });
    return [...starts, ...has, ...dial];
  }, [query]);

  useEffect(() => { setActive(0); }, [query]);

  // Close on outside click.
  useEffect(() => {
    function onDown(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  // Keep the highlighted row in view while arrowing through a long list.
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.children[active];
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  const selected = COUNTRY_BY_CODE[code];

  function choose(c) {
    setCode(c.code);
    setQuery('');
    setOpen(false);
    // Let the phone input (and anything else) follow the country change.
    try {
      window.dispatchEvent(new CustomEvent('cnl:country', { detail: { code: c.code } }));
    } catch (e) { /* non-fatal */ }
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) { setOpen(true); return; }
      setActive((i) => {
        const next = e.key === 'ArrowDown' ? i + 1 : i - 1;
        return Math.max(0, Math.min(matches.length - 1, next));
      });
    } else if (e.key === 'Enter') {
      if (open && matches[active]) { e.preventDefault(); choose(matches[active]); }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  const field =
    'w-full rounded-[10px] border-[1.5px] border-navy/10 bg-white px-4 py-3.5 text-left text-sm text-navy transition-colors outline-none focus:border-teal';

  return (
    <div className="relative" ref={boxRef}>
      <input type="hidden" name={name} value={selected ? selected.name : ''} />
      <button
        type="button"
        id={id}
        className={field + ' flex items-center justify-between gap-2'}
        onClick={() => { setOpen((o) => !o); setTimeout(() => inputRef.current && inputRef.current.focus(), 0); }}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={`flex items-center gap-2 ${selected ? 'text-navy' : 'text-navy/40'}`}>
          {selected && <img
          src={flagSrc(selected.code)}
          alt=""
          aria-hidden="true"
          loading="lazy"
          width="20"
          height="15"
          className="h-[15px] w-5 shrink-0 rounded-[2px] object-cover ring-1 ring-navy/10"
        />}
          {selected ? selected.name : 'Select your country'}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0 text-navy/40" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full overflow-hidden rounded-[10px] border-[1.5px] border-navy/10 bg-white shadow-[0_16px_40px_rgba(26,43,74,0.16)]">
          <div className="border-b border-navy/10 p-2">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search country or code…"
              aria-label="Search country"
              className="w-full rounded-md bg-off px-3 py-2 text-sm text-navy outline-none placeholder:text-navy/40"
            />
          </div>
          <ul ref={listRef} role="listbox" className="max-h-60 overflow-y-auto py-1">
            {matches.length === 0 && (
              <li className="px-4 py-3 text-sm text-navy/50">No country matches “{query}”.</li>
            )}
            {matches.map((c, i) => (
              <li
                key={c.code}
                role="option"
                aria-selected={c.code === code}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => { e.preventDefault(); choose(c); }}
                className={`flex cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-sm ${
                  i === active ? 'bg-teal/10 text-navy' : 'text-navy/75'
                }`}
              >
                <span className="flex items-center gap-2"><img
          src={flagSrc(c.code)}
          alt=""
          aria-hidden="true"
          loading="lazy"
          width="20"
          height="15"
          className="h-[15px] w-5 shrink-0 rounded-[2px] object-cover ring-1 ring-navy/10"
        />{c.name}</span>
                <span className="text-[12px] tabular-nums text-navy/40">{c.dial}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {required && !selected && (
        // Keeps native form validation honest without blocking the visitor
        // behind a hidden input they cannot focus.
        <input
          tabIndex={-1}
          aria-hidden="true"
          required
          value=""
          onChange={() => {}}
          className="pointer-events-none absolute bottom-1 left-4 h-0 w-0 opacity-0"
        />
      )}
    </div>
  );
}
