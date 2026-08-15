import React, { useState, useEffect, useRef } from 'react';
import { Search, Check } from 'lucide-react';

export default function EntitySearchInput({
  type = "student", // "student" | "staff"
  data = [],
  onSelect,
  value,
  label
}) {
  const containerRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const placeholder = type === "student" ? "Enter student name..." : "Enter staff name...";

  const getItemLabel = (item) => {
    if (!item) return '';
    if (typeof item === 'string') return item;
    if (item.name) {
      if (type === "student") {
        return `${item.name} ${item.standard ? `(${item.standard})` : ''}`;
      }
      return `${item.name} ${item.role ? `(${item.role})` : ''}`;
    }
    return item.label || String(item.id || item.value || '');
  };

  const getItemValue = (item) => {
    if (!item) return '';
    if (typeof item === 'string') return item;
    return item.id !== undefined ? item.id : (item.value !== undefined ? item.value : item);
  };

  useEffect(() => {
    if (value !== undefined && value !== null) {
      const selected = data.find(item => String(getItemValue(item)) === String(value));
      if (selected && !isOpen) {
        setSearchTerm(getItemLabel(selected));
      }
    }
  }, [value, data, isOpen]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        const selected = data.find(item => String(getItemValue(item)) === String(value));
        if (selected) {
          setSearchTerm(getItemLabel(selected));
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value, data]);

  const filteredData = data.filter(item => {
    const itemLabel = getItemLabel(item);
    return itemLabel.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {label && (
        <label className="form-label" style={{ display: 'block', marginBottom: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
          {label}
        </label>
      )}

      <div style={{ position: 'relative', width: '100%' }}>
        <input
          type="text"
          className="form-input"
          placeholder={placeholder}
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
            width: '100%',
            paddingRight: '36px',
            height: '42px',
            borderRadius: '10px',
            fontSize: '0.88rem',
            fontWeight: 500,
            background: 'var(--card-bg-subtle, #FAFAFA)',
            border: '1px solid var(--border-color, #E5E7EB)',
            color: 'var(--text-main, #111827)'
          }}
        />
        <Search
          size={16}
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            color: 'var(--text-muted, #9CA3AF)'
          }}
        />
      </div>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: 'var(--card-bg, #FFFFFF)',
            border: '1px solid var(--border-color, #E5E7EB)',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25)',
            zIndex: 9999,
            maxHeight: '220px',
            overflowY: 'auto',
            padding: '4px'
          }}
        >
          {filteredData.length > 0 ? (
            filteredData.map(item => {
              const itemVal = getItemValue(item);
              const itemLbl = getItemLabel(item);
              const isSelected = String(itemVal) === String(value);

              return (
                <div
                  key={String(itemVal)}
                  onClick={() => {
                    if (onSelect) onSelect(item);
                    setSearchTerm(itemLbl);
                    setIsOpen(false);
                  }}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: isSelected ? 600 : 400,
                    color: isSelected ? 'var(--accent-primary, #059669)' : 'var(--text-main, #111827)',
                    background: isSelected ? 'var(--card-bg-subtle, #F3F4F6)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'space-between',
                    transition: 'background 0.15s ease'
                  }}
                >
                  <span>{itemLbl}</span>
                  {isSelected && <Check size={14} color="var(--accent-primary, #059669)" />}
                </div>
              );
            })
          ) : (
            <div style={{ padding: '12px', fontSize: '0.82rem', color: 'var(--text-muted, #9CA3AF)', textAlign: 'center' }}>
              No matches found for "{searchTerm}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}
