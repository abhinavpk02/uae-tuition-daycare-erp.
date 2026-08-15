import React, { useEffect, useState } from 'react';
import { UserCheck, Shield, Plus, Phone, Mail, Clock, Search, DollarSign, Trash2 } from 'lucide-react';
import AddStaffModal from '../components/AddStaffModal';
import SwipeableTableRow from '../components/SwipeableTableRow';
import { addToTrashBin } from '../utils/trashBin';
import { BASE_URL } from '../api';

export default function StaffView({ activeRole = 'SuperAdmin' }) {
  const [staff, setStaff] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);

  const defaultStaff = [
    { id: 'stf-201', name: 'Fatima Al-Mansoori', email: 'fatima.mansoori@nest.ae', role: 'Teacher', emirates_id: '784-1992-8821941-1', hourly_rate: 120.00 },
    { id: 'stf-202', name: 'Ayesha Rashid', email: 'ayesha.rashid@nest.ae', role: 'Caregiver', emirates_id: '784-1995-1029384-2', hourly_rate: 95.00 }
  ];

  const fetchStaff = () => {
    fetch(`${BASE_URL}/api/staff`)
      .then(res => res.json())
      .then(data => {
        const remoteList = Array.isArray(data) ? data.map(st => ({
          id: st.id,
          name: st.name,
          email: st.email || `${st.name.toLowerCase().replace(/\s+/g, '.')}@nest.ae`,
          role: st.role || 'Teacher',
          emirates_id: st.emirates_id || '784-1992-8821941-1',
          hourly_rate: parseFloat(st.hourly_rate) || 120.00
        })) : [];

        // Merge local storage staff
        const localStaff = JSON.parse(localStorage.getItem('registered_staff') || '[]');
        const merged = [...localStaff];

        remoteList.forEach(r => {
          if (!merged.some(m => String(m.id) === String(r.id) || m.emirates_id === r.emirates_id)) {
            merged.push(r);
          }
        });

        if (merged.length === 0) {
          merged.push(...defaultStaff);
        }

        setStaff(merged);
      })
      .catch(() => {
        const localStaff = JSON.parse(localStorage.getItem('registered_staff') || '[]');
        setStaff(localStaff.length > 0 ? localStaff : defaultStaff);
      });
  };

  useEffect(() => {
    fetchStaff();
    window.addEventListener('registered_data_updated', fetchStaff);
    return () => {
      window.removeEventListener('registered_data_updated', fetchStaff);
    };
  }, []);

  const handleStaffAdded = (newStaff) => {
    if (newStaff) {
      const updatedLocal = [newStaff, ...staff.filter(s => s.id !== newStaff.id)];
      setStaff(updatedLocal);
      localStorage.setItem('registered_staff', JSON.stringify(updatedLocal));
    }
    fetchStaff();
  };

  // Permanent Staff Deletion (Slide-to-Delete or Action Click) -> Routes to Common Trash
  const handleDeleteStaff = (staffId, e) => {
    if (e) e.stopPropagation();
    const target = staff.find(s => String(s.id) === String(staffId));
    const staffName = target ? target.name : 'staff member';

    if (!window.confirm(`Move staff member ${staffName} to Common Trash?`)) {
      return;
    }

    if (target) {
      addToTrashBin(target, 'Staff', target.name);
    }

    const updated = staff.filter(s => String(s.id) !== String(staffId));
    setStaff(updated);
    localStorage.setItem('registered_staff', JSON.stringify(updated));

    fetch(`${BASE_URL}/api/staff/${staffId}`, { method: 'DELETE' }).catch(() => {});
  };

  const filteredStaff = staff.filter(s =>
    (s.name && s.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (s.email && s.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (s.role && s.role.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (s.emirates_id && s.emirates_id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="view-container">
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.6rem', color: 'var(--text-main)' }}>Staff Directory & Payroll Credentials</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Manage teaching staff, caregivers, payroll hourly rates & Emirates ID compliance ({staff.length} Active Staff)
          </p>
        </div>

        {['SuperAdmin', 'Admin'].includes(activeRole) && (
          <button className="btn btn-emerald" onClick={() => setIsStaffModalOpen(true)}>
            <Plus size={18} /> Onboard Staff Member
          </button>
        )}
      </div>

      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ fontFamily: 'Outfit', color: 'var(--text-main)' }}>Staff Members Roster ({staff.length})</h3>
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search staff by name or role..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '36px', height: '38px', fontSize: '0.85rem', width: '100%' }}
            />
          </div>
        </div>

        <div className="table-responsive-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Staff ID</th>
                <th>Full Name</th>
                <th>Email Address</th>
                <th>Assigned Role</th>
                <th>Emirates ID</th>
                <th>Hourly Payroll Rate</th>
                <th style={{ width: '40px', textAlign: 'center' }}></th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.length > 0 ? (
                filteredStaff.map(stf => (
                  <SwipeableTableRow 
                    key={stf.id}
                    onDelete={() => handleDeleteStaff(stf.id)}
                    deleteLabel={`Delete ${stf.name}`}
                  >
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{stf.id}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{stf.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{stf.email}</td>
                    <td><span className="badge-status badge-success">{stf.role}</span></td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{stf.emirates_id || '784-1992-1234567-1'}</td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-primary)' }}>
                      AED {parseFloat(stf.hourly_rate || 120).toFixed(2)} / hr
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        onClick={(e) => handleDeleteStaff(stf.id, e)} 
                        title={`Delete ${stf.name}`}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          outline: 'none',
                          boxShadow: 'none',
                          color: '#EF4444',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'inline-flex',
                          alignItems: 'center'
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </SwipeableTableRow>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>
                    No staff members onboarded. Click "Onboard Staff Member" to add new staff.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddStaffModal 
        isOpen={isStaffModalOpen} 
        onClose={() => setIsStaffModalOpen(false)} 
        onSuccess={handleStaffAdded} 
      />
    </div>
  );
}
