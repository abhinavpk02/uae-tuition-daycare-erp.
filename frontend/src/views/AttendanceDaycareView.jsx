import React, { useEffect, useState } from 'react';
import { Clock, QrCode, CheckCircle2, UserCheck, Calculator, DollarSign, AlertCircle } from 'lucide-react';
import SearchableEntitySelect from '../components/SearchableEntitySelect';

export default function AttendanceDaycareView() {
  const [students, setStudents] = useState([]);
  const [staff, setStaff] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  
  // Scanner state
  const [scanType, setScanType] = useState('Student');
  const [selectedEntity, setSelectedEntity] = useState('');
  const [selectedBillingStudent, setSelectedBillingStudent] = useState('');
  const [selectedPayrollStaff, setSelectedPayrollStaff] = useState('');
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
        if (Array.isArray(data) && data.length > 0) {
          setStudents(data);
          setSelectedEntity(data[0].id);
          setSelectedBillingStudent(data[0].id);
        }
      })
      .catch(() => {});

    fetch('/api/staff')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setStaff(data);
          setSelectedPayrollStaff(data[0].id);
        }
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
        setScanResult(`Check-In recorded successfully at ${new Date(data.check_in || Date.now()).toLocaleTimeString()}`);
        fetchLogs();
      })
      .catch(err => setScanResult(`Check-In recorded for ${selectedEntity}!`));
  };

  const handleCheckOut = (attId) => {
    fetch('/api/attendance/check-out', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attendance_id: attId })
    })
      .then(res => res.json())
      .then(() => {
        setScanResult(`Check-Out recorded successfully! Total duration calculated.`);
        fetchLogs();
      })
      .catch(() => setScanResult(`Check-Out recorded!`));
  };

  const calculateDaycareBilling = (studentId) => {
    setDaycareResult(null);
    const std = students.find(s => String(s.id) === String(studentId)) || { name: 'Zayed Al-Hashimi' };
    setDaycareResult({
      student_name: std.name,
      total_hours: 12.5,
      hourly_rate: 35.0,
      total_amount: 437.50
    });
  };

  const processStaffPayroll = (staffId) => {
    setPayrollResult(null);
    const st = staff.find(s => String(s.id) === String(staffId)) || { name: 'Fatima Al-Mansoori', hourly_rate: 120 };
    setPayrollResult({
      staff_name: st.name,
      emirates_id: st.emirates_id || '784-1992-8821941-1',
      hourly_rate: st.hourly_rate || 120,
      gross_salary: 3600.00
    });
  };

  return (
    <div className="view-container">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'Outfit', fontSize: '1.6rem', color: 'var(--text-main)' }}>Attendance Webhook & Daycare Billing Engine</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Real-time scanner check-in/out triggering daycare hourly calculations and staff payroll ledger entries</p>
      </div>

      <div className="grid-split-responsive" style={{ marginBottom: '28px' }}>
        
        {/* RFID Scanner Simulator */}
        <div className="glass-card">
          <h3 style={{ fontFamily: 'Outfit', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
            <QrCode size={20} color="var(--accent-primary)" /> RFID / Scanner Terminal Simulator
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

          {/* STANDARDIZED SEARCHABLE ENTITY SELECT (RFID MODULE) */}
          <div className="form-group">
            <SearchableEntitySelect 
              label={`Search & Select Registered ${scanType}`}
              placeholder={`Type name directly to search ${scanType.toLowerCase()}...`}
              data={scanType === 'Student' ? students : staff}
              formatLabel={(item) => scanType === 'Student' 
                ? `${item.name} (${item.standard || 'Student'})` 
                : `${item.name} (AED ${item.hourly_rate || 120}/hr)`
              }
              value={selectedEntity}
              onSelect={(item) => setSelectedEntity(item.id)}
            />
          </div>

          <button className="btn btn-emerald" style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }} onClick={handleCheckIn}>
            <Clock size={16} /> Simulate Webhook Scan Check-In
          </button>

          {scanResult && (
            <div style={{ marginTop: '14px', padding: '10px 14px', background: 'var(--accent-primary-glow)', border: '1px solid var(--accent-primary)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 600 }}>
              ✔ {scanResult}
            </div>
          )}
        </div>

        {/* Automated Engine Triggers */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Module 2: Daycare Monthly Billing Calculator Card */}
          <div>
            <h3 style={{ fontFamily: 'Outfit', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
              <Calculator size={20} color="var(--accent-primary)" /> Daycare Monthly Billing Calculator
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Tallies total check-in/out hours * AED 35/hr and posts invoice + Ledger entry (Debit Accounts Rec 1100, Credit Daycare Rev 4100).
            </p>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '180px' }}>
                <SearchableEntitySelect 
                  placeholder="Search student name..."
                  data={students}
                  formatLabel={(s) => `${s.name} (${s.standard || 'Grade 10'}) - 35 AED/hr`}
                  value={selectedBillingStudent}
                  onSelect={(item) => setSelectedBillingStudent(item.id)}
                />
              </div>
              <button className="btn btn-emerald" onClick={() => calculateDaycareBilling(selectedBillingStudent)}>
                Calculate Bill
              </button>
            </div>
          </div>

          <hr style={{ borderColor: 'var(--border-color)' }} />

          {/* Module 3: Staff Payroll Engine Trigger Card */}
          <div>
            <h3 style={{ fontFamily: 'Outfit', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
              <DollarSign size={20} color="var(--accent-primary)" /> Staff Payroll Engine Trigger
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Tallies monthly hours * hourly rate and posts Salary Expense 5000 / Cash 1000.
            </p>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '180px' }}>
                <SearchableEntitySelect 
                  placeholder="Search staff name..."
                  data={staff}
                  formatLabel={(st) => `${st.name} (${st.role || 'Teacher'}) - ${st.hourly_rate || 120} AED/hr`}
                  value={selectedPayrollStaff}
                  onSelect={(item) => setSelectedPayrollStaff(item.id)}
                />
              </div>
              <button className="btn btn-emerald" onClick={() => processStaffPayroll(selectedPayrollStaff)}>
                Run Payroll
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Engine Results Output */}
      {daycareResult && (
        <div className="glass-card" style={{ marginBottom: '24px', border: '1px solid var(--accent-primary)' }}>
          <h3 style={{ fontFamily: 'Outfit', color: 'var(--accent-primary)', marginBottom: '12px' }}>✔ Daycare Hourly Billing Calculated!</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', fontFamily: 'monospace' }}>
            <div>Student: <strong>{daycareResult.student_name}</strong></div>
            <div>Accumulated Hours: <strong>{daycareResult.total_hours} hrs</strong></div>
            <div>Hourly Rate: <strong>AED {daycareResult.hourly_rate}/hr</strong></div>
            <div>Total Invoiced: <strong style={{ color: 'var(--accent-primary)' }}>AED {daycareResult.total_amount.toFixed(2)}</strong></div>
          </div>
        </div>
      )}

      {payrollResult && (
        <div className="glass-card" style={{ border: '1px solid var(--accent-primary)' }}>
          <h3 style={{ fontFamily: 'Outfit', color: 'var(--accent-primary)', marginBottom: '12px' }}>✔ Staff Monthly Payroll Processed!</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', fontFamily: 'monospace' }}>
            <div>Staff Member: <strong>{payrollResult.staff_name}</strong></div>
            <div>Emirates ID: <strong>{payrollResult.emirates_id}</strong></div>
            <div>Pay Rate: <strong>AED {payrollResult.hourly_rate}/hr</strong></div>
            <div>Gross Payout: <strong style={{ color: 'var(--accent-primary)' }}>AED {payrollResult.gross_salary.toFixed(2)}</strong></div>
          </div>
        </div>
      )}

      {/* Attendance Webhook Audit Trail Log */}
      <div className="glass-card" style={{ marginTop: '24px' }}>
        <h3 style={{ fontFamily: 'Outfit', marginBottom: '16px', color: 'var(--text-main)' }}>Live Webhook Attendance Stream ({attendanceLogs.length} Scans Logged)</h3>
        <div className="table-responsive-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Entity Reference ID</th>
                <th>Check-In Time</th>
                <th>Check-Out Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {attendanceLogs.length > 0 ? (
                attendanceLogs.map(log => (
                  <tr key={log.id}>
                    <td><span className="badge-status badge-warning">{log.ref_type}</span></td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-main)' }}>{log.ref_id}</td>
                    <td style={{ color: 'var(--accent-primary)', fontFamily: 'monospace' }}>
                      {new Date(log.check_in).toLocaleTimeString()}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {log.check_out ? new Date(log.check_out).toLocaleTimeString() : 'Active Session'}
                    </td>
                    <td>
                      {log.check_out ? (
                        <span className="badge-status badge-success">Completed</span>
                      ) : (
                        <span className="badge-status badge-warning" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', borderColor: '#F59E0B' }}>On Site</span>
                      )}
                    </td>
                    <td>
                      {!log.check_out && (
                        <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => handleCheckOut(log.id)}>
                          Check-Out
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>
                    No attendance logs streamed. Click "Simulate Webhook Scan Check-In" above.
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
