import React, { useEffect, useState } from 'react';
import { Check, ShieldCheck, Users, UserPlus, Sliders, CheckCircle2 } from 'lucide-react';

const ROLES_LIST = [
  { id: 'SuperAdmin', label: 'SuperAdmin (Full Access)' },
  { id: 'Admin', label: 'Admin / Accountant' },
  { id: 'Teacher', label: 'Teacher / Staff' },
  { id: 'Parent', label: 'Parent Portal' },
];

export default function RBACManagementView() {
  const [selectedRole, setSelectedRole] = useState('SuperAdmin');
  const [permissions, setPermissions] = useState({
    manage_students_staff: true,
    admissions_onboarding: true,
    operational_details: true,
  });
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  const fetchPermissions = (roleName) => {
    setLoading(true);
    setSaveStatus('');
    fetch(`/api/v1/roles/${roleName}/permissions`)
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setPermissions({
            manage_students_staff: !!data.manage_students_staff,
            admissions_onboarding: !!data.admissions_onboarding,
            operational_details: !!data.operational_details,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPermissions(selectedRole);
  }, [selectedRole]);

  const handleSave = () => {
    setLoading(true);
    setSaveStatus('');
    fetch(`/api/v1/roles/${selectedRole}/permissions`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(permissions),
    })
      .then((res) => res.json())
      .then((data) => {
        setSaveStatus('Permissions saved successfully!');
      })
      .catch((err) => setSaveStatus(`Error saving: ${err.message}`))
      .finally(() => setLoading(false));
  };

  const togglePermission = (key) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      {/* 2-Pane Main Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px', flex: 1, minHeight: 0 }}>
        
        {/* Left Sidebar: Roles List */}
        <div 
          className="glass-card" 
          style={{ 
            background: 'rgba(15, 23, 42, 0.75)', 
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '20px' 
          }}
        >
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
            System Roles
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {ROLES_LIST.map((role) => {
              const isActive = selectedRole === role.id;
              return (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                    background: isActive ? '#2563EB' : 'transparent',
                    color: isActive ? '#FFFFFF' : '#9CA3AF',
                  }}
                >
                  <span>{role.label}</span>
                  {isActive && <Check size={18} color="#FFFFFF" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Panel: Role Details & Permission Blocks */}
        <div 
          className="glass-card" 
          style={{ 
            background: 'rgba(15, 23, 42, 0.75)', 
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '28px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between'
          }}
        >
          <div>
            {/* Right Panel Header */}
            <h2 
              style={{ 
                fontFamily: 'Outfit', 
                fontSize: '1.4rem', 
                fontWeight: 700, 
                letterSpacing: '0.04em', 
                marginBottom: '24px',
                color: '#F9FAFB',
                textTransform: 'uppercase'
              }}
            >
              {selectedRole.toUpperCase()} ROLE & ACCESS DETAILS
            </h2>

            {/* Permission Block 1 */}
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                justify: 'space-between',
                padding: '20px', 
                background: 'rgba(255, 255, 255, 0.03)', 
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                marginBottom: '16px' 
              }}
            >
              <div style={{ display: 'flex', gap: '16px', flex: 1, paddingRight: '20px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3B82F6', flexShrink: 0 }}>
                  <Users size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#F9FAFB', marginBottom: '6px' }}>
                    Manage Students & Staff
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#9CA3AF', lineHeight: '1.5' }}>
                    Grant full access to add and manage student profiles, staff records, and core center details. Includes the centralized module to seamlessly onboard new students, register staff members, and update essential records.
                  </p>
                </div>
              </div>

              <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px', cursor: 'pointer', flexShrink: 0, marginTop: '6px' }}>
                <input 
                  type="checkbox" 
                  checked={permissions.manage_students_staff} 
                  onChange={() => togglePermission('manage_students_staff')} 
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span 
                  style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: permissions.manage_students_staff ? '#10B981' : '#374151',
                    transition: '.3s', borderRadius: '26px'
                  }}
                >
                  <span 
                    style={{
                      position: 'absolute', content: '""', height: '20px', width: '20px', left: permissions.manage_students_staff ? '24px' : '3px', bottom: '3px',
                      backgroundColor: 'white', transition: '.3s', borderRadius: '50%'
                    }}
                  />
                </span>
              </label>
            </div>

            {/* Permission Block 2 */}
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                justify: 'space-between',
                padding: '20px', 
                background: 'rgba(255, 255, 255, 0.03)', 
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                marginBottom: '16px' 
              }}
            >
              <div style={{ display: 'flex', gap: '16px', flex: 1, paddingRight: '20px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F59E0B', flexShrink: 0 }}>
                  <UserPlus size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#F9FAFB', marginBottom: '6px' }}>
                    Admissions & Staff Onboarding
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#9CA3AF', lineHeight: '1.5' }}>
                    Provides full administrative access for admissions. Includes tools to onboard teachers and complete all staff onboarding steps. Permits user to create new student and employee entries.
                  </p>
                </div>
              </div>

              <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px', cursor: 'pointer', flexShrink: 0, marginTop: '6px' }}>
                <input 
                  type="checkbox" 
                  checked={permissions.admissions_onboarding} 
                  onChange={() => togglePermission('admissions_onboarding')} 
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span 
                  style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: permissions.admissions_onboarding ? '#10B981' : '#374151',
                    transition: '.3s', borderRadius: '26px'
                  }}
                >
                  <span 
                    style={{
                      position: 'absolute', content: '""', height: '20px', width: '20px', left: permissions.admissions_onboarding ? '24px' : '3px', bottom: '3px',
                      backgroundColor: 'white', transition: '.3s', borderRadius: '50%'
                    }}
                  />
                </span>
              </label>
            </div>

            {/* Permission Block 3 */}
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                justify: 'space-between',
                padding: '20px', 
                background: 'rgba(255, 255, 255, 0.03)', 
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                marginBottom: '16px' 
              }}
            >
              <div style={{ display: 'flex', gap: '16px', flex: 1, paddingRight: '20px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981', flexShrink: 0 }}>
                  <Sliders size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#F9FAFB', marginBottom: '6px' }}>
                    Day-to-day Operational Details
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#9CA3AF', lineHeight: '1.5' }}>
                    Includes centralized controls to manage day-to-day operational details for the center.
                  </p>
                </div>
              </div>

              <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px', cursor: 'pointer', flexShrink: 0, marginTop: '6px' }}>
                <input 
                  type="checkbox" 
                  checked={permissions.operational_details} 
                  onChange={() => togglePermission('operational_details')} 
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span 
                  style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: permissions.operational_details ? '#10B981' : '#374151',
                    transition: '.3s', borderRadius: '26px'
                  }}
                >
                  <span 
                    style={{
                      position: 'absolute', content: '""', height: '20px', width: '20px', left: permissions.operational_details ? '24px' : '3px', bottom: '3px',
                      backgroundColor: 'white', transition: '.3s', borderRadius: '50%'
                    }}
                  />
                </span>
              </label>
            </div>
          </div>

          {/* Sticky Bottom Bar with Green Save Button */}
          <div 
            style={{ 
              display: 'flex', 
              justify: 'space-between', 
              alignItems: 'center', 
              paddingTop: '20px', 
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              marginTop: '20px' 
            }}
          >
            <div>
              {saveStatus && (
                <span style={{ fontSize: '0.85rem', color: saveStatus.includes('Error') ? '#EF4444' : '#10B981', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                  <CheckCircle2 size={16} /> {saveStatus}
                </span>
              )}
            </div>

            <button 
              onClick={handleSave} 
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #10B981, #059669)',
                color: '#FFFFFF',
                padding: '12px 24px',
                borderRadius: '10px',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.92rem',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.2s ease',
              }}
            >
              {loading ? 'Saving Changes...' : 'Save Permissions'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
