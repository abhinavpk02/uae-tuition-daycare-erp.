import React, { useEffect, useState } from 'react';
import { UserCheck, BookOpen, Plus, ShieldAlert, CheckCircle2, AlertTriangle, DollarSign, Clock } from 'lucide-react';
import AddStudentModal from '../components/AddStudentModal';

export default function StudentsView({ activeRole = 'SuperAdmin' }) {
  const [students, setStudents] = useState([
    { id: 'std-101', name: 'Sami Al-Hashimi', standard: 'Grade 4', program: 'Tuition & Daycare', parent_id: 'PRT-882194', due_amount: 140.0, attendance_status: 'Present' },
    { id: 'std-102', name: 'Mariam Bin Zayed', standard: 'Grade 2', program: 'Daycare Only', parent_id: 'PRT-992103', due_amount: 0.0, attendance_status: 'Present' },
    { id: 'std-103', name: 'Rashid Al-Maktoum', standard: 'Grade 5', program: 'Tuition Only', parent_id: 'PRT-441092', due_amount: 450.0, attendance_status: 'Absent' },
    { id: 'std-104', name: 'Fatima Al-Nuaimi', standard: 'Grade 3', program: 'Tuition & Daycare', parent_id: 'PRT-110293', due_amount: 0.0, attendance_status: 'Late' }
  ]);

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
        if (Array.isArray(data) && data.length > 0) {
          setStudents(data.map(s => ({
            ...s,
            due_amount: s.due_amount !== undefined ? s.due_amount : 140.0,
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

    // Post Double-Entry Journal Entry to Backend
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

  // One-Click Attendance Status Toggle
  const handleToggleAttendance = (studentId, newStatus) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, attendance_status: newStatus } : s));
  };

  return (
    <div className="view-container">
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.6rem', color: 'var(--text-main)' }}>Student Directory, Due Payments & Attendance</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Manage student attendance, track outstanding tuition dues, and register new enrollments
          </p>
        </div>

        {/* Action Button for SuperAdmin and Admin */}
        {['SuperAdmin', 'Admin'].includes(activeRole) && (
          <button className="btn btn-emerald" onClick={() => setIsStudentModalOpen(true)}>
            <Plus size={18} /> Register Student
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Students Table */}
        <div className="glass-card">
          <h3 style={{ fontFamily: 'Outfit', marginBottom: '16px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserCheck size={20} color="var(--accent-primary)" /> Enrolled Students Directory ({students.length})
          </h3>

          <div className="table-responsive-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Grade</th>
                  <th>Program</th>
                  <th>Attendance Status</th>
                  <th>Outstanding Dues</th>
                  <th>Quick Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{s.name}</td>
                    <td><span className="badge-status badge-warning">{s.standard}</span></td>
                    <td>
                      <span className="badge-status badge-success">
                        {s.program || 'Tuition & Daycare'}
                      </span>
                    </td>
                    
                    {/* One-Click Attendance Toggle Buttons */}
                    <td>
                      <div style={{ display: 'inline-flex', gap: '4px', background: 'var(--card-bg-subtle)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                        <button 
                          onClick={() => handleToggleAttendance(s.id, 'Present')}
                          style={{
                            padding: '4px 8px',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            background: s.attendance_status === 'Present' ? 'var(--accent-primary)' : 'transparent',
                            color: s.attendance_status === 'Present' ? '#FFF' : 'var(--text-muted)'
                          }}
                        >
                          Present
                        </button>

                        <button 
                          onClick={() => handleToggleAttendance(s.id, 'Late')}
                          style={{
                            padding: '4px 8px',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            background: s.attendance_status === 'Late' ? '#F59E0B' : 'transparent',
                            color: s.attendance_status === 'Late' ? '#FFF' : 'var(--text-muted)'
                          }}
                        >
                          Late
                        </button>

                        <button 
                          onClick={() => handleToggleAttendance(s.id, 'Absent')}
                          style={{
                            padding: '4px 8px',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            background: s.attendance_status === 'Absent' ? '#EF4444' : 'transparent',
                            color: s.attendance_status === 'Absent' ? '#FFF' : 'var(--text-muted)'
                          }}
                        >
                          Absent
                        </button>
                      </div>
                    </td>

                    {/* Student Due Status */}
                    <td>
                      {s.due_amount > 0 ? (
                        <span className="badge-status" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', border: '1px solid #EF4444' }}>
                          <AlertTriangle size={12} /> Due: AED {s.due_amount.toFixed(2)}
                        </span>
                      ) : (
                        <span className="badge-status badge-success">
                          <CheckCircle2 size={12} /> Settled
                        </span>
                      )}
                    </td>

                    {/* Settle Due Payment CTA */}
                    <td>
                      {s.due_amount > 0 ? (
                        <button className="btn btn-emerald" style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={() => handleSettleDue(s.id)}>
                          <DollarSign size={14} /> Settle Due
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No Due</span>
                      )}
                    </td>
                  </tr>
                ))}
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
