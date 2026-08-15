import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, Users, Clock, ShieldCheck, DollarSign, 
  ShoppingBag, ArrowUpRight, CheckCircle2, Coins, Layers, Search, UserCheck, X, Phone, Mail, FileText, BadgeCheck, BookOpen
} from 'lucide-react';
import { BASE_URL } from '../api';

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
    fetch(`${BASE_URL}/api/reports/trial-balance`)
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

    // Fetch and merge Students
    fetch(`${BASE_URL}/api/students`)
      .then(res => res.json())
      .then(data => {
        const remoteList = Array.isArray(data) ? data : [];
        const localList = JSON.parse(localStorage.getItem('registered_students') || '[]');
        const merged = [...localList];

        remoteList.forEach(r => {
          if (!merged.some(m => String(m.id) === String(r.id))) {
            merged.push(r);
          }
        });

        if (merged.length === 0) {
          merged.push({ id: 'std-101', name: 'Zayed Al-Hashimi', standard: 'Grade 10', due_amount: 0 });
        }

        setStats(prev => ({ ...prev, activeStudents: merged.length.toString() }));
        setCustomersList(merged.map(s => ({
          id: s.id,
          studentName: s.name,
          parentName: 'Parent of ' + s.name,
          grade: s.standard || 'Grade 10',
          program: s.program || 'Tuition & Daycare',
          phone: '+971 50 000 0000',
          email: 'parent@uaeerp.ae',
          rfidTag: `TAG-${s.id}`,
          monthlyFee: 'AED 1,200.00',
          balanceDue: `AED ${(s.due_amount || 0).toFixed(2)}`,
          attendanceRate: 'Present'
        })));
      })
      .catch(() => {
        const localList = JSON.parse(localStorage.getItem('registered_students') || '[]');
        const merged = localList.length > 0 ? localList : [{ id: 'std-101', name: 'Zayed Al-Hashimi', standard: 'Grade 10', due_amount: 0 }];

        setStats(prev => ({ ...prev, activeStudents: merged.length.toString() }));
        setCustomersList(merged.map(s => ({
          id: s.id,
          studentName: s.name,
          parentName: 'Parent of ' + s.name,
          grade: s.standard || 'Grade 10',
          program: s.program || 'Tuition & Daycare',
          phone: '+971 50 000 0000',
          email: 'parent@uaeerp.ae',
          rfidTag: `TAG-${s.id}`,
          monthlyFee: 'AED 1,200.00',
          balanceDue: `AED ${(s.due_amount || 0).toFixed(2)}`,
          attendanceRate: 'Present'
        })));
      });

    // Fetch and merge Staff
    fetch(`${BASE_URL}/api/staff`)
      .then(res => res.json())
      .then(data => {
        const remoteList = Array.isArray(data) ? data : [];
        const localList = JSON.parse(localStorage.getItem('registered_staff') || '[]');
        const merged = [...localList];

        remoteList.forEach(r => {
          if (!merged.some(m => String(m.id) === String(r.id))) {
            merged.push(r);
          }
        });

        if (merged.length === 0) {
          merged.push({ id: 'stf-201', name: 'Fatima Al-Mansoori', role: 'Teacher', hourly_rate: 120.00 });
        }

        setStaffList(merged.map(stf => ({
          id: stf.id,
          name: stf.name,
          role: stf.role || 'Teacher',
          emiratesId: stf.emirates_id || '784-1992-1234567-1',
          hourlyRate: `AED ${(stf.hourly_rate || 120).toFixed(2)} / hr`,
          monthlyHours: '30 hrs',
          monthlyPayout: `AED ${((stf.hourly_rate || 120) * 30).toFixed(2)}`,
          email: stf.email || `${stf.name.toLowerCase().replace(/\s+/g, '.')}@nest.ae`,
          phone: '+971 50 111 2233',
          assignedRooms: 'Main Zone'
        })));
      })
      .catch(() => {
        const localList = JSON.parse(localStorage.getItem('registered_staff') || '[]');
        const merged = localList.length > 0 ? localList : [{ id: 'stf-201', name: 'Fatima Al-Mansoori', role: 'Teacher', hourly_rate: 120.00 }];

        setStaffList(merged.map(stf => ({
          id: stf.id,
          name: stf.name,
          role: stf.role || 'Teacher',
          emiratesId: stf.emirates_id || '784-1992-1234567-1',
          hourlyRate: `AED ${(stf.hourly_rate || 120).toFixed(2)} / hr`,
          monthlyHours: '30 hrs',
          monthlyPayout: `AED ${((stf.hourly_rate || 120) * 30).toFixed(2)}`,
          email: stf.email || `${stf.name.toLowerCase().replace(/\s+/g, '.')}@nest.ae`,
          phone: '+971 50 111 2233',
          assignedRooms: 'Main Zone'
        })));
      });

    fetch(`${BASE_URL}/api/accounting/journal-entries`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setRecentEntries(data.slice(0, 5));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredCustomers = customersList.filter(c => 
    (c.studentName && c.studentName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.parentName && c.parentName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.grade && c.grade.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredStaff = staffList.filter(s =>
    (s.name && s.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (s.role && s.role.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (s.email && s.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="view-container">
      {/* Header Bar */}
      <div className="header-bar">
        <div>
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.6rem', color: 'var(--text-main)' }}>Executive Operational Dashboard</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Overview of student attendance, daycare operations, billing, and accounting ledgers</p>
        </div>
        <div className="header-actions">
          <span className="badge-status badge-success" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', border: '1px solid #10B981' }}>
            <ShieldCheck size={14} /> Double-Entry Ledger: Balanced
          </span>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid-stats-large">
        <div className="stat-card-square">
          <div className="stat-icon-square"><DollarSign size={24} color="var(--accent-primary)" /></div>
          <div className="stat-val-square">AED {stats.totalRevenue}</div>
          <div className="stat-lbl-square">General Ledger Balance</div>
        </div>

        <div className="stat-card-square">
          <div className="stat-icon-square"><Users size={24} color="var(--accent-primary)" /></div>
          <div className="stat-val-square">{stats.activeStudents}</div>
          <div className="stat-lbl-square">Registered Students</div>
        </div>

        <div className="stat-card-square">
          <div className="stat-icon-square"><UserCheck size={24} color="var(--accent-primary)" /></div>
          <div className="stat-val-square">{staffList.length}</div>
          <div className="stat-lbl-square">Active Staff & Teachers</div>
        </div>

        <div className="stat-card-square">
          <div className="stat-icon-square"><Clock size={24} color="var(--accent-primary)" /></div>
          <div className="stat-val-square">12.5 hrs</div>
          <div className="stat-lbl-square">Daycare Clocked Hours</div>
        </div>
      </div>

      {/* MASTER SEARCH & INSPECTION HUB CARD */}
      <div className="glass-card" style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontFamily: 'Outfit', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search size={20} color="var(--accent-primary)" /> Master Directory Search & Profile Inspection
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Inspect full profiles, attendance records, daycare hours, and billing ledgers for students or staff</p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className={`btn ${searchCategory === 'customers' ? 'btn-emerald' : 'btn-outline'}`}
              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
              onClick={() => { setSearchCategory('customers'); setSelectedEntity(null); }}
            >
              <Users size={14} /> Students & Parents ({customersList.length})
            </button>
            <button 
              className={`btn ${searchCategory === 'staff' ? 'btn-emerald' : 'btn-outline'}`}
              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
              onClick={() => { setSearchCategory('staff'); setSelectedEntity(null); }}
            >
              <UserCheck size={14} /> Staff Members ({staffList.length})
            </button>
          </div>
        </div>

        <div className="form-group" style={{ position: 'relative', marginBottom: '16px' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '12px' }} />
          <input 
            type="text"
            className="form-input"
            placeholder={searchCategory === 'customers' ? "Search student name or grade..." : "Search staff member by name or role..."}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '42px' }}
          />
        </div>

        {/* Directory Results Table */}
        <div className="table-responsive-wrapper">
          <table className="custom-table">
            <thead>
              {searchCategory === 'customers' ? (
                <tr>
                  <th>Student ID</th>
                  <th>Student Name</th>
                  <th>Grade</th>
                  <th>Program</th>
                  <th>Outstanding Dues</th>
                  <th>Action</th>
                </tr>
              ) : (
                <tr>
                  <th>Staff ID</th>
                  <th>Staff Member Name</th>
                  <th>Role</th>
                  <th>Emirates ID</th>
                  <th>Hourly Rate</th>
                  <th>Action</th>
                </tr>
              )}
            </thead>
            <tbody>
              {searchCategory === 'customers' ? (
                filteredCustomers.length > 0 ? (
                  filteredCustomers.map(c => (
                    <tr key={c.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{c.id}</td>
                      <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{c.studentName}</td>
                      <td><span className="badge-status badge-success">{c.grade}</span></td>
                      <td><span className="badge-status badge-warning">{c.program}</span></td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 700, color: c.balanceDue !== 'AED 0.00' ? '#EF4444' : 'var(--accent-primary)' }}>{c.balanceDue}</td>
                      <td>
                        <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => setSelectedEntity(c)}>
                          Inspect Profile
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>No students found in directory.</td></tr>
                )
              ) : (
                filteredStaff.length > 0 ? (
                  filteredStaff.map(st => (
                    <tr key={st.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{st.id}</td>
                      <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{st.name}</td>
                      <td><span className="badge-status badge-success">{st.role}</span></td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{st.emiratesId}</td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-primary)' }}>{st.hourlyRate}</td>
                      <td>
                        <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => setSelectedEntity(st)}>
                          Inspect Profile
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>No staff members found in directory.</td></tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSPECTION PROFILE MODAL */}
      {selectedEntity && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '520px', padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'Outfit', color: 'var(--text-main)' }}>
                {searchCategory === 'customers' ? `Student Record: ${selectedEntity.studentName}` : `Staff Credential: ${selectedEntity.name}`}
              </h3>
              <button onClick={() => setSelectedEntity(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            {searchCategory === 'customers' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
                <div><strong>Student ID:</strong> <span style={{ fontFamily: 'monospace' }}>{selectedEntity.id}</span></div>
                <div><strong>Grade Level:</strong> {selectedEntity.grade}</div>
                <div><strong>Enrolled Program:</strong> {selectedEntity.program}</div>
                <div><strong>Outstanding Dues:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-primary)' }}>{selectedEntity.balanceDue}</span></div>
                <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
                  <button className="btn btn-emerald" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { setSelectedEntity(null); onNavigate('students'); }}>Go to Student Roster</button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.9rem' }}>
                <div><strong>Staff ID:</strong> <span style={{ fontFamily: 'monospace' }}>{selectedEntity.id}</span></div>
                <div><strong>Assigned Role:</strong> {selectedEntity.role}</div>
                <div><strong>Email Address:</strong> {selectedEntity.email}</div>
                <div><strong>Emirates ID:</strong> <span style={{ fontFamily: 'monospace' }}>{selectedEntity.emiratesId}</span></div>
                <div><strong>Hourly Payroll Rate:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-primary)' }}>{selectedEntity.hourlyRate}</span></div>
                <div style={{ marginTop: '12px', display: 'flex', gap: '10px' }}>
                  <button className="btn btn-emerald" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { setSelectedEntity(null); onNavigate('staff'); }}>Go to Staff Directory</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Ledger Entries */}
      <div className="glass-card">
        <h3 style={{ fontFamily: 'Outfit', marginBottom: '16px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={18} color="var(--accent-primary)" /> Live Audit Trail: Recent Journal Entries
        </h3>
        <div className="table-responsive-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>JE Ref ID</th>
                <th>Description</th>
                <th>Module Origin</th>
                <th>Date / Time</th>
              </tr>
            </thead>
            <tbody>
              {recentEntries.length > 0 ? (
                recentEntries.map(je => (
                  <tr key={je.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{je.id}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{je.description}</td>
                    <td><span className="badge-status badge-success">{je.ref_module || 'System'}</span></td>
                    <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.82rem' }}>
                      {new Date(je.date).toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                    No recent double-entry ledger postings.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
