import React, { useEffect, useState } from 'react';
import { Calendar, Plus, Clock, MapPin, UserCheck, BookOpen, CheckCircle2, Users, Check, X, AlertTriangle, Search } from 'lucide-react';

export default function TimetableView() {
  const [activeSessions, setActiveSessions] = useState([
    { id: 'sess-1', room: 'Room 101', subject: 'Advanced Mathematics', time: '09:00 AM - 10:30 AM', teacher: 'Fatima Al-Mansoori' },
    { id: 'sess-2', room: 'Daycare Zone A', subject: 'Montessori Art & Sensory Play', time: '11:00 AM - 01:00 PM', teacher: 'Sarah Jenkins' },
    { id: 'sess-3', room: 'Room 102', subject: 'Physics & Chemistry Lab', time: '02:00 PM - 03:30 PM', teacher: 'Fatima Al-Mansoori' }
  ]);

  const [staff, setStaff] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State for new slot
  const [roomId, setRoomId] = useState('Room 101');
  const [subjectId, setSubjectId] = useState('');
  const [teacherName, setTeacherName] = useState('Fatima Al-Mansoori');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('10:30 AM');

  // In-Class Attendance Roster State
  const [selectedClass, setSelectedClass] = useState('Room 101 - Advanced Mathematics');
  const [studentSearch, setStudentSearch] = useState('');

  const [classRoster, setClassRoster] = useState([
    { id: 'std-101', name: 'Sami Al-Hashimi', grade: 'Grade 4', program: 'Tuition & Daycare', status: 'Present' },
    { id: 'std-102', name: 'Mariam Bin Zayed', grade: 'Grade 2', program: 'Daycare Only', status: 'Present' },
    { id: 'std-103', name: 'Rashid Al-Maktoum', grade: 'Grade 5', program: 'Tuition Only', status: 'Absent' },
    { id: 'std-104', name: 'Fatima Al-Nuaimi', grade: 'Grade 3', program: 'Tuition & Daycare', status: 'Late' },
  ]);

  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  useEffect(() => {
    fetch('/api/staff')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setStaff(data);
      })
      .catch(() => {});
  }, []);

  const handleCreateSlot = (e) => {
    e.preventDefault();
    if (!subjectId.trim()) return;

    const newSess = {
      id: `sess-${Date.now()}`,
      room: roomId,
      subject: subjectId,
      time: `${startTime} - ${endTime}`,
      teacher: teacherName
    };

    setActiveSessions(prev => [newSess, ...prev]);
    setSubjectId('');
    setShowAddModal(false);
    setSaveSuccessMsg(`New Class Session "${subjectId}" allocated successfully!`);
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  // Toggle student status in class roster
  const setStudentAttendance = (stdId, status) => {
    setClassRoster(prev => prev.map(s => s.id === stdId ? { ...s, status } : s));
  };

  const markAllPresent = () => {
    setClassRoster(prev => prev.map(s => ({ ...s, status: 'Present' })));
  };

  const handleSaveClassAttendance = () => {
    setSaveSuccessMsg(`Attendance saved for ${selectedClass}! (${classRoster.filter(s => s.status === 'Present').length} Present)`);
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  // Filtered Roster by Search Query
  const filteredRoster = classRoster.filter(s =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.grade.toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <div className="view-container">
      {/* Header with Prominent Add Session Button */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.6rem', color: 'var(--text-main)' }}>Class Schedule & In-Class Attendance</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Classroom spatial schedule and 1-click teacher roll call system</p>
        </div>

        {/* PROMINENT ADD NEW CLASS SESSION ACTION BUTTON */}
        <button className="btn btn-emerald" onClick={() => setShowAddModal(true)} style={{ padding: '10px 20px' }}>
          <Plus size={18} /> Add New Class Session
        </button>
      </div>

      {/* ADD NEW CLASS SESSION MODAL DIALOG */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', background: 'var(--bg-card)', border: '1px solid var(--accent-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontFamily: 'Outfit', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={20} color="var(--accent-primary)" /> Allocate New Class Session
              </h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSlot}>
              <div className="form-group">
                <label className="form-label">Subject / Session Name</label>
                <input 
                  className="form-input" 
                  placeholder="e.g. Advanced Biology Lab / Montessori Art" 
                  value={subjectId} 
                  onChange={e => setSubjectId(e.target.value)} 
                  required 
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label className="form-label">Room / Daycare Zone</label>
                <select className="form-select" value={roomId} onChange={e => setRoomId(e.target.value)}>
                  <option value="Room 101">Room 101 (HSS Math/Sci)</option>
                  <option value="Room 102">Room 102 (HS English/Arts)</option>
                  <option value="Daycare Zone A">Daycare Zone A (Toddlers Sensory)</option>
                  <option value="Daycare Zone B">Daycare Zone B (KG Active Play)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Teacher / Supervisor</label>
                <select className="form-select" value={teacherName} onChange={e => setTeacherName(e.target.value)}>
                  <option value="Fatima Al-Mansoori">Fatima Al-Mansoori</option>
                  <option value="Sarah Jenkins">Sarah Jenkins</option>
                  {staff.map(st => <option key={st.id} value={st.name}>{st.name}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <input className="form-input" value={startTime} onChange={e => setStartTime(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <input className="form-input" value={endTime} onChange={e => setEndTime(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-emerald" style={{ flex: 1, justifyContent: 'center' }}>
                  <Plus size={16} /> Save Class Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main 2-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Left Column: Quick In-Class Attendance Roll Call */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ fontFamily: 'Outfit', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck size={20} color="var(--accent-primary)" /> Quick In-Class Roll Call
            </h3>
            <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={markAllPresent}>
              <CheckCircle2 size={14} color="var(--accent-primary)" /> Mark All Present
            </button>
          </div>

          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label className="form-label">Select Active Class / Room Session</label>
            <select className="form-select" value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
              {activeSessions.map(s => (
                <option key={s.id} value={`${s.room} - ${s.subject}`}>
                  {s.room} - {s.subject} ({s.time})
                </option>
              ))}
            </select>
          </div>

          {/* SEARCH STUDENT IN CLASS ROSTER */}
          <div className="form-group" style={{ marginBottom: '16px', position: 'relative' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search student by name in roster..." 
              value={studentSearch}
              onChange={e => setStudentSearch(e.target.value)}
              style={{ paddingLeft: '36px', height: '38px', fontSize: '0.85rem' }}
            />
          </div>

          {/* Student Class Roster Table */}
          <div className="table-responsive-wrapper" style={{ marginBottom: '16px' }}>
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
            <Check size={18} /> Save Class Attendance
          </button>
        </div>

        {/* Right Column: Active Scheduled Activity Slots & Quick Add Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Active Class Sessions Card */}
          <div className="glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'Outfit', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                <Calendar size={20} color="var(--accent-primary)" /> Active Class Sessions
              </h3>
              <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => setShowAddModal(true)}>
                <Plus size={14} /> Add Session
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {activeSessions.map(sess => (
                <div key={sess.id} style={{ padding: '14px', background: 'var(--card-bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
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

          {/* Quick Class Session Allocation Card */}
          <div className="glass-card">
            <h3 style={{ fontFamily: 'Outfit', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
              <Clock size={20} color="var(--accent-primary)" /> Allocate Class Session
            </h3>

            <form onSubmit={handleCreateSlot}>
              <div className="form-group">
                <label className="form-label">Subject / Activity Name</label>
                <input className="form-input" placeholder="e.g. Advanced Chemistry Lab" value={subjectId} onChange={e => setSubjectId(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Room / Daycare Zone</label>
                <select className="form-select" value={roomId} onChange={e => setRoomId(e.target.value)}>
                  <option value="Room 101">Room 101 (HSS Math/Sci)</option>
                  <option value="Room 102">Room 102 (HS English/Arts)</option>
                  <option value="Daycare Zone A">Daycare Zone A (Toddlers)</option>
                  <option value="Daycare Zone B">Daycare Zone B (KG Active Play)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Teacher / Supervisor</label>
                <select className="form-select" value={teacherName} onChange={e => setTeacherName(e.target.value)}>
                  <option value="Fatima Al-Mansoori">Fatima Al-Mansoori</option>
                  <option value="Sarah Jenkins">Sarah Jenkins</option>
                  {staff.map(st => <option key={st.id} value={st.name}>{st.name}</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <input className="form-input" value={startTime} onChange={e => setStartTime(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <input className="form-input" value={endTime} onChange={e => setEndTime(e.target.value)} required />
                </div>
              </div>

              <button type="submit" className="btn btn-emerald" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}>
                <Plus size={16} /> Save Class Session
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
