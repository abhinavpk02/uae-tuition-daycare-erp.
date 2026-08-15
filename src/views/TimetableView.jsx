import React, { useEffect, useState } from 'react';
import { Calendar, MapPin, UserCheck, CheckCircle2, Check, Search, Plus, UserPlus, X, BookOpen, Clock, Trash2 } from 'lucide-react';
import SearchableSelectInput from '../components/SearchableSelectInput';
import { addToTrashBin } from '../utils/trashBin';
import { BASE_URL } from '../api';

export default function TimetableView() {
  const [activeSessions, setActiveSessions] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [allStaff, setAllStaff] = useState([]);

  const [selectedClassId, setSelectedClassId] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [classRoster, setClassRoster] = useState([]);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Modal 1: Create New Class Schedule (By Existing Student)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newTeacher, setNewTeacher] = useState('');
  const [newRoom, setNewRoom] = useState('Room 101');
  const [newTime, setNewTime] = useState('09:00 AM - 10:30 AM');
  const [selectedStudentId, setSelectedStudentId] = useState('');

  // Modal 2: Add Student to Active Class
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [targetClassSession, setTargetClassSession] = useState(null);
  const [studentToEnroll, setStudentToEnroll] = useState('');

  const defaultClasses = [
    {
      id: 'cls-101',
      subject: 'Grade 10 Advanced Mathematics',
      teacher: 'Fatima Al-Mansoori',
      room: 'Room 101 (Secondary Wing)',
      time: 'Mon & Wed 09:00 AM - 10:30 AM',
      enrolled_students: [
        { id: 'std-101', name: 'Zayed Al-Hashimi', grade: 'Grade 10', status: 'Present' }
      ]
    },
    {
      id: 'cls-102',
      subject: 'Daycare Creative Craft & Activity',
      teacher: 'Fatima Al-Mansoori',
      room: 'Activity Hall A (Daycare Wing)',
      time: 'Daily 11:00 AM - 01:00 PM',
      enrolled_students: []
    }
  ];

  // Fetch registered students & staff from API & localStorage
  const loadData = () => {
    fetch(`${BASE_URL}/api/students`)
      .then(res => res.json())
      .then(data => {
        const remoteStd = Array.isArray(data) ? data : [];
        const localStd = JSON.parse(localStorage.getItem('registered_students') || '[]');
        const merged = [...localStd];

        remoteStd.forEach(r => {
          if (!merged.some(m => String(m.id) === String(r.id))) {
            merged.push({ id: r.id, name: r.name, grade: r.standard || 'Grade 10' });
          }
        });

        if (merged.length === 0) {
          merged.push({ id: 'std-101', name: 'Zayed Al-Hashimi', grade: 'Grade 10' });
        }
        setAllStudents(merged);
      })
      .catch(() => {
        const localStd = JSON.parse(localStorage.getItem('registered_students') || '[]');
        setAllStudents(localStd.length > 0 ? localStd : [{ id: 'std-101', name: 'Zayed Al-Hashimi', grade: 'Grade 10' }]);
      });

    fetch(`${BASE_URL}/api/staff`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setAllStaff(data);
        else {
          const localStf = JSON.parse(localStorage.getItem('registered_staff') || '[]');
          setAllStaff(localStf.length > 0 ? localStf : [{ id: 'stf-201', name: 'Fatima Al-Mansoori' }]);
        }
      })
      .catch(() => {
        const localStf = JSON.parse(localStorage.getItem('registered_staff') || '[]');
        setAllStaff(localStf.length > 0 ? localStf : [{ id: 'stf-201', name: 'Fatima Al-Mansoori' }]);
      });

    // Load Class Sessions
    const localSchedules = JSON.parse(localStorage.getItem('registered_class_schedules') || '[]');
    if (localSchedules.length > 0) {
      setActiveSessions(localSchedules);
      if (localSchedules[0]) {
        setSelectedClassId(localSchedules[0].id);
        setClassRoster(localSchedules[0].enrolled_students || []);
      }
    } else {
      setActiveSessions(defaultClasses);
      setSelectedClassId(defaultClasses[0].id);
      setClassRoster(defaultClasses[0].enrolled_students || []);
      localStorage.setItem('registered_class_schedules', JSON.stringify(defaultClasses));
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('registered_data_updated', loadData);
    return () => {
      window.removeEventListener('registered_data_updated', loadData);
    };
  }, []);

  // Delete active class session -> Routes to Common Trash
  const handleDeleteClassSession = (classId, e) => {
    if (e) e.stopPropagation();
    const target = activeSessions.find(c => String(c.id) === String(classId));
    const title = target ? target.subject : 'class session';

    if (!window.confirm(`Move "${title}" to Common Trash?`)) {
      return;
    }

    if (target) {
      addToTrashBin(target, 'Classes', target.subject);
    }

    const updatedSessions = activeSessions.filter(c => String(c.id) !== String(classId));
    setActiveSessions(updatedSessions);
    localStorage.setItem('registered_class_schedules', JSON.stringify(updatedSessions));

    if (String(selectedClassId) === String(classId)) {
      if (updatedSessions.length > 0) {
        setSelectedClassId(updatedSessions[0].id);
        setClassRoster(updatedSessions[0].enrolled_students || []);
      } else {
        setSelectedClassId('');
        setClassRoster([]);
      }
    }
  };

  // Handle active class selection change
  const handleSelectClass = (classId) => {
    setSelectedClassId(classId);
    const found = activeSessions.find(c => String(c.id) === String(classId));
    if (found) {
      setClassRoster(found.enrolled_students || []);
    }
  };

  // Create new class schedule featuring existing student assignment
  const handleCreateClassSubmit = (e) => {
    e.preventDefault();
    if (!newSubject.trim()) return;

    const assignedStdObj = allStudents.find(s => String(s.id) === String(selectedStudentId));
    const initialEnrolled = assignedStdObj ? [{
      id: assignedStdObj.id,
      name: assignedStdObj.name,
      grade: assignedStdObj.grade || assignedStdObj.standard || 'Grade 10',
      status: 'Present'
    }] : [];

    const teacherName = newTeacher || (allStaff[0] ? allStaff[0].name : 'Fatima Al-Mansoori');

    const newClassObj = {
      id: `cls-${Date.now()}`,
      subject: newSubject.trim(),
      teacher: teacherName,
      room: newRoom,
      time: newTime,
      enrolled_students: initialEnrolled
    };

    const updatedSessions = [newClassObj, ...activeSessions];
    setActiveSessions(updatedSessions);
    setSelectedClassId(newClassObj.id);
    setClassRoster(initialEnrolled);

    localStorage.setItem('registered_class_schedules', JSON.stringify(updatedSessions));

    fetch(`${BASE_URL}/api/timetable`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject_name: newSubject.trim(),
        room: newRoom,
        time_slot: newTime
      })
    }).catch(() => {});

    setSaveSuccessMsg(`Class "${newSubject}" created successfully with assigned student!`);
    setNewSubject('');
    setSelectedStudentId('');
    setTimeout(() => {
      setSaveSuccessMsg('');
      setShowCreateModal(false);
    }, 1500);
  };

  // Add existing student directly to an active class
  const handleEnrollStudentSubmit = (e) => {
    e.preventDefault();
    if (!targetClassSession || !studentToEnroll) return;

    const stdObj = allStudents.find(s => String(s.id) === String(studentToEnroll));
    if (!stdObj) return;

    const updatedSessions = activeSessions.map(sess => {
      if (String(sess.id) === String(targetClassSession.id)) {
        const currentEnrolled = sess.enrolled_students || [];
        if (currentEnrolled.some(e => String(e.id) === String(stdObj.id))) {
          return sess;
        }
        return {
          ...sess,
          enrolled_students: [
            ...currentEnrolled,
            {
              id: stdObj.id,
              name: stdObj.name,
              grade: stdObj.grade || stdObj.standard || 'Grade 10',
              status: 'Present'
            }
          ]
        };
      }
      return sess;
    });

    setActiveSessions(updatedSessions);
    localStorage.setItem('registered_class_schedules', JSON.stringify(updatedSessions));

    const updatedCurrent = updatedSessions.find(c => String(c.id) === String(selectedClassId));
    if (updatedCurrent) {
      setClassRoster(updatedCurrent.enrolled_students || []);
    }

    setSaveSuccessMsg(`Added ${stdObj.name} to "${targetClassSession.subject}"!`);
    setStudentToEnroll('');
    setTimeout(() => {
      setSaveSuccessMsg('');
      setShowEnrollModal(false);
    }, 1500);
  };

  const setStudentAttendance = (stdId, status) => {
    const updatedRoster = classRoster.map(s => s.id === stdId ? { ...s, status } : s);
    setClassRoster(updatedRoster);

    const updatedSessions = activeSessions.map(sess => {
      if (String(sess.id) === String(selectedClassId)) {
        return { ...sess, enrolled_students: updatedRoster };
      }
      return sess;
    });
    setActiveSessions(updatedSessions);
    localStorage.setItem('registered_class_schedules', JSON.stringify(updatedSessions));
  };

  const markAllPresent = () => {
    const updatedRoster = classRoster.map(s => ({ ...s, status: 'Present' }));
    setClassRoster(updatedRoster);

    const updatedSessions = activeSessions.map(sess => {
      if (String(sess.id) === String(selectedClassId)) {
        return { ...sess, enrolled_students: updatedRoster };
      }
      return sess;
    });
    setActiveSessions(updatedSessions);
    localStorage.setItem('registered_class_schedules', JSON.stringify(updatedSessions));
  };

  const handleSaveClassAttendance = () => {
    setSaveSuccessMsg(`Class attendance saved! (${classRoster.filter(s => s.status === 'Present').length} Present out of ${classRoster.length} enrolled)`);
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  const filteredRoster = classRoster.filter(s =>
    (s.name && s.name.toLowerCase().includes(studentSearch.toLowerCase())) ||
    (s.grade && s.grade.toLowerCase().includes(studentSearch.toLowerCase()))
  );

  const selectedClassObj = activeSessions.find(c => String(c.id) === String(selectedClassId));

  return (
    <div className="view-container">
      {/* Header Bar */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.6rem', color: 'var(--text-main)' }}>Class Schedule & In-Class Attendance</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Classroom spatial timetable and teacher roll call system ({activeSessions.length} Active Sessions)</p>
        </div>

        <button className="btn btn-emerald" onClick={() => setShowCreateModal(true)}>
          <Plus size={18} /> Create Class Schedule
        </button>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid-split-responsive">
        
        {/* Left Column: Roll Call Table */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ fontFamily: 'Outfit', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserCheck size={20} color="var(--accent-primary)" /> Roll Call Roster ({classRoster.length} Enrolled)
            </h3>
            <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={markAllPresent} disabled={classRoster.length === 0}>
              <CheckCircle2 size={14} color="var(--accent-primary)" /> Mark All Present
            </button>
          </div>

          {/* Active Class Switcher Dropdown */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">Active Classroom Session</label>
            <select 
              className="form-input"
              value={selectedClassId}
              onChange={e => handleSelectClass(e.target.value)}
              style={{ width: '100%' }}
            >
              {activeSessions.map(s => (
                <option key={s.id} value={s.id}>
                  {s.subject} — {s.room} ({s.enrolled_students?.length || 0} Students)
                </option>
              ))}
            </select>
          </div>

          {/* Search Roster Input */}
          <div className="form-group" style={{ marginBottom: '16px', position: 'relative' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder={`Search in ${selectedClassObj ? selectedClassObj.subject : 'class'} roster...`}
              value={studentSearch}
              onChange={e => setStudentSearch(e.target.value)}
              style={{ paddingLeft: '36px', height: '38px', fontSize: '0.85rem' }}
            />
          </div>

          {/* Student Class Roster Table */}
          <div className="table-responsive-wrapper" style={{ marginBottom: '16px', maxHeight: '400px', overflowY: 'auto' }}>
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
                              color: s.status === 'Present' ? '#000' : 'var(--text-muted)'
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
                    <td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>
                      No students enrolled in this active class session. Click "+ Add Student" on the card to enroll students!
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

          <button className="btn btn-emerald" style={{ width: '100%', justifyContent: 'center' }} onClick={handleSaveClassAttendance} disabled={classRoster.length === 0}>
            <Check size={18} /> Save Class Attendance ({classRoster.filter(s => s.status === 'Present').length} Present)
          </button>
        </div>

        {/* Right Column: Active Scheduled Classes Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card" style={{ height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'Outfit', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
                <Calendar size={20} color="var(--accent-primary)" /> Active Class Sessions ({activeSessions.length})
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {activeSessions.map(sess => (
                <div key={sess.id} style={{ padding: '18px', background: 'var(--card-bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span className="badge-status badge-success"><MapPin size={12} /> {sess.room}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{sess.time}</span>
                      {/* Frameless Delete Trash Icon Button */}
                      <button 
                        onClick={(e) => handleDeleteClassSession(sess.id, e)} 
                        title={`Delete ${sess.subject}`}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          outline: 'none',
                          boxShadow: 'none',
                          color: '#EF4444',
                          cursor: 'pointer',
                          padding: '2px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <h4 style={{ fontFamily: 'Outfit', fontSize: '1.05rem', margin: '8px 0', color: 'var(--text-main)', paddingRight: '20px' }}>{sess.subject}</h4>
                  
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                    <UserCheck size={14} color="var(--accent-primary)" /> Teacher: {sess.teacher}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      Enrolled: {sess.enrolled_students?.length || 0} Students
                    </span>
                    <button 
                      className="btn btn-outline"
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                      onClick={() => {
                        setTargetClassSession(sess);
                        setShowEnrollModal(true);
                      }}
                    >
                      <UserPlus size={14} /> + Add Student
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Modal 1: Create New Class Schedule (By Existing Student) */}
      {showCreateModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '480px', padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'Outfit', color: 'var(--text-main)' }}>Create Class Schedule by Student</h3>
              <button onClick={() => setShowCreateModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleCreateClassSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Subject / Class Name</label>
                <input type="text" className="form-input" placeholder="e.g. Grade 10 Physics Lab" value={newSubject} onChange={e => setNewSubject(e.target.value)} required />
              </div>

              <div className="form-group">
                <label className="form-label">Assign Primary Existing Student</label>
                <select className="form-input" value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)} style={{ width: '100%' }}>
                  <option value="">Select registered student...</option>
                  {allStudents.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.grade || 'Student'})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Teacher / Staff</label>
                <select className="form-input" value={newTeacher} onChange={e => setNewTeacher(e.target.value)} style={{ width: '100%' }}>
                  {allStaff.map(st => (
                    <option key={st.id} value={st.name}>{st.name} ({st.role || 'Teacher'})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label className="form-label">Classroom Location</label>
                  <input type="text" className="form-input" placeholder="Room 101" value={newRoom} onChange={e => setNewRoom(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Time Slot</label>
                  <input type="text" className="form-input" placeholder="09:00 AM - 10:30 AM" value={newTime} onChange={e => setNewTime(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-emerald" style={{ flex: 1, justifyContent: 'center' }}>Create Class</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add Student to Active Class */}
      {showEnrollModal && targetClassSession && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '440px', padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'Outfit', color: 'var(--text-main)' }}>Add Student to "{targetClassSession.subject}"</h3>
              <button onClick={() => setShowEnrollModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            <form onSubmit={handleEnrollStudentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Select Registered Student to Add</label>
                <select 
                  className="form-input" 
                  value={studentToEnroll} 
                  onChange={e => setStudentToEnroll(e.target.value)}
                  style={{ width: '100%' }}
                  required
                >
                  <option value="">Choose student to add...</option>
                  {allStudents.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.grade || 'Student'})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowEnrollModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-emerald" style={{ flex: 1, justifyContent: 'center' }}>Enroll Student</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
