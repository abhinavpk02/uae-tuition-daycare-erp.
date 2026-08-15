import React, { useEffect, useState, useRef } from 'react';
import { Search } from 'lucide-react';

export default function SearchableSelectInput({ label, placeholder, options = [], value, onChange, style }) {
  const selectedOpt = options.find(o => String(o.value) === String(value));
  const [searchTerm, setSearchTerm] = useState(selectedOpt ? selectedOpt.label : '');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const matched = options.find(o => String(o.value) === String(value));
    if (!isOpen) {
      if (matched) {
        setSearchTerm(matched.label);
      } else if (!value && options.length > 0 && options[0].value === '') {
        setSearchTerm(options[0].label);
      } else if (!value) {
        setSearchTerm('');
      }
    }
  }, [value, options, isOpen]);

  const filteredOptions = options.filter(o =>
    o.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        const matched = options.find(o => String(o.value) === String(value));
        if (matched) {
          setSearchTerm(matched.label);
        } else if (!value && options.length > 0 && options[0].value === '') {
          setSearchTerm(options[0].label);
        } else {
          setSearchTerm('');
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value, options]);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', ...style }}>
      {label && <label className="form-label">{label}</label>}
      <div style={{ position: 'relative', width: '100%' }}>
        <input
          type="text"
          className="form-input"
          placeholder={placeholder || "Type to search option..."}
          value={searchTerm}
          onFocus={() => {
            setIsOpen(true);
            setSearchTerm('');
          }}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          style={{
            paddingRight: '36px',
            fontWeight: 600,
            width: '100%',
            cursor: 'text'
          }}
        />
        <Search size={16} color="var(--accent-primary)" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
      </div>

      {isOpen && (
        <div 
          className="search-results-popover"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '6px',
            borderRadius: '16px',
            padding: '6px',
            maxHeight: '240px',
            overflowY: 'auto'
          }}
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map(opt => (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setSearchTerm(opt.label);
                  setIsOpen(false);
                }}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '0.86rem',
                  color: String(opt.value) === String(value) ? 'var(--accent-primary)' : 'var(--text-main)',
                  fontWeight: String(opt.value) === String(value) ? 700 : 500,
                  background: String(opt.value) === String(value) ? 'var(--card-bg-subtle)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justify: 'space-between',
                  transition: 'background 0.15s ease'
                }}
              >
                <span>{opt.label}</span>
                {String(opt.value) === String(value) && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-primary)', fontWeight: 700 }}>✓ Selected</span>
                )}
              </div>
            ))
          ) : (
            <div style={{ padding: '10px 14px', fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              No option found matching "{searchTerm}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
