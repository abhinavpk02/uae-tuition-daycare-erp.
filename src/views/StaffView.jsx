import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Shield, Mail, CreditCard, DollarSign, MapPin, Search } from 'lucide-react';
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

  const filteredStaff = staff.filter(st =>
    st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (st.emirates_id && st.emirates_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (st.user?.email && st.user.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="view-container">
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.6rem', color: 'var(--text-main)' }}>Staff & Faculty Directory</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Search registered teaching staff, administrators, and Emirates ID compliance records
          </p>
        </div>

        {/* Action Button for SuperAdmin and Admin */}
        {['SuperAdmin', 'Admin'].includes(activeRole) && (
          <button className="btn btn-emerald" onClick={() => setIsStaffModalOpen(true)}>
            <UserPlus size={18} /> Onboard Staff
          </button>
        )}
      </div>

      {/* Dedicated Staff Table with Real-Time Search */}
      <div className="glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ fontFamily: 'Outfit', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} color="var(--accent-primary)" /> Registered Staff Members ({filteredStaff.length})
          </h3>

          {/* SEARCH STAFF INPUT */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search staff by name or email..." 
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
                <th>Staff Name</th>
                <th>Work Email</th>
                <th>Emirates ID (UAE Legal)</th>
                <th>Passport No</th>
                <th>Hourly Rate</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.length > 0 ? (
                filteredStaff.map(st => (
                  <tr key={st.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{st.name}</td>
                    <td style={{ color: 'var(--accent-primary)', fontFamily: 'monospace' }}>{st.user?.email || 'staff@uaeerp.ae'}</td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-main)' }}>
                      {st.emirates_id}
                    </td>
                    <td style={{ fontFamily: 'monospace' }}>{st.passport_no || 'N/A'}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: 'var(--accent-primary)' }}>
                      AED {parseFloat(st.hourly_rate).toFixed(2)} / hr
                    </td>
                    <td>
                      <span className="badge-status badge-success">Active Duty</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px' }}>
                    No staff members found matching "{searchQuery}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Trigger */}
      <AddStaffModal 
        isOpen={isStaffModalOpen} 
        onClose={() => setIsStaffModalOpen(false)} 
        onSuccess={() => fetchStaff()}
        creatorRole={activeRole}
      />
    </div>
  );
}
