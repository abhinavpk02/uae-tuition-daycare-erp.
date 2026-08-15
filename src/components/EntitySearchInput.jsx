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

  const defaultStudents = [
    { id: 'std-101', name: 'Zayed Al-Hashimi', standard: 'Grade 10' },
    { id: 'std-102', name: 'Amina Al-Mansoori', standard: 'Grade 11' },
    { id: 'std-103', name: 'Ahmed Hassan', standard: 'Grade 9' },
    { id: 'std-104', name: 'Fatima Saeed', standard: 'KG 2 Daycare' },
    { id: 'std-105', name: 'Abhinav Kumar', standard: 'Grade 12' }
  ];

  const defaultStaff = [
    { id: 'stf-201', name: 'Fatima Al-Mansoori', role: 'Teacher' },
    { id: 'stf-202', name: 'Ayesha Rashid', role: 'Caregiver' },
    { id: 'stf-203', name: 'Mariam Al-Zahra', role: 'Administrator' },
    { id: 'stf-204', name: 'Tariq Mahmoud', role: 'Supervisor' }
  ];

  // Use provided data or fallback defaults
  const activeData = (Array.isArray(data) && data.length > 0) 
    ? data 
    : (type === "student" ? defaultStudents : defaultStaff);

  const placeholder = type === "student" ? "Enter student name..." : "Enter staff name...";

  const getItemLabel = (item) => {
    if (!item) return '';
    if (typeof item === 'string') return item;
    
    const nameStr = item.name || item.studentName || item.staffName || item.label || item.title || item.email || String(item.id || '');
    if (!nameStr) return String(item.id || item.value || '');

    if (type === "student") {
      const gradeStr = item.standard || item.grade || '';
      return gradeStr ? `${nameStr} (${gradeStr})` : nameStr;
    }
    const roleStr = item.role || item.title || '';
    return roleStr ? `${nameStr} (${roleStr})` : nameStr;
  };

  const getItemValue = (item) => {
    if (!item) return '';
    if (typeof item === 'string') return item;
    return item.id !== undefined ? item.id : (item.value !== undefined ? item.value : item);
  };

  useEffect(() => {
    if (value !== undefined && value !== null) {
      const selected = activeData.find(item => String(getItemValue(item)) === String(value));
      if (selected && !isOpen) {
        setSearchTerm(getItemLabel(selected));
      }
    }
  }, [value, activeData, isOpen]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        const selected = activeData.find(item => String(getItemValue(item)) === String(value));
        if (selected) {
          setSearchTerm(getItemLabel(selected));
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value, activeData]);

  const filteredData = activeData.filter(item => {
    const itemLabel = getItemLabel(item);
    return itemLabel.toLowerCase().includes((searchTerm || '').toLowerCase());
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
                    justifyContent: 'space-between',
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
