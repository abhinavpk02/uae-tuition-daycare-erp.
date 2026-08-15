import React, { useState, useEffect } from 'react';
import { 
  Gauge, ShieldCheck, ShoppingBag, Clock, Users, 
  Sparkles, Calendar, Coins, UserCheck, Lock, Settings, UserPlus, BookOpen, Menu, X, Sun, Moon, Bot, Bell, AlertTriangle, DollarSign 
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
import AIAssistantView from './views/AIAssistantView';
import SearchableSelectInput from './components/SearchableSelectInput';
import CommonTrashWidget from './components/CommonTrashWidget';
import NestLogo from './components/NestLogo';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [activeRole, setActiveRole] = useState('SuperAdmin');
  
  // OPEN SIDE PANEL BY DEFAULT ON MOBILE APP INITIAL LAUNCH
  const [mobileMenuOpen, setMobileMenuOpen] = useState(() => {
    return typeof window !== 'undefined' && window.innerWidth <= 768;
  });

  const [theme, setTheme] = useState('light'); // DEFAULT TO LIGHT MODE ON INITIAL LAUNCH
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleNavClick = (viewKey) => {
    setCurrentView(viewKey);
    setMobileMenuOpen(false);
  };

  const roles = [
    { value: 'SuperAdmin', label: 'SuperAdmin (Full Access)' },
    { value: 'Admin', label: 'Admin (Operations & Accounting)' },
    { value: 'Teacher', label: 'Teacher (Academic & Attendance)' },
    { value: 'Caregiver', label: 'Caregiver (Daycare Tracking)' },
    { value: 'Parent', label: 'Parent (Portal Only)' }
  ];

  const rolePermissions = {
    SuperAdmin: ['dashboard', 'students', 'staff', 'accounting', 'pos', 'attendance', 'timetable', 'assets', 'parent-portal', 'rbac', 'ai-assistant'],
    Admin: ['dashboard', 'students', 'staff', 'accounting', 'pos', 'attendance', 'timetable', 'assets', 'ai-assistant'],
    Teacher: ['dashboard', 'students', 'attendance', 'timetable', 'ai-assistant'],
    Caregiver: ['attendance'],
    Parent: ['parent-portal']
  };

  const canAccess = (viewKey) => {
    const allowed = rolePermissions[activeRole] || [];
    return allowed.includes(viewKey);
  };

  return (
    <div className="app-container">
      {/* Mobile Top App Bar */}
      <div className="mobile-header-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="brand-icon" style={{ width: '36px', height: '36px' }}>
            <NestLogo size={20} />
          </div>
          <div>
            <div className="brand-title" style={{ fontSize: '1rem' }}>NESTIN ERP</div>
            <div className="brand-subtitle" style={{ fontSize: '0.6rem' }}>Tuition and Day Care</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            onClick={toggleTheme} 
            className="theme-toggle-btn" 
            title="Toggle Light/Dark Theme"
            style={{ width: '40px', height: '40px', padding: 0, justifyContent: 'center', borderRadius: '12px' }}
          >
            {theme === 'dark' ? <Sun size={18} color="#F59E0B" /> : <Moon size={18} color="#3B82F6" />}
          </button>
          
          <button 
            className="mobile-menu-toggle" 
            onClick={() => setMobileMenuOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', width: 'auto', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}
          >
            <Menu size={18} />
            <span>Side Panel</span>
          </button>
        </div>
      </div>

      {/* Constant Left Sidebar Frame */}
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        {/* Pinned Brand Header */}
        <div className="brand-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="brand-icon">
              <NestLogo size={24} />
            </div>
            <div>
              <div className="brand-title">NESTIN</div>
              <div className="brand-subtitle">Tuition and Day Care</div>
            </div>
          </div>

          <button 
            className="mobile-close-btn"
            onClick={() => setMobileMenuOpen(false)}
            title="Close Side Panel"
          >
            <X size={20} />
          </button>
        </div>

        {/* Movable & Scrollable Navigation Tabs Container */}
        <div className="nav-tile-wrapper">
          <div className="nav-tile-grid">
            {canAccess('parent-portal') && activeRole === 'Parent' && (
              <div className="nav-tile-item">
                <button 
                  className={`nav-tile-btn ${currentView === 'parent-portal' ? 'active' : ''}`} 
                  onClick={() => handleNavClick('parent-portal')}
                >
                  <UserCheck size={26} />
                  <span className="nav-tile-label">Parent Portal</span>
                </button>
              </div>
            )}

            {canAccess('dashboard') && (
              <div className="nav-tile-item">
                <button 
                  className={`nav-tile-btn ${currentView === 'dashboard' ? 'active' : ''}`} 
                  onClick={() => handleNavClick('dashboard')}
                >
                  <Gauge size={26} />
                  <span className="nav-tile-label">Exec Dashboard</span>
                </button>
              </div>
            )}

            {canAccess('attendance') && (
              <div className="nav-tile-item">
                <button 
                  className={`nav-tile-btn ${currentView === 'attendance' ? 'active' : ''}`} 
                  onClick={() => handleNavClick('attendance')}
                >
                  <Clock size={26} />
                  <span className="nav-tile-label">RFID/Daycare</span>
                </button>
              </div>
            )}

            {canAccess('students') && (
              <div className="nav-tile-item">
                <button 
                  className={`nav-tile-btn ${currentView === 'students' ? 'active' : ''}`} 
                  onClick={() => handleNavClick('students')}
                >
                  <Users size={26} />
                  <span className="nav-tile-label">Student Dir</span>
                </button>
              </div>
            )}

            {canAccess('staff') && (
              <div className="nav-tile-item">
                <button 
                  className={`nav-tile-btn ${currentView === 'staff' ? 'active' : ''}`} 
                  onClick={() => handleNavClick('staff')}
                >
                  <UserPlus size={26} />
                  <span className="nav-tile-label">Staff Dir</span>
                </button>
              </div>
            )}

            {canAccess('accounting') && (
              <div className="nav-tile-item">
                <button 
                  className={`nav-tile-btn ${currentView === 'accounting' ? 'active' : ''}`} 
                  onClick={() => handleNavClick('accounting')}
                >
                  <BookOpen size={26} />
                  <span className="nav-tile-label">Ledger</span>
                </button>
              </div>
            )}

            {canAccess('pos') && (
              <div className="nav-tile-item">
                <button 
                  className={`nav-tile-btn ${currentView === 'pos' ? 'active' : ''}`} 
                  onClick={() => handleNavClick('pos')}
                >
                  <ShoppingBag size={26} />
                  <span className="nav-tile-label">POS Terminal</span>
                </button>
              </div>
            )}

            {canAccess('timetable') && (
              <div className="nav-tile-item">
                <button 
                  className={`nav-tile-btn ${currentView === 'timetable' ? 'active' : ''}`} 
                  onClick={() => handleNavClick('timetable')}
                >
                  <Calendar size={26} />
                  <span className="nav-tile-label">Class Schedule</span>
                </button>
              </div>
            )}

            {canAccess('assets') && (
              <div className="nav-tile-item">
                <button 
                  className={`nav-tile-btn ${currentView === 'assets' ? 'active' : ''}`} 
                  onClick={() => handleNavClick('assets')}
                >
                  <Coins size={26} />
                  <span className="nav-tile-label">Fixed Assets</span>
                </button>
              </div>
            )}

            {canAccess('rbac') && (
              <div className="nav-tile-item">
                <button 
                  className={`nav-tile-btn ${currentView === 'rbac' ? 'active' : ''}`} 
                  onClick={() => handleNavClick('rbac')}
                >
                  <Settings size={26} />
                  <span className="nav-tile-label">Settings</span>
                </button>
              </div>
            )}

            {canAccess('ai-assistant') && (
              <div className="nav-tile-item">
                <button 
                  className={`nav-tile-btn ${currentView === 'ai-assistant' ? 'active' : ''}`} 
                  onClick={() => handleNavClick('ai-assistant')}
                >
                  <Bot size={26} />
                  <span className="nav-tile-label">AI Assistant</span>
                </button>
              </div>
            )}
          </div>

          {/* ACTIVE RBAC MODE dropdown moved to bottom of navigation flow */}
          <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-color)', width: '100%' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <SearchableSelectInput
                label="ACTIVE RBAC MODE:"
                options={roles}
                value={activeRole}
                onChange={(newRole) => {
                  setActiveRole(newRole);
                  const allowed = rolePermissions[newRole] || [];
                  if (!allowed.includes(currentView)) {
                    setCurrentView(allowed[0] || 'dashboard');
                  }
                }}
                placeholder="Search active role..."
              />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Workspace Area */}
      <main className="main-content">
        <header className="header-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              className="mobile-menu-toggle" 
              onClick={() => setMobileMenuOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', width: 'auto', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 700 }}
            >
              <Menu size={18} />
              <span>Side Panel</span>
            </button>

            <span className="badge-status badge-success" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              <ShieldCheck size={14} /> RBAC: {activeRole}
            </span>
            <span className="badge-status badge-warning" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              <Sparkles size={14} /> Balanced
            </span>
          </div>

          <div className="header-actions" style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowNotifDrawer(!showNotifDrawer)}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-main)',
                cursor: 'pointer',
                position: 'relative'
              }}
              title="System Notifications"
            >
              <Bell size={18} />
              <span style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', background: '#EF4444', borderRadius: '50%' }}></span>
            </button>

            <button 
              onClick={toggleTheme} 
              className="theme-toggle-btn" 
              title="Toggle Light/Dark Theme"
              style={{ width: '40px', height: '40px', padding: 0, justifyContent: 'center', borderRadius: '12px' }}
            >
              {theme === 'dark' ? <Sun size={18} color="#F59E0B" /> : <Moon size={18} color="#3B82F6" />}
            </button>

            {showNotifDrawer && (
              <div className="notif-drawer-popover">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                  <h4 style={{ fontFamily: 'Outfit', color: 'var(--text-main)', fontSize: '0.95rem' }}>System Alerts & Activity Logs</h4>
                  <button onClick={() => setShowNotifDrawer(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={16} /></button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ padding: '10px', background: 'var(--card-bg-subtle)', borderRadius: '10px', borderLeft: '3px solid var(--accent-primary)', fontSize: '0.8rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>RFID Attendance Event Logged</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>Zayed Al-Hashimi checked into Daycare Wing (Terminal #1)</div>
                  </div>
                  <div style={{ padding: '10px', background: 'var(--card-bg-subtle)', borderRadius: '10px', borderLeft: '3px solid #F59E0B', fontSize: '0.8rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>Outstanding Tuition Alert</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '2px' }}>Amina Al-Mansoori has AED 450.00 pending payment</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* View Router */}
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
        {currentView === 'ai-assistant' && canAccess('ai-assistant') && <AIAssistantView />}
      </main>

      {/* Floating Bottom-Right Categorized Common Trash Widget */}
      <CommonTrashWidget />
    </div>
  );
}
