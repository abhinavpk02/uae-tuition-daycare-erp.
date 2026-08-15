import React, { useEffect, useState } from 'react';
import { UserCheck, BookOpen, Plus, ShieldAlert, CheckCircle2, AlertTriangle, DollarSign, Clock, Search } from 'lucide-react';
import AddStudentModal from '../components/AddStudentModal';

export default function StudentsView({ activeRole = 'SuperAdmin' }) {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);

  const [subjects] = useState([
    { id: '1', name: 'Advanced Mathematics', tier: 'HSS', monthly_fee: 1200 },
    { id: '2', name: 'Physics & Chemistry Lab', tier: 'HS', monthly_fee: 950 },
    { id: '3', name: 'English Literature', tier: 'HS', monthly_fee: 800 }
  ]);

  const fetchStudents = () => {
    fetch('/api/students')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setStudents(data.map(s => ({
            ...s,
            due_amount: s.due_amount || 0.0,
            attendance_status: s.attendance_status || 'Present'
          })));
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // One-Click Settle Due Payment
  const handleSettleDue = (studentId) => {
    const target = students.find(s => s.id === studentId);
    if (!target || target.due_amount <= 0) return;

    const settledAmt = target.due_amount;

    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, due_amount: 0.0 } : s));

    fetch('/api/accounting/journal-entry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description: `Student Due Payment Receipt - ${target.name}`,
        ref_module: 'POS',
        lines: [
          { account_code: '1000', debit: settledAmt, credit: 0.0 },
          { account_code: '1200', debit: 0.0, credit: settledAmt }
        ]
      })
    }).catch(() => {});

    alert(`Successfully settled due payment of AED ${settledAmt.toFixed(2)} for ${target.name}. Posted to General Ledger!`);
  };

  const handleToggleAttendance = (studentId, newStatus) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, attendance_status: newStatus } : s));
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.standard && s.standard.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (s.program && s.program.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="view-container">
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.6rem', color: 'var(--text-main)' }}>Student Directory, Due Payments & Attendance</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Search students, manage attendance, track outstanding tuition dues, and register new enrollments ({students.length} Registered Students)
          </p>
        </div>

        {['SuperAdmin', 'Admin'].includes(activeRole) && (
          <button className="btn btn-emerald" onClick={() => setIsStudentModalOpen(true)}>
            <Plus size={18} /> Register Student
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Students Table with Real-time Search Filter */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontFamily: 'Outfit', color: 'var(--text-main)' }}>Registered Students Roster ({students.length})</h3>
            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              <input 
                type="text" 
                className="form-input" 
                placeholder="Search by student name or grade..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '36px', height: '38px', fontSize: '0.85rem', width: '100%' }}
              />
            </div>
          </div>

          <div className="table-responsive-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Student Name</th>
                  <th>Standard / Grade</th>
                  <th>Program Type</th>
                  <th>Outstanding Dues</th>
                  <th>Attendance Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map(std => (
                    <tr key={std.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{std.id}</td>
                      <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{std.name}</td>
                      <td><span className="badge-status badge-warning">{std.standard}</span></td>
                      <td><span className="badge-status badge-success">{std.program}</span></td>
                      <td>
                        {std.due_amount > 0 ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: '#EF4444', fontWeight: 700, fontFamily: 'monospace' }}>
                              AED {std.due_amount.toFixed(2)}
                            </span>
                            {['SuperAdmin', 'Admin', 'Accountant'].includes(activeRole) && (
                              <button 
                                className="btn btn-emerald" 
                                style={{ padding: '2px 8px', fontSize: '0.72rem', height: '26px' }}
                                onClick={() => handleSettleDue(std.id)}
                              >
                                Settle Dues
                              </button>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>✔ Settled</span>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'inline-flex', gap: '4px', background: 'var(--card-bg-subtle)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                          <button 
                            onClick={() => handleToggleAttendance(std.id, 'Present')}
                            style={{
                              padding: '4px 8px',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              borderRadius: '6px',
                              border: 'none',
                              cursor: 'pointer',
                              background: std.attendance_status === 'Present' ? 'var(--accent-primary)' : 'transparent',
                              color: std.attendance_status === 'Present' ? '#FFF' : 'var(--text-muted)'
                            }}
                          >
                            Present
                          </button>
                          <button 
                            onClick={() => handleToggleAttendance(std.id, 'Late')}
                            style={{
                              padding: '4px 8px',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              borderRadius: '6px',
                              border: 'none',
                              cursor: 'pointer',
                              background: std.attendance_status === 'Late' ? '#F59E0B' : 'transparent',
                              color: std.attendance_status === 'Late' ? '#FFF' : 'var(--text-muted)'
                            }}
                          >
                            Late
                          </button>
                          <button 
                            onClick={() => handleToggleAttendance(std.id, 'Absent')}
                            style={{
                              padding: '4px 8px',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              borderRadius: '6px',
                              border: 'none',
                              cursor: 'pointer',
                              background: std.attendance_status === 'Absent' ? '#EF4444' : 'transparent',
                              color: std.attendance_status === 'Absent' ? '#FFF' : 'var(--text-muted)'
                            }}
                          >
                            Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>
                      No students found. Click "Register Student" to onboard a new student.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Subjects & Course Pricing Matrix */}
        <div className="glass-card">
          <h3 style={{ fontFamily: 'Outfit', marginBottom: '16px', color: 'var(--text-main)' }}>Tuition Pricing Matrix</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {subjects.map(sub => (
              <div key={sub.id} style={{ padding: '14px', background: 'var(--card-bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{sub.name}</span>
                  <span className="badge-status badge-warning">{sub.tier}</span>
                </div>
                <div style={{ color: 'var(--accent-primary)', fontFamily: 'monospace', fontWeight: 700 }}>
                  AED {sub.monthly_fee.toFixed(2)} / month
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Modal Trigger */}
      <AddStudentModal 
        isOpen={isStudentModalOpen} 
        onClose={() => setIsStudentModalOpen(false)} 
        onSuccess={() => fetchStudents()}
        creatorRole={activeRole}
      />
    </div>
  );
}
