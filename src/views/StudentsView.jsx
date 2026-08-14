import React, { useEffect, useState } from 'react';
import { UserCheck, BookOpen, Plus, ShieldAlert, UserPlus } from 'lucide-react';
import AddStudentModal from '../components/AddStudentModal';
import AddStaffModal from '../components/AddStaffModal';

export default function StudentsView() {
  const [students, setStudents] = useState([]);
  const [staff, setStaff] = useState([]);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);

  const [subjects] = useState([
    { id: '1', name: 'Advanced Mathematics', tier: 'HSS', monthly_fee: 1200 },
    { id: '2', name: 'Physics & Chemistry Lab', tier: 'HS', monthly_fee: 950 },
    { id: '3', name: 'English Literature', tier: 'HS', monthly_fee: 800 }
  ]);

  const fetchStudents = () => {
    fetch('/api/students')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setStudents(data);
      })
      .catch(() => {});
  };

  const fetchStaff = () => {
    fetch('/api/staff')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setStaff(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchStudents();
    fetchStaff();
  }, []);

  return (
    <div className="view-container">
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.6rem' }}>Academic & Student Directory</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Registered students, daycare enrollment programs, and teaching staff</p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-emerald" onClick={() => setIsStudentModalOpen(true)}>
            <Plus size={18} /> Register Student
          </button>
          <button className="btn btn-gold" onClick={() => setIsStaffModalOpen(true)}>
            <UserPlus size={18} /> Onboard Staff
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Students Table */}
        <div className="glass-card">
          <h3 style={{ fontFamily: 'Outfit', marginBottom: '16px' }}>Enrolled Students Directory</h3>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Standard / Grade</th>
                <th>Enrolled Program</th>
                <th>Parent ID</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td><span className="badge-status badge-warning">{s.standard}</span></td>
                  <td>
                    <span className={`badge-status ${s.program === 'Both' ? 'badge-success' : 'badge-warning'}`}>
                      {s.program}
                    </span>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{s.parent_id.substring(0, 8)}...</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Subjects & Staff Directory */}
        <div className="glass-card">
          <h3 style={{ fontFamily: 'Outfit', marginBottom: '16px' }}>Tuition Pricing Matrix</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {subjects.map(sub => (
              <div key={sub.id} style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600 }}>{sub.name}</span>
                  <span className="badge-status badge-warning">{sub.tier}</span>
                </div>
                <div style={{ color: '#10B981', fontFamily: 'monospace', fontWeight: 700 }}>
                  AED {sub.monthly_fee.toFixed(2)} / month
                </div>
              </div>
            ))}
          </div>

          <h3 style={{ fontFamily: 'Outfit', margin: '24px 0 16px' }}>Teaching Staff Directory</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {staff.map(st => (
              <div key={st.id} style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 600 }}>{st.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  Emirates ID: {st.emirates_id} | AED {st.hourly_rate}/hr
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Modals */}
      <AddStudentModal 
        isOpen={isStudentModalOpen} 
        onClose={() => setIsStudentModalOpen(false)} 
        onSuccess={() => fetchStudents()} 
      />

      <AddStaffModal 
        isOpen={isStaffModalOpen} 
        onClose={() => setIsStaffModalOpen(false)} 
        onSuccess={() => fetchStaff()} 
      />
    </div>
  );
}
