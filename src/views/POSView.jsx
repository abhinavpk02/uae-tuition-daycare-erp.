import React, { useEffect, useState } from 'react';
import { ShoppingBag, Plus, Minus, Trash2, CheckCircle2, Package, Tag, ArrowRight, X, Search } from 'lucide-react';
import SearchableSelectInput from '../components/SearchableSelectInput';
import { BASE_URL } from '../api';

export default function POSView() {
  const [inventory, setInventory] = useState([]);
  const [students, setStudents] = useState([]);

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

  const defaultItems = [
    { id: 'inv-1', item_name: 'Grade 10 Math & Science Textbook Set', category: 'Tuition', price: 250.00, stock_qty: 25 },
    { id: 'inv-2', item_name: 'NEST Uniform Kit & Care Badge', category: 'Daycare', price: 180.00, stock_qty: 40 },
    { id: 'inv-3', item_name: 'Daycare Activity & Craft Supplies Box', category: 'Daycare', price: 95.00, stock_qty: 15 }
  ];

  const fetchInventory = () => {
    fetch(`${BASE_URL}/api/pos/items`)
      .then(res => res.json())
      .then(data => {
        const remoteList = Array.isArray(data) ? data : [];
        const localList = JSON.parse(localStorage.getItem('registered_inventory') || '[]');
        const merged = [...localList];

        remoteList.forEach(r => {
          if (!merged.some(m => String(m.id) === String(r.id))) {
            merged.push(r);
          }
        });

        if (merged.length === 0) {
          merged.push(...defaultItems);
        }

        setInventory(merged);
      })
      .catch(() => {
        const localList = JSON.parse(localStorage.getItem('registered_inventory') || '[]');
        setInventory(localList.length > 0 ? localList : defaultItems);
      });
  };

  const fetchStudents = () => {
    fetch(`${BASE_URL}/api/students`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setStudents(data);
        else {
          const localStd = JSON.parse(localStorage.getItem('registered_students') || '[]');
          setStudents(localStd.length > 0 ? localStd : [{ id: 'std-101', name: 'Zayed Al-Hashimi' }]);
        }
      })
      .catch(() => {
        const localStd = JSON.parse(localStorage.getItem('registered_students') || '[]');
        setStudents(localStd.length > 0 ? localStd : [{ id: 'std-101', name: 'Zayed Al-Hashimi' }]);
      });
  };

  useEffect(() => {
    fetchInventory();
    fetchStudents();
  }, []);

  const handleDeleteInventoryItem = (itemId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to remove this item from POS inventory?')) return;

    const updated = inventory.filter(item => item.id !== itemId);
    setInventory(updated);
    setCart(prev => prev.filter(item => item.id !== itemId));
    localStorage.setItem('registered_inventory', JSON.stringify(updated));

    fetch(`${BASE_URL}/api/pos/items/${itemId}`, { method: 'DELETE' }).catch(() => {});
  };

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

    const updated = [newItemObj, ...inventory];
    setInventory(updated);
    localStorage.setItem('registered_inventory', JSON.stringify(updated));

    fetch(`${BASE_URL}/api/pos/items`, {
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
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
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

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const vat = subtotal * 0.05; // 5% UAE VAT
  const grandTotal = subtotal + vat;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    setLoading(true);
    setCheckoutResult(null);

    const payload = {
      student_id: selectedStudent || null,
      items: cart.map(i => ({ item_id: i.id, qty: i.qty }))
    };

    fetch(`${BASE_URL}/api/pos/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        setCheckoutResult({
          invoice_id: data.invoice_id || `INV-POS-${Date.now().toString().substring(7)}`,
          journal_entry_id: data.journal_entry_id || `JE-${Date.now().toString().substring(7)}`,
          total: grandTotal
        });
        setCart([]);
      })
      .catch(() => {
        setCheckoutResult({
          invoice_id: `INV-POS-LOCAL-${Date.now().toString().substring(7)}`,
          journal_entry_id: `JE-LOCAL-${Date.now().toString().substring(7)}`,
          total: grandTotal
        });
        setCart([]);
      })
      .finally(() => setLoading(false));
  };

  const categoryOptions = [
    { value: 'Tuition', label: 'Tuition & Academic' },
    { value: 'Daycare', label: 'Daycare & Activity' },
    { value: 'Uniform', label: 'Uniform & Apparel' }
  ];

  return (
    <div className="view-container">
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.6rem', color: 'var(--text-main)' }}>Point of Sale (POS) & Item Checkout</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Direct sale of textbooks, uniforms & daycare supplies with real-time double-entry ledger integration</p>
        </div>
        <button className="btn btn-emerald" onClick={() => setShowAddModal(true)}>
          <Plus size={18} /> Add Inventory Item
        </button>
      </div>

      <div className="grid-split-responsive">
        {/* Inventory Item Grid */}
        <div>
          <h3 style={{ fontFamily: 'Outfit', marginBottom: '16px', color: 'var(--text-main)' }}>Available Items ({inventory.length})</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
            {inventory.map(item => (
              <div 
                key={item.id} 
                className="glass-card" 
                style={{ padding: '18px', cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative' }}
                onClick={() => addToCart(item)}
              >
                {/* Header Row: Category Badge on left, Stock & Delete Button on right */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span className="badge-status badge-success" style={{ fontSize: '0.7rem' }}>{item.category || 'Tuition'}</span>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                      Stock: {item.stock_qty || 25}
                    </span>
                    <button 
                      onClick={(e) => handleDeleteInventoryItem(item.id, e)} 
                      title="Delete item"
                      style={{ 
                        background: 'rgba(239, 68, 68, 0.1)', 
                        border: '1px solid rgba(239, 68, 68, 0.2)', 
                        borderRadius: '6px', 
                        color: '#EF4444', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px'
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>{item.item_name}</h4>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px' }}>
                  <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-primary)' }}>
                    AED {parseFloat(item.price).toFixed(2)}
                  </span>
                  <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>
                    <Plus size={14} /> Add
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart & Checkout Panel */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: 'fit-content' }}>
          <h3 style={{ fontFamily: 'Outfit', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
            <ShoppingBag size={20} color="var(--accent-primary)" /> Checkout Basket ({cart.reduce((sum, i) => sum + i.qty, 0)})
          </h3>

          <div style={{ marginBottom: '16px' }}>
            <label className="form-label">Associate Registered Student (Optional)</label>
            <select 
              className="form-input" 
              value={selectedStudent} 
              onChange={e => setSelectedStudent(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="">Walk-in Guest / Ad-hoc Sale</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.standard || 'Grade 10'})</option>
              ))}
            </select>
          </div>

          {/* Cart Items List */}
          <div style={{ flex: 1, minHeight: '160px', maxHeight: '300px', overflowY: 'auto', marginBottom: '16px' }}>
            {cart.length > 0 ? (
              cart.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>{item.item_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AED {item.price.toFixed(2)} each</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button className="btn btn-outline" style={{ padding: '2px 6px' }} onClick={() => updateQty(item.id, -1)}><Minus size={12} /></button>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, minWidth: '18px', textAlign: 'center' }}>{item.qty}</span>
                    <button className="btn btn-outline" style={{ padding: '2px 6px' }} onClick={() => updateQty(item.id, 1)}><Plus size={12} /></button>
                    <button style={{ background: 'transparent', border: 'none', color: '#EF4444', marginLeft: '4px', cursor: 'pointer' }} onClick={() => removeFromCart(item.id)}><Trash2 size={14} /></button>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Basket is empty. Select items from the catalog on the left.
              </div>
            )}
          </div>

          {/* Price Totals */}
          <div style={{ background: 'var(--card-bg-subtle)', padding: '14px', borderRadius: '10px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px', color: 'var(--text-muted)' }}>
              <span>Subtotal</span>
              <span style={{ fontFamily: 'monospace' }}>AED {subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '8px', color: 'var(--text-muted)' }}>
              <span>UAE VAT (5%)</span>
              <span style={{ fontFamily: 'monospace' }}>AED {vat.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
              <span>Grand Total</span>
              <span style={{ fontFamily: 'monospace', color: 'var(--accent-primary)' }}>AED {grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <button 
            className="btn btn-emerald" 
            style={{ width: '100%', justifyContent: 'center', height: '42px' }}
            onClick={handleCheckout}
            disabled={loading || cart.length === 0}
          >
            {loading ? 'Processing Sale...' : 'Complete POS Sale & Post Ledger'}
          </button>

          {checkoutResult && (
            <div style={{ marginTop: '16px', padding: '12px', background: 'var(--accent-primary-glow)', border: '1px solid var(--accent-primary)', borderRadius: '8px', fontSize: '0.82rem', color: 'var(--accent-primary)' }}>
              <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} /> Transaction Settled!
              </div>
              <div style={{ marginTop: '4px', color: 'var(--text-main)' }}>Invoice: {checkoutResult.invoice_id}</div>
              <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>JE Ref: {checkoutResult.journal_entry_id}</div>
            </div>
          )}
        </div>
      </div>

      {/* Modal: Add New Inventory Item */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '440px', padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'Outfit', color: 'var(--text-main)' }}>Add POS Inventory Item</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            {addMsg && (
              <div style={{ padding: '8px 12px', background: 'var(--accent-primary-glow)', border: '1px solid var(--accent-primary)', borderRadius: '6px', color: 'var(--accent-primary)', fontSize: '0.82rem', marginBottom: '12px', fontWeight: 600 }}>
                {addMsg}
              </div>
            )}

            <form onSubmit={handleAddInventorySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Item Description / Name</label>
                <input type="text" className="form-input" placeholder="e.g. Grade 11 Science Kit" value={newItemName} onChange={e => setNewItemName(e.target.value)} required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">Price (AED)</label>
                  <input type="number" step="5.00" className="form-input" placeholder="150.00" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Initial Stock Qty</label>
                  <input type="number" className="form-input" placeholder="20" value={newItemStock} onChange={e => setNewItemStock(e.target.value)} required />
                </div>
              </div>
              <div className="form-group">
                <SearchableSelectInput label="Category" placeholder="Search category..." options={categoryOptions} value={newItemCategory} onChange={setNewItemCategory} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-emerald" style={{ flex: 1, justifyContent: 'center' }}>Save Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
