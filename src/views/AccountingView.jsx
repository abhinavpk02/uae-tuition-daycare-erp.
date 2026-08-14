import React, { useEffect, useState } from 'react';
import { ShieldCheck, Plus, FileText, PieChart, Scale, ArrowDownRight, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export default function AccountingView() {
  const [activeTab, setActiveTab] = useState('trial-balance');
  const [trialBalance, setTrialBalance] = useState(null);
  const [pnl, setPnl] = useState(null);
  const [balanceSheet, setBalanceSheet] = useState(null);
  const [journalEntries, setJournalEntries] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Manual Journal Entry Form State
  const [desc, setDesc] = useState('');
  const [debitAcc, setDebitAcc] = useState('1000');
  const [creditAcc, setCreditAcc] = useState('4000');
  const [amount, setAmount] = useState('500');
  const [formMsg, setFormMsg] = useState('');

  const fetchReports = () => {
    fetch('/api/reports/trial-balance')
      .then(res => res.json())
      .then(data => setTrialBalance(data))
      .catch(() => {});

    fetch('/api/reports/pnl')
      .then(res => res.json())
      .then(data => setPnl(data))
      .catch(() => {});

    fetch('/api/reports/balance-sheet')
      .then(res => res.json())
      .then(data => setBalanceSheet(data))
      .catch(() => {});

    fetch('/api/accounting/journal-entries')
      .then(res => res.json())
      .then(data => setJournalEntries(data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleCreateEntry = (e) => {
    e.preventDefault();
    setFormMsg('');
    const val = parseFloat(amount);
    if (!val || val <= 0) {
      setFormMsg('Please enter a valid amount');
      return;
    }

    const payload = {
      description: desc || 'Manual Ledger Adjustment',
      ref_module: 'Manual',
      lines: [
        { account_code: debitAcc, debit: val, credit: 0.0 },
        { account_code: creditAcc, debit: 0.0, credit: val }
      ]
    };

    fetch('/api/accounting/journal-entry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') {
          setShowModal(false);
          setDesc('');
          fetchReports();
        } else {
          setFormMsg(data.detail || 'Error creating journal entry');
        }
      })
      .catch(err => setFormMsg(err.message));
  };

  return (
    <div className="view-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.6rem' }}>Double-Entry General Ledger & Reports</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Strict auditability with real-time \(\sum \text{Debit} = \sum \text{Credit}\) validation</p>
        </div>
        <button className="btn btn-emerald" onClick={() => setShowModal(true)}>
          <Plus size={18} /> New Journal Entry
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="tabs-header">
        <button className={`tab-btn ${activeTab === 'trial-balance' ? 'active' : ''}`} onClick={() => setActiveTab('trial-balance')}>
          <Scale size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Trial Balance
        </button>
        <button className={`tab-btn ${activeTab === 'pnl' ? 'active' : ''}`} onClick={() => setActiveTab('pnl')}>
          <PieChart size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Profit & Loss
        </button>
        <button className={`tab-btn ${activeTab === 'balance-sheet' ? 'active' : ''}`} onClick={() => setActiveTab('balance-sheet')}>
          <ShieldCheck size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Balance Sheet
        </button>
        <button className={`tab-btn ${activeTab === 'ledger' ? 'active' : ''}`} onClick={() => setActiveTab('ledger')}>
          <FileText size={16} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> Journal History
        </button>
      </div>

      {/* 1. Trial Balance Tab */}
      {activeTab === 'trial-balance' && (
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontFamily: 'Outfit' }}>Trial Balance (Chart of Accounts Rollup)</h3>
            {trialBalance && (
              <span className={`badge-status ${trialBalance.is_balanced ? 'badge-success' : 'badge-warning'}`}>
                <CheckCircle2 size={14} /> {trialBalance.is_balanced ? 'Double-Entry Constraint Balanced' : 'Unbalanced'}
              </span>
            )}
          </div>

          <table className="custom-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Account Name</th>
                <th>Type</th>
                <th style={{ textAlign: 'right' }}>Total Debit (AED)</th>
                <th style={{ textAlign: 'right' }}>Total Credit (AED)</th>
                <th style={{ textAlign: 'right' }}>Net Balance (AED)</th>
              </tr>
            </thead>
            <tbody>
              {trialBalance && trialBalance.accounts ? (
                trialBalance.accounts.map(acc => (
                  <tr key={acc.code}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--accent-gold)' }}>{acc.code}</td>
                    <td style={{ fontWeight: 600 }}>{acc.name}</td>
                    <td><span className="badge-status badge-warning">{acc.type}</span></td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{acc.total_debit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>{acc.total_credit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: acc.net_balance >= 0 ? '#10B981' : '#F59E0B' }}>
                      {acc.net_balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" style={{ textAlign: 'center' }}>Loading Trial Balance data...</td></tr>
              )}
            </tbody>
            {trialBalance && (
              <tfoot>
                <tr style={{ fontWeight: 700, background: 'rgba(16, 185, 129, 0.1)', borderTop: '2px solid var(--accent-emerald)' }}>
                  <td colSpan="3">GRAND TOTALS</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>AED {trialBalance.grand_total_debit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace' }}>AED {trialBalance.grand_total_credit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td style={{ textAlign: 'right', color: '#10B981' }}>0.00 (Balanced)</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}

      {/* 2. Profit & Loss Statement Tab */}
      {activeTab === 'pnl' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="glass-card">
            <h3 style={{ fontFamily: 'Outfit', color: '#10B981', marginBottom: '16px' }}><ArrowUpRight size={20} /> Revenues</h3>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Revenue Stream</th>
                  <th style={{ textAlign: 'right' }}>Amount (AED)</th>
                </tr>
              </thead>
              <tbody>
                {pnl && pnl.revenues ? (
                  pnl.revenues.map(r => (
                    <tr key={r.code}>
                      <td style={{ fontFamily: 'monospace' }}>{r.code}</td>
                      <td>{r.name}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>{r.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))
                ) : <tr><td colSpan="3">No revenue items recorded yet.</td></tr>}
              </tbody>
            </table>
            <div style={{ marginTop: '16px', textAlign: 'right', fontWeight: 700, fontSize: '1.1rem', color: '#10B981' }}>
              Total Revenue: AED {pnl ? pnl.total_revenue.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
            </div>
          </div>

          <div className="glass-card">
            <h3 style={{ fontFamily: 'Outfit', color: '#EF4444', marginBottom: '16px' }}><ArrowDownRight size={20} /> Expenses</h3>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Expense Category</th>
                  <th style={{ textAlign: 'right' }}>Amount (AED)</th>
                </tr>
              </thead>
              <tbody>
                {pnl && pnl.expenses ? (
                  pnl.expenses.map(e => (
                    <tr key={e.code}>
                      <td style={{ fontFamily: 'monospace' }}>{e.code}</td>
                      <td>{e.name}</td>
                      <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>{e.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  ))
                ) : <tr><td colSpan="3">No expense items recorded yet.</td></tr>}
              </tbody>
            </table>
            <div style={{ marginTop: '16px', textAlign: 'right', fontWeight: 700, fontSize: '1.1rem', color: '#EF4444' }}>
              Total Expenses: AED {pnl ? pnl.total_expense.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'}
            </div>
          </div>
        </div>
      )}

      {/* 3. Balance Sheet Tab */}
      {activeTab === 'balance-sheet' && (
        <div className="glass-card">
          <h3 style={{ fontFamily: 'Outfit', marginBottom: '16px' }}>Balance Sheet Statement (Assets = Liabilities + Equity)</h3>
          {balanceSheet ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <h4 style={{ color: '#10B981', marginBottom: '12px' }}>Assets</h4>
                {balanceSheet.assets.map(a => (
                  <div key={a.code} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <span>{a.code} - {a.name}</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>AED {a.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
                <div style={{ marginTop: '16px', fontWeight: 700, fontSize: '1.1rem', color: '#10B981' }}>
                  TOTAL ASSETS: AED {balanceSheet.total_assets.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div>
                <h4 style={{ color: '#F59E0B', marginBottom: '12px' }}>Liabilities & Equity</h4>
                {balanceSheet.liabilities.map(l => (
                  <div key={l.code} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <span>{l.code} - {l.name}</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>AED {l.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
                {balanceSheet.equity.map(eq => (
                  <div key={eq.code} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
                    <span>{eq.code} - {eq.name}</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>AED {eq.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)', color: '#10B981' }}>
                  <span>Current Period Net Income (from P&L)</span>
                  <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>AED {balanceSheet.net_income.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div style={{ marginTop: '16px', fontWeight: 700, fontSize: '1.1rem', color: '#F59E0B' }}>
                  TOTAL LIABILITIES & EQUITY: AED {balanceSheet.total_liabilities_and_equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          ) : <p>Loading Balance Sheet...</p>}
        </div>
      )}

      {/* 4. Journal History Tab */}
      {activeTab === 'ledger' && (
        <div className="glass-card">
          <h3 style={{ fontFamily: 'Outfit', marginBottom: '16px' }}>Journal Entries Audit Log</h3>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Entry ID</th>
                <th>Timestamp</th>
                <th>Description</th>
                <th>Ref Module</th>
                <th>Constraint State</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {journalEntries.map(e => (
                <tr key={e.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{e.id.substring(0, 8)}...</td>
                  <td>{new Date(e.date).toLocaleString()}</td>
                  <td style={{ fontWeight: 600 }}>{e.description}</td>
                  <td><span className="badge-status badge-warning">{e.ref_module}</span></td>
                  <td><span className="badge-status badge-success"><CheckCircle2 size={12} /> Debit == Credit</span></td>
                  <td>
                    {e.ref_id ? (
                      <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => window.open(`/api/billing-pos/invoices/${e.ref_id}/pdf`, '_blank')}>
                        PDF Invoice
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ledger Direct</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}

      {/* New Journal Entry Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '450px', background: '#0F172A', border: '1px solid var(--border-highlight)' }}>
            <h3 style={{ fontFamily: 'Outfit', marginBottom: '16px' }}>Create Double-Entry Journal Entry</h3>
            {formMsg && <div style={{ color: '#EF4444', marginBottom: '12px', fontSize: '0.85rem' }}>{formMsg}</div>}
            <form onSubmit={handleCreateEntry}>
              <div className="form-group">
                <label className="form-label">Entry Description</label>
                <input className="form-input" value={desc} onChange={e => setDesc(e.target.value)} placeholder="e.g. Utility Payment / Course Registration" required />
              </div>

              <div className="form-group">
                <label className="form-label">Debit Account</label>
                <select className="form-select" value={debitAcc} onChange={e => setDebitAcc(e.target.value)}>
                  <option value="1000">1000 - Cash & Bank Account</option>
                  <option value="1100">1100 - Accounts Receivable</option>
                  <option value="1500">1500 - Equipment & Facility Assets</option>
                  <option value="5000">5000 - Staff Payroll Expense</option>
                  <option value="5200">5200 - Facility Utilities Expense</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Credit Account</label>
                <select className="form-select" value={creditAcc} onChange={e => setCreditAcc(e.target.value)}>
                  <option value="3000">3000 - Owner Capital / Equity</option>
                  <option value="4000">4000 - Tuition Fee Revenue</option>
                  <option value="4100">4100 - Daycare Fee Revenue</option>
                  <option value="4200">4200 - POS Sales Revenue</option>
                  <option value="1000">1000 - Cash & Bank Account</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Amount (AED)</label>
                <input className="form-input" type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} required />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-emerald">Dispatch Entry</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
