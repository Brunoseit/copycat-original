import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import { createPortal } from 'react-dom';

function Avatar({ item, size = 'md' }) {
  const dim = size === 'sm' ? 'w-5 h-5 text-[9px]' : size === 'lg' ? 'w-9 h-9 text-sm' : 'w-7 h-7 text-xs';
  const img = item?.image_url || item?.url_imagen;
  if (img) {
    return <img src={img} alt={item.nombre} className={`${dim} rounded-md object-cover flex-shrink-0 bg-zinc-700`} />;
  }
  return (
    <div
      className={`${dim} rounded-md flex-shrink-0 flex items-center justify-center font-bold text-white shadow-inner`}
      style={{ backgroundColor: item?.color || '#555' }}
    >
      {item?.nombre?.charAt(0)?.toUpperCase() || '?'}
    </div>
  );
}

export default function Combobox({ options = [], value, onChange, placeholder = "Buscar...", label = "", disabled = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [dropdownStyle, setDropdownStyle] = useState({});
  const buttonRef = useRef(null);
  const wrapperRef = useRef(null);

  const selected = options.find(o => o.id === value) || null;
  const filtered = options.filter(o => !search || o.nombre?.toLowerCase().includes(search.toLowerCase()));

  // Position dropdown using fixed positioning to escape overflow:hidden parents
  const openDropdown = () => {
    if (disabled) return;
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropH = 220;
      if (spaceBelow >= dropH) {
        setDropdownStyle({ top: rect.bottom + 4, left: rect.left, width: rect.width });
      } else {
        setDropdownStyle({ bottom: window.innerHeight - rect.top + 4, left: rect.left, width: rect.width });
      }
    }
    setIsOpen(true);
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        wrapperRef.current && !wrapperRef.current.contains(e.target) &&
        !document.getElementById('combobox-portal')?.contains(e.target)
      ) {
        setIsOpen(false);
        setSearch('');
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (id) => {
    onChange(id);
    setSearch('');
    setIsOpen(false);
  };

  const dropdown = isOpen ? createPortal(
    <div
      id="combobox-portal"
      style={{ position: 'fixed', zIndex: 9999, ...dropdownStyle }}
      className="bg-zinc-800 border border-zinc-700/60 rounded-lg shadow-2xl shadow-black/70 overflow-hidden"
    >
      <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-700/40">
        <Search className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
        <input
          autoFocus
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar..."
          className="flex-1 bg-transparent text-sm text-zinc-200 placeholder:text-zinc-500 outline-none"
        />
        {search && (
          <button onMouseDown={(e) => { e.preventDefault(); setSearch(''); }} className="text-zinc-500 hover:text-zinc-300">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <div className="max-h-48 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="px-3 py-4 text-sm text-zinc-500 text-center">Sin resultados</div>
        ) : (
          filtered.map((option) => (
            <button
              key={option.id}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); handleSelect(option.id); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors duration-150 hover:bg-red-950/30
                ${option.id === value ? 'bg-red-950/20 text-red-300' : 'text-zinc-300'}`}
            >
              <Avatar item={option} />
              <div className="text-left flex-1 min-w-0">
                <div className="truncate">{option.nombre}</div>
                {option.personaje && <div className="text-[10px] text-zinc-500 truncate">{option.personaje}</div>}
              </div>
              {option.rol && (option.rol === 'killer' || option.rol === 'survivor') && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                  option.rol === 'killer' ? 'bg-red-900/40 text-red-300' : 'bg-blue-900/40 text-blue-300'
                }`}>
                  {option.rol === 'killer' ? 'K' : 'S'}
                </span>
              )}
            </button>
          ))
        )}
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <div ref={wrapperRef} className="relative">
      {label && <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">{label}</label>}
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={openDropdown}
        className="w-full flex items-center gap-2 px-3 py-2.5 bg-zinc-800/80 border border-zinc-700/50 rounded-lg text-left
          focus:outline-none focus:border-red-800/50 focus:ring-1 focus:ring-red-800/30
          disabled:opacity-50 disabled:cursor-not-allowed
          hover:border-zinc-600/50 transition-all duration-200"
      >
        {selected ? (
          <>
            <Avatar item={selected} />
            <span className="text-sm text-zinc-200 flex-1 text-left truncate">{selected.nombre}</span>
          </>
        ) : (
          <span className="text-sm text-zinc-500 flex-1 text-left">{placeholder}</span>
        )}
        <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {dropdown}
    </div>
  );
}

export { Avatar };