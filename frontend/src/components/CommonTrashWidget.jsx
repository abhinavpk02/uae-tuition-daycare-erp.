import React, { useState, useEffect } from 'react';
import { Trash2, RotateCcw, X } from 'lucide-react';
import { getTrashBinItems, restoreTrashItem, deleteTrashItemPermanently, emptyAllTrash } from '../utils/trashBin';

export default function CommonTrashWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const syncTrash = () => {
    setItems(getTrashBinItems());
  };

  useEffect(() => {
    syncTrash();
    window.addEventListener('common_trash_updated', syncTrash);
    return () => {
      window.removeEventListener('common_trash_updated', syncTrash);
    };
  }, []);

  const handleRestore = (trashId) => {
    restoreTrashItem(trashId);
  };

  const handleDeletePermanent = (trashId) => {
    deleteTrashItemPermanently(trashId);
  };

  const handleEmptyTrash = () => {
    if (window.confirm('Are you sure you want to permanently empty all trash items?')) {
      emptyAllTrash();
    }
  };

  const categories = ['All', 'Students', 'Staff', 'Classes', 'POS Items', 'Capital Assets'];

  const filteredItems = selectedCategory === 'All' 
    ? items 
    : items.filter(i => i.category === selectedCategory);

  return (
    <>
      {/* Floating Bottom-Right Big Bin Round Outline Button */}
      <div 
        style={{ 
          position: 'fixed', 
          bottom: '24px', 
          right: '24px', 
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          title="Trash Bin"
          style={{
            width: '58px',
            height: '58px',
            borderRadius: '50%',
            background: 'var(--bg-card)',
            color: 'var(--text-main)',
            border: '2.5px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 12px 35px rgba(0,0,0,0.6)',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            outline: 'none'
          }}
        >
          {/* Big Bin New Icon */}
          <Trash2 size={26} color="#EF4444" />
          
          {items.length > 0 && (
            <span 
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                background: '#EF4444',
                color: '#FFFFFF',
                fontSize: '0.68rem',
                fontWeight: 800,
                borderRadius: '12px',
                padding: '2px 7px',
                lineHeight: 1,
                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.5)'
              }}
            >
              {items.length}
            </span>
          )}
        </button>

        {/* Minimal Bin Drawer / Modal */}
        {isOpen && (
          <div 
            style={{
              position: 'absolute',
              bottom: '72px',
              right: '0',
              width: '360px',
              maxHeight: '520px',
              background: 'var(--bg-card)',
              border: '1.5px solid var(--border-color)',
              borderRadius: '22px',
              padding: '18px',
              boxShadow: '0 24px 64px rgba(0, 0, 0, 0.8)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 10000,
              backdropFilter: 'blur(24px)'
            }}
          >
            {/* Minimal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trash2 size={22} color="#EF4444" />
                <span style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                  ({items.length})
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {items.length > 0 && (
                  <button 
                    onClick={handleEmptyTrash}
                    style={{ background: 'transparent', border: 'none', color: '#EF4444', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Empty
                  </button>
                )}
                <button 
                  onClick={() => setIsOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '10px', marginBottom: '12px', scrollbarWidth: 'none' }}>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    border: '1px solid',
                    borderColor: selectedCategory === cat ? 'var(--text-main)' : 'var(--border-color)',
                    background: selectedCategory === cat ? 'var(--text-main)' : 'var(--card-bg-subtle)',
                    color: selectedCategory === cat ? 'var(--bg-dark)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Trash Items List */}
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '180px' }}>
              {filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <div 
                    key={item.trashId}
                    style={{
                      padding: '12px',
                      background: 'var(--card-bg-subtle)',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)', flex: 1, paddingRight: '8px' }}>
                        {item.title}
                      </span>
                      <span className="badge-status badge-success" style={{ fontSize: '0.65rem' }}>
                        {item.category}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
                        {new Date(item.deletedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => handleRestore(item.trashId)}
                          title="Restore record"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: 'var(--accent-primary-glow)',
                            border: '1px solid var(--accent-primary)',
                            borderRadius: '6px',
                            color: 'var(--accent-primary)',
                            padding: '3px 8px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          <RotateCcw size={12} /> Restore
                        </button>

                        <button
                          onClick={() => handleDeletePermanent(item.trashId)}
                          title="Delete permanently"
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#EF4444',
                            cursor: 'pointer',
                            padding: '2px'
                          }}
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '36px 12px', fontSize: '0.82rem' }}>
                  <Trash2 size={26} color="var(--text-dim)" style={{ marginBottom: '8px' }} />
                  <div>Empty ({selectedCategory})</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
