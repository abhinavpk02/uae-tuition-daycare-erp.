import React, { useState, useEffect } from 'react';
import { 
  Gauge, ShieldCheck, ShoppingBag, Clock, Users, 
  Building2, Sparkles, Calendar, Coins, UserCheck, Lock, UserPlus, BookOpen, Menu, X, Sun, Moon, Bot 
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

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [activeRole, setActiveRole] = useState('SuperAdmin');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState('dark');

  // Sync active theme with document data-theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

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

  const handleNavClick = (viewKey) => {
    setCurrentView(viewKey);
    setMobileMenuOpen(false);
  };

  // RBAC Permission checks
  const canAccess = (viewKey) => {
    if (activeRole === 'SuperAdmin') return true;
    if (activeRole === 'Admin') {
      return ['dashboard', 'accounting', 'pos', 'attendance', 'students', 'staff', 'assets', 'ai-assistant'].includes(viewKey);
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

      {/* Mobile Sticky Top Bar (Smartphones / Tablets) */}
      <div className="mobile-header-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="brand-icon" style={{ width: '36px', height: '36px' }}>
            <Building2 size={20} />
          </div>
          <div>
            <div className="brand-title" style={{ fontSize: '1.1rem' }}>UAE ERP</div>
            <div className="brand-subtitle" style={{ fontSize: '0.65rem' }}>Tuition & Daycare</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Icon-Only Theme Mode Switcher */}
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
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation (Desktop & Mobile Drawer) */}
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div>
          {/* Brand Header (Desktop) */}
          <div className="brand-header">
            <div className="brand-icon">
              <Building2 size={24} />
            </div>
            <div>
              <div className="brand-title">UAE ERP</div>
              <div className="brand-subtitle">Tuition & Daycare</div>
            </div>
          </div>

          {/* PERFECT 1:1 APPLE CONTROL CENTER SQUARE TILE NAVIGATION GRID */}
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

            {canAccess('rbac') && (
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

            {canAccess('timetable') && (
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

            {/* AI ASSISTANT TAB AT THE VERY LAST POSITION */}
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
        </div>

        {/* Footer Role Switcher */}
        <div style={{ paddingTop: '14px', borderTop: '1px solid var(--border-color)', marginTop: '16px' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Active RBAC Mode:
          </div>
          <select 
            className="form-select" 
            style={{ width: '100%', fontSize: '0.8rem', padding: '8px' }}
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
        {/* Sleek Minimalist Top Header Bar */}
        <header className="header-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="badge-status badge-warning" style={{ fontSize: '0.8rem', padding: '6px 14px' }}>
              RBAC: {activeRole}
            </div>
            <div className="badge-status badge-success" style={{ fontSize: '0.8rem', padding: '6px 14px' }}>
              <Sparkles size={14} /> Balanced
            </div>
          </div>

          <div className="header-actions">
            {/* Icon-Only Theme Mode Switcher Button */}
            <button 
              onClick={toggleTheme} 
              className="theme-toggle-btn"
              title="Toggle Light/Dark Theme"
              style={{ width: '40px', height: '40px', padding: 0, justifyContent: 'center', borderRadius: '12px' }}
            >
              {theme === 'dark' ? <Sun size={18} color="#F59E0B" /> : <Moon size={18} color="#3B82F6" />}
            </button>
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
        {currentView === 'ai-assistant' && canAccess('ai-assistant') && <AIAssistantView />}
      </main>
    </div>
  );
}
