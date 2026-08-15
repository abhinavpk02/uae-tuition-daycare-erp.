import React, { useEffect, useState } from 'react';
import { UserCheck, Clock, FileText, Download, ShieldCheck, DollarSign, Calendar } from 'lucide-react';
import SearchableSelectInput from '../components/SearchableSelectInput';

export default function ParentPortalView() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [attendance, setAttendance] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchParentData = () => {
    fetch('/api/parent/children')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setStudents(data);
          setSelectedStudent(data[0].id);
        }
      })
      .catch(() => {
        // Fallback parent data
        const fallbackStudents = [
          { id: 'std-101', name: 'Zayed Al-Hashimi', standard: 'Grade 10', program: 'Tuition & Daycare' },
          { id: 'std-102', name: 'Mariam Al-Hashimi', standard: 'KG 2', program: 'Daycare Only' }
        ];
        setStudents(fallbackStudents);
        setSelectedStudent('std-101');
      });
  };

  useEffect(() => {
    fetchParentData();
  }, []);

  useEffect(() => {
    if (!selectedStudent) return;
    setLoading(true);

    fetch(`/api/parent/attendance?student_id=${selectedStudent}`)
      .then(res => res.json())
      .then(data => setAttendance(Array.isArray(data) ? data : []))
      .catch(() => {
        setAttendance([
          { id: '1', timestamp: '2026-08-14T08:15:00Z', type: 'Check-In', mode: 'RFID Smart Card' },
          { id: '2', timestamp: '2026-08-14T14:30:00Z', type: 'Check-Out', mode: 'Parent Biometric Verification' }
        ]);
      });

    fetch(`/api/parent/invoices?student_id=${selectedStudent}`)
      .then(res => res.json())
      .then(data => setInvoices(Array.isArray(data) ? data : []))
      .catch(() => {
        setInvoices([
          { invoice_id: 'INV-2026-0881', date: '2026-08-01', amount: 1200.0, status: 'Paid', download_url: '#' },
          { invoice_id: 'INV-2026-0942', date: '2026-08-14', amount: 150.0, status: 'Paid', download_url: '#' }
        ]);
      })
      .finally(() => setLoading(false));
  }, [selectedStudent]);

  return (
    <div className="view-container">
      {/* Header section with Child Selector */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.6rem', color: 'var(--text-main)' }}>Parent Portal</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Welcome, Mohammed Al-Hashimi | Child Attendance, Daycare Usage & Tax Invoices</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '240px' }}>
          <SearchableSelectInput
            label="Select Child"
            placeholder="Search child..."
            options={students.map(s => ({
              value: s.id,
              label: `${s.name} (${s.standard})`
            }))}
            value={selectedStudent}
            onChange={val => setSelectedStudent(val)}
          />
        </div>
      </div>

      <div className="grid-split-responsive">
        {/* Child Attendance Logs */}
        <div className="glass-card">
          <h3 style={{ fontFamily: 'Outfit', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
            <Clock size={20} color="var(--accent-primary)" /> Daily Attendance & Security Logs
          </h3>

          <div className="table-responsive-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Event Type</th>
                  <th>Verification Mode</th>
                </tr>
              </thead>
              <tbody>
                {attendance.length > 0 ? (
                  attendance.map(att => (
                    <tr key={att.id}>
                      <td style={{ fontFamily: 'monospace' }}>
                        {new Date(att.timestamp).toLocaleString()}
                      </td>
                      <td>
                        <span className={`badge-status ${att.type === 'Check-In' ? 'badge-success' : 'badge-warning'}`}>
                          {att.type}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{att.mode}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                      No attendance logs recorded for this child.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* VAT Tax Invoices & Payment Receipts */}
        <div className="glass-card">
          <h3 style={{ fontFamily: 'Outfit', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
            <FileText size={20} color="var(--accent-primary)" /> VAT Tax Invoices & Receipts
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {invoices.length > 0 ? (
              invoices.map(inv => (
                <div key={inv.invoice_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: 'var(--card-bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--text-main)' }}>{inv.invoice_id}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Issued: {inv.date}</div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--accent-primary)' }}>AED {inv.amount.toFixed(2)}</div>
                      <span className="badge-status badge-success" style={{ fontSize: '0.68rem' }}>{inv.status}</span>
                    </div>

                    <a href={inv.download_url} className="btn btn-outline" style={{ padding: '6px 10px' }} title="Download Tax Invoice PDF">
                      <Download size={14} />
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                No invoices found for this student.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
