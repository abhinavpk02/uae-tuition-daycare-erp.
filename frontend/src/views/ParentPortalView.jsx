import React, { useEffect, useState } from 'react';
import { UserCheck, Clock, FileText, Download, ShieldCheck, DollarSign, Calendar } from 'lucide-react';

export default function ParentPortalView() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [attendance, setAttendance] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/students')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setStudents(data);
          setSelectedStudent(data[0].id);
        }
      })
      .catch(() => {});

    fetch('/api/attendance')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAttendance(data);
      })
      .catch(() => {});
  }, []);

  const currentChild = students.find(s => s.id === selectedStudent);
  const childLogs = attendance.filter(a => a.ref_id === selectedStudent);

  const downloadPdf = (invId) => {
    window.open(`/api/billing-pos/invoices/${invId}/pdf`, '_blank');
  };

  return (
    <div className="view-container">
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.6rem' }}>Parent Portal</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Welcome, Mohammed Al-Hashimi | Child Attendance, Daycare Usage & Tax Invoices</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Select Child:</label>
          <select 
            className="form-select" 
            style={{ width: '220px', background: '#0F172A', border: '1px solid var(--accent-emerald)', color: '#FFF', fontWeight: 600 }}
            value={selectedStudent}
            onChange={e => setSelectedStudent(e.target.value)}
          >
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.standard})</option>
            ))}
          </select>
        </div>
      </div>

      {currentChild && (
        <>
          {/* Child KPI Summary */}
          <div className="grid-stats" style={{ marginBottom: '24px' }}>
            <div className="glass-card stat-card">
              <div className="stat-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
                <UserCheck size={26} />
              </div>
              <div>
                <div className="stat-value">{currentChild.name}</div>
                <div className="stat-label">Grade: {currentChild.standard} | Program: {currentChild.program}</div>
              </div>
            </div>

            <div className="glass-card stat-card">
              <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' }}>
                <Clock size={26} />
              </div>
              <div>
                <div className="stat-value">{childLogs.length} Sessions</div>
                <div className="stat-label">Daycare / Class Attendance Logs</div>
              </div>
            </div>

            <div className="glass-card stat-card">
              <div className="stat-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6' }}>
                <ShieldCheck size={26} />
              </div>
              <div>
                <div className="stat-value" style={{ fontSize: '1.2rem', color: '#10B981' }}>VERIFIED PARENT</div>
                <div className="stat-label">Account Security Status</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Child Attendance Logs */}
            <div className="glass-card">
              <h3 style={{ fontFamily: 'Outfit', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={20} color="var(--accent-gold)" /> {currentChild.name}'s Attendance Log
              </h3>

              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Check-In Time</th>
                    <th>Check-Out Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {childLogs.length > 0 ? (
                    childLogs.map(att => (
                      <tr key={att.id}>
                        <td>{new Date(att.check_in).toLocaleString()}</td>
                        <td>{att.check_out ? new Date(att.check_out).toLocaleString() : 'In Progress'}</td>
                        <td>
                          <span className={`badge-status ${att.check_out ? 'badge-success' : 'badge-warning'}`}>
                            {att.check_out ? 'Completed' : 'Active On-Site'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No attendance logs recorded today.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Invoices & PDF Download Section */}
            <div className="glass-card">
              <h3 style={{ fontFamily: 'Outfit', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} color="var(--accent-emerald)" /> Tax Invoices & Statements
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Daycare & Tuition Monthly Invoice</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Invoice ID: INV-DAYCARE-2026</div>
                    <div style={{ color: '#10B981', fontFamily: 'monospace', fontWeight: 700, marginTop: '4px' }}>AED 140.00 | Status: Issued</div>
                  </div>
                  <button className="btn btn-emerald" style={{ padding: '8px 14px', fontSize: '0.8rem' }} onClick={() => downloadPdf('aeb81ae6-f52c-425f-873f-5f9d2dad92c7')}>
                    <Download size={14} /> PDF Invoice
                  </button>
                </div>

                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Tuition Fee - Advanced Mathematics</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Invoice ID: INV-TUITION-1001</div>
                    <div style={{ color: '#10B981', fontFamily: 'monospace', fontWeight 700, marginTop: '4px' }}>AED 1,200.00 | Status: Paid</div>
                  </div>
                  <button className="btn btn-outline" style={{ padding: '8px 14px', fontSize: '0.8rem' }} onClick={() => downloadPdf('aeb81ae6-f52c-425f-873f-5f9d2dad92c7')}>
                    <Download size={14} /> PDF Receipt
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
