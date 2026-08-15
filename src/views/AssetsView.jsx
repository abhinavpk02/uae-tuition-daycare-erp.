import React, { useEffect, useState } from 'react';
import { Building2, Plus, TrendingDown, CheckCircle2, Trash2 } from 'lucide-react';
import SearchableSelectInput from '../components/SearchableSelectInput';
import { BASE_URL } from '../api';

export default function AssetsView() {
  const [assets, setAssets] = useState([]);
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('Technology');
  const [value, setValue] = useState('10000');
  const [rate, setRate] = useState('10');
  const [message, setMessage] = useState('');

  const defaultAssets = [
    { id: 'ast-1', item_name: 'Interactive Smartboard Displays & Projectors', category: 'Technology', cost_basis: 25000.00, depreciation_rate: 15.0, current_book_value: 21250.00 },
    { id: 'ast-2', item_name: 'Daycare Soft Play Area & Playground Equipment', category: 'Furniture', cost_basis: 18000.00, depreciation_rate: 10.0, current_book_value: 16200.00 }
  ];

  const fetchAssets = () => {
    fetch(`${BASE_URL}/api/assets`)
      .then(res => res.json())
      .then(data => {
        const remoteList = Array.isArray(data) ? data : [];
        const localList = JSON.parse(localStorage.getItem('registered_assets') || '[]');
        const merged = [...localList];

        remoteList.forEach(r => {
          if (!merged.some(m => String(m.id) === String(r.id))) {
            merged.push(r);
          }
        });

        if (merged.length === 0) {
          merged.push(...defaultAssets);
        }

        setAssets(merged);
      })
      .catch(() => {
        const localList = JSON.parse(localStorage.getItem('registered_assets') || '[]');
        setAssets(localList.length > 0 ? localList : defaultAssets);
      });
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
      id: `ast-${Date.now()}`,
      item_name: itemName.trim(),
      category,
      cost_basis: cost,
      depreciation_rate: depRate,
      current_book_value: cost * (1 - depRate / 100)
    };

    const updated = [newAsset, ...assets];
    setAssets(updated);
    localStorage.setItem('registered_assets', JSON.stringify(updated));

    fetch(`${BASE_URL}/api/assets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAsset)
    }).catch(() => {});

    setMessage(`Registered "${itemName}" in Fixed Assets Ledger!`);
    setItemName('');
    setValue('10000');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDeleteAsset = (assetId, e) => {
    if (e) e.stopPropagation();
    const target = assets.find(a => String(a.id) === String(assetId));
    const title = target ? target.item_name : 'asset';

    if (!window.confirm(`Are you sure you want to remove "${title}" from Fixed Assets Ledger?`)) {
      return;
    }

    const updated = assets.filter(a => String(a.id) !== String(assetId));
    setAssets(updated);
    localStorage.setItem('registered_assets', JSON.stringify(updated));

    fetch(`${BASE_URL}/api/assets/${assetId}`, { method: 'DELETE' }).catch(() => {});
  };

  const categoryOptions = [
    { value: 'Technology', label: 'Technology & Smartboards' },
    { value: 'Furniture', label: 'Furniture & Play Equipment' },
    { value: 'Facility', label: 'Facility Improvements & HVAC' }
  ];

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
                  <th>Depr. Rate</th>
                  <th>Current Book Value</th>
                  <th style={{ width: '40px', textAlign: 'center' }}></th>
                </tr>
              </thead>
              <tbody>
                {assets.map(asset => (
                  <tr key={asset.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{asset.item_name}</td>
                    <td><span className="badge-status badge-success">{asset.category || 'Capital'}</span></td>
                    <td style={{ fontFamily: 'monospace' }}>AED {parseFloat(asset.cost_basis || 0).toFixed(2)}</td>
                    <td style={{ fontFamily: 'monospace', color: '#EF4444' }}>{asset.depreciation_rate || 10}% / yr</td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-primary)' }}>
                      AED {parseFloat(asset.current_book_value || asset.cost_basis || 0).toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        onClick={(e) => handleDeleteAsset(asset.id, e)}
                        title={`Delete ${asset.item_name}`}
                        style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Asset Form */}
        <div className="glass-card">
          <h3 style={{ fontFamily: 'Outfit', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
            <Building2 size={20} color="var(--accent-primary)" /> Register Capital Asset
          </h3>

          {message && (
            <div style={{ padding: '10px 14px', background: 'var(--accent-primary-glow)', border: '1px solid var(--accent-primary)', borderRadius: '8px', color: 'var(--accent-primary)', fontSize: '0.85rem', marginBottom: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} /> {message}
            </div>
          )}

          <form onSubmit={handleAddAsset} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Asset Description / Title</label>
              <input type="text" className="form-input" placeholder="e.g. Smartboard Interactive Display Unit" value={itemName} onChange={e => setItemName(e.target.value)} required />
            </div>

            <div className="form-group">
              <SearchableSelectInput label="Asset Category" placeholder="Search category..." options={categoryOptions} value={category} onChange={setCategory} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Cost Basis (AED)</label>
                <input type="number" step="500" className="form-input" placeholder="10000" value={value} onChange={e => setValue(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Annual Depr. Rate (%)</label>
                <input type="number" step="1" className="form-input" placeholder="10" value={rate} onChange={e => setRate(e.target.value)} required />
              </div>
            </div>

            <button type="submit" className="btn btn-emerald" style={{ marginTop: '8px', justifyContent: 'center', height: '42px' }}>
              <Plus size={16} /> Add Asset to Ledger
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
