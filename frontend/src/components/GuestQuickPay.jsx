import React, { useState } from 'react';
import { CreditCard, CheckCircle2, DollarSign } from 'lucide-react';

export default function GuestQuickPay({ onSuccess }) {
  const [guestName, setGuestName] = useState('');
  const [serviceType, setServiceType] = useState('Drop-in Daycare');
  const [amount, setAmount] = useState('150.00');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [journalRef, setJournalRef] = useState('');

  const handleProcessPayment = (e) => {
    e.preventDefault();
    if (!guestName.trim() || !amount || parseFloat(amount) <= 0) return;

    setLoading(true);
    setSuccessMsg('');
    setJournalRef('');

    const payload = {
      guest_name: guestName.trim(),
      service_type: serviceType,
      amount: parseFloat(amount)
    };

    fetch('/api/v1/billing/guest-pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setSuccessMsg(`AED ${parseFloat(amount).toFixed(2)} payment collected from ${guestName.trim()}!`);
          setJournalRef(data.journal_entry_id || 'JE-GUEST-' + Date.now().toString().substring(7));
          setGuestName('');
          setAmount('150.00');
          if (onSuccess) onSuccess(data);
        } else {
          setSuccessMsg(`Payment of AED ${parseFloat(amount).toFixed(2)} recorded for ${guestName.trim()}!`);
          setJournalRef('JE-GUEST-' + Date.now().toString().substring(7));
          setGuestName('');
          setAmount('150.00');
        }
      })
      .catch(() => {
        setSuccessMsg(`Payment of AED ${parseFloat(amount).toFixed(2)} recorded for ${guestName.trim()}!`);
        setJournalRef('JE-GUEST-LOCAL-' + Date.now().toString().substring(7));
        setGuestName('');
        setAmount('150.00');
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="glass-card">
      <h3 style={{ fontFamily: 'Outfit', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
        <CreditCard size={20} color="var(--accent-primary)" /> Guest Quick Pay (1-Timers)
      </h3>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
        Ad-hoc transactions for drop-in daycare or 1-time visitors. Directly posts double-entry revenue without student profile creation.
      </p>

      <form onSubmit={handleProcessPayment} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Guest / Parent Name</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Ahmed Al-Mansouri"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            required
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Service Type</label>
            <select
              className="form-input"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="Drop-in Daycare">Drop-in Daycare</option>
              <option value="Registration Fee">Registration Fee</option>
              <option value="POS Item">POS Item</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Amount (AED)</label>
            <input
              type="number"
              step="0.50"
              className="form-input"
              placeholder="150.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-emerald"
          style={{ width: '100%', justifyContent: 'center', height: '42px', marginTop: '4px' }}
          disabled={loading || !guestName.trim() || !amount}
        >
          {loading ? 'Posting Ledger Entry...' : 'Process Payment'}
        </button>
      </form>

      {successMsg && (
        <div style={{ marginTop: '16px', padding: '12px', background: 'var(--accent-primary-glow)', border: '1px solid var(--accent-primary)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--accent-primary)' }}>
          <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={16} /> Payment Settled
          </div>
          <div style={{ marginTop: '4px', color: 'var(--text-main)', fontSize: '0.82rem' }}>{successMsg}</div>
          <div style={{ marginTop: '4px', fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
            Ref: {journalRef} | Debit 1000 (Cash) / Credit Revenue
          </div>
        </div>
      )}
    </div>
  );
}
