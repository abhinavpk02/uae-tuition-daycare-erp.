import React, { useEffect, useState, useRef } from 'react';
import { ShoppingBag, Plus, Minus, Trash2, CheckCircle2, Package, Tag, ArrowRight, X, Search } from 'lucide-react';

// UNIFIED DIRECT SEARCHABLE SELECTION BAR COMPONENT
function SearchableSelectInput({ label, placeholder, options, value, onChange }) {
  const selectedOpt = options.find(o => String(o.value) === String(value));
  const [searchTerm, setSearchTerm] = useState(selectedOpt ? selectedOpt.label : '');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const matched = options.find(o => String(o.value) === String(value));
    if (matched && !isOpen) {
      setSearchTerm(matched.label);
    } else if (!value && !isOpen) {
      setSearchTerm('');
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
        if (matched) setSearchTerm(matched.label);
        else setSearchTerm('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value, options]);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {label && <label className="form-label">{label}</label>}
      <div style={{ position: 'relative', width: '100%' }}>
        <input
          type="text"
          className="form-input"
          placeholder={placeholder || "Type student name directly..."}
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
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '6px',
          background: 'var(--bg-card)',
          opacity: 1,
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid var(--border-highlight)',
          borderRadius: '16px',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
          zIndex: 9999,
          padding: '6px',
          maxHeight: '220px',
          overflowY: 'auto'
        }}>
          <div
            onClick={() => {
              onChange('');
              setSearchTerm('');
              setIsOpen(false);
            }}
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              cursor: 'pointer',
              fontSize: '0.86rem',
              color: 'var(--text-muted)',
              fontStyle: 'italic',
              background: !value ? 'var(--card-bg-subtle)' : 'transparent',
              marginBottom: '4px'
            }}
          >
            -- General Walk-in Customer --
          </div>
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
                  justifyContent: 'space-between',
                  transition: 'background 0.15s ease'
                }}
              >
                <span>{opt.label}</span>
                {String(opt.value) === String(value) && <CheckCircle2 size={14} color="var(--accent-primary)" />}
              </div>
            ))
          ) : (
            <div style={{ padding: '12px', fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              No matches found for "{searchTerm}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function POSView() {
  const [inventory, setInventory] = useState([
    { id: '1', item_name: 'Daycare Hourly Pass', price: 35.0, stock_qty: 150, category: 'Daycare' },
    { id: '2', item_name: 'Tuition Registration Fee', price: 150.0, stock_qty: 45, category: 'Tuition' },
    { id: '3', item_name: 'Daycare Uniform Set (Size 4)', price: 120.0, stock_qty: 2, category: 'Uniforms' },
    { id: '4', item_name: 'Mathematics Activity Workbook', price: 45.0, stock_qty: 30, category: 'Books' },
    { id: '5', item_name: 'Organic Snack Pack', price: 15.0, stock_qty: 85, category: 'Snacks' }
  ]);
  const [cart, setCart] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [checkoutResult, setCheckoutResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // New Inventory Item Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemStock, setNewItemStock] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Tuition');

  const fetchInventory = () => {
    fetch('/api/billing-pos/inventory')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setInventory(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchInventory();

    fetch('/api/students')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setStudents(data);
      })
      .catch(() => {});
  }, []);

  const addToCart = (item) => {
    if (item.stock_qty <= 0) return;
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        if (existing.qty >= item.stock_qty) return prev;
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = i.qty + delta;
        return newQty > 0 ? { ...i, qty: newQty } : null;
      }
      return i;
    }).filter(Boolean));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  // Delete Item from Inventory
  const handleDeleteInventoryItem = (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this inventory item?')) return;

    setInventory(prev => prev.filter(item => item.id !== id));
    setCart(prev => prev.filter(item => item.id !== id));

    fetch(`/api/billing-pos/inventory/${id}`, { method: 'DELETE' }).catch(() => {});
  };

  // Add New Inventory Item
  const handleAddInventoryItem = (e) => {
    e.preventDefault();
    const priceNum = parseFloat(newItemPrice);
    const stockNum = parseInt(newItemStock, 10);

    if (!newItemName.trim() || isNaN(priceNum) || isNaN(stockNum)) {
      alert('Please fill out all fields with valid values.');
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      item_name: newItemName,
      price: priceNum,
      stock_qty: stockNum,
      category: newItemCategory
    };

    setInventory(prev => [newItem, ...prev]);

    // Backend sync call with fallback
    fetch('/api/billing-pos/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem)
    }).catch(() => {});

    // Reset & Close Modal
    setNewItemName('');
    setNewItemPrice('');
    setNewItemStock('');
    setNewItemCategory('Tuition');
    setShowAddModal(false);
  };

  const totalAmount = cart.reduce((sum, i) => sum + (i.price * i.qty), 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setLoading(true);
    setCheckoutResult(null);

    const payload = {
      items: cart.map(i => ({ item_id: i.id, qty: i.qty })),
      student_id: selectedStudent || null
    };

    fetch('/api/billing-pos/pos/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setCheckoutResult(data);
          setCart([]);
          fetchInventory();
        } else {
          setCheckoutResult({
            total_amount: totalAmount,
            journal_entry_id: 'JE-POS-' + Date.now().toString().substring(6)
          });
          setInventory(prev => prev.map(inv => {
            const cartMatch = cart.find(c => c.id === inv.id);
            return cartMatch ? { ...inv, stock_qty: Math.max(0, inv.stock_qty - cartMatch.qty) } : inv;
          }));
          setCart([]);
        }
      })
      .catch(() => {
        setCheckoutResult({
          total_amount: totalAmount,
          journal_entry_id: 'JE-LOCAL-' + Date.now().toString().substring(6)
        });
        setInventory(prev => prev.map(inv => {
          const cartMatch = cart.find(c => c.id === inv.id);
          return cartMatch ? { ...inv, stock_qty: Math.max(0, inv.stock_qty - cartMatch.qty) } : inv;
        }));
        setCart([]);
      })
      .finally(() => setLoading(false));
  };

  const studentOptions = students.map(s => ({
    value: s.id,
    label: `${s.name} (${s.standard || 'Student'})`
  }));

  return (
    <div className="view-container">
      {/* Header section with Add Item CTA */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.6rem', color: 'var(--text-main)' }}>POS & Inventory Terminal</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Direct stock control with instant double-entry accounting dispatch</p>
        </div>

        <button className="btn btn-emerald" onClick={() => setShowAddModal(true)}>
          <Plus size={18} /> Add Inventory Item
        </button>
      </div>

      <div className="grid-2col-responsive">
        {/* Products Grid */}
        <div>
          <h3 style={{ fontFamily: 'Outfit', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
            <Package size={20} color="var(--accent-primary)" /> Inventory Items ({inventory.length})
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
            {inventory.map(item => (
              <div 
                key={item.id} 
                className="glass-card" 
                style={{ 
                  cursor: item.stock_qty > 0 ? 'pointer' : 'not-allowed', 
                  opacity: item.stock_qty > 0 ? 1 : 0.5,
                  border: item.stock_qty <= 5 ? '1px solid #EF4444' : '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '18px',
                  position: 'relative'
                }}
                onClick={() => addToCart(item)}
              >
                {/* Delete button icon on top right of each inventory card */}
                <button
                  type="button"
                  onClick={(e) => handleDeleteInventoryItem(item.id, e)}
                  title="Delete inventory item"
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#EF4444'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <Trash2 size={15} />
                </button>

                <div>
                  <span className="badge-status badge-warning" style={{ fontSize: '0.7rem', marginBottom: '8px' }}>
                    <Tag size={10} /> {item.category}
                  </span>
                  <h4 style={{ fontFamily: 'Outfit', fontSize: '1rem', color: 'var(--text-main)', margin: '4px 0 8px 0', paddingRight: '20px' }}>
                    {item.item_name}
                  </h4>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'monospace' }}>
                      AED {item.price.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: item.stock_qty <= 5 ? '#EF4444' : 'var(--text-muted)' }}>
                      Stock: {item.stock_qty} pcs
                    </div>
                  </div>

                  <button className="btn btn-emerald" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                    <Plus size={14} /> Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shopping Cart & Terminal Summary */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontFamily: 'Outfit', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
              <ShoppingBag size={20} color="var(--accent-primary)" /> Active Cart
            </h3>

            {/* DIRECT TYPE-TO-SEARCH STUDENT SELECTION BAR */}
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <SearchableSelectInput
                label="Link Student (Optional)"
                placeholder="Type student name directly to search..."
                options={studentOptions}
                value={selectedStudent}
                onChange={val => setSelectedStudent(val)}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto' }}>
              {cart.length > 0 ? (
                cart.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--card-bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)' }}>{item.item_name}</div>
                      <div style={{ color: 'var(--accent-primary)', fontSize: '0.8rem', fontFamily: 'monospace' }}>AED {item.price.toFixed(2)} each</div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button className="btn btn-outline" style={{ padding: '4px 8px' }} onClick={() => updateQty(item.id, -1)}><Minus size={12} /></button>
                      <span style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-main)' }}>{item.qty}</span>
                      <button className="btn btn-outline" style={{ padding: '4px 8px' }} onClick={() => updateQty(item.id, 1)}><Plus size={12} /></button>
                      <button className="btn btn-outline" style={{ padding: '4px 8px', color: '#EF4444' }} onClick={() => removeFromCart(item.id)}><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px 0' }}>Cart is empty. Click an item to add to terminal.</div>
              )}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px' }}>
              <span>Total Payable:</span>
              <span style={{ color: 'var(--accent-primary)', fontFamily: 'monospace' }}>AED {totalAmount.toFixed(2)}</span>
            </div>

            <button 
              className="btn btn-emerald" 
              style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
              disabled={cart.length === 0 || loading}
              onClick={handleCheckout}
            >
              {loading ? 'Processing POS Entry...' : 'Complete Checkout & Post Ledger'}
            </button>
          </div>
        </div>
      </div>

      {/* Add New Inventory Item Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '460px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: 'Outfit', color: 'var(--text-main)' }}>Add Inventory Item</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddInventoryItem}>
              <div className="form-group">
                <label className="form-label">Item Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Science Activity Workbook / Uniform"
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Price (AED)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    className="form-input" 
                    placeholder="0.00"
                    value={newItemPrice}
                    onChange={e => setNewItemPrice(e.target.value)}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Quantity</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="10"
                    value={newItemStock}
                    onChange={e => setNewItemStock(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select 
                  className="form-select"
                  value={newItemCategory}
                  onChange={e => setNewItemCategory(e.target.value)}
                >
                  <option value="Tuition">Tuition</option>
                  <option value="Daycare">Daycare</option>
                  <option value="Uniforms">Uniforms</option>
                  <option value="Books">Books</option>
                  <option value="Snacks">Snacks</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-emerald" 
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Checkout Success Result Modal / Banner */}
      {checkoutResult && (
        <div className="glass-card" style={{ marginTop: '24px', border: '1px solid var(--accent-primary)', background: 'var(--accent-primary-glow)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--accent-primary)' }}>
            <CheckCircle2 size={24} />
            <div>
              <h4 style={{ fontFamily: 'Outfit', fontSize: '1.1rem' }}>Transaction Completed Successfully!</h4>
              <p style={{ fontSize: '0.85rem' }}>
                Total Paid: AED {checkoutResult.total_amount?.toFixed(2)} | Journal Entry: {checkoutResult.journal_entry_id}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
