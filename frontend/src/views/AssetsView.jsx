import React, { useEffect, useState } from 'react';
import { Building2, Plus, TrendingDown, CheckCircle2 } from 'lucide-react';
import SearchableSelectInput from '../components/SearchableSelectInput';

export default function AssetsView() {
  const [assets, setAssets] = useState([
    { id: '1', item_name: 'Interactive Smartboard Setup (Room 101)', category: 'Technology', cost_basis: 15000.0, depreciation_rate: 15.0, current_book_value: 12750.0 },
    { id: '2', item_name: 'Dell High-Density Server & Router Rack', category: 'Technology', cost_basis: 25000.0, depreciation_rate: 20.0, current_book_value: 20000.0 },
    { id: '3', item_name: 'Daycare Montessori Play & Soft Furniture', category: 'Facility', cost_basis: 18000.0, depreciation_rate: 10.0, current_book_value: 16200.0 },
    { id: '4', item_name: 'Toyota Coaster Student Bus Shuttle', category: 'Transportation', cost_basis: 140000.0, depreciation_rate: 12.5, current_book_value: 122500.0 },
    { id: '5', item_name: 'Magnetic Wall Whiteboards & Projector Set', category: 'Facility', cost_basis: 8500.0, depreciation_rate: 10.0, current_book_value: 7650.0 }
  ]);

  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('Technology');
  const [value, setValue] = useState('10000');
  const [rate, setRate] = useState('10');
  const [message, setMessage] = useState('');

  const fetchAssets = () => {
    fetch('/api/assets')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setAssets(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleAddAsset = (e) => {
    e.preventDefault();
    if (!itemName.trim() || !value) return;

    const cost = parseFloat(value);
    const depRate = parseFloat(rate);
    const newAsset = {
      id: Date.now().toString(),
      item_name: itemName,
      category,
      cost_basis: cost,
      depreciation_rate: depRate,
      current_book_value: cost * (1 - depRate / 100)
    };

    setAssets([newAsset, ...assets]);

    fetch('/api/assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAsset)
    }).catch(() => {});

    setMessage(`Registered "${itemName}" in Fixed Assets Ledger!`);
    setItemName('');
    setValue('10000');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="view-container">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'Outfit', fontSize: '1.6rem', color: 'var(--text-main)' }}>Fixed Assets & Depreciation Ledger</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Asset lifecycle tracking with automated straight-line depreciation dispatch ({assets.length} Capital Assets)</p>
      </div>

      <div className="grid-2col-responsive">
        {/* Assets List */}
        <div className="glass-card">
          <h3 style={{ fontFamily: 'Outfit', marginBottom: '16px', color: 'var(--text-main)' }}>Capital Assets Register ({assets.length})</h3>
          <div className="table-responsive-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Asset Name</th>
                  <th>Category</th>
                  <th>Cost Basis</th>
                  <th>Dep. Rate</th>
                  <th>Current Book Value</th>
                </tr>
              </thead>
              <tbody>
                {assets.map(a => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{a.item_name || a.name}</td>
                    <td><span className="badge-status badge-warning">{a.category}</span></td>
                    <td style={{ fontFamily: 'monospace' }}>AED {a.cost_basis?.toFixed(2)}</td>
                    <td style={{ fontFamily: 'monospace', color: '#EF4444' }}>{a.depreciation_rate}% / yr</td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                      AED {a.current_book_value?.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Asset Form */}
        <div className="glass-card">
          <h3 style={{ fontFamily: 'Outfit', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={20} color="var(--accent-emerald)" /> Register New Asset
          </h3>

          <form onSubmit={handleAddAsset}>
            <SearchableSelectInput
              label="Category"
              placeholder="Search asset category..."
              options={[
                { value: 'Technology', label: 'Technology & Hardware' },
                { value: 'Facility', label: 'Facility & Furniture' },
                { value: 'Transportation', label: 'Student Bus Shuttle' },
                { value: 'Daycare', label: 'Daycare Play Equipment' }
              ]}
              value={category}
              onChange={val => setCategory(val)}
            />

            <div className="form-group">
              <label className="form-label">Item Name</label>
              <input className="form-input" value={itemName} onChange={e => setItemName(e.target.value)} placeholder="e.g. Smartboard / Laptop Set" required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Cost Basis (AED)</label>
                <input type="number" className="form-input" value={value} onChange={e => setValue(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Dep. Rate (%/yr)</label>
                <input type="number" className="form-input" value={rate} onChange={e => setRate(e.target.value)} required />
              </div>
            </div>

            {message && (
              <div style={{ padding: '10px', background: 'var(--accent-primary-glow)', borderRadius: '8px', color: 'var(--accent-primary)', fontSize: '0.85rem', marginBottom: '16px', fontWeight: 600 }}>
                {message}
              </div>
            )}

            <button type="submit" className="btn btn-emerald" style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}>
              <Plus size={16} /> Post Asset to Ledger
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
