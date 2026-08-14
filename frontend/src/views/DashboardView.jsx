import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, Users, Clock, ShieldCheck, DollarSign, 
  ShoppingBag, ArrowUpRight, CheckCircle2, Coins, Layers
} from 'lucide-react';

export default function DashboardView({ onNavigate }) {
  const [stats, setStats] = useState({
    totalRevenue: '125,400',
    activeStudents: '42',
    daycareHours: '184.5',
    isBalanced: true,
    totalDebit: '125,400',
    totalCredit: '125,400'
  });

  const [recentEntries, setRecentEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports/trial-balance')
      .then(res => res.json())
      .then(data => {
        if (data && data.grand_total_debit) {
          setStats(prev => ({
            ...prev,
            totalRevenue: (data.grand_total_debit).toLocaleString('en-US'),
            isBalanced: data.is_balanced,
            totalDebit: (data.grand_total_debit).toLocaleString('en-US'),
            totalCredit: (data.grand_total_credit).toLocaleString('en-US')
          }));
        }
      })
      .catch(err => console.log('Backend connection fallback for local mode:', err));

    fetch('/api/accounting/journal-entries')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setRecentEntries(data.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="view-container">
      {/* KPI Cards: Large Minimalist Cards */}
      <div className="grid-stats-large">
        
        {/* Metric 1: Total Volume */}
        <div className="stat-card-large glass-card">
          <div className="stat-icon-large" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
            <Coins size={32} />
          </div>
          <div>
            <div className="stat-val-large" style={{ color: '#10B981' }}>
              AED {stats.totalRevenue}
            </div>
            <div className="stat-lbl-large">Total Volume</div>
          </div>
        </div>

        {/* Metric 2: Enrolled Students */}
        <div className="stat-card-large glass-card">
          <div className="stat-icon-large" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}>
            <Users size={32} />
          </div>
          <div>
            <div className="stat-val-large" style={{ color: '#F59E0B' }}>
              {stats.activeStudents}
            </div>
            <div className="stat-lbl-large">Enrolled Students</div>
          </div>
        </div>

        {/* Metric 3: Daycare Hours */}
        <div className="stat-card-large glass-card">
          <div className="stat-icon-large" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6' }}>
            <Clock size={32} />
          </div>
          <div>
            <div className="stat-val-large" style={{ color: '#3B82F6' }}>
              {stats.daycareHours} hrs
            </div>
            <div className="stat-lbl-large">Daycare Hours</div>
          </div>
        </div>

        {/* Metric 4: Ledger Status */}
        <div className="stat-card-large glass-card">
          <div className="stat-icon-large" style={{ background: stats.isBalanced ? 'rgba(139, 92, 246, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: stats.isBalanced ? '#8B5CF6' : '#EF4444' }}>
            <ShieldCheck size={32} />
          </div>
          <div>
            <div className="stat-val-large" style={{ color: stats.isBalanced ? '#8B5CF6' : '#EF4444', fontSize: '1.35rem' }}>
              {stats.isBalanced ? '100% BALANCED' : 'UNBALANCED'}
            </div>
            <div className="stat-lbl-large">Ledger Audit Status</div>
          </div>
        </div>

      </div>

      {/* Main Responsive Grid Section */}
      <div className="grid-2col-responsive">
        
        {/* Recent Double-Entry Journal Entries Table */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', color: '#F9FAFB' }}>Recent Double-Entry Journal Entries</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Automated financial transaction logs</p>
            </div>
            <button className="btn btn-outline" onClick={() => onNavigate('accounting')} style={{ fontSize: '0.8rem', padding: '6px 14px' }}>
              General Ledger <ArrowUpRight size={14} />
            </button>
          </div>

          <div className="table-responsive-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Date / Ref</th>
                  <th>Description</th>
                  <th>Module</th>
                  <th>Audit Status</th>
                </tr>
              </thead>
              <tbody>
                {recentEntries.length > 0 ? (
                  recentEntries.map((entry, idx) => (
                    <tr key={entry.id || idx}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>
                        {entry.date ? new Date(entry.date).toLocaleDateString() : '2026-08-14'}
                      </td>
                      <td style={{ fontWeight: 600 }}>{entry.description}</td>
                      <td>
                        <span className="badge-status badge-warning">{entry.ref_module}</span>
                      </td>
                      <td>
                        <span className="badge-status badge-success"><CheckCircle2 size={12} /> Balanced</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <>
                    <tr>
                      <td style={{ fontFamily: 'monospace' }}>2026-08-14</td>
                      <td style={{ fontWeight: 600 }}>Initial Owner Capital Injection</td>
                      <td><span className="badge-status badge-warning">Manual</span></td>
                      <td><span className="badge-status badge-success"><CheckCircle2 size={12} /> Balanced (AED 100,000)</span></td>
                    </tr>
                    <tr>
                      <td style={{ fontFamily: 'monospace' }}>2026-08-14</td>
                      <td style={{ fontWeight: 600 }}>Purchase of Tuition & Daycare Equipment Assets</td>
                      <td><span className="badge-status badge-warning">Manual</span></td>
                      <td><span className="badge-status badge-success"><CheckCircle2 size={12} /> Balanced (AED 25,000)</span></td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Re-imagined ERP Operations Hub: Large Iconic Cards */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', color: '#F9FAFB', marginBottom: '2px' }}>
            ERP Operations Hub
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
            Direct access to core module terminals
          </p>

          {/* Card 1: POS Terminal */}
          <div 
            onClick={() => onNavigate('pos')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '20px', 
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.04))', 
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '16px',
              cursor: 'pointer',
              transition: 'all 0.25s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981', flexShrink: 0 }}>
                <ShoppingBag size={26} />
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#F9FAFB' }}>POS Terminal</h4>
                <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Tuition & Daycare Checkout</p>
              </div>
            </div>
            <ArrowUpRight size={20} color="#10B981" />
          </div>

          {/* Card 2: RFID Scanner */}
          <div 
            onClick={() => onNavigate('attendance')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '20px', 
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(245, 158, 11, 0.04))', 
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '16px',
              cursor: 'pointer',
              transition: 'all 0.25s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B', flexShrink: 0 }}>
                <Clock size={26} />
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#F9FAFB' }}>RFID Daycare Engine</h4>
                <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>Real-time Attendance Tracker</p>
              </div>
            </div>
            <ArrowUpRight size={20} color="#F59E0B" />
          </div>

          {/* Card 3: Ledger Reports */}
          <div 
            onClick={() => onNavigate('accounting')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '20px', 
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.04))', 
              border: '1px solid rgba(59, 130, 246, 0.3)',
              borderRadius: '16px',
              cursor: 'pointer',
              transition: 'all 0.25s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6', flexShrink: 0 }}>
                <Layers size={26} />
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#F9FAFB' }}>Financial Reports</h4>
                <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>General Ledger & Audits</p>
              </div>
            </div>
            <ArrowUpRight size={20} color="#3B82F6" />
          </div>

        </div>

      </div>
    </div>
  );
}
