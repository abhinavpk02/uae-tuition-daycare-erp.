import React, { useEffect, useState } from 'react';
import { Calendar, Plus, Clock, MapPin, UserCheck, BookOpen } from 'lucide-react';

export default function TimetableView() {
  const [timetable, setTimetable] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [staff, setStaff] = useState([]);

  const [roomId, setRoomId] = useState('Room 101');
  const [subjectId, setSubjectId] = useState('');
  const [staffId, setStaffId] = useState('');
  const [startTime, setStartTime] = useState('09:00 AM');
  const [endTime, setEndTime] = useState('10:30 AM');

  const fetchTimetable = () => {
    fetch('/api/timetable')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setTimetable(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchTimetable();

    fetch('/api/students') // load metadata
      .catch(() => {});

    fetch('/api/staff')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setStaff(data);
          if (data.length > 0) setStaffId(data[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const handleCreateSlot = (e) => {
    e.preventDefault();
    if (!staffId) return;

    fetch('/api/timetable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        room_id: roomId,
        subject_id: subjectId || 'default',
        staff_id: staffId,
        start_time: startTime,
        end_time: endTime
      })
    })
      .then(res => res.json())
      .then(() => {
        fetchTimetable();
      })
      .catch(err => alert(err.message));
  };

  return (
    <div className="view-container">
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontFamily: 'Outfit', fontSize: '1.6rem' }}>Timetable & Room Schedule Matrix</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Spatial-temporal mapping for tuition classrooms and daycare activity zones</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Timetable Slots Grid */}
        <div>
          <h3 style={{ fontFamily: 'Outfit', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={20} color="var(--accent-gold)" /> Scheduled Activity Slots
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
            {timetable.length > 0 ? (
              timetable.map(slot => (
                <div key={slot.id} className="glass-card" style={{ border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span className="badge-status badge-warning" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} /> {slot.room_id}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {slot.start_time} - {slot.end_time}
                    </span>
                  </div>

                  <h4 style={{ fontFamily: 'Outfit', fontSize: '1.05rem', margin: '8px 0' }}>{slot.subject_name}</h4>
                  <div style={{ fontSize: '0.85rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <UserCheck size={14} /> Teacher: {slot.staff_name}
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="glass-card" style={{ border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span className="badge-status badge-warning"><MapPin size={12} /> Room 101</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>09:00 AM - 10:30 AM</span>
                  </div>
                  <h4 style={{ fontFamily: 'Outfit', fontSize: '1.05rem', margin: '8px 0' }}>Advanced Mathematics</h4>
                  <div style={{ fontSize: '0.85rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <UserCheck size={14} /> Teacher: Fatima Al-Mansoori
                  </div>
                </div>

                <div className="glass-card" style={{ border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span className="badge-status badge-success"><MapPin size={12} /> Daycare Zone A</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>11:00 AM - 01:00 PM</span>
                  </div>
                  <h4 style={{ fontFamily: 'Outfit', fontSize: '1.05rem', margin: '8px 0' }}>Montessori Art & Sensory Play</h4>
                  <div style={{ fontSize: '0.85rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <UserCheck size={14} /> Supervisor: Fatima Al-Mansoori
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Add Timetable Slot Form */}
        <div className="glass-card">
          <h3 style={{ fontFamily: 'Outfit', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={20} color="var(--accent-emerald)" /> Allocate Classroom Slot
          </h3>

          <form onSubmit={handleCreateSlot}>
            <div className="form-group">
              <label className="form-label">Room / Zone</label>
              <select className="form-select" value={roomId} onChange={e => setRoomId(e.target.value)}>
                <option value="Room 101">Room 101 (HSS Math/Sci)</option>
                <option value="Room 102">Room 102 (HS English/Arts)</option>
                <option value="Daycare Zone A">Daycare Zone A (Toddlers)</option>
                <option value="Daycare Zone B">Daycare Zone B (KG Active Play)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Assigned Staff Member</label>
              <select className="form-select" value={staffId} onChange={e => setStaffId(e.target.value)}>
                {staff.map(st => (
                  <option key={st.id} value={st.id}>{st.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Start Time</label>
              <input className="form-input" value={startTime} onChange={e => setStartTime(e.target.value)} required />
            </div>

            <div className="form-group">
              <label className="form-label">End Time</label>
              <input className="form-input" value={endTime} onChange={e => setEndTime(e.target.value)} required />
            </div>

            <button type="submit" className="btn btn-gold" style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}>
              <Plus size={16} /> Save Timetable Allocation
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
