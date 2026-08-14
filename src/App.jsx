import React, { useState } from 'react';
import { 
  LayoutDashboard, ShieldCheck, ShoppingBag, Clock, Users, 
  Building2, Globe, Sparkles, Calendar, Coins, UserCheck, Lock, UserPlus 
} from 'lucide-react';

import DashboardView from './views/DashboardView';
import AccountingView from './views/AccountingView';
import POSView from './views/POSView';
import AttendanceDaycareView from './views/AttendanceDaycareView';
import StudentsView from './views/StudentsView';
import StaffView from './views/StaffView';
import AssetsView from './views/AssetsView';
import TimetableView from './views/TimetableView';
import ParentPortalView from './views/ParentPortalView';
import RBACManagementView from './views/RBACManagementView';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [activeRole, setActiveRole] = useState('SuperAdmin');

  // Handle role switching with automatic view redirection
  const handleRoleChange = (newRole) => {
    setActiveRole(newRole);
    if (newRole === 'Parent') {
      setCurrentView('parent-portal');
    } else if (newRole === 'Teacher') {
      setCurrentView('students');
    } else {
      setCurrentView('dashboard');
    }
  };

  // RBAC Permission checks
  const canAccess = (viewKey) => {
    if (activeRole === 'SuperAdmin') return true;
    if (activeRole === 'Admin') {
      return ['dashboard', 'accounting', 'pos', 'attendance', 'students', 'staff', 'assets'].includes(viewKey);
    }
    if (activeRole === 'Teacher') {
      return ['students', 'timetable'].includes(viewKey);
    }
    if (activeRole === 'Parent') {
      return ['parent-portal', 'students'].includes(viewKey);
    }
    return false;
  };


  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div>
          <div className="brand-header">
            <div className="brand-icon">
              <Building2 size={24} />
            </div>
            <div>
              <div className="brand-title">UAE ERP</div>
              <div className="brand-subtitle">Tuition & Daycare</div>
            </div>
          </div>

          <ul className="nav-menu">
            {canAccess('parent-portal') && activeRole === 'Parent' && (
              <li className="nav-item">
                <button 
                  className={currentView === 'parent-portal' ? 'active' : ''} 
                  onClick={() => setCurrentView('parent-portal')}
                >
                  <UserCheck size={18} /> Parent Portal
                </button>
              </li>
            )}

            {canAccess('dashboard') && (
              <li className="nav-item">
                <button 
                  className={currentView === 'dashboard' ? 'active' : ''} 
                  onClick={() => setCurrentView('dashboard')}
                >
                  <LayoutDashboard size={18} /> Executive Dashboard
                </button>
              </li>
            )}

            {canAccess('rbac') && (
              <li className="nav-item">
                <button 
                  className={currentView === 'rbac' ? 'active' : ''} 
                  onClick={() => setCurrentView('rbac')}
                >
                  <Lock size={18} /> RBAC Permissions
                </button>
              </li>
            )}

            {canAccess('students') && (
              <li className="nav-item">
                <button 
                  className={currentView === 'students' ? 'active' : ''} 
                  onClick={() => setCurrentView('students')}
                >
                  <Users size={18} /> Student Directory
                </button>
              </li>
            )}

            {canAccess('staff') && (
              <li className="nav-item">
                <button 
                  className={currentView === 'staff' ? 'active' : ''} 
                  onClick={() => setCurrentView('staff')}
                >
                  <UserPlus size={18} /> Staff Directory
                </button>
              </li>
            )}

            {canAccess('accounting') && (
              <li className="nav-item">
                <button 
                  className={currentView === 'accounting' ? 'active' : ''} 
                  onClick={() => setCurrentView('accounting')}
                >
                  <ShieldCheck size={18} /> Double-Entry Ledger
                </button>
              </li>
            )}

            {canAccess('pos') && (
              <li className="nav-item">
                <button 
                  className={currentView === 'pos' ? 'active' : ''} 
                  onClick={() => setCurrentView('pos')}
                >
                  <ShoppingBag size={18} /> POS Checkout Terminal
                </button>
              </li>
            )}

            {canAccess('attendance') && (
              <li className="nav-item">
                <button 
                  className={currentView === 'attendance' ? 'active' : ''} 
                  onClick={() => setCurrentView('attendance')}
                >
                  <Clock size={18} /> RFID & Daycare Engine
                </button>
              </li>
            )}

            {canAccess('timetable') && (
              <li className="nav-item">
                <button 
                  className={currentView === 'timetable' ? 'active' : ''} 
                  onClick={() => setCurrentView('timetable')}
                >
                  <Calendar size={18} /> Room Timetable
                </button>
              </li>
            )}

            {canAccess('assets') && (
              <li className="nav-item">
                <button 
                  className={currentView === 'assets' ? 'active' : ''} 
                  onClick={() => setCurrentView('assets')}
                >
                  <Coins size={18} /> Fixed Assets & Depr.
                </button>
              </li>
            )}
          </ul>
        </div>

        <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>Active RBAC Mode:</div>
          <select 
            className="form-select" 
            style={{ width: '100%', fontSize: '0.82rem', padding: '8px 10px', background: '#0F172A', border: '1px solid var(--border-highlight)' }}
            value={activeRole}
            onChange={e => handleRoleChange(e.target.value)}
          >
            <option value="SuperAdmin">SuperAdmin (Full Access)</option>
            <option value="Admin">Admin / Accountant</option>
            <option value="Teacher">Teacher / Staff</option>
            <option value="Parent">Parent Portal</option>
          </select>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Top Header Bar */}
        <header className="header-bar">
          <div>
            <div className="badge-uae">
              <Globe size={14} /> United Arab Emirates Standard (AED)
            </div>
          </div>
          <div className="header-actions">
            <div className="badge-status badge-warning" style={{ fontSize: '0.8rem', padding: '6px 14px' }}>
              RBAC Mode: {activeRole}
            </div>
            <div className="badge-status badge-success" style={{ fontSize: '0.8rem', padding: '6px 14px' }}>
              <Sparkles size={14} /> 100% Audit Balanced
            </div>
          </div>
        </header>

        {/* View Router with Access Protection */}
        {currentView === 'parent-portal' && canAccess('parent-portal') && <ParentPortalView />}
        {currentView === 'dashboard' && canAccess('dashboard') && <DashboardView onNavigate={setCurrentView} />}
        {currentView === 'rbac' && canAccess('rbac') && <RBACManagementView activeRole={activeRole} />}
        {currentView === 'students' && canAccess('students') && <StudentsView activeRole={activeRole} />}
        {currentView === 'staff' && canAccess('staff') && <StaffView activeRole={activeRole} />}
        {currentView === 'accounting' && canAccess('accounting') && <AccountingView />}
        {currentView === 'pos' && canAccess('pos') && <POSView />}
        {currentView === 'attendance' && canAccess('attendance') && <AttendanceDaycareView />}
        {currentView === 'timetable' && canAccess('timetable') && <TimetableView />}
        {currentView === 'assets' && canAccess('assets') && <AssetsView />}
      </main>
    </div>
  );
}
