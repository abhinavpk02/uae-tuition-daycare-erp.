import React, { useEffect, useState } from 'react';
import { UserCheck, Shield, Plus, Phone, Mail, Clock, Search, DollarSign } from 'lucide-react';
import AddStaffModal from '../components/AddStaffModal';

export default function StaffView({ activeRole = 'SuperAdmin' }) {
  const [staff, setStaff] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);

  const fetchStaff = () => {
    fetch('/api/staff')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setStaff(data);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const filteredStaff = staff.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.role.toLowerCase().includes(searchQuery.toLowerCase())
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
              </tr>
            </thead>
            <tbody>
              {filteredStaff.length > 0 ? (
                filteredStaff.map(stf => (
                  <tr key={stf.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{stf.id}</td>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{stf.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{stf.email}</td>
                    <td><span className="badge-status badge-success">{stf.role}</span></td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.82rem' }}>{stf.emirates_id || '784-1992-1234567-1'}</td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-primary)' }}>
                      AED {parseFloat(stf.hourly_rate || 95).toFixed(2)} / hr
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>
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
        onSuccess={() => fetchStaff()} 
      />
    </div>
  );
}
