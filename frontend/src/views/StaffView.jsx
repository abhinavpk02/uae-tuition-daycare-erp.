import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Shield, Mail, CreditCard, DollarSign, MapPin } from 'lucide-react';
import AddStaffModal from '../components/AddStaffModal';

export default function StaffView({ activeRole = 'SuperAdmin' }) {
  const [staff, setStaff] = useState([]);
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

  return (
    <div className="view-container">
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.6rem' }}>Staff & Faculty Directory</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Registered teaching staff, administrators, and Emirates ID compliance records
          </p>
        </div>

        {/* Action Button for SuperAdmin and Admin */}
        {['SuperAdmin', 'Admin'].includes(activeRole) && (
          <button className="btn btn-gold" onClick={() => setIsStaffModalOpen(true)}>
            <UserPlus size={18} /> Onboard Staff
          </button>
        )}
      </div>

      {/* Dedicated Staff Table */}
      <div className="glass-card">
        <h3 style={{ fontFamily: 'Outfit', marginBottom: '16px' }}>Registered Staff Members</h3>
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
              {staff.map(st => (
                <tr key={st.id}>
                  <td style={{ fontWeight: 600 }}>{st.name}</td>
                  <td style={{ color: 'var(--accent-cyan)', fontFamily: 'monospace' }}>{st.user?.email || 'staff@uaeerp.ae'}</td>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--accent-gold)' }}>
                    {st.emirates_id}
                  </td>
                  <td style={{ fontFamily: 'monospace' }}>{st.passport_no || 'N/A'}</td>
                  <td style={{ textAlign: 'right', fontFamily: 'monospace', fontWeight: 700, color: '#10B981' }}>
                    AED {parseFloat(st.hourly_rate).toFixed(2)} / hr
                  </td>
                  <td>
                    <span className="badge-status badge-success">Active Duty</span>
                  </td>
                </tr>
              ))}
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
