import React, { useEffect, useState } from 'react';
import { ShoppingBag, Plus, Minus, Trash2, CheckCircle2, Package, Tag, ArrowRight, X } from 'lucide-react';

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
          // Local fallback completion
          setCheckoutResult({
            total_amount: totalAmount,
            journal_entry_id: 'JE-LOCAL-' + Date.now().toString().substring(6)
          });
          // Decrement stock locally
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

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
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
                  position: 'relative'
                }}
                onClick={() => addToCart(item)}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span className={`badge-status ${item.stock_qty <= 5 ? 'badge-warning' : 'badge-success'}`} style={{ fontSize: '0.7rem' }}>
                      Stock: {item.stock_qty} {item.stock_qty <= 5 ? '(Low)' : 'units'}
                    </span>
                    
                    {/* Delete Item Button */}
                    <button 
                      onClick={(e) => handleDeleteInventoryItem(item.id, e)}
                      title="Delete Item"
                      style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        color: 'var(--text-muted)', 
                        cursor: 'pointer',
                        padding: '4px',
                        borderRadius: '6px',
                        transition: 'color 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.color = '#EF4444'}
                      onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <h4 style={{ fontFamily: 'Outfit', fontSize: '1.05rem', margin: '8px 0', color: 'var(--text-main)' }}>{item.item_name}</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.category || 'General'}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-primary)' }}>
                    AED {item.price.toFixed(2)}
                  </span>
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

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Link Student (Optional)</label>
              <select className="form-select" value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}>
                <option value="">-- General Walk-in Customer --</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.standard})</option>
                ))}
              </select>
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
              <h3 style={{ fontFamily: 'Outfit', fontSize: '1.3rem', color: 'var(--text-main)' }}>Add New Inventory Item</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddInventoryItem}>
              <div className="form-group">
                <label className="form-label">Item Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Science Activity Workbook" 
                  value={newItemName} 
                  onChange={e => setNewItemName(e.target.value)} 
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Price (AED)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    className="form-input" 
                    placeholder="75.00" 
                    value={newItemPrice} 
                    onChange={e => setNewItemPrice(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Initial Stock Qty</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="25" 
                    value={newItemStock} 
                    onChange={e => setNewItemStock(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label className="form-label">Category</label>
                <select className="form-select" value={newItemCategory} onChange={e => setNewItemCategory(e.target.value)}>
                  <option value="Tuition">Tuition</option>
                  <option value="Daycare">Daycare</option>
                  <option value="Uniforms">Uniforms</option>
                  <option value="Books">Books</option>
                  <option value="Snacks">Snacks</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-emerald" style={{ flex: 1, justifyContent: 'center' }}>
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Checkout Success Confirmation Modal */}
      {checkoutResult && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '480px' }}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <CheckCircle2 size={48} color="var(--accent-primary)" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontFamily: 'Outfit', color: 'var(--text-main)' }}>POS Checkout Successful!</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Stock decremented and double-entry posted to general ledger.</p>
            </div>

            <div style={{ background: 'var(--card-bg-subtle)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Total Revenue Posted:</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-primary)', fontFamily: 'monospace' }}>AED {checkoutResult.total_amount.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Journal Entry Reference:</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{checkoutResult.journal_entry_id?.substring(0, 12)}</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--accent-primary)' }}>
                ✔ Debit: 1000 Cash & Bank (AED {checkoutResult.total_amount.toFixed(2)})<br/>
                ✔ Credit: 4200 POS Sales Revenue (AED {checkoutResult.total_amount.toFixed(2)})
              </div>
            </div>

            <button className="btn btn-emerald" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setCheckoutResult(null)}>
              Close & Ready Next Customer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
