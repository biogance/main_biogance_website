'use client';

import React, { useEffect, useRef, useState } from 'react';

// Custom dropdown for the filters panel — a native <select>'s own open
// popup is OS-rendered, so Chrome/Edge ignore any hover/selected CSS put on
// its <option>s. This renders the list ourselves so hover and the selected
// state both actually show bg-black/text-white as asked.
export default function BreedFilterSelect({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function onOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onOutside);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const active = options.find((o) => o.value === value) || options[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 border-0 border-b border-[#9b9b96] bg-transparent py-[9px] px-2 text-left text-[14px] cursor-pointer"
      >
        <span>{active.label}</span>
        <span className={`text-[10px] shrink-0 transition-transform duration-200 ${open ? '-rotate-180' : ''}`}>▾</span>
      </button>

      <ul
        role="listbox"
        aria-label={label}
        className={`absolute left-0 right-0 top-full z-30 bg-white border border-[#d8d8d4] shadow-[0_10px_24px_rgba(0,0,0,.12)] max-h-[260px] overflow-y-auto origin-top transition-[opacity,transform] duration-150 ease-out ${
          open ? 'opacity-100 scale-y-100 pointer-events-auto' : 'opacity-0 scale-y-95 pointer-events-none'
        }`}
      >
        {options.map((o) => (
          <li key={o.value}>
            <button
              type="button"
              role="option"
              aria-selected={o.value === value}
              onClick={() => {
                onChange(o.value);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-[10px] text-[13px] cursor-pointer transition-colors duration-150 hover:bg-black hover:text-white ${
                o.value === value ? 'bg-black text-white' : 'bg-white text-black'
              }`}
            >
              {o.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
