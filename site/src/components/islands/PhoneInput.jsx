// Phone field with a searchable dialling-code picker.
//
// Submits ONE value ("+971 50 123 4567") under the field's own name, so
// every downstream consumer - the owner email, the sheet column, the
// WhatsApp reply - gets a number that is dialable as-is. A bare "50 123
// 4567" from a UAE lead is not, which is the bug this fixes.
//
// Follows the country field: picking a country updates the dial code
// (via the 'cnl:country' event), unless the visitor has already set the
// code by hand, in which case their choice is left alone.
import { useState, useRef, useEffect, useMemo } from 'react';
import { COUNTRIES, COUNTRY_BY_CODE, flagSrc, detectCountry } from '../../data/countries';

export default function PhoneInput({ name = 'phone', id, required = false, placeholder = '98765 43210', onValueChange }) {
  const [code, setCode] = useState('IN');
  const [number, setNumber] = useState('');
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const touched = useRef(false); // visitor picked a code themselves
  const boxRef = useRef(null);
  const searchRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    const guess = detectCountry();
    if (guess) setCode(guess);
  }, []);

  // Follow the country picker unless the visitor overrode this themselves.
  useEffect(() => {
    function onCountry(e) {
      const c = e.detail && e.detail.code;
      if (c && !touched.current && COUNTRY_BY_CODE[c]) setCode(c);
    }
    window.addEventListener('cnl:country', onCountry);
    return () => window.removeEventListener('cnl:country', onCountry);
  }, []);

  useEffect(() => {
    function onDown(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  useEffect(() => { setActive(0); }, [query]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.children[active];
    if (el && el.scrollIntoView) el.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^\+/, '');
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.dial.replace('+', '').startsWith(q) || c.code.toLowerCase() === q
    );
  }, [query]);

  const current = COUNTRY_BY_CODE[code] || COUNTRY_BY_CODE.IN;

  function choose(c) {
    touched.current = true;
    setCode(c.code);
    setQuery('');
    setOpen(false);
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) { setOpen(true); return; }
      setActive((i) => Math.max(0, Math.min(matches.length - 1, e.key === 'ArrowDown' ? i + 1 : i - 1)));
    } else if (e.key === 'Enter' && open && matches[active]) {
      e.preventDefault();
      choose(matches[active]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  // One combined value, so nothing downstream has to reassemble it.
  const combined = number.trim() ? `${current.dial} ${number.trim()}` : '';

  useEffect(() => {
    if (onValueChange) onValueChange(combined);
  }, [combined]);

  return (
    <div className="relative" ref={boxRef}>
      <input type="hidden" name={name} value={combined} />
      <div className="flex rounded-[10px] border-[1.5px] border-navy/10 bg-white transition-colors focus-within:border-teal">
        <button
          type="button"
          onClick={() => { setOpen((o) => !o); setTimeout(() => searchRef.current && searchRef.current.focus(), 0); }}
          onKeyDown={onKeyDown}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={`Country code, currently ${current.name} ${current.dial}`}
          className="flex shrink-0 items-center gap-1.5 rounded-l-[9px] border-r border-navy/10 px-3 py-3.5 text-sm text-navy hover:bg-off"
        >
          <img
          src={flagSrc(current.code)}
          alt=""
          aria-hidden="true"
          loading="lazy"
          width="20"
          height="15"
          className="h-[15px] w-5 shrink-0 rounded-[2px] object-cover ring-1 ring-navy/10"
        />
          <span className="tabular-nums">{current.dial}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-navy/40" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
        </button>
        <input
          id={id}
          type="tel"
          inputMode="tel"
          required={required}
          value={number}
          onChange={(e) => setNumber(e.target.value)}
          placeholder={placeholder}
          aria-label="Phone number"
          className="w-full rounded-r-[9px] bg-transparent px-3 py-3.5 text-sm text-navy outline-none placeholder:text-navy/40"
        />
      </div>

      {open && (
        <div className="absolute z-50 mt-1.5 w-full min-w-[16rem] overflow-hidden rounded-[10px] border-[1.5px] border-navy/10 bg-white shadow-[0_16px_40px_rgba(26,43,74,0.16)]">
          <div className="border-b border-navy/10 p-2">
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search country or code…"
              aria-label="Search dialling code"
              className="w-full rounded-md bg-off px-3 py-2 text-sm text-navy outline-none placeholder:text-navy/40"
            />
          </div>
          <ul ref={listRef} role="listbox" className="max-h-60 overflow-y-auto py-1">
            {matches.length === 0 && (
              <li className="px-4 py-3 text-sm text-navy/50">No match for “{query}”.</li>
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
    </div>
  );
}
