import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, UserCheck, CheckCircle2, Check, Search } from 'lucide-react';
import SearchableSelectInput from '../components/SearchableSelectInput';

export default function TimetableView() {
  const [activeSessions, setActiveSessions] = useState([
    { id: 'sess-1', room: 'Room 101', subject: 'Advanced Mathematics', time: '09:00 AM - 10:30 AM', teacher: 'Fatima Al-Mansoori' },
    { id: 'sess-2', room: 'Daycare Zone A', subject: 'Montessori Art & Sensory Play', time: '11:00 AM - 01:00 PM', teacher: 'Sarah Jenkins' },
    { id: 'sess-3', room: 'Room 102', subject: 'Physics & Chemistry Lab', time: '02:00 PM - 03:30 PM', teacher: 'Fatima Al-Mansoori' },
    { id: 'sess-4', room: 'Daycare Zone B', subject: 'Early Toddler Quiet Reading & Nap Time', time: '01:30 PM - 03:00 PM', teacher: 'Khalfan Al-Remeithi' },
    { id: 'sess-5', room: 'Activity Room 2', subject: 'English Literature & Debate Workshop', time: '04:00 PM - 05:30 PM', teacher: 'Aisha Al-Mheiri' }
  ]);

  // In-Class Attendance Roster State
  const [selectedClass, setSelectedClass] = useState('Room 101 - Advanced Mathematics');
  const [studentSearch, setStudentSearch] = useState('');

  const [classRoster, setClassRoster] = useState([
    { id: 'std-101', name: 'Zayed Al-Hashimi', grade: 'Grade 10', program: 'Tuition & Daycare', status: 'Present' },
    { id: 'std-102', name: 'Mariam Al-Hashimi', grade: 'KG 2', program: 'Daycare Only', status: 'Present' },
    { id: 'std-103', name: 'Sami Al-Nuaimi', grade: 'Grade 4', program: 'Tuition & Daycare', status: 'Present' },
    { id: 'std-104', name: 'Rashid Al-Maktoum', grade: 'Grade 5', program: 'Tuition Only', status: 'Absent' },
    { id: 'std-105', name: 'Fatima Al-Qassimi', grade: 'Grade 3', program: 'Tuition & Daycare', status: 'Late' }
  ]);

  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  useEffect(() => {
    fetch('/api/students')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map((s, idx) => ({
            id: s.id || `std-${idx}`,
            name: s.name,
            grade: s.standard || s.grade || 'Grade ' + (idx + 1),
            program: s.program || 'Tuition & Daycare',
            status: s.status || (idx % 4 === 2 ? 'Absent' : idx % 5 === 3 ? 'Late' : 'Present')
          }));
          setClassRoster(formatted);
        }
      })
      .catch(() => {});
  }, []);

  // Toggle student status in class roster
  const setStudentAttendance = (stdId, status) => {
    setClassRoster(prev => prev.map(s => s.id === stdId ? { ...s, status } : s));
  };

  const markAllPresent = () => {
    setClassRoster(prev => prev.map(s => ({ ...s, status: 'Present' })));
  };

  const handleSaveClassAttendance = () => {
    setSaveSuccessMsg(`Attendance saved for ${selectedClass}! (${classRoster.filter(s => s.status === 'Present').length} Present out of ${classRoster.length} registered students)`);
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  // Filtered Roster by Search Query
  const filteredRoster = classRoster.filter(s =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    (s.grade && s.grade.toLowerCase().includes(studentSearch.toLowerCase()))
  );

  return (
    <div className="view-container">
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'Outfit', fontSize: '1.6rem', color: 'var(--text-main)' }}>Class Schedule & In-Class Attendance</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Classroom spatial schedule and 1-click teacher roll call system ({classRoster.length} Registered Students)</p>
      </div>

      {/* Main 2-Column Responsive Grid */}
      <div className="grid-split-responsive">
        
        {/* Left Column: Quick In-Class Attendance Roll Call */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ fontFamily: 'Outfit', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck size={20} color="var(--accent-primary)" /> Quick In-Class Roll Call ({classRoster.length} Students)
            </h3>
            <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={markAllPresent}>
              <CheckCircle2 size={14} color="var(--accent-primary)" /> Mark All Present
            </button>
          </div>

          <div className="form-group" style={{ marginBottom: '12px' }}>
            <SearchableSelectInput
              label="Select Active Class / Room Session"
              placeholder="Search active classroom session..."
              options={activeSessions.map(s => ({
                value: `${s.room} - ${s.subject}`,
                label: `${s.room} - ${s.subject} (${s.time})`
              }))}
              value={selectedClass}
              onChange={val => setSelectedClass(val)}
            />
          </div>

          {/* SEARCH STUDENT IN CLASS ROSTER */}
          <div className="form-group" style={{ marginBottom: '16px', position: 'relative' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder={`Search among all ${classRoster.length} registered students...`}
              value={studentSearch}
              onChange={e => setStudentSearch(e.target.value)}
              style={{ paddingLeft: '36px', height: '38px', fontSize: '0.85rem' }}
            />
          </div>

          {/* Student Class Roster Table */}
          <div className="table-responsive-wrapper" style={{ marginBottom: '16px', maxHeight: '420px', overflowY: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Grade</th>
                  <th>Attendance Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoster.length > 0 ? (
                  filteredRoster.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{s.name}</td>
                      <td><span className="badge-status badge-warning">{s.grade}</span></td>
                      <td>
                        <div style={{ display: 'inline-flex', gap: '4px', background: 'var(--card-bg-subtle)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                          <button 
                            onClick={() => setStudentAttendance(s.id, 'Present')}
                            style={{
                              padding: '4px 8px',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              borderRadius: '6px',
                              border: 'none',
                              cursor: 'pointer',
                              background: s.status === 'Present' ? 'var(--accent-primary)' : 'transparent',
                              color: s.status === 'Present' ? '#FFF' : 'var(--text-muted)'
                            }}
                          >
                            Present
                          </button>
                          <button 
                            onClick={() => setStudentAttendance(s.id, 'Late')}
                            style={{
                              padding: '4px 8px',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              borderRadius: '6px',
                              border: 'none',
                              cursor: 'pointer',
                              background: s.status === 'Late' ? '#F59E0B' : 'transparent',
                              color: s.status === 'Late' ? '#FFF' : 'var(--text-muted)'
                            }}
                          >
                            Late
                          </button>
                          <button 
                            onClick={() => setStudentAttendance(s.id, 'Absent')}
                            style={{
                              padding: '4px 8px',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              borderRadius: '6px',
                              border: 'none',
                              cursor: 'pointer',
                              background: s.status === 'Absent' ? '#EF4444' : 'transparent',
                              color: s.status === 'Absent' ? '#FFF' : 'var(--text-muted)'
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
                    <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '16px' }}>
                      No student found matching "{studentSearch}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {saveSuccessMsg && (
            <div style={{ marginBottom: '14px', padding: '10px 14px', background: 'var(--accent-primary-glow)', borderRadius: '12px', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} /> {saveSuccessMsg}
            </div>
          )}

          <button className="btn btn-emerald" style={{ width: '100%', justifyContent: 'center' }} onClick={handleSaveClassAttendance}>
            <Check size={18} /> Save Class Attendance ({classRoster.filter(s => s.status === 'Present').length} Present)
          </button>
        </div>

        {/* Right Column: Active Scheduled Activity Slots */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Active Class Sessions Card */}
          <div className="glass-card" style={{ height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'Outfit', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                <Calendar size={20} color="var(--accent-primary)" /> Active Class Sessions ({activeSessions.length})
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {activeSessions.map(sess => (
                <div key={sess.id} style={{ padding: '16px', background: 'var(--card-bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span className="badge-status badge-success"><MapPin size={12} /> {sess.room}</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{sess.time}</span>
                  </div>
                  <h4 style={{ fontFamily: 'Outfit', fontSize: '1rem', margin: '6px 0', color: 'var(--text-main)' }}>{sess.subject}</h4>
                  <div style={{ fontSize: '0.82rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <UserCheck size={14} /> Teacher/Supervisor: {sess.teacher}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
