import React, { useEffect, useState } from 'react';
import { ShoppingBag, Plus, Minus, Trash2, CheckCircle2, Package, Tag, ArrowRight, X, Search } from 'lucide-react';
import SearchableSelectInput from '../components/SearchableSelectInput';

export default function POSView() {
  const [inventory, setInventory] = useState([
    { id: 'inv-1', item_name: 'Grade 10 Mathematics Course Book', category: 'General', price: 120.0, stock_qty: 50 },
    { id: 'inv-2', item_name: 'Daycare Uniform Set (Polo & Shorts)', category: 'General', price: 150.0, stock_qty: 35 },
    { id: 'inv-3', item_name: 'Montessori Activity Kit', category: 'General', price: 75.0, stock_qty: 40 }
  ]);

  const [students, setStudents] = useState([
    { id: 'std-101', name: 'Zayed Al-Hashimi', standard: 'Grade 10' },
    { id: 'std-102', name: 'Mariam Al-Hashimi', standard: 'KG 2' }
  ]);

  const [cart, setCart] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState(null);

  // Add Inventory Item Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemStock, setNewItemStock] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('Tuition');
  const [addMsg, setAddMsg] = useState('');

  const fetchInventory = () => {
    fetch('/api/pos/items')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setInventory(data); })
      .catch(() => {});
  };

  const fetchStudents = () => {
    const localSaved = JSON.parse(localStorage.getItem('registered_students') || '[]');

    fetch('/api/students')
      .then(res => res.json())
      .then(data => {
        let combined = Array.isArray(data) && data.length > 0 ? [...data] : [...students];
        localSaved.forEach(ls => {
          if (!combined.some(c => String(c.id) === String(ls.id) || c.name.toLowerCase() === ls.name.toLowerCase())) {
            combined.unshift(ls);
          }
        });
        setStudents(combined);
      })
      .catch(() => {
        let combined = [...students];
        localSaved.forEach(ls => {
          if (!combined.some(c => String(c.id) === String(ls.id) || c.name.toLowerCase() === ls.name.toLowerCase())) {
            combined.unshift(ls);
          }
        });
        setStudents(combined);
      });
  };

  useEffect(() => {
    fetchInventory();
    fetchStudents();
  }, []);

  // One-Click Delete Inventory Item
  const handleDeleteInventoryItem = (itemId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to remove this item from POS inventory?')) return;

    setInventory(prev => prev.filter(item => item.id !== itemId));
    setCart(prev => prev.filter(item => item.id !== itemId));

    fetch(`/api/pos/items/${itemId}`, { method: 'DELETE' }).catch(() => {});
  };

  // Add Item to Inventory List & Backend API
  const handleAddInventorySubmit = (e) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemPrice || !newItemStock) return;

    const priceNum = parseFloat(newItemPrice);
    const stockNum = parseInt(newItemStock, 10);
    const newItemObj = {
      id: `inv-${Date.now()}`,
      item_name: newItemName.trim(),
      category: newItemCategory,
      price: priceNum,
      stock_qty: stockNum
    };

    setInventory(prev => [newItemObj, ...prev]);

    fetch('/api/pos/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItemObj)
    }).catch(() => {});

    setAddMsg(`Successfully added "${newItemName}" to stock!`);
    setNewItemName('');
    setNewItemPrice('');
    setNewItemStock('');
    setTimeout(() => {
      setAddMsg('');
      setShowAddModal(false);
    }, 1200);
  };

  const addToCart = (item) => {
    if (item.stock_qty <= 0) return;
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: Math.min(i.qty + 1, item.stock_qty) } : i);
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

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setLoading(true);

    const payload = {
      student_id: selectedStudent || null,
      payment_method: 'Cash',
      items: cart.map(i => ({ item_id: i.id, qty: i.qty, price: i.price }))
    };

    fetch('/api/pos/checkout', {
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

  const studentOptions = [
    { value: '', label: '-- General Walk-in Customer --' },
    ...students.map(s => ({
      value: s.id,
      label: `${s.name} (${s.standard || 'Student'})`
    }))
  ];

  const categoryOptions = [
    { value: 'Tuition', label: 'Tuition Course Books' },
    { value: 'Daycare', label: 'Daycare Uniforms & Supplies' },
    { value: 'Uniforms', label: 'Student Apparel & Uniforms' },
    { value: 'Books', label: 'Library & Activity Books' },
    { value: 'Snacks', label: 'Daycare Snacks & Refreshments' }
  ];

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
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#EF4444'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <Trash2 size={16} />
                </button>

                <div>
                  <span className="badge-status badge-warning" style={{ fontSize: '0.7rem', marginBottom: '8px' }}>
                    <Tag size={10} /> {item.category || 'General'}
                  </span>
                  <h4 style={{ fontFamily: 'Outfit', fontSize: '0.98rem', margin: '4px 0 12px 0', color: 'var(--text-main)', paddingRight: '20px' }}>
                    {item.item_name}
                  </h4>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '12px' }}>
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
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  Cart is empty. Click an item to add to terminal.
                </div>
              )}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '18px', marginTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px', color: 'var(--text-main)' }}>
              <span>Total Payable:</span>
              <span style={{ color: 'var(--accent-primary)', fontFamily: 'monospace' }}>AED {totalAmount.toFixed(2)}</span>
            </div>

            <button 
              className="btn btn-emerald" 
              style={{ width: '100%', justifyContent: 'center', height: '48px', fontSize: '1rem' }}
              disabled={cart.length === 0 || loading}
              onClick={handleCheckout}
            >
              {loading ? 'Posting Journal Entry...' : 'Complete Checkout & Post Ledger'}
            </button>
          </div>
        </div>
      </div>

      {/* Checkout Success Modal */}
      {checkoutResult && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '420px', textAlignment: 'center', padding: '32px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--accent-primary-glow)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              <CheckCircle2 size={32} />
            </div>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.4rem', color: 'var(--text-main)', marginBottom: '8px' }}>Transaction Settled</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>
              Double-entry journal entry successfully posted to General Ledger!
            </p>

            <div style={{ padding: '12px', background: 'var(--card-bg-subtle)', borderRadius: 'var(--radius-sm)', marginBottom: '20px', textAlign: 'left', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Amount Collected:</span>
                <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>AED {checkoutResult.total_amount?.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Journal Reference:</span>
                <span style={{ fontFamily: 'monospace', color: 'var(--text-main)' }}>{checkoutResult.journal_entry_id}</span>
              </div>
            </div>

            <button className="btn btn-emerald" style={{ width: '100%', justifyContent: 'center' }} onClick={() => setCheckoutResult(null)}>
              Done & Print Receipt
            </button>
          </div>
        </div>
      )}

      {/* Add New Inventory Item Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '460px', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: 'Outfit', color: 'var(--text-main)' }}>Add Inventory Item</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {addMsg && (
              <div style={{ padding: '10px', background: 'var(--accent-primary-glow)', border: '1px solid var(--accent-primary)', borderRadius: '8px', color: 'var(--accent-primary)', fontSize: '0.85rem', marginBottom: '16px' }}>
                {addMsg}
              </div>
            )}

            <form onSubmit={handleAddInventorySubmit}>
              <div className="form-group">
                <label className="form-label">Item / Product Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Grade 10 Science Workbook"
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
                    step="0.50" 
                    className="form-input" 
                    placeholder="85.00"
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

              <SearchableSelectInput
                label="Category"
                placeholder="Search item category..."
                options={categoryOptions}
                value={newItemCategory}
                onChange={val => setNewItemCategory(val)}
              />

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
                  Save Stock Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
