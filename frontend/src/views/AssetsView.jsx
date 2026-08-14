import React, { useEffect, useState } from 'react';
import { Building2, Plus, TrendingDown, CheckCircle2 } from 'lucide-react';

export default function AssetsView() {
  const [assets, setAssets] = useState([]);
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('Technology');
  const [value, setValue] = useState('10000');
  const [rate, setRate] = useState('10');
  const [message, setMessage] = useState('');

  const fetchAssets = () => {
    fetch('/api/assets')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAssets(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleAddAsset = (e) => {
    e.preventDefault();
    setMessage('');
    fetch('/api/assets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category,
        item_name: itemName,
        value: parseFloat(value),
        depreciation_rate: parseFloat(rate)
      })
    })
      .then(res => res.json())
      .then(data => {
        setItemName('');
        fetchAssets();
        setMessage('Asset added successfully!');
      })
      .catch(err => setMessage(err.message));
  };

  const handleDepreciate = (assetId) => {
    setMessage('');
    fetch(`/api/assets/${assetId}/depreciate`, { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        setMessage(`Posted Monthly Depreciation: AED ${data.monthly_depreciation} for ${data.asset_name} (Entry ID: ${data.journal_entry_id.substring(0, 8)})`);
      })
      .catch(err => setMessage(err.message));
  };

  return (
    <div className="view-container">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'Outfit', fontSize: '1.6rem' }}>Fixed Assets & Depreciation Ledger</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Track facility equipment, technology assets, and dispatch automated monthly depreciation journal entries</p>
      </div>

      {message && (
        <div style={{ padding: '12px 16px', background: 'rgba(16,185,129,0.15)', border: '1px solid var(--accent-emerald)', borderRadius: 'var(--radius-md)', color: '#10B981', marginBottom: '20px', fontSize: '0.9rem' }}>
          ✔ {message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Fixed Assets Table */}
        <div className="glass-card">
          <h3 style={{ fontFamily: 'Outfit', marginBottom: '16px' }}>Registered Center Assets</h3>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Item Description</th>
                <th>Asset Value (AED)</th>
                <th>Depr. Rate</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {assets.map(asset => (
                <tr key={asset.id}>
                  <td><span className="badge-status badge-warning">{asset.category}</span></td>
                  <td style={{ fontWeight: 600 }}>{asset.item_name}</td>
                  <td style={{ fontFamily: 'monospace', fontWeight: 700, color: '#10B981' }}>
                    AED {floatValue(asset.value).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ fontFamily: 'monospace' }}>{asset.depreciation_rate}% / yr</td>
                  <td>
                    <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => handleDepreciate(asset.id)}>
                      <TrendingDown size={12} /> Depreciate Month
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Asset Form */}
        <div className="glass-card">
          <h3 style={{ fontFamily: 'Outfit', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={20} color="var(--accent-emerald)" /> Register New Asset
          </h3>

          <form onSubmit={handleAddAsset}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
                <option value="Technology">Technology & Hardware</option>
                <option value="Facility">Facility & Furniture</option>
                <option value="Transportation">Student Bus Shuttle</option>
                <option value="Daycare">Daycare Play Equipment</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Item Name</label>
              <input className="form-input" value={itemName} onChange={e => setItemName(e.target.value)} placeholder="e.g. Smartboard / Laptop Set" required />
            </div>

            <div className="form-group">
              <label className="form-label">Original Asset Value (AED)</label>
              <input className="form-input" type="number" step="0.01" value={value} onChange={e => setValue(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">Annual Depreciation Rate (%)</label>
              <input className="form-input" type="number" step="0.1" value={rate} onChange={e => setRate(e.target.value)} required />
            </div>

            <button type="submit" className="btn btn-emerald" style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}>
              <Plus size={16} /> Register Asset & Post to Ledger
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

function floatValue(val) {
  if (typeof val === 'number') return val;
  return parseFloat(val || 0);
}
