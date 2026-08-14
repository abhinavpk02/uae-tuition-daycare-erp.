import React, { useEffect, useState } from 'react';
import { ShoppingBag, Plus, Minus, Trash2, CheckCircle2, Package, Tag, ArrowRight } from 'lucide-react';

export default function POSView() {
  const [inventory, setInventory] = useState([]);
  const [cart, setCart] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [checkoutResult, setCheckoutResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchInventory = () => {
    fetch('/api/billing-pos/inventory')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setInventory(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchInventory();

    fetch('/api/students')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setStudents(data);
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
          alert(data.detail || 'Checkout failed');
        }
      })
      .catch(err => alert(err.message))
      .finally(() => setLoading(false));
  };

  return (
    <div className="view-container">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'Outfit', fontSize: '1.6rem' }}>POS Inventory Checkout Terminal</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Direct stock decrement with instant double-entry accounting dispatch (Debit Cash 1000, Credit POS Sales 4200)</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        {/* Products Grid */}
        <div>
          <h3 style={{ fontFamily: 'Outfit', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={20} color="var(--accent-emerald)" /> Inventory Items
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
            {inventory.length > 0 ? (
              inventory.map(item => (
                <div 
                  key={item.id} 
                  className="glass-card" 
                  style={{ 
                    cursor: item.stock_qty > 0 ? 'pointer' : 'not-allowed', 
                    opacity: item.stock_qty > 0 ? 1 : 0.5,
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    justify: 'space-between'
                  }}
                  onClick={() => addToCart(item)}
                >
                  <div>
                    <span className="badge-status badge-warning" style={{ fontSize: '0.7rem', marginBottom: '8px' }}>
                      Stock: {item.stock_qty} units
                    </span>
                    <h4 style={{ fontFamily: 'Outfit', fontSize: '1.05rem', margin: '8px 0' }}>{item.item_name}</h4>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.1rem', color: '#10B981' }}>
                      AED {item.price.toFixed(2)}
                    </span>
                    <button className="btn btn-emerald" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                      <Plus size={14} /> Add
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>Loading inventory...</p>
            )}
          </div>
        </div>

        {/* Shopping Cart & Terminal Summary */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontFamily: 'Outfit', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingBag size={20} color="var(--accent-gold)" /> Active Cart
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
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{item.item_name}</div>
                      <div style={{ color: '#10B981', fontSize: '0.8rem', fontFamily: 'monospace' }}>AED {item.price.toFixed(2)} each</div>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button className="btn btn-outline" style={{ padding: '4px 8px' }} onClick={() => updateQty(item.id, -1)}><Minus size={12} /></button>
                      <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{item.qty}</span>
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
              <span style={{ color: '#10B981', fontFamily: 'monospace' }}>AED {totalAmount.toFixed(2)}</span>
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

      {/* Checkout Success Confirmation Modal */}
      {checkoutResult && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '480px', background: '#0F172A', border: '1px solid var(--accent-emerald)' }}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <CheckCircle2 size={48} color="#10B981" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontFamily: 'Outfit' }}>POS Checkout Successful!</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Stock decremented and double-entry posted to general ledger.</p>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Total Revenue Posted:</span>
                <span style={{ fontWeight: 700, color: '#10B981', fontFamily: 'monospace' }}>AED {checkoutResult.total_amount.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Journal Entry Reference:</span>
                <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{checkoutResult.journal_entry_id?.substring(0, 8)}...</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--accent-gold)' }}>
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
