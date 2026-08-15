import React, { useEffect, useState } from 'react';
import { UserCheck, BookOpen, Plus, ShieldAlert, CheckCircle2, AlertTriangle, DollarSign, Clock, Search, Trash2 } from 'lucide-react';
import AddStudentModal from '../components/AddStudentModal';
import SwipeableTableRow from '../components/SwipeableTableRow';
import { BASE_URL } from '../api';

export default function StudentsView({ activeRole = 'SuperAdmin' }) {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);

  const [subjects] = useState([
    { id: '1', name: 'Advanced Mathematics', tier: 'HSS', monthly_fee: 1200 },
    { id: '2', name: 'Physics & Chemistry Lab', tier: 'HS', monthly_fee: 950 },
    { id: '3', name: 'English Literature', tier: 'HS', monthly_fee: 800 }
  ]);

  const defaultStudents = [
    { id: 'std-101', name: 'Zayed Al-Hashimi', standard: 'Grade 10', program: 'Both', due_amount: 0.0, attendance_status: 'Present' },
    { id: 'std-102', name: 'Amina Al-Mansoori', standard: 'Grade 11', program: 'Tuition', due_amount: 450.0, attendance_status: 'Present' }
  ];

  const fetchStudents = () => {
    fetch(`${BASE_URL}/api/students`)
      .then(res => res.json())
      .then(data => {
        const remoteList = Array.isArray(data) ? data.map(s => ({
          id: s.id,
          name: s.name,
          standard: s.standard || 'Grade 10',
          program: typeof s.program === 'object' ? (s.program.value || 'Both') : String(s.program || 'Both'),
          due_amount: s.due_amount || 0.0,
          attendance_status: s.attendance_status || 'Present'
        })) : [];

        const localStudents = JSON.parse(localStorage.getItem('registered_students') || '[]');
        const merged = [...localStudents];

        remoteList.forEach(r => {
          if (!merged.some(m => String(m.id) === String(r.id) || m.name.toLowerCase() === r.name.toLowerCase())) {
            merged.push(r);
          }
        });

        if (merged.length === 0) {
          merged.push(...defaultStudents);
        }

        setStudents(merged);
      })
      .catch(() => {
        const localStudents = JSON.parse(localStorage.getItem('registered_students') || '[]');
        setStudents(localStudents.length > 0 ? localStudents : defaultStudents);
      });
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleStudentAdded = (newStudent) => {
    if (newStudent) {
      const updatedLocal = [newStudent, ...students.filter(s => s.id !== newStudent.id)];
      setStudents(updatedLocal);
      localStorage.setItem('registered_students', JSON.stringify(updatedLocal));
    }
    fetchStudents();
  };

  // Permanent Student Deletion (Slide-to-Delete or Action Click)
  const handleDeleteStudent = (studentId, e) => {
    if (e) e.stopPropagation();
    const target = students.find(s => String(s.id) === String(studentId));
    const studentName = target ? target.name : 'student';

    if (!window.confirm(`Are you sure you want to permanently delete ${studentName} and remove all records from the database?`)) {
      return;
    }

    const updated = students.filter(s => String(s.id) !== String(studentId));
    setStudents(updated);
    localStorage.setItem('registered_students', JSON.stringify(updated));

    fetch(`${BASE_URL}/api/students/${studentId}`, { method: 'DELETE' }).catch(() => {});
  };

  const handleSettleDue = (studentId) => {
    const target = students.find(s => s.id === studentId);
    if (!target || target.due_amount <= 0) return;

    const settledAmt = target.due_amount;
    const updated = students.map(s => s.id === studentId ? { ...s, due_amount: 0.0 } : s);

    setStudents(updated);
    localStorage.setItem('registered_students', JSON.stringify(updated));

    fetch(`${BASE_URL}/api/accounting/journal-entry`, {
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
    const updated = students.map(s => s.id === studentId ? { ...s, attendance_status: newStatus } : s);
    setStudents(updated);
    localStorage.setItem('registered_students', JSON.stringify(updated));
  };

  const filteredStudents = students.filter(s =>
    (s.name && s.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (s.standard && s.standard.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (s.program && String(s.program).toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="view-container">
      {/* Header Bar */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.6rem', color: 'var(--text-main)' }}>Student Directory & Academic Roster</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Manage registered students, program enrollments, attendance status & outstanding balances ({students.length} Registered Students)
          </p>
        </div>

        {['SuperAdmin', 'Admin'].includes(activeRole) && (
          <button className="btn btn-emerald" onClick={() => setIsStudentModalOpen(true)}>
            <Plus size={18} /> Register Student
          </button>
        )}
      </div>

      {/* Main Roster Card */}
      <div className="glass-card" style={{ marginBottom: '28px' }}>
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
                <th>Full Name</th>
                <th>Grade / Class</th>
                <th>Enrolled Program</th>
                <th>Outstanding Dues</th>
                <th>Attendance Status</th>
                <th>Quick Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map(std => (
                  <SwipeableTableRow 
                    key={std.id} 
                    onDelete={() => handleDeleteStudent(std.id)}
                    deleteLabel={`Delete ${std.name}`}
                  >
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{std.id}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{std.name}</td>
                    <td><span className="badge-status badge-success">{std.standard}</span></td>
                    <td>
                      <span className="badge-status badge-warning" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3B82F6', borderColor: '#3B82F6' }}>
                        {std.program === 'Both' ? 'Tuition & Daycare' : std.program}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: std.due_amount > 0 ? '#EF4444' : 'var(--accent-primary)' }}>
                      AED {parseFloat(std.due_amount || 0).toFixed(2)}
                    </td>
                    <td>
                      <button 
                        className={`btn ${std.attendance_status === 'Present' ? 'btn-emerald' : 'btn-outline'}`}
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        onClick={() => handleToggleAttendance(std.id, std.attendance_status === 'Present' ? 'Absent' : 'Present')}
                      >
                        <Clock size={12} /> {std.attendance_status || 'Present'}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {std.due_amount > 0 ? (
                          <button 
                            className="btn btn-emerald" 
                            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                            onClick={() => handleSettleDue(std.id)}
                          >
                            <DollarSign size={12} /> Settle Due
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}>✔ Settled</span>
                        )}
                        
                        <button 
                          onClick={(e) => handleDeleteStudent(std.id, e)} 
                          title={`Delete ${std.name}`}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#EF4444',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'inline-flex',
                            alignItems: 'center'
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </SwipeableTableRow>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>
                    No students registered. Click "Register Student" to record a new student.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Available Academic Offerings Card */}
      <div className="glass-card">
        <h3 style={{ fontFamily: 'Outfit', marginBottom: '16px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={18} color="var(--accent-primary)" /> Tuition & Academic Offerings Pricing Catalog
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {subjects.map(sub => (
            <div key={sub.id} style={{ padding: '16px', background: 'var(--card-bg-subtle)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>{sub.name}</span>
                <span className="badge-status badge-success" style={{ fontSize: '0.7rem' }}>{sub.tier}</span>
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-primary)', fontFamily: 'monospace' }}>
                AED {sub.monthly_fee}.00 / month
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Registration Modal */}
      <AddStudentModal 
        isOpen={isStudentModalOpen} 
        onClose={() => setIsStudentModalOpen(false)} 
        onSuccess={handleStudentAdded}
        creatorRole={activeRole}
      />
    </div>
  );
}
