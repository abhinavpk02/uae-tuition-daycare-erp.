import React, { useEffect, useState } from 'react';
import { Clock, QrCode, CheckCircle2, UserCheck, Calculator, DollarSign, AlertCircle } from 'lucide-react';

export default function AttendanceDaycareView() {
  const [students, setStudents] = useState([]);
  const [staff, setStaff] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  
  // Scanner state
  const [scanType, setScanType] = useState('Student');
  const [selectedEntity, setSelectedEntity] = useState('');
  const [scanResult, setScanResult] = useState('');

  // Engine triggers
  const [daycareResult, setDaycareResult] = useState(null);
  const [payrollResult, setPayrollResult] = useState(null);

  const fetchLogs = () => {
    fetch('/api/attendance')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAttendanceLogs(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchLogs();

    fetch('/api/students')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setStudents(data);
          if (data.length > 0) setSelectedEntity(data[0].id);
        }
      })
      .catch(() => {});

    fetch('/api/staff')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setStaff(data);
      })
      .catch(() => {});
  }, []);

  const handleCheckIn = () => {
    if (!selectedEntity) return;
    fetch('/api/attendance/check-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ref_type: scanType, ref_id: selectedEntity })
    })
      .then(res => res.json())
      .then(data => {
        setScanResult(`Check-In recorded successfully at ${new Date(data.check_in).toLocaleTimeString()}`);
        fetchLogs();
      })
      .catch(err => setScanResult(`Error: ${err.message}`));
  };

  const handleCheckOut = (attId) => {
    fetch('/api/attendance/check-out', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attendance_id: attId })
    })
      .then(res => res.json())
      .then(data => {
        setScanResult(`Check-Out recorded successfully! Total duration calculated.`);
        fetchLogs();
      })
      .catch(err => setScanResult(`Error: ${err.message}`));
  };

  const calculateDaycareBilling = (studentId) => {
    setDaycareResult(null);
    fetch(`/api/billing-pos/daycare/calculate/${studentId}`, { method: 'POST' })
      .then(res => res.json())
      .then(data => setDaycareResult(data))
      .catch(err => alert(err.message));
  };

  const processStaffPayroll = (staffId) => {
    setPayrollResult(null);
    fetch(`/api/staff/${staffId}/process-payroll`, { method: 'POST' })
      .then(res => res.json())
      .then(data => setPayrollResult(data))
      .catch(err => alert(err.message));
  };

  return (
    <div className="view-container">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'Outfit', fontSize: '1.6rem' }}>Attendance Webhook & Daycare Billing Engine</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Real-time scanner check-in/out triggering daycare hourly calculations and staff payroll ledger entries</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        
        {/* RFID Scanner Simulator */}
        <div className="glass-card">
          <h3 style={{ fontFamily: 'Outfit', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <QrCode size={20} color="var(--accent-gold)" /> RFID / Scanner Terminal Simulator
          </h3>

          <div className="form-group">
            <label className="form-label">Entity Category</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                type="button"
                className={`btn ${scanType === 'Student' ? 'btn-emerald' : 'btn-outline'}`}
                onClick={() => {
                  setScanType('Student');
                  if (students.length > 0) setSelectedEntity(students[0].id);
                }}
              >
                Student Scanner
              </button>
              <button 
                type="button"
                className={`btn ${scanType === 'Staff' ? 'btn-emerald' : 'btn-outline'}`}
                onClick={() => {
                  setScanType('Staff');
                  if (staff.length > 0) setSelectedEntity(staff[0].id);
                }}
              >
                Staff Scanner
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Select Registered {scanType}</label>
            <select className="form-select" value={selectedEntity} onChange={e => setSelectedEntity(e.target.value)}>
              {scanType === 'Student' ? (
                students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.standard}) - {s.program}</option>)
              ) : (
                staff.map(st => <option key={st.id} value={st.id}>{st.name} (AED {st.hourly_rate}/hr)</option>)
              )}
            </select>
          </div>

          <button className="btn btn-gold" style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }} onClick={handleCheckIn}>
            <Clock size={16} /> Simulate Webhook Scan Check-In
          </button>

          {scanResult && (
            <div style={{ marginTop: '14px', padding: '10px 14px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--accent-emerald)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: '#10B981' }}>
              ✔ {scanResult}
            </div>
          )}
        </div>

        {/* Automated Engine Triggers */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 style={{ fontFamily: 'Outfit', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calculator size={20} color="var(--accent-emerald)" /> Daycare Monthly Billing Calculator
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Tallies total check-in/out hours * AED 35/hr and posts invoice + Ledger entry (Debit Accounts Rec 1100, Credit Daycare Rev 4100).
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <select className="form-select" id="daycareSelect" style={{ flex: 1 }}>
                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <button className="btn btn-emerald" onClick={() => calculateDaycareBilling(document.getElementById('daycareSelect').value)}>
                Calculate Bill
              </button>
            </div>
          </div>

          <hr style={{ borderColor: 'var(--border-color)' }} />

          <div>
            <h3 style={{ fontFamily: 'Outfit', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={20} color="var(--accent-gold)" /> Staff Payroll Engine Trigger
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Tallies monthly hours * hourly rate and posts Salary Expense 5000 / Cash 1000.
            </p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <select className="form-select" id="staffSelect" style={{ flex: 1 }}>
                {staff.map(st => <option key={st.id} value={st.id}>{st.name}</option>)}
              </select>
              <button className="btn btn-gold" onClick={() => processStaffPayroll(document.getElementById('staffSelect').value)}>
                Run Payroll
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Engine Results Modal Output */}
      {daycareResult && (
        <div className="glass-card" style={{ marginBottom: '24px', border: '1px solid var(--accent-emerald)' }}>
          <h3 style={{ fontFamily: 'Outfit', color: '#10B981', marginBottom: '12px' }}>✔ Daycare Hourly Billing Calculated!</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', fontFamily: 'monospace' }}>
            <div>Student: <strong>{daycareResult.student_name}</strong></div>
            <div>Accumulated Hours: <strong>{daycareResult.total_hours} hrs</strong></div>
            <div>Hourly Rate: <strong>AED {daycareResult.hourly_rate}/hr</strong></div>
            <div>Total Invoiced: <strong style={{ color: '#10B981' }}>AED {daycareResult.total_amount.toFixed(2)}</strong></div>
          </div>
        </div>
      )}

      {payrollResult && (
        <div className="glass-card" style={{ marginBottom: '24px', border: '1px solid var(--accent-gold)' }}>
          <h3 style={{ fontFamily: 'Outfit', color: 'var(--accent-gold)', marginBottom: '12px' }}>✔ Staff Payroll Processed!</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', fontFamily: 'monospace' }}>
            <div>Staff Member: <strong>{payrollResult.staff_name}</strong></div>
            <div>Emirates ID: <strong>{payrollResult.emirates_id}</strong></div>
            <div>Hourly Rate: <strong>AED {payrollResult.hourly_rate}/hr</strong></div>
            <div>Gross Payout: <strong style={{ color: 'var(--accent-gold)' }}>AED {payrollResult.gross_salary.toFixed(2)}</strong></div>
          </div>
        </div>
      )}

      {/* Live Attendance Logs Table */}
      <div className="glass-card">
        <h3 style={{ fontFamily: 'Outfit', marginBottom: '16px' }}>Live Check-In / Check-Out Log</h3>
        <table className="custom-table">
          <thead>
            <tr>
              <th>Ref Type</th>
              <th>Ref ID</th>
              <th>Check-In Time</th>
              <th>Check-Out Time</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {attendanceLogs.map(att => (
              <tr key={att.id}>
                <td><span className="badge-status badge-warning">{att.ref_type}</span></td>
                <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{att.ref_id.substring(0, 8)}...</td>
                <td>{new Date(att.check_in).toLocaleString()}</td>
                <td>{att.check_out ? new Date(att.check_out).toLocaleString() : <span style={{ color: 'var(--accent-gold)' }}>Active Session</span>}</td>
                <td>
                  {!att.check_out && (
                    <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => handleCheckOut(att.id)}>
                      Check Out Now
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
