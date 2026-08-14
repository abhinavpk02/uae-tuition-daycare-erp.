import React, { useState } from 'react';
import { X, User, Phone, Mail, Calendar, GraduationCap, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function AddStudentModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    standard: 'Grade 10',
    program: 'Both',
    parent_phone: '',
    parent_email: ''
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

    // Client-side validation
    if (!formData.name.trim() || formData.name.length < 2) {
      setErrorMsg('Student full name must be at least 2 characters.');
      return;
    }
    if (!formData.parent_phone.trim()) {
      setErrorMsg('Parent phone number is required.');
      return;
    }
    if (!formData.parent_email.trim() || !formData.parent_email.includes('@')) {
      setErrorMsg('Valid parent email address is required.');
      return;
    }

    setLoading(true);

    fetch('/api/v1/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
      .then(async (res) => {
        let data = {};
        try {
          data = await res.json();
        } catch {
          data = { detail: `HTTP Error ${res.status}: Unable to process student registration request` };
        }
        return { ok: res.ok, data };
      })
      .then(({ ok, data }) => {
        if (ok && data.status === 'success') {
          setToastMsg('Student added successfully!');
          setTimeout(() => {
            if (onSuccess) onSuccess(data.student);
            onClose();
          }, 1200);
        } else {
          setErrorMsg(data.detail || 'Failed to add student');
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
          width: '520px', 
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
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.3rem', fontWeight: 700, color: '#F9FAFB' }}>Register New Student</h3>
            <p style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>Enter student particulars & parent contact details</p>
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
          
          <div className="form-group">
            <label className="form-label">Student Full Name *</label>
            <input 
              className="form-input" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              placeholder="e.g. Zayed Al-Hashimi" 
              required 
            />
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
              <label className="form-label">Standard / Grade *</label>
              <select className="form-select" name="standard" value={formData.standard} onChange={handleChange}>
                <option value="KG 1">KG 1</option>
                <option value="KG 2">KG 2</option>
                <option value="Grade 1">Grade 1</option>
                <option value="Grade 5">Grade 5</option>
                <option value="Grade 10">Grade 10</option>
                <option value="Grade 12">Grade 12 (HSS)</option>
              </select>
            </div>
          </div>

          {/* Program Radio Selection */}
          <div className="form-group">
            <label className="form-label">Program Type *</label>
            <div style={{ display: 'flex', gap: '16px', marginTop: '4px' }}>
              {['Tuition', 'Daycare', 'Both'].map(prog => (
                <label key={prog} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.88rem', color: '#E2E8F0' }}>
                  <input 
                    type="radio" 
                    name="program" 
                    value={prog} 
                    checked={formData.program === prog} 
                    onChange={handleChange}
                    style={{ accentColor: '#10B981' }} 
                  />
                  {prog}
                </label>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px', marginTop: '4px' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent-gold)', marginBottom: '10px', textTransform: 'uppercase' }}>
              Parent Contact & Billing Record
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Parent Phone *</label>
                <input 
                  className="form-input" 
                  name="parent_phone" 
                  value={formData.parent_phone} 
                  onChange={handleChange} 
                  placeholder="+971 50 123 4567" 
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label">Parent Email *</label>
                <input 
                  className="form-input" 
                  type="email" 
                  name="parent_email" 
                  value={formData.parent_email} 
                  onChange={handleChange} 
                  placeholder="parent@uaeerp.ae" 
                  required 
                />
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '16px' }}>
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-emerald" disabled={loading} style={{ minWidth: '130px', justifyContent: 'center' }}>
              {loading ? <><Loader2 size={16} className="spin" /> Saving...</> : 'Save Student'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
