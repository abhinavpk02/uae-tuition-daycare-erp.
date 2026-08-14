import React, { useEffect, useState } from 'react';
import { UserCheck, BookOpen, Plus, ShieldAlert } from 'lucide-react';

export default function StudentsView() {
  const [students, setStudents] = useState([]);
  const [staff, setStaff] = useState([]);
  const [subjects, setSubjects] = useState([
    { id: '1', name: 'Advanced Mathematics', tier: 'HSS', monthly_fee: 1200 },
    { id: '2', name: 'Physics & Chemistry Lab', tier: 'HS', monthly_fee: 950 },
    { id: '3', name: 'English Literature', tier: 'HS', monthly_fee: 800 }
  ]);

  useEffect(() => {
    fetch('/api/students')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setStudents(data);
      })
      .catch(() => {});

    fetch('/api/staff')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setStaff(data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="view-container">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'Outfit', fontSize: '1.6rem' }}>Academic & Student Directory</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Registered students, daycare enrollment programs, and teaching staff</p>
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

        {/* Subjects Matrix */}
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
    </div>
  );
}
