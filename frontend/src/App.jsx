import React, { useState, useEffect } from 'react';
import { 
  Gauge, ShieldCheck, ShoppingBag, Clock, Users, 
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
  
  // MOBILE MENU OVERLAY STATE
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [theme, setTheme] = useState('light');
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
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

  // REUSABLE NAVIGATION GRID CONTENT
  const NavigationContent = () => (
    <div className="flex-1 flex flex-col justify-between w-full">
      {/* 2-COLUMN SQUARE BUTTON GRID */}
      <div className="w-full grid grid-cols-2 gap-3 mt-4">
        {canAccess('parent-portal') && activeRole === 'Parent' && (
          <button 
            className={`flex flex-col items-center justify-center w-full aspect-square p-3 rounded-2xl text-center text-[0.68rem] font-extrabold uppercase tracking-wider transition-all border ${
              currentView === 'parent-portal' 
                ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-lg' 
                : 'bg-[var(--card-bg-subtle)] text-[var(--text-muted)] border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-main)]'
            }`} 
            onClick={() => handleNavClick('parent-portal')}
          >
            <UserCheck size={24} className="mb-1.5 shrink-0" />
            <span>Parent Portal</span>
          </button>
        )}

        {canAccess('dashboard') && (
          <button 
            className={`flex flex-col items-center justify-center w-full aspect-square p-3 rounded-2xl text-center text-[0.68rem] font-extrabold uppercase tracking-wider transition-all border ${
              currentView === 'dashboard' 
                ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-lg' 
                : 'bg-[var(--card-bg-subtle)] text-[var(--text-muted)] border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-main)]'
            }`} 
            onClick={() => handleNavClick('dashboard')}
          >
            <Gauge size={24} className="mb-1.5 shrink-0" />
            <span>Exec Dashboard</span>
          </button>
        )}

        {canAccess('attendance') && (
          <button 
            className={`flex flex-col items-center justify-center w-full aspect-square p-3 rounded-2xl text-center text-[0.68rem] font-extrabold uppercase tracking-wider transition-all border ${
              currentView === 'attendance' 
                ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-lg' 
                : 'bg-[var(--card-bg-subtle)] text-[var(--text-muted)] border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-main)]'
            }`} 
            onClick={() => handleNavClick('attendance')}
          >
            <Clock size={24} className="mb-1.5 shrink-0" />
            <span>RFID/Daycare</span>
          </button>
        )}

        {canAccess('students') && (
          <button 
            className={`flex flex-col items-center justify-center w-full aspect-square p-3 rounded-2xl text-center text-[0.68rem] font-extrabold uppercase tracking-wider transition-all border ${
              currentView === 'students' 
                ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-lg' 
                : 'bg-[var(--card-bg-subtle)] text-[var(--text-muted)] border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-main)]'
            }`} 
            onClick={() => handleNavClick('students')}
          >
            <Users size={24} className="mb-1.5 shrink-0" />
            <span>Student Dir</span>
          </button>
        )}

        {canAccess('staff') && (
          <button 
            className={`flex flex-col items-center justify-center w-full aspect-square p-3 rounded-2xl text-center text-[0.68rem] font-extrabold uppercase tracking-wider transition-all border ${
              currentView === 'staff' 
                ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-lg' 
                : 'bg-[var(--card-bg-subtle)] text-[var(--text-muted)] border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-main)]'
            }`} 
            onClick={() => handleNavClick('staff')}
          >
            <UserPlus size={24} className="mb-1.5 shrink-0" />
            <span>Staff Dir</span>
          </button>
        )}

        {canAccess('accounting') && (
          <button 
            className={`flex flex-col items-center justify-center w-full aspect-square p-3 rounded-2xl text-center text-[0.68rem] font-extrabold uppercase tracking-wider transition-all border ${
              currentView === 'accounting' 
                ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-lg' 
                : 'bg-[var(--card-bg-subtle)] text-[var(--text-muted)] border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-main)]'
            }`} 
            onClick={() => handleNavClick('accounting')}
          >
            <BookOpen size={24} className="mb-1.5 shrink-0" />
            <span>Ledger</span>
          </button>
        )}

        {canAccess('pos') && (
          <button 
            className={`flex flex-col items-center justify-center w-full aspect-square p-3 rounded-2xl text-center text-[0.68rem] font-extrabold uppercase tracking-wider transition-all border ${
              currentView === 'pos' 
                ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-lg' 
                : 'bg-[var(--card-bg-subtle)] text-[var(--text-muted)] border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-main)]'
            }`} 
            onClick={() => handleNavClick('pos')}
          >
            <ShoppingBag size={24} className="mb-1.5 shrink-0" />
            <span>POS Terminal</span>
          </button>
        )}

        {canAccess('timetable') && (
          <button 
            className={`flex flex-col items-center justify-center w-full aspect-square p-3 rounded-2xl text-center text-[0.68rem] font-extrabold uppercase tracking-wider transition-all border ${
              currentView === 'timetable' 
                ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-lg' 
                : 'bg-[var(--card-bg-subtle)] text-[var(--text-muted)] border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-main)]'
            }`} 
            onClick={() => handleNavClick('timetable')}
          >
            <Calendar size={24} className="mb-1.5 shrink-0" />
            <span>Class Schedule</span>
          </button>
        )}

        {canAccess('assets') && (
          <button 
            className={`flex flex-col items-center justify-center w-full aspect-square p-3 rounded-2xl text-center text-[0.68rem] font-extrabold uppercase tracking-wider transition-all border ${
              currentView === 'assets' 
                ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-lg' 
                : 'bg-[var(--card-bg-subtle)] text-[var(--text-muted)] border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-main)]'
            }`} 
            onClick={() => handleNavClick('assets')}
          >
            <Coins size={24} className="mb-1.5 shrink-0" />
            <span>Fixed Assets</span>
          </button>
        )}

        {canAccess('rbac') && (
          <button 
            className={`flex flex-col items-center justify-center w-full aspect-square p-3 rounded-2xl text-center text-[0.68rem] font-extrabold uppercase tracking-wider transition-all border ${
              currentView === 'rbac' 
                ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-lg' 
                : 'bg-[var(--card-bg-subtle)] text-[var(--text-muted)] border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-main)]'
            }`} 
            onClick={() => handleNavClick('rbac')}
          >
            <Settings size={24} className="mb-1.5 shrink-0" />
            <span>Settings</span>
          </button>
        )}

        {canAccess('ai-assistant') && (
          <button 
            className={`flex flex-col items-center justify-center w-full aspect-square p-3 rounded-2xl text-center text-[0.68rem] font-extrabold uppercase tracking-wider transition-all border ${
              currentView === 'ai-assistant' 
                ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-lg' 
                : 'bg-[var(--card-bg-subtle)] text-[var(--text-muted)] border-[var(--border-color)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-main)]'
            }`} 
            onClick={() => handleNavClick('ai-assistant')}
          >
            <Bot size={24} className="mb-1.5 shrink-0" />
            <span>AI Assistant</span>
          </button>
        )}
      </div>

      {/* ACTIVE RBAC MODE SELECTOR AT BOTTOM */}
      <div className="mt-6 pt-4 border-t border-[var(--border-color)] w-full">
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
  );

  return (
    // ROOT LAYOUT WRAPPER
    <div className="flex flex-col md:flex-row min-h-screen w-full bg-[var(--bg-dark)] text-[var(--text-main)] relative">
      
      {/* 1. DESKTOP SIDEBAR (Visible ONLY on md: desktop screens) */}
      <aside className="hidden md:flex md:flex-col md:w-64 h-screen sticky top-0 bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] shrink-0 p-4 overflow-y-auto">
        <div className="flex items-center gap-3 pb-4 border-b border-[var(--border-color)]">
          <div className="w-10 h-10 bg-black dark:bg-white text-white dark:text-black rounded-xl flex items-center justify-center shrink-0">
            <NestLogo size={24} />
          </div>
          <div>
            <div className="font-extrabold text-base tracking-tight">NESTIN</div>
            <div className="text-[0.65rem] font-bold text-[var(--text-muted)] uppercase tracking-wider">Tuition and Day Care</div>
          </div>
        </div>

        <NavigationContent />
      </aside>

      {/* 2. MOBILE SIDEBAR OVERLAY (Renders ONLY when isMobileMenuOpen === true on mobile) */}
      {isMobileMenuOpen && (
        <aside className="fixed inset-0 z-50 bg-[var(--bg-sidebar)] p-4 flex flex-col h-[100dvh] overflow-y-auto pb-24 md:hidden w-full">
          <div className="flex items-center justify-between w-full pb-4 mb-4 border-b border-[var(--border-color)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black dark:bg-white text-white dark:text-black rounded-xl flex items-center justify-center">
                <NestLogo size={24} />
              </div>
              <div>
                <div className="font-extrabold text-base tracking-tight">NESTIN</div>
                <div className="text-[0.65rem] font-bold text-[var(--text-muted)] uppercase tracking-wider">Tuition and Day Care</div>
              </div>
            </div>

            <button 
              className="w-10 h-10 rounded-xl flex items-center justify-center border border-[var(--border-color)] bg-[var(--card-bg-subtle)] text-[var(--text-main)]"
              onClick={() => setIsMobileMenuOpen(false)}
              title="Close Side Panel"
            >
              <X size={20} />
            </button>
          </div>

          <NavigationContent />
        </aside>
      )}

      {/* 3. MAIN CONTENT AREA */}
      <main className="flex-1 w-full min-w-0 p-4 md:p-8 overflow-y-auto">
        
        {/* CONSOLIDATED SINGLE DASHBOARD TOP-BAR */}
        <div className="flex flex-wrap items-center justify-between w-full gap-4 mb-6">
          {/* LEFT SIDE: Mobile Side Panel Toggle + RBAC Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <button 
              className="flex md:hidden items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-[var(--border-color)] bg-[var(--card-bg-subtle)] text-[var(--text-main)]" 
              onClick={() => setIsMobileMenuOpen(true)}
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

          {/* RIGHT SIDE: Single Bell & Theme Toggle Buttons */}
          <div className="flex items-center gap-2 shrink-0 relative">
            <button 
              onClick={() => setShowNotifDrawer(!showNotifDrawer)}
              className="w-10 h-10 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] flex items-center justify-center relative text-[var(--text-main)]"
              title="System Notifications"
            >
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <button 
              onClick={toggleTheme} 
              className="w-10 h-10 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] flex items-center justify-center text-[var(--text-main)]" 
              title="Toggle Light/Dark Theme"
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
        </div>

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
