import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, Users, Clock, ShieldCheck, DollarSign, 
  ShoppingBag, ArrowUpRight, CheckCircle2, Coins, Layers, Search, UserCheck, X, Phone, Mail, FileText, BadgeCheck, BookOpen
} from 'lucide-react';

export default function DashboardView({ onNavigate }) {
  const [stats, setStats] = useState({
    totalRevenue: '0.00',
    activeStudents: '0',
    daycareHours: '0.0',
    isBalanced: true,
    totalDebit: '0.00',
    totalCredit: '0.00'
  });

  const [recentEntries, setRecentEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  // SEARCH & INSPECTION HUB STATE
  const [searchCategory, setSearchCategory] = useState('customers'); // 'customers' | 'staff'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntity, setSelectedEntity] = useState(null);

  const [customersList, setCustomersList] = useState([]);
  const [staffList, setStaffList] = useState([]);

  useEffect(() => {
    fetch('/api/reports/trial-balance')
      .then(res => res.json())
      .then(data => {
        if (data && data.grand_total_debit !== undefined) {
          setStats(prev => ({
            ...prev,
            totalRevenue: (data.grand_total_debit).toLocaleString('en-US'),
            isBalanced: data.is_balanced,
            totalDebit: (data.grand_total_debit).toLocaleString('en-US'),
            totalCredit: (data.grand_total_credit).toLocaleString('en-US')
          }));
        }
      })
      .catch(() => {});

    fetch('/api/students')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setStats(prev => ({ ...prev, activeStudents: data.length.toString() }));
          setCustomersList(data.map(s => ({
            id: s.id,
            studentName: s.name,
            parentName: 'Parent of ' + s.name,
            grade: s.standard || 'Grade 10',
            program: s.program || 'Tuition & Daycare',
            phone: '+971 50 000 0000',
            email: 'parent@uaeerp.ae',
            rfidTag: `TAG-${s.id}`,
            monthlyFee: 'AED 0.00',
            balanceDue: `AED ${(s.due_amount || 0).toFixed(2)}`,
            attendanceRate: 'Present'
          })));
        }
      })
      .catch(() => {});

    fetch('/api/staff')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setStaffList(data.map(stf => ({
            id: stf.id,
            name: stf.name,
            role: stf.role,
            emiratesId: stf.emirates_id || '784-1992-1234567-1',
            hourlyRate: `AED ${(stf.hourly_rate || 95).toFixed(2)} / hr`,
            monthlyHours: '0 hrs',
            monthlyPayout: 'AED 0.00',
            email: stf.email,
            phone: '+971 50 000 0000',
            assignedRooms: 'Main Zone'
          })));
        }
      })
      .catch(() => {});

    fetch('/api/accounting/journal-entries')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setRecentEntries(data.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredCustomers = customersList.filter(c => 
    c.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.grade.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStaff = staffList.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="view-container">
      {/* Header Banner */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.6rem', color: 'var(--text-main)' }}>Executive ERP Overview</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Double-entry accounting, RFID tracking & student daycare operations center</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-outline" onClick={() => onNavigate('pos')}>
            <ShoppingBag size={16} /> Open POS Terminal
          </button>
          <button className="btn btn-emerald" onClick={() => onNavigate('accounting')}>
            <Coins size={16} /> General Ledger
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid-stats-large" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL LEDGER DEBITS</span>
            <DollarSign size={18} color="var(--accent-primary)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'monospace' }}>
            AED {stats.totalRevenue}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', marginTop: '4px', display: 'block' }}>
            Balanced Double-Entry
          </span>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>REGISTERED STUDENTS</span>
            <Users size={18} color="var(--accent-primary)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'monospace' }}>
            {stats.activeStudents}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
            Tuition & Daycare Enrolled
          </span>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>DAYCARE HOURLY TALLY</span>
            <Clock size={18} color="var(--accent-primary)" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'monospace' }}>
            {stats.daycareHours} hrs
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
            Automated Scanner Log
          </span>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>LEDGER BALANCE AUDIT</span>
            <ShieldCheck size={18} color="var(--accent-primary)" />
          </div>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: stats.isBalanced ? 'var(--accent-primary)' : '#EF4444' }}>
            {stats.isBalanced ? '100% Balanced' : 'Imbalance Alert'}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
            Debits = Credits Check
          </span>
        </div>
      </div>

      {/* Main Split Sections */}
      <div className="grid-split-responsive">
        
        {/* Real-time Customer & Staff Inspection Hub */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ fontFamily: 'Outfit', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search size={18} color="var(--accent-primary)" /> Real-Time Search & Entity Hub
            </h3>

            {/* Category Toggle Tabs */}
            <div style={{ display: 'flex', background: 'var(--card-bg-subtle)', padding: '3px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <button 
                onClick={() => { setSearchCategory('customers'); setSelectedEntity(null); }}
                style={{
                  padding: '5px 12px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  borderRadius: '7px',
                  border: 'none',
                  cursor: 'pointer',
                  background: searchCategory === 'customers' ? 'var(--accent-primary)' : 'transparent',
                  color: searchCategory === 'customers' ? '#FFF' : 'var(--text-muted)'
                }}
              >
                Students ({customersList.length})
              </button>
              <button 
                onClick={() => { setSearchCategory('staff'); setSelectedEntity(null); }}
                style={{
                  padding: '5px 12px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  borderRadius: '7px',
                  border: 'none',
                  cursor: 'pointer',
                  background: searchCategory === 'staff' ? 'var(--accent-primary)' : 'transparent',
                  color: searchCategory === 'staff' ? '#FFF' : 'var(--text-muted)'
                }}
              >
                Staff ({staffList.length})
              </button>
            </div>
          </div>

          {/* Search Input Field */}
          <div className="form-group" style={{ marginBottom: '16px', position: 'relative' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder={searchCategory === 'customers' ? "Search student, parent name..." : "Search staff member name, role..."}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '36px', height: '38px', fontSize: '0.85rem' }}
            />
          </div>

          {/* Entity List Table */}
          <div className="table-responsive-wrapper" style={{ maxHeight: '280px', overflowY: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>{searchCategory === 'customers' ? 'Grade / Program' : 'Assigned Role'}</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {searchCategory === 'customers' ? (
                  filteredCustomers.length > 0 ? (
                    filteredCustomers.map(c => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{c.studentName}</td>
                        <td><span className="badge-status badge-warning">{c.grade}</span></td>
                        <td>
                          <button className="btn btn-outline" style={{ padding: '3px 8px', fontSize: '0.72rem' }} onClick={() => setSelectedEntity(c)}>
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '16px' }}>No students registered in database.</td></tr>
                  )
                ) : (
                  filteredStaff.length > 0 ? (
                    filteredStaff.map(stf => (
                      <tr key={stf.id}>
                        <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{stf.name}</td>
                        <td><span className="badge-status badge-success">{stf.role}</span></td>
                        <td>
                          <button className="btn btn-outline" style={{ padding: '3px 8px', fontSize: '0.72rem' }} onClick={() => setSelectedEntity(stf)}>
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '16px' }}>No staff members onboarded.</td></tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Log */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontFamily: 'Outfit', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} color="var(--accent-primary)" /> Recent General Ledger Entries
            </h3>
            <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => onNavigate('accounting')}>
              View Full Audit Trail
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentEntries.length > 0 ? (
              recentEntries.map(entry => (
                <div key={entry.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--card-bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)' }}>{entry.description}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>Ref: {entry.id} ({entry.ref_module})</div>
                  </div>
                  <span className="badge-status badge-success" style={{ fontSize: '0.7rem' }}>Posted</span>
                </div>
              ))
            ) : (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                No journal entries posted in ledger.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Inspection Modal */}
      {selectedEntity && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '420px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'Outfit', color: 'var(--text-main)' }}>
                {selectedEntity.studentName ? selectedEntity.studentName : selectedEntity.name}
              </h3>
              <button onClick={() => setSelectedEntity(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
              {selectedEntity.studentName ? (
                <>
                  <div><strong style={{ color: 'var(--text-muted)' }}>Grade / Class:</strong> {selectedEntity.grade}</div>
                  <div><strong style={{ color: 'var(--text-muted)' }}>Program:</strong> {selectedEntity.program}</div>
                  <div><strong style={{ color: 'var(--text-muted)' }}>Balance Dues:</strong> <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{selectedEntity.balanceDue}</span></div>
                </>
              ) : (
                <>
                  <div><strong style={{ color: 'var(--text-muted)' }}>Role:</strong> {selectedEntity.role}</div>
                  <div><strong style={{ color: 'var(--text-muted)' }}>Emirates ID:</strong> {selectedEntity.emiratesId}</div>
                  <div><strong style={{ color: 'var(--text-muted)' }}>Hourly Rate:</strong> <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{selectedEntity.hourlyRate}</span></div>
                  <div><strong style={{ color: 'var(--text-muted)' }}>Email:</strong> {selectedEntity.email}</div>
                </>
              )}
            </div>

            <button className="btn btn-emerald" style={{ width: '100%', justifyContent: 'center', marginTop: '20px' }} onClick={() => setSelectedEntity(null)}>
              Close Inspection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
