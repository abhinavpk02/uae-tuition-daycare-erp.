import React, { useState, useEffect } from 'react';
import { X, User, Mail, Calendar, Shield, CreditCard, MapPin, DollarSign, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function AddStaffModal({ isOpen, onClose, onSuccess, creatorRole = 'SuperAdmin' }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dob: '',
    passport_no: '',
    emirates_id: '',
    address: '',
    role: 'Teacher',
    hourly_rate: 120.00
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Default role selection based on creator hierarchy
  useEffect(() => {
    if (creatorRole === 'Admin') {
      setFormData(prev => ({ ...prev, role: 'Teacher' }));
    }
  }, [creatorRole]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setToastMsg('');

    // Client-side validation
    if (!formData.name.trim() || formData.name.length < 2) {
      setErrorMsg('Staff full name must be at least 2 characters.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMsg('Valid email address is required.');
      return;
    }
    if (!formData.emirates_id.trim()) {
      setErrorMsg('Emirates ID is required for UAE staff compliance.');
      return;
    }

    setLoading(true);

    const payload = {
      ...formData,
      hourly_rate: parseFloat(formData.hourly_rate) || 0,
      creator_role: creatorRole
    };

    fetch('/api/v1/staff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json().then(data => ({ ok: res.ok, data })))
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
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div 
        className="glass-card" 
        style={{ 
          width: '560px', 
          maxHeight: '90vh', 
          overflowY: 'auto', 
          background: '#0F172A', 
          border: '1px solid rgba(255,255,255,0.12)', 
          borderRadius: '16px', 
          padding: '28px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)' 
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.3rem', fontWeight: 700, color: '#F9FAFB' }}>
              Onboard New Staff
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>
              Acting Creator Role: <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>{creatorRole}</span>
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Toast / Error Banners */}
        {toastMsg && (
          <div style={{ padding: '10px 14px', background: 'rgba(16,185,129,0.15)', border: '1px solid #10B981', borderRadius: '8px', color: '#10B981', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
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
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
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

            <div className="form-group">
              <label className="form-label">Work Email *</label>
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
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input 
                className="form-input" 
                type="date" 
                name="dob" 
                value={formData.dob} 
                onChange={handleChange} 
              />
            </div>

            <div className="form-group">
              <label className="form-label">Passport Number</label>
              <input 
                className="form-input" 
                name="passport_no" 
                value={formData.passport_no} 
                onChange={handleChange} 
                placeholder="N9876543" 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Emirates ID (UAE Legal Compliance) *</label>
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
            <label className="form-label">Address</label>
            <input 
              className="form-input" 
              name="address" 
              value={formData.address} 
              onChange={handleChange} 
              placeholder="Al Wasl Road, Villa 42, Dubai, UAE" 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Assigned Role *</label>
              <select className="form-select" name="role" value={formData.role} onChange={handleChange}>
                <option value="Teacher">Teacher / Staff</option>
                {/* SuperAdmin can create Admins; Admin can only create Teachers */}
                {creatorRole === 'SuperAdmin' && (
                  <option value="Admin">Admin / Accountant</option>
                )}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Hourly Rate (AED / hr) *</label>
              <input 
                className="form-input" 
                type="number" 
                step="0.01" 
                name="hourly_rate" 
                value={formData.hourly_rate} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-emerald" disabled={loading} style={{ minWidth: '140px', justifyContent: 'center' }}>
              {loading ? <><Loader2 size={16} className="spin" /> Onboarding...</> : 'Onboard Staff'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
