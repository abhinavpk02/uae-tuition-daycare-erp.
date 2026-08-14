import React, { useEffect, useState } from 'react';
import { Check, ShieldCheck, Users, UserPlus, Sliders, CheckCircle2, Lock } from 'lucide-react';

const ROLES_LIST = [
  { id: 'SuperAdmin', label: 'SuperAdmin (Full Access)' },
  { id: 'Admin', label: 'Admin / Accountant' },
  { id: 'Teacher', label: 'Teacher / Staff' },
  { id: 'Parent', label: 'Parent Portal' },
];

export default function RBACManagementView({ activeRole = 'SuperAdmin' }) {
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
    if (activeRole !== 'SuperAdmin') {
      setSaveStatus('Error: Only SuperAdmin can modify role permissions');
      return;
    }

    setLoading(true);
    setSaveStatus('');
    fetch(`/api/v1/roles/${selectedRole}/permissions`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...permissions, requester_role: activeRole }),
    })
      .then((res) => res.json().then(data => ({ ok: res.ok, data })))
      .then(({ ok, data }) => {
        if (ok) {
          setSaveStatus('Permissions saved successfully!');
        } else {
          setSaveStatus(`Error: ${data.detail || 'Failed to save'}`);
        }
      })
      .catch((err) => setSaveStatus(`Error saving: ${err.message}`))
      .finally(() => setLoading(false));
  };

  const togglePermission = (key) => {
    if (activeRole !== 'SuperAdmin') return;
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (activeRole !== 'SuperAdmin') {
    return (
      <div className="glass-card" style={{ padding: '40px', textAlign: 'center', margin: '40px auto', maxWidth: '500px' }}>
        <Lock size={48} color="#EF4444" style={{ marginBottom: '16px' }} />
        <h3 style={{ fontFamily: 'Outfit', color: 'var(--text-main)', marginBottom: '8px' }}>Access Restricted</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Only <strong style={{ color: 'var(--accent-primary)' }}>SuperAdmin</strong> is authorized to view and modify RBAC permission settings.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '600px' }}>
      {/* 2-Pane Main Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px', flex: 1 }}>
        
        {/* Left Sidebar: Roles List */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '16px' }}>
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
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.88rem',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                    background: isActive ? 'var(--accent-primary)' : 'var(--card-bg-subtle)',
                    color: isActive ? '#FFFFFF' : 'var(--text-main)',
                    boxShadow: isActive ? '0 4px 14px var(--accent-primary-glow)' : 'none'
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
        <div className="glass-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            {/* Right Panel Header */}
            <h2 
              style={{ 
                fontFamily: 'Outfit', 
                fontSize: '1.3rem', 
                fontWeight: 700, 
                letterSpacing: '0.04em', 
                marginBottom: '24px',
                color: 'var(--text-main)',
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
                justifyContent: 'space-between',
                padding: '20px', 
                background: 'var(--card-bg-subtle)', 
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                marginBottom: '16px' 
              }}
            >
              <div style={{ display: 'flex', gap: '16px', flex: 1, paddingRight: '20px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--accent-primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', flexShrink: 0 }}>
                  <Users size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                    Manage Students & Staff
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
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
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: permissions.manage_students_staff ? 'var(--accent-primary)' : 'var(--border-color)',
                    borderRadius: '26px',
                    transition: '0.3s'
                  }}
                >
                  <span 
                    style={{
                      position: 'absolute',
                      height: '20px', width: '20px',
                      left: permissions.manage_students_staff ? '24px' : '3px',
                      bottom: '3px',
                      background: 'white',
                      borderRadius: '50%',
                      transition: '0.3s'
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
                justifyContent: 'space-between',
                padding: '20px', 
                background: 'var(--card-bg-subtle)', 
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                marginBottom: '16px' 
              }}
            >
              <div style={{ display: 'flex', gap: '16px', flex: 1, paddingRight: '20px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--accent-primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', flexShrink: 0 }}>
                  <UserPlus size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                    Admissions & Staff Onboarding
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                    Provides full administrative access for admissions. Permits authorized users to process student applications and complete all staff onboarding steps.
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
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: permissions.admissions_onboarding ? 'var(--accent-primary)' : 'var(--border-color)',
                    borderRadius: '26px',
                    transition: '0.3s'
                  }}
                >
                  <span 
                    style={{
                      position: 'absolute',
                      height: '20px', width: '20px',
                      left: permissions.admissions_onboarding ? '24px' : '3px',
                      bottom: '3px',
                      background: 'white',
                      borderRadius: '50%',
                      transition: '0.3s'
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
                justifyContent: 'space-between',
                padding: '20px', 
                background: 'var(--card-bg-subtle)', 
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                marginBottom: '24px' 
              }}
            >
              <div style={{ display: 'flex', gap: '16px', flex: 1, paddingRight: '20px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--accent-primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', flexShrink: 0 }}>
                  <Sliders size={22} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '6px' }}>
                    Day-to-day Operational Details
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
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
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: permissions.operational_details ? 'var(--accent-primary)' : 'var(--border-color)',
                    borderRadius: '26px',
                    transition: '0.3s'
                  }}
                >
                  <span 
                    style={{
                      position: 'absolute',
                      height: '20px', width: '20px',
                      left: permissions.operational_details ? '24px' : '3px',
                      bottom: '3px',
                      background: 'white',
                      borderRadius: '50%',
                      transition: '0.3s'
                    }}
                  />
                </span>
              </label>
            </div>
          </div>

          {/* Action Footer */}
          <div>
            {saveStatus && (
              <div 
                style={{ 
                  marginBottom: '16px', 
                  fontSize: '0.85rem', 
                  fontWeight: 600, 
                  color: saveStatus.startsWith('Error') ? '#EF4444' : 'var(--accent-primary)' 
                }}
              >
                {saveStatus}
              </div>
            )}

            <button 
              className="btn btn-emerald" 
              onClick={handleSave} 
              disabled={loading}
              style={{ padding: '12px 28px', fontSize: '0.9rem' }}
            >
              {loading ? 'Saving Changes...' : 'Save Permissions'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
