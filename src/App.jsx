import React, { useState } from 'react';
import { 
  LayoutDashboard, ShieldCheck, ShoppingBag, Clock, Users, 
  Building2, Globe, Sparkles, Calendar, Coins 
} from 'lucide-react';

import DashboardView from './views/DashboardView';
import AccountingView from './views/AccountingView';
import POSView from './views/POSView';
import AttendanceDaycareView from './views/AttendanceDaycareView';
import StudentsView from './views/StudentsView';
import AssetsView from './views/AssetsView';
import TimetableView from './views/TimetableView';

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [activeRole, setActiveRole] = useState('SuperAdmin');

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
            <li className="nav-item">
              <button 
                className={currentView === 'dashboard' ? 'active' : ''} 
                onClick={() => setCurrentView('dashboard')}
              >
                <LayoutDashboard size={18} /> Executive Dashboard
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={currentView === 'accounting' ? 'active' : ''} 
                onClick={() => setCurrentView('accounting')}
              >
                <ShieldCheck size={18} /> Double-Entry Ledger
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={currentView === 'pos' ? 'active' : ''} 
                onClick={() => setCurrentView('pos')}
              >
                <ShoppingBag size={18} /> POS Checkout Terminal
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={currentView === 'attendance' ? 'active' : ''} 
                onClick={() => setCurrentView('attendance')}
              >
                <Clock size={18} /> RFID & Daycare Engine
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={currentView === 'students' ? 'active' : ''} 
                onClick={() => setCurrentView('students')}
              >
                <Users size={18} /> Academic & Students
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={currentView === 'timetable' ? 'active' : ''} 
                onClick={() => setCurrentView('timetable')}
              >
                <Calendar size={18} /> Room Timetable
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={currentView === 'assets' ? 'active' : ''} 
                onClick={() => setCurrentView('assets')}
              >
                <Coins size={18} /> Fixed Assets & Depr.
              </button>
            </li>
          </ul>
        </div>

        <div style={{ paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Active RBAC Mode:</div>
          <select 
            className="form-select" 
            style={{ width: '100%', fontSize: '0.8rem', padding: '6px 10px' }}
            value={activeRole}
            onChange={e => setActiveRole(e.target.value)}
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
            <div className="badge-status badge-success" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
              <Sparkles size={14} /> System Status: 100% Audit Balanced
            </div>
          </div>
        </header>

        {/* View Router */}
        {currentView === 'dashboard' && <DashboardView onNavigate={setCurrentView} />}
        {currentView === 'accounting' && <AccountingView />}
        {currentView === 'pos' && <POSView />}
        {currentView === 'attendance' && <AttendanceDaycareView />}
        {currentView === 'students' && <StudentsView />}
        {currentView === 'timetable' && <TimetableView />}
        {currentView === 'assets' && <AssetsView />}
      </main>
    </div>
  );
}
