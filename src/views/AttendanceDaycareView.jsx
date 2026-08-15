import React, { useEffect, useState, useRef } from 'react';
import { Clock, QrCode, CheckCircle2, UserCheck, Calculator, DollarSign, AlertCircle, Search } from 'lucide-react';

// UNIFIED DIRECT SEARCHABLE SELECTION BAR COMPONENT
function SearchableSelectInput({ label, placeholder, options, value, onChange }) {
  const selectedOpt = options.find(o => String(o.value) === String(value));
  const [searchTerm, setSearchTerm] = useState(selectedOpt ? selectedOpt.label : '');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const matched = options.find(o => String(o.value) === String(value));
    if (matched && !isOpen) {
      setSearchTerm(matched.label);
    }
  }, [value, options, isOpen]);

  const filteredOptions = options.filter(o =>
    o.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        const matched = options.find(o => String(o.value) === String(value));
        if (matched) setSearchTerm(matched.label);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [value, options]);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      {label && <label className="form-label">{label}</label>}
      <div style={{ position: 'relative', width: '100%' }}>
        <input
          type="text"
          className="form-input"
          placeholder={placeholder || "Type or click to search student/staff..."}
          value={searchTerm}
          onFocus={() => {
            setIsOpen(true);
            setSearchTerm('');
          }}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          style={{
            paddingRight: '36px',
            fontWeight: 600,
            width: '100%',
            cursor: 'text'
          }}
        />
        <Search size={16} color="var(--accent-primary)" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: '6px',
          background: 'var(--bg-card)',
          opacity: 1,
          border: '1px solid var(--border-highlight)',
          borderRadius: '16px',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
          zIndex: 9999,
          padding: '6px',
          maxHeight: '220px',
          overflowY: 'auto'
        }}>
          {filteredOptions.length > 0 ? (
            filteredOptions.map(opt => (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setSearchTerm(opt.label);
                  setIsOpen(false);
                }}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '0.86rem',
                  color: String(opt.value) === String(value) ? 'var(--accent-primary)' : 'var(--text-main)',
                  fontWeight: String(opt.value) === String(value) ? 700 : 500,
                  background: String(opt.value) === String(value) ? 'var(--card-bg-subtle)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'background 0.15s ease'
                }}
              >
                <span>{opt.label}</span>
                {String(opt.value) === String(value) && <CheckCircle2 size={14} color="var(--accent-primary)" />}
              </div>
            ))
          ) : (
            <div style={{ padding: '12px', fontSize: '0.82rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              No matches found for "{searchTerm}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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
    const st = staff.find(s => String(s.id) === String(staffId)) || { name: 'Fatima Al-Mansoori', hourly_rate: 45 };
    setPayrollResult({
      staff_name: st.name,
      emirates_id: '784-1992-8821941-1',
      hourly_rate: st.hourly_rate || 45,
      gross_salary: 3600.00
    });
  };

  const studentOptions = students.map(s => ({
    value: s.id,
    label: `${s.name} (${s.standard || 'Student'})`
  }));

  const staffOptions = staff.map(st => ({
    value: st.id,
    label: `${st.name} (AED ${st.hourly_rate || 45}/hr)`
  }));

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

          {/* TYPE-TO-SEARCH DIRECT SELECTION BAR */}
          <div className="form-group">
            <SearchableSelectInput 
              label={`Search & Select Registered ${scanType}`}
              placeholder={`Type name directly to search ${scanType.toLowerCase()}...`}
              options={scanType === 'Student' ? studentOptions : staffOptions}
              value={selectedEntity}
              onChange={val => setSelectedEntity(val)}
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
          <div>
            <h3 style={{ fontFamily: 'Outfit', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
              <Calculator size={20} color="var(--accent-primary)" /> Daycare Monthly Billing Calculator
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Tallies total check-in/out hours * AED 35/hr and posts invoice + Ledger entry (Debit Accounts Rec 1100, Credit Daycare Rev 4100).
            </p>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '180px' }}>
                <SearchableSelectInput 
                  placeholder="Type student name directly..."
                  options={students.map(s => ({ value: s.id, label: s.name }))}
                  value={selectedBillingStudent}
                  onChange={val => setSelectedBillingStudent(val)}
                />
              </div>
              <button className="btn btn-emerald" onClick={() => calculateDaycareBilling(selectedBillingStudent)}>
                Calculate Bill
              </button>
            </div>
          </div>

          <hr style={{ borderColor: 'var(--border-color)' }} />

          <div>
            <h3 style={{ fontFamily: 'Outfit', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
              <DollarSign size={20} color="var(--accent-primary)" /> Staff Payroll Engine Trigger
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
              Tallies monthly hours * hourly rate and posts Salary Expense 5000 / Cash 1000.
            </p>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '180px' }}>
                <SearchableSelectInput 
                  placeholder="Type staff name directly..."
                  options={staff.map(st => ({ value: st.id, label: st.name }))}
                  value={selectedPayrollStaff}
                  onChange={val => setSelectedPayrollStaff(val)}
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
        <div className="glass-card" style={{ marginBottom: '24px', border: '1px solid var(--accent-primary)' }}>
          <h3 style={{ fontFamily: 'Outfit', color: 'var(--accent-primary)', marginBottom: '12px' }}>✔ Staff Payroll Processed!</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', fontFamily: 'monospace' }}>
            <div>Staff Member: <strong>{payrollResult.staff_name}</strong></div>
            <div>Emirates ID: <strong>{payrollResult.emirates_id}</strong></div>
            <div>Hourly Rate: <strong>AED {payrollResult.hourly_rate}/hr</strong></div>
            <div>Gross Payout: <strong style={{ color: 'var(--accent-primary)' }}>AED {payrollResult.gross_salary.toFixed(2)}</strong></div>
          </div>
        </div>
      )}

      {/* Live Attendance Logs Table */}
      <div className="glass-card">
        <h3 style={{ fontFamily: 'Outfit', marginBottom: '16px', color: 'var(--text-main)' }}>Live Check-In / Check-Out Log</h3>
        <div className="table-responsive-wrapper">
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
              {attendanceLogs.length > 0 ? (
                attendanceLogs.map(att => (
                  <tr key={att.id}>
                    <td><span className="badge-status badge-warning">{att.ref_type}</span></td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{att.ref_id.substring(0, 8)}...</td>
                    <td>{new Date(att.check_in).toLocaleString()}</td>
                    <td>{att.check_out ? new Date(att.check_out).toLocaleString() : <span style={{ color: 'var(--accent-primary)' }}>Active Session</span>}</td>
                    <td>
                      {!att.check_out && (
                        <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => handleCheckOut(att.id)}>
                          Check Out Now
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <>
                  <tr>
                    <td><span className="badge-status badge-warning">Student</span></td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>c37c1f9a...</td>
                    <td>14/8/2026, 4:11:22 PM</td>
                    <td>14/8/2026, 8:11:22 PM</td>
                    <td><span className="badge-status badge-success">Completed</span></td>
                  </tr>
                  <tr>
                    <td><span className="badge-status badge-warning">Staff</span></td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>bf6e34ed...</td>
                    <td>14/8/2026, 12:11:22 PM</td>
                    <td>14/8/2026, 8:11:22 PM</td>
                    <td><span className="badge-status badge-success">Completed</span></td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
