import React, { useState, useEffect } from 'react';
import { 
  LayoutGrid, Gauge, ShieldCheck, ShoppingBag, Clock, Users, 
  Sparkles, Calendar, Coins, UserCheck, Lock, Settings, UserPlus, BookOpen, Menu, X, Sun, Moon, Bot, Bell 
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
  
  // MOBILE MENU INITIAL STATE: Opens by default on mobile load (<= 768px)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
    return false;
  });

  const [theme, setTheme] = useState('light');
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.title = "NESTIN ERP — Tuition & Daycare";
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleNavClick = (viewKey) => {
    setCurrentView(viewKey);
    setIsMobileMenuOpen(false);
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
    <div className="flex flex-col md:flex-row min-h-[100dvh] w-full bg-slate-50 text-slate-900 app-container">
      
      {/* MOBILE TOP BAR (Only visible on mobile screens) */}
      <div className="mobile-header-bar flex items-center justify-between w-full p-4 bg-white border-b border-slate-200 sticky top-0 z-40 md:hidden">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="brand-icon" style={{ width: '36px', height: '36px' }}>
            <NestLogo size={20} />
          </div>
          <div>
            <div className="brand-title" style={{ fontSize: '0.95rem', fontWeight: 800 }}>NESTIN ERP</div>
            <div className="brand-subtitle" style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Tuition & Daycare</div>
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
          
          {/* 4-GRID ICON BUTTON FOR MOBILE MENU OVERLAY */}
          <button 
            className="mobile-menu-toggle flex items-center justify-center p-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 md:hidden" 
            onClick={() => setIsMobileMenuOpen(true)}
            title="Open Control Panel"
            style={{ 
              width: '40px', 
              height: '40px'
            }}
          >
            <LayoutGrid size={20} />
          </button>
        </div>
      </div>

      {/* SIDEBAR NAVIGATION (Desktop Sticky Sidebar / Mobile Drawer Overlay) */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'fixed inset-0 z-50 bg-white p-4 overflow-y-auto pb-32 md:hidden mobile-open' : 'hidden md:flex md:flex-col md:w-64 h-screen sticky top-0 bg-white border-r border-slate-200 shrink-0 p-4'}`}>
        {/* Brand Header */}
        <div className="brand-header flex items-center justify-between pb-4 border-b border-slate-200 mb-4 w-full">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="brand-icon">
              <NestLogo size={24} />
            </div>
            <div>
              <div className="brand-title" style={{ fontSize: '1.15rem', fontWeight: 800 }}>NESTIN ERP</div>
              <div className="brand-subtitle" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Tuition & Daycare</div>
            </div>
          </div>

          <button 
            className="mobile-close-btn flex md:hidden items-center justify-center p-2 rounded-xl bg-slate-100 text-slate-700"
            onClick={() => setIsMobileMenuOpen(false)}
            title="Close Side Panel"
          >
            <X size={20} />
          </button>
        </div>

        {/* 2-COLUMN SQUARE NAVIGATION TILE GRID (Mobile) / VERTICAL STACK (Desktop) */}
        <div className="nav-tile-wrapper flex-1 overflow-y-auto flex flex-col justify-between w-full">
          <div className="nav-tile-grid grid grid-cols-2 gap-3.5 w-full">
            {canAccess('parent-portal') && activeRole === 'Parent' && (
              <div className="nav-tile-item">
                <button 
                  className={`nav-tile-btn aspect-square p-3 flex flex-col items-center justify-center text-center rounded-2xl transition-all w-full ${currentView === 'parent-portal' ? 'active bg-black text-white dark:bg-white dark:text-black font-bold shadow-md' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`} 
                  onClick={() => handleNavClick('parent-portal')}
                >
                  <UserCheck size={26} />
                  <span className="nav-tile-label mt-1 text-[0.7rem] font-extrabold uppercase">Parent Portal</span>
                </button>
              </div>
            )}

            {canAccess('dashboard') && (
              <div className="nav-tile-item">
                <button 
                  className={`nav-tile-btn aspect-square p-3 flex flex-col items-center justify-center text-center rounded-2xl transition-all w-full ${currentView === 'dashboard' ? 'active bg-black text-white dark:bg-white dark:text-black font-bold shadow-md' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`} 
                  onClick={() => handleNavClick('dashboard')}
                >
                  <Gauge size={26} />
                  <span className="nav-tile-label mt-1 text-[0.7rem] font-extrabold uppercase">Dashboard</span>
                </button>
              </div>
            )}

            {canAccess('attendance') && (
              <div className="nav-tile-item">
                <button 
                  className={`nav-tile-btn aspect-square p-3 flex flex-col items-center justify-center text-center rounded-2xl transition-all w-full ${currentView === 'attendance' ? 'active bg-black text-white dark:bg-white dark:text-black font-bold shadow-md' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`} 
                  onClick={() => handleNavClick('attendance')}
                >
                  <Clock size={26} />
                  <span className="nav-tile-label mt-1 text-[0.7rem] font-extrabold uppercase">Attendance & Daycare</span>
                </button>
              </div>
            )}

            {canAccess('students') && (
              <div className="nav-tile-item">
                <button 
                  className={`nav-tile-btn aspect-square p-3 flex flex-col items-center justify-center text-center rounded-2xl transition-all w-full ${currentView === 'students' ? 'active bg-black text-white dark:bg-white dark:text-black font-bold shadow-md' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`} 
                  onClick={() => handleNavClick('students')}
                >
                  <Users size={26} />
                  <span className="nav-tile-label mt-1 text-[0.7rem] font-extrabold uppercase">Student Directory</span>
                </button>
              </div>
            )}

            {canAccess('staff') && (
              <div className="nav-tile-item">
                <button 
                  className={`nav-tile-btn aspect-square p-3 flex flex-col items-center justify-center text-center rounded-2xl transition-all w-full ${currentView === 'staff' ? 'active bg-black text-white dark:bg-white dark:text-black font-bold shadow-md' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`} 
                  onClick={() => handleNavClick('staff')}
                >
                  <UserPlus size={26} />
                  <span className="nav-tile-label mt-1 text-[0.7rem] font-extrabold uppercase">Staff & Payroll</span>
                </button>
              </div>
            )}

            {canAccess('accounting') && (
              <div className="nav-tile-item">
                <button 
                  className={`nav-tile-btn aspect-square p-3 flex flex-col items-center justify-center text-center rounded-2xl transition-all w-full ${currentView === 'accounting' ? 'active bg-black text-white dark:bg-white dark:text-black font-bold shadow-md' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`} 
                  onClick={() => handleNavClick('accounting')}
                >
                  <BookOpen size={26} />
                  <span className="nav-tile-label mt-1 text-[0.7rem] font-extrabold uppercase">General Ledger</span>
                </button>
              </div>
            )}

            {canAccess('pos') && (
              <div className="nav-tile-item">
                <button 
                  className={`nav-tile-btn aspect-square p-3 flex flex-col items-center justify-center text-center rounded-2xl transition-all w-full ${currentView === 'pos' ? 'active bg-black text-white dark:bg-white dark:text-black font-bold shadow-md' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`} 
                  onClick={() => handleNavClick('pos')}
                >
                  <ShoppingBag size={26} />
                  <span className="nav-tile-label mt-1 text-[0.7rem] font-extrabold uppercase">POS & Store</span>
                </button>
              </div>
            )}

            {canAccess('timetable') && (
              <div className="nav-tile-item">
                <button 
                  className={`nav-tile-btn aspect-square p-3 flex flex-col items-center justify-center text-center rounded-2xl transition-all w-full ${currentView === 'timetable' ? 'active bg-black text-white dark:bg-white dark:text-black font-bold shadow-md' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`} 
                  onClick={() => handleNavClick('timetable')}
                >
                  <Calendar size={26} />
                  <span className="nav-tile-label mt-1 text-[0.7rem] font-extrabold uppercase">Class Schedules</span>
                </button>
              </div>
            )}

            {canAccess('assets') && (
              <div className="nav-tile-item">
                <button 
                  className={`nav-tile-btn aspect-square p-3 flex flex-col items-center justify-center text-center rounded-2xl transition-all w-full ${currentView === 'assets' ? 'active bg-black text-white dark:bg-white dark:text-black font-bold shadow-md' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`} 
                  onClick={() => handleNavClick('assets')}
                >
                  <Coins size={26} />
                  <span className="nav-tile-label mt-1 text-[0.7rem] font-extrabold uppercase">Asset Ledger</span>
                </button>
              </div>
            )}

            {canAccess('rbac') && (
              <div className="nav-tile-item">
                <button 
                  className={`nav-tile-btn aspect-square p-3 flex flex-col items-center justify-center text-center rounded-2xl transition-all w-full ${currentView === 'rbac' ? 'active bg-black text-white dark:bg-white dark:text-black font-bold shadow-md' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`} 
                  onClick={() => handleNavClick('rbac')}
                >
                  <Settings size={26} />
                  <span className="nav-tile-label mt-1 text-[0.7rem] font-extrabold uppercase">System Settings</span>
                </button>
              </div>
            )}

            {canAccess('ai-assistant') && (
              <div className="nav-tile-item">
                <button 
                  className={`nav-tile-btn aspect-square p-3 flex flex-col items-center justify-center text-center rounded-2xl transition-all w-full ${currentView === 'ai-assistant' ? 'active bg-black text-white dark:bg-white dark:text-black font-bold shadow-md' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`} 
                  onClick={() => handleNavClick('ai-assistant')}
                >
                  <Bot size={26} />
                  <span className="nav-tile-label mt-1 text-[0.7rem] font-extrabold uppercase">AI Copilot</span>
                </button>
              </div>
            )}
          </div>

          {/* ACTIVE RBAC MODE SELECTOR AT BOTTOM */}
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)', width: '100%' }}>
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
      </aside>

      {/* MAIN CONTENT WORKSPACE PANEL */}
      <main className="flex-1 w-full min-w-0 p-4 md:p-8 overflow-y-auto main-content">
        
        {/* UNIFIED NON-DUPLICATING HEADER BAR */}
        <header className="flex items-center justify-between w-full pb-4 mb-6 border-b border-slate-200 md:border-none header-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span className="badge-status badge-success text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 flex items-center gap-1.5">
              <ShieldCheck size={14} /> RBAC: {activeRole}
            </span>
            <span className="badge-status badge-warning text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center gap-1.5">
              <Sparkles size={14} /> Balanced
            </span>
          </div>

          <div className="header-actions" style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              onClick={() => setShowNotifDrawer(!showNotifDrawer)}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-main)',
                cursor: 'pointer',
                position: 'relative'
              }}
              title="System Notifications"
            >
              <Bell size={18} />
              <span style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', background: '#EF4444', borderRadius: '50%' }}></span>
            </button>

            {/* Desktop Theme Switcher */}
            <button 
              onClick={toggleTheme} 
              className="theme-toggle-btn hidden md:inline-flex" 
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
