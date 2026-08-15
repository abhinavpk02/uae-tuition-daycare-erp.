import React, { useState, useEffect } from 'react';
import { 
  Gauge, ShieldCheck, ShoppingBag, Clock, Users, 
  Building2, Sparkles, Calendar, Coins, UserCheck, Lock, Settings, UserPlus, BookOpen, Menu, X, Sun, Moon, Bot, Bell, AlertTriangle, DollarSign 
} from 'lucide-react';

import DashboardView from './views/DashboardView';
import AccountingView from './views/AccountingView';
import POSView from './views/POSView';
import AttendanceDaycareView from './views/AttendanceDaycareView';
import TimetableView from './views/TimetableView';
import AssetsView from './views/AssetsView';
import StudentsView from './views/StudentsView';
import StaffView from './views/StaffView';
import ParentPortalView from './views/ParentPortalView';
import RBACManagementView from './views/RBACManagementView';
import AIAssistantView from './views/AIAssistantView';
import SearchableSelectInput from './components/SearchableSelectInput';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [activeRole, setActiveRole] = useState('SuperAdmin');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Minimalist Pure OLED Pitch Black (Dark) vs Frosted Glass (Light) Mode State
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('theme_mode') || 'light';
  });

  // Notifications Drawer State
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications] = useState([
    { id: 1, type: 'warning', title: 'Outstanding Dues Alert', msg: 'Rashid Al-Maktoum has AED 450.00 pending tuition fees.', time: '10 mins ago' },
    { id: 2, type: 'success', title: 'Daycare Check-in', msg: 'Mariam Al-Hashimi checked into Daycare Zone A.', time: '25 mins ago' },
    { id: 3, type: 'info', title: 'Asset Depreciation Logged', msg: 'Monthly straight-line depreciation calculated for IT Hardware.', time: '1 hour ago' }
  ]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
    localStorage.setItem('theme_mode', themeMode);
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleRoleChange = (role) => {
    setActiveRole(role);
    if (role === 'Parent') {
      setCurrentView('parent-portal');
    } else if (role === 'Teacher') {
      setCurrentView('timetable');
    }
  };

  const handleNavClick = (viewKey) => {
    setCurrentView(viewKey);
    setIsMobileMenuOpen(false); // Close mobile drawer when a tile is clicked
  };

  return (
    <div className="app-container">
      {/* Mobile Top Header Bar with Hamburger Drawer Trigger */}
      <div className="mobile-header-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="brand-icon" style={{ width: '36px', height: '36px' }}>
            <Building2 size={20} />
          </div>
          <div>
            <div className="brand-title" style={{ fontSize: '1rem' }}>NEST</div>
            <div className="brand-subtitle" style={{ fontSize: '0.6rem' }}>Tuition & Daycare</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Notification Bell in Mobile Top Bar */}
          <button 
            className="mobile-menu-toggle"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            style={{ position: 'relative', width: '38px', height: '38px' }}
          >
            <Bell size={18} color="var(--text-main)" />
            <span style={{ position: 'absolute', top: '6px', right: '6px', width: '8px', height: '8px', background: '#EF4444', borderRadius: '50%' }}></span>
          </button>

          {/* Theme Switcher Button in Mobile Top Bar */}
          <button 
            className="mobile-menu-toggle" 
            onClick={toggleTheme}
            style={{ width: '38px', height: '38px' }}
          >
            {themeMode === 'dark' ? <Sun size={18} color="#F59E0B" /> : <Moon size={18} color="#059669" />}
          </button>

          {/* Menu Drawer Toggle */}
          <button 
            className="mobile-menu-toggle" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{ width: '38px', height: '38px' }}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div>
          {/* Brand Header */}
          <div className="brand-header">
            <div className="brand-icon">
              <Building2 size={24} />
            </div>
            <div>
              <div className="brand-title">NEST</div>
              <div className="brand-subtitle">Tuition & Daycare</div>
            </div>
          </div>

          {/* Nav Tile Grid (Control Center Style) */}
          <div className="nav-tile-grid">
            
            {/* Executive Dashboard */}
            {['SuperAdmin', 'Admin'].includes(activeRole) && (
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

            {/* RBAC Permissions */}
            {activeRole === 'SuperAdmin' && (
              <div className="nav-tile-item">
                <button 
                  className={`nav-tile-btn ${currentView === 'rbac' ? 'active' : ''}`}
                  onClick={() => handleNavClick('rbac')}
                >
                  <Lock size={26} />
                  <span className="nav-tile-label">Permissions</span>
                </button>
              </div>
            )}

            {/* Student Directory */}
            {['SuperAdmin', 'Admin', 'Teacher', 'Accountant'].includes(activeRole) && (
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

            {/* Staff Directory */}
            {['SuperAdmin', 'Admin'].includes(activeRole) && (
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

            {/* General Ledger */}
            {['SuperAdmin', 'Admin', 'Accountant'].includes(activeRole) && (
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

            {/* POS Terminal */}
            {['SuperAdmin', 'Admin', 'Accountant'].includes(activeRole) && (
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

            {/* RFID & Daycare */}
            {['SuperAdmin', 'Admin', 'Teacher', 'Accountant'].includes(activeRole) && (
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

            {/* Timetable & Schedule */}
            {['SuperAdmin', 'Admin', 'Teacher'].includes(activeRole) && (
              <div className="nav-tile-item">
                <button 
                  className={`nav-tile-btn ${currentView === 'timetable' ? 'active' : ''}`}
                  onClick={() => handleNavClick('timetable')}
                >
                  <Calendar size={26} />
                  <span className="nav-tile-label">Room Timetable</span>
                </button>
              </div>
            )}

            {/* Fixed Assets */}
            {['SuperAdmin', 'Admin', 'Accountant'].includes(activeRole) && (
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

            {/* Parent Portal */}
            {['SuperAdmin', 'Parent'].includes(activeRole) && (
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

            {/* AI Assistant */}
            {['SuperAdmin', 'Admin', 'Teacher', 'Accountant'].includes(activeRole) && (
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
        </div>

        {/* Footer Role Switcher */}
        <div style={{ paddingTop: '14px', borderTop: '1px solid var(--border-color)', marginTop: '16px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Active RBAC Mode:
          </div>
          <SearchableSelectInput 
            options={[
              { value: 'SuperAdmin', label: 'SuperAdmin (Full Access)' },
              { value: 'Admin', label: 'Admin / Accountant' },
              { value: 'Teacher', label: 'Teacher / Staff' },
              { value: 'Parent', label: 'Parent Portal' }
            ]}
            value={activeRole}
            onChange={val => handleRoleChange(val)}
          />
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content" style={{ display: isMobileMenuOpen ? 'none' : 'block' }}>
        
        {/* Desktop Header Bar with Notifications & Theme Switcher */}
        <div className="header-bar">
          <div className="header-actions">
            <span className="badge-status badge-success">
              <ShieldCheck size={14} /> RBAC: {activeRole}
            </span>
            <span className="badge-status badge-warning">
              <Sparkles size={14} /> Balanced
            </span>
          </div>

          <div className="header-actions" style={{ position: 'relative' }}>
            
            {/* Notification Drawer Toggle */}
            <button 
              className="theme-toggle-btn"
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              style={{ position: 'relative' }}
            >
              <Bell size={16} /> Notifications
              <span style={{ width: '8px', height: '8px', background: '#EF4444', borderRadius: '50%', display: 'inline-block' }}></span>
            </button>

            {/* Notification Drawer Popover */}
            {isNotifOpen && (
              <div className="notif-drawer-popover">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ fontFamily: 'Outfit', color: 'var(--text-main)', fontSize: '0.95rem' }}>System Alerts</h4>
                  <button onClick={() => setIsNotifOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    <X size={16} />
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {notifications.map(n => (
                    <div key={n.id} style={{ padding: '10px 12px', background: 'var(--card-bg-subtle)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-main)', marginBottom: '2px' }}>{n.title}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px' }}>{n.msg}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--accent-primary)', textAlign: 'right' }}>{n.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Desktop Theme Switcher */}
            <button className="theme-toggle-btn" onClick={toggleTheme}>
              {themeMode === 'dark' ? (
                <><Sun size={16} color="#F59E0B" /> Light Mode</>
              ) : (
                <><Moon size={16} color="#059669" /> Dark Mode</>
              )}
            </button>

          </div>
        </div>

        {/* Dynamic Views Rendering based on active navigation */}
        {currentView === 'dashboard' && <DashboardView activeRole={activeRole} />}
        {currentView === 'accounting' && <AccountingView activeRole={activeRole} />}
        {currentView === 'pos' && <POSView />}
        {currentView === 'attendance' && <AttendanceDaycareView />}
        {currentView === 'timetable' && <TimetableView />}
        {currentView === 'assets' && <AssetsView />}
        {currentView === 'students' && <StudentsView activeRole={activeRole} />}
        {currentView === 'staff' && <StaffView activeRole={activeRole} />}
        {currentView === 'parent-portal' && <ParentPortalView />}
        {currentView === 'rbac' && <RBACManagementView activeRole={activeRole} onRoleChange={handleRoleChange} />}
        {currentView === 'ai-assistant' && <AIAssistantView />}

      </main>
    </div>
  );
}
