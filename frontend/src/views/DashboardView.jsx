import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, Users, Clock, ShieldCheck, DollarSign, 
  ShoppingBag, ArrowUpRight, CheckCircle2, Coins, Layers, Search, UserCheck, X, Phone, Mail, FileText, BadgeCheck, BookOpen
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

  // SEARCH & INSPECTION HUB STATE
  const [searchCategory, setSearchCategory] = useState('customers'); // 'customers' | 'staff'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntity, setSelectedEntity] = useState(null);

  // Sample Customer Database (Students & Parents)
  const customersList = [
    {
      id: 'cust-101',
      studentName: 'Zayed Al-Hashimi',
      parentName: 'Mohammed Al-Hashimi',
      grade: 'Grade 10',
      program: 'Tuition & Daycare',
      phone: '+971 50 123 4567',
      email: 'mohammed.hashimi@example.ae',
      rfidTag: 'TAG-882194',
      monthlyFee: 'AED 1,200/mo',
      balanceDue: 'AED 0.00 (Fully Paid)',
      attendanceRate: '98% Present'
    },
    {
      id: 'cust-102',
      studentName: 'Mariam Al-Hashimi',
      parentName: 'Mohammed Al-Hashimi',
      grade: 'KG 2',
      program: 'Daycare Only',
      phone: '+971 50 123 4567',
      email: 'mohammed.hashimi@example.ae',
      rfidTag: 'TAG-882195',
      monthlyFee: 'AED 800/mo',
      balanceDue: 'AED 0.00 (Fully Paid)',
      attendanceRate: '95% Present'
    },
    {
      id: 'cust-103',
      studentName: 'Sami Al-Hashimi',
      parentName: 'Tariq Al-Hashimi',
      grade: 'Grade 4',
      program: 'Tuition & Daycare',
      phone: '+971 55 987 6543',
      email: 'tariq.hashimi@example.ae',
      rfidTag: 'TAG-771029',
      monthlyFee: 'AED 1,100/mo',
      balanceDue: 'AED 140.00 (Pending)',
      attendanceRate: '92% Present'
    },
    {
      id: 'cust-104',
      studentName: 'Rashid Al-Maktoum',
      parentName: 'Saeed Al-Maktoum',
      grade: 'Grade 5',
      program: 'Tuition Only',
      phone: '+971 52 444 8899',
      email: 'saeed.maktoum@example.ae',
      rfidTag: 'TAG-993012',
      monthlyFee: 'AED 950/mo',
      balanceDue: 'AED 450.00 (Overdue)',
      attendanceRate: '88% Present'
    }
  ];

  // Sample Staff Database
  const staffList = [
    {
      id: 'stf-101',
      name: 'Fatima Al-Mansoori',
      role: 'Senior STEM Lead Teacher',
      emiratesId: '784-1992-8821941-1',
      hourlyRate: 'AED 45.00 / hr',
      monthlyHours: '80 hrs',
      monthlyPayout: 'AED 3,600.00',
      email: 'fatima.mansoori@nest.ae',
      phone: '+971 52 987 6543',
      assignedRooms: 'Room 101, Room 102'
    },
    {
      id: 'stf-102',
      name: 'Sarah Jenkins',
      role: 'Daycare & Montessori Specialist',
      emiratesId: '784-1988-3341902-3',
      hourlyRate: 'AED 40.00 / hr',
      monthlyHours: '75 hrs',
      monthlyPayout: 'AED 3,000.00',
      email: 'sarah.jenkins@nest.ae',
      phone: '+971 50 888 2211',
      assignedRooms: 'Daycare Zone A, Daycare Zone B'
    }
  ];

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

  // Filtered Results
  const filteredCustomers = customersList.filter(c => 
    c.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.grade.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStaff = staffList.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.emiratesId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="view-container">
      {/* KPI Cards */}
      <div className="grid-stats-large">
        
        {/* Metric 1: Total Volume */}
        <div className="stat-card-square">
          <div className="stat-icon-square">
            <Coins size={32} />
          </div>
          <div className="stat-val-square" style={{ color: 'var(--accent-primary)' }}>
            AED {stats.totalRevenue}
          </div>
          <div className="stat-lbl-square">Total Volume</div>
        </div>

        {/* Metric 2: Enrolled Students */}
        <div className="stat-card-square">
          <div className="stat-icon-square">
            <Users size={32} />
          </div>
          <div className="stat-val-square">
            {stats.activeStudents}
          </div>
          <div className="stat-lbl-square">Enrolled Students</div>
        </div>

        {/* Metric 3: Daycare Hours */}
        <div className="stat-card-square">
          <div className="stat-icon-square">
            <Clock size={32} />
          </div>
          <div className="stat-val-square">
            {stats.daycareHours} hrs
          </div>
          <div className="stat-lbl-square">Daycare Hours</div>
        </div>

        {/* Metric 4: Ledger Status */}
        <div className="stat-card-square">
          <div className="stat-icon-square">
            <ShieldCheck size={32} />
          </div>
          <div className="stat-val-square" style={{ color: stats.isBalanced ? 'var(--accent-primary)' : '#EF4444', fontSize: '1.25rem' }}>
            {stats.isBalanced ? '100% BALANCED' : 'UNBALANCED'}
          </div>
          <div className="stat-lbl-square">Ledger Audit Status</div>
        </div>

      </div>

      {/* EXECUTIVE DASHBOARD SEARCH & DETAIL INSPECTION CONSOLE */}
      <div className="glass-card" style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search size={20} color="var(--accent-primary)" /> Executive Search & Inspection Hub
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Search across customer records (students & parents) and staff member profiles
            </p>
          </div>

          {/* Category Tabs Switcher */}
          <div style={{ display: 'flex', gap: '8px', background: 'var(--card-bg-subtle)', padding: '4px', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => { setSearchCategory('customers'); setSelectedEntity(null); }}
              className={`btn ${searchCategory === 'customers' ? 'btn-emerald' : 'btn-outline'}`}
              style={{ padding: '6px 16px', fontSize: '0.8rem', minHeight: '36px' }}
            >
              🎓 Customers (Students & Parents)
            </button>
            <button
              onClick={() => { setSearchCategory('staff'); setSelectedEntity(null); }}
              className={`btn ${searchCategory === 'staff' ? 'btn-emerald' : 'btn-outline'}`}
              style={{ padding: '6px 16px', fontSize: '0.8rem', minHeight: '36px' }}
            >
              👩‍🏫 Staff & Teachers
            </button>
          </div>
        </div>

        {/* Live Search Input Bar */}
        <div className="form-group" style={{ position: 'relative', marginBottom: '16px' }}>
          <Search size={18} color="var(--accent-primary)" style={{ position: 'absolute', left: '14px', top: '13px' }} />
          <input
            type="text"
            className="form-input"
            placeholder={
              searchCategory === 'customers'
                ? "Search by student name, parent name, grade, or phone number..."
                : "Search staff by teacher name, role, email, or Emirates ID..."
            }
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '44px', height: '44px', fontSize: '0.9rem' }}
          />
        </div>

        {/* Search Results Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px', marginBottom: selectedEntity ? '20px' : '0' }}>
          {searchCategory === 'customers' ? (
            filteredCustomers.map(item => (
              <div
                key={item.id}
                onClick={() => setSelectedEntity(item)}
                style={{
                  padding: '14px',
                  borderRadius: '16px',
                  background: selectedEntity?.id === item.id ? 'var(--accent-primary-glow)' : 'var(--card-bg-subtle)',
                  border: selectedEntity?.id === item.id ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>{item.studentName}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>Parent: {item.parentName}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                  <span className="badge-status badge-warning" style={{ fontSize: '0.7rem' }}>{item.grade}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>Click to View Details →</span>
                </div>
              </div>
            ))
          ) : (
            filteredStaff.map(item => (
              <div
                key={item.id}
                onClick={() => setSelectedEntity(item)}
                style={{
                  padding: '14px',
                  borderRadius: '16px',
                  background: selectedEntity?.id === item.id ? 'var(--accent-primary-glow)' : 'var(--card-bg-subtle)',
                  border: selectedEntity?.id === item.id ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>{item.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>{item.role}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                  <span className="badge-status badge-success" style={{ fontSize: '0.7rem' }}>{item.hourlyRate}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>Click to View Details →</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* DETAILED INSPECTION CARD WHEN A NAME IS SELECTED */}
        {selectedEntity && (
          <div style={{ marginTop: '20px', padding: '20px', background: 'var(--bg-card)', borderRadius: '18px', border: '1px solid var(--accent-primary)', boxShadow: 'var(--glass-shadow)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <h4 style={{ fontFamily: 'Outfit', fontSize: '1.1rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BadgeCheck size={18} /> Detailed Inspection Profile: {searchCategory === 'customers' ? selectedEntity.studentName : selectedEntity.name}
              </h4>
              <button onClick={() => setSelectedEntity(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {searchCategory === 'customers' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '0.85rem' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Student Name:</span> <strong style={{ color: 'var(--text-main)' }}>{selectedEntity.studentName}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Parent / Guardian:</span> <strong style={{ color: 'var(--text-main)' }}>{selectedEntity.parentName}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Grade & Program:</span> <strong>{selectedEntity.grade} ({selectedEntity.program})</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Emergency Contact:</span> <strong>{selectedEntity.phone}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Email:</span> <strong>{selectedEntity.email}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>RFID Tag ID:</span> <strong style={{ fontFamily: 'monospace' }}>{selectedEntity.rfidTag}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Monthly Fee:</span> <strong style={{ color: 'var(--accent-primary)' }}>{selectedEntity.monthlyFee}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Account Balance:</span> <strong style={{ color: selectedEntity.balanceDue.includes('Overdue') ? '#EF4444' : 'var(--accent-primary)' }}>{selectedEntity.balanceDue}</strong></div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', fontSize: '0.85rem' }}>
                <div><span style={{ color: 'var(--text-muted)' }}>Staff Member:</span> <strong style={{ color: 'var(--text-main)' }}>{selectedEntity.name}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Role / Title:</span> <strong>{selectedEntity.role}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Emirates ID:</span> <strong style={{ fontFamily: 'monospace' }}>{selectedEntity.emiratesId}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Hourly Compensation:</span> <strong style={{ color: 'var(--accent-primary)' }}>{selectedEntity.hourlyRate}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Monthly Hours:</span> <strong>{selectedEntity.monthlyHours}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Gross Payroll Payout:</span> <strong style={{ color: 'var(--accent-primary)' }}>{selectedEntity.monthlyPayout}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Work Email:</span> <strong>{selectedEntity.email}</strong></div>
                <div><span style={{ color: 'var(--text-muted)' }}>Assigned Classrooms:</span> <strong>{selectedEntity.assignedRooms}</strong></div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Responsive Grid Section */}
      <div className="grid-2col-responsive">
        
        {/* Recent Double-Entry Journal Entries Table */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', color: 'var(--text-main)' }}>Recent Double-Entry Journal Entries</h3>
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

        {/* Re-imagined ERP Operations Hub */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '2px' }}>
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
              background: 'var(--card-bg-subtle)', 
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              cursor: 'pointer',
              transition: 'all 0.25s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--accent-primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', flexShrink: 0 }}>
                <ShoppingBag size={26} />
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>POS Terminal</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tuition & Daycare Checkout</p>
              </div>
            </div>
            <ArrowUpRight size={20} color="var(--accent-primary)" />
          </div>

          {/* Card 2: RFID Scanner */}
          <div 
            onClick={() => onNavigate('attendance')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '20px', 
              background: 'var(--card-bg-subtle)', 
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              cursor: 'pointer',
              transition: 'all 0.25s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--accent-primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', flexShrink: 0 }}>
                <Clock size={26} />
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>RFID Daycare Engine</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real-time Attendance Tracker</p>
              </div>
            </div>
            <ArrowUpRight size={20} color="var(--accent-primary)" />
          </div>

          {/* Card 3: Ledger Reports */}
          <div 
            onClick={() => onNavigate('accounting')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '20px', 
              background: 'var(--card-bg-subtle)', 
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              cursor: 'pointer',
              transition: 'all 0.25s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--accent-primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', flexShrink: 0 }}>
                <Layers size={26} />
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>Financial Reports</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>General Ledger & Audits</p>
              </div>
            </div>
            <ArrowUpRight size={20} color="var(--accent-primary)" />
          </div>

        </div>

      </div>
    </div>
  );
}
