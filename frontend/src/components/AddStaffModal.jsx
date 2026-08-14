import React, { useState } from 'react';
import { X, User, Phone, Mail, Calendar, Shield, DollarSign, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function AddStaffModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    emirates_id: '',
    role: 'Teacher',
    hourly_rate: '45.00'
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setToastMsg('');

    if (!formData.name.trim() || formData.name.length < 2) {
      setErrorMsg('Staff full name must be at least 2 characters.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMsg('Valid staff email address is required.');
      return;
    }
    if (!formData.emirates_id.trim()) {
      setErrorMsg('Emirates ID is required (e.g. 784-1992-1234567-1).');
      return;
    }

    setLoading(true);

    const payload = {
      ...formData,
      hourly_rate: parseFloat(formData.hourly_rate) || 45.00
    };

    fetch('/api/v1/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        let data = {};
        try {
          data = await res.json();
        } catch {
          data = { detail: `HTTP Error ${res.status}: Unable to process staff onboarding request` };
        }
        return { ok: res.ok, data };
      })
      .then(({ ok, data }) => {
        if (ok && data.status === 'success') {
          setToastMsg('Staff member onboarded successfully!');
          setTimeout(() => {
            if (onSuccess) onSuccess(data.staff);
            onClose();
          }, 1200);
        } else {
          setErrorMsg(data.detail || 'Failed to onboard staff member');
        }
      })
      .catch(err => setErrorMsg(err.message))
      .finally(() => setLoading(false));

  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div 
        className="glass-card" 
        style={{ 
          width: '560px', 
          maxHeight: '90vh', 
          overflowY: 'auto', 
          background: 'var(--bg-card)', 
          border: '1px solid var(--border-color)', 
          borderRadius: '16px', 
          padding: '28px',
          boxShadow: 'var(--glass-shadow)' 
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-main)' }}>Onboard New Staff Member</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Enter staff credentials, Emirates ID & payroll hourly rate</p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Toast / Error Banners */}
        {toastMsg && (
          <div style={{ padding: '10px 14px', background: 'var(--accent-primary-glow)', border: '1px solid var(--accent-primary)', borderRadius: '8px', color: 'var(--accent-primary)', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
            <CheckCircle2 size={16} /> {toastMsg}
          </div>
        )}

        {errorMsg && (
          <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.15)', border: '1px solid #EF4444', borderRadius: '8px', color: '#EF4444', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} /> {errorMsg}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input 
              className="form-input" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              placeholder="e.g. Fatima Al-Mansoori" 
              required 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Email Address *</label>
              <input 
                className="form-input" 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                placeholder="fatima@uaeerp.ae" 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input 
                className="form-input" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                placeholder="+971 50 987 6543" 
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Emirates ID *</label>
              <input 
                className="form-input" 
                name="emirates_id" 
                value={formData.emirates_id} 
                onChange={handleChange} 
                placeholder="784-1992-1234567-1" 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Assigned Role *</label>
              <select className="form-select" name="role" value={formData.role} onChange={handleChange}>
                <option value="Teacher">Teacher / Supervisor</option>
                <option value="Admin">Admin Staff</option>
                <option value="Accountant">Accountant</option>
                <option value="DaycareCaregiver">Daycare Caregiver</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Hourly Payroll Rate (AED/hr) *</label>
            <input 
              className="form-input" 
              type="number" 
              step="0.50" 
              name="hourly_rate" 
              value={formData.hourly_rate} 
              onChange={handleChange} 
              required 
            />
          </div>

          {/* Modal Footer */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-emerald" disabled={loading} style={{ minWidth: '140px', justifyContent: 'center' }}>
              {loading ? <><Loader2 size={16} className="spin" /> Onboarding...</> : 'Save Staff Member'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
