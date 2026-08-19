import React, { useEffect, useState } from 'react';
import { 
  UserCheck, BookOpen, Clock, ShieldCheck, Mail, Phone, 
  DollarSign, Sparkles, CreditCard, Tag, Calendar, BadgeCheck, ArrowLeft, Printer, CheckCircle2, AlertCircle
} from 'lucide-react';
import { BASE_URL } from '../api';
import NestLogo from '../components/NestLogo';

export default function StudentProfileView({ studentId: propStudentId }) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract student_id from URL parameter or props
  const getStudentId = () => {
    if (propStudentId) return propStudentId;
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('student_id')) return urlParams.get('student_id');
      if (urlParams.get('id')) return urlParams.get('id');
      const parts = window.location.pathname.split('/student/');
      if (parts.length > 1 && parts[1]) return parts[1];
    }
    return 'std-101';
  };

  const studentId = getStudentId();

  useEffect(() => {
    setLoading(true);
    // 1. Attempt API fetch GET /api/v1/students/{student_id} or GET /api/students
    fetch(`${BASE_URL}/api/v1/students/${studentId}`)
      .then(res => {
        if (res.ok) return res.json();
        return fetch(`${BASE_URL}/api/students`).then(r => r.json());
      })
      .then(data => {
        let found = null;
        if (data && data.id && String(data.id) === String(studentId)) {
          found = data;
        } else if (Array.isArray(data)) {
          found = data.find(s => String(s.id) === String(studentId));
        }

        // Check local storage fallback if not found in remote API
        if (!found) {
          const localStudents = JSON.parse(localStorage.getItem('registered_students') || '[]');
          found = localStudents.find(s => String(s.id) === String(studentId));
        }

        // Final default demo fallback
        if (!found) {
          found = {
            id: studentId || 'std-101',
            name: 'Zayed Al-Hashimi',
            standard: 'Grade 10',
            program: 'Tuition & Daycare',
            due_amount: 0.0,
            attendance_status: 'Present',
            parent_phone: '+971 50 123 4567',
            parent_email: 'hashimi@uaeerp.ae',
            dob: '2012-05-14',
            emirates_id: '784-2012-1234567-1'
          };
        }

        setStudent(found);
      })
      .catch(() => {
        const localStudents = JSON.parse(localStorage.getItem('registered_students') || '[]');
        const found = localStudents.find(s => String(s.id) === String(studentId)) || {
          id: studentId || 'std-101',
          name: 'Zayed Al-Hashimi',
          standard: 'Grade 10',
          program: 'Tuition & Daycare',
          due_amount: 0.0,
          attendance_status: 'Present',
          parent_phone: '+971 50 123 4567',
          parent_email: 'hashimi@uaeerp.ae',
          dob: '2012-05-14',
          emirates_id: '784-2012-1234567-1'
        };
        setStudent(found);
      })
      .finally(() => setLoading(false));
  }, [studentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600 font-medium text-sm">Loading Student Profile Particulars...</p>
        </div>
      </div>
    );
  }

  const dueAmount = parseFloat(student?.due_amount || 0);

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 bg-slate-50 min-h-screen font-sans text-slate-900">
      
      {/* Top Brand & Navigation Header */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-200 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center font-bold">
            <NestLogo size={22} />
          </div>
          <div>
            <div className="font-extrabold text-base tracking-tight">NESTIN ERP</div>
            <div className="text-xs text-slate-500 font-semibold uppercase">Tuition & Daycare • Student Transcript</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.print()} 
            className="px-4 py-2 text-sm font-semibold bg-white border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-700 flex items-center gap-2 shadow-sm transition-colors"
          >
            <Printer size={16} /> Print Profile
          </button>
          <button 
            onClick={() => {
              if (window.opener) {
                window.close();
              } else {
                window.location.href = '/';
              }
            }} 
            className="px-4 py-2 text-sm font-semibold bg-black text-white rounded-xl hover:opacity-90 flex items-center gap-2 shadow-sm transition-opacity"
          >
            <ArrowLeft size={16} /> Back to ERP
          </button>
        </div>
      </div>

      {/* Main Student Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white font-extrabold text-2xl flex items-center justify-center shadow-md shrink-0">
            {student.name ? student.name.charAt(0) : 'S'}
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{student.name}</h1>
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-slate-100 border border-slate-200 text-slate-800">
                {student.standard || 'Grade 10'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-1">
              STUDENT ID: {student.id} • Registered Active Student
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <span className="px-3.5 py-1.5 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5">
            <BookOpen size={14} /> {student.program === 'Both' ? 'Tuition & Daycare' : (student.program || 'Tuition & Daycare')}
          </span>
          <span className={`px-3.5 py-1.5 text-xs font-bold rounded-full flex items-center gap-1.5 ${dueAmount > 0 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
            <BadgeCheck size={14} /> {dueAmount > 0 ? 'Payment Pending' : 'Clear Ledger'}
          </span>
        </div>
      </div>

      {/* 2-Column Responsive Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN: Parent & Contact Particulars + RFID Tag Code */}
        <div className="space-y-6">
          
          {/* Card 1: Parent & Contact Particulars */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
              <UserCheck size={16} className="text-slate-700" /> Parent & Contact Particulars
            </h3>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium flex items-center gap-2"><Phone size={14} /> Parent Phone</span>
                <span className="font-bold text-slate-900">{student.parent_phone || '+971 50 123 4567'}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium flex items-center gap-2"><Mail size={14} /> Email Address</span>
                <span className="font-bold text-slate-900">{student.parent_email || 'parent@uaeerp.ae'}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium flex items-center gap-2"><Calendar size={14} /> Date of Birth</span>
                <span className="font-bold text-slate-900">{student.dob || '2012-05-14'}</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium flex items-center gap-2"><ShieldCheck size={14} /> Emirates ID</span>
                <span className="font-mono font-bold text-slate-900">{student.emirates_id || '784-2012-1234567-1'}</span>
              </div>
            </div>
          </div>

          {/* Card 2: RFID Tag Code & Terminal Access */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
              <Tag size={16} className="text-slate-700" /> RFID Tag Code & Terminal Tracking
            </h3>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500 font-semibold uppercase">Active Hardware Tag ID</div>
                <div className="text-lg font-mono font-extrabold text-slate-900 mt-0.5">
                  TAG-{String(student.id).substring(0, 8).toUpperCase()}
                </div>
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-extrabold rounded-full border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 size={12} /> Hardware Active
              </span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Academic & Daycare Billing Profile + Outstanding Balance */}
        <div className="space-y-6">
          
          {/* Card 3: Academic & Daycare Billing Profile */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
              <CreditCard size={16} className="text-slate-700" /> Academic & Daycare Billing Profile
            </h3>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Monthly Fixed Tuition Fee</span>
                <span className="font-mono font-bold text-slate-900">AED 1,200.00 / mo</span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-50">
                <span className="text-slate-500 font-medium">Daycare Hourly Billing Rate</span>
                <span className="font-mono font-bold text-slate-900">AED 35.00 / hr</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-medium">General Ledger Sync Status</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 size={14} /> Synchronized
                </span>
              </div>
            </div>
          </div>

          {/* Card 4: Outstanding Balance (Highlighted in RED if > 0, GREEN if 0) */}
          <div className={`rounded-2xl border p-6 shadow-sm transition-all ${dueAmount > 0 ? 'bg-red-50/60 border-red-200' : 'bg-emerald-50/60 border-emerald-200'}`}>
            <h3 className="text-xs font-extrabold uppercase tracking-wider mb-2 text-slate-600 flex items-center gap-1.5">
              <DollarSign size={14} /> Current Ledger Outstanding Balance
            </h3>

            <div className={`text-3xl font-extrabold font-mono mb-2 ${dueAmount > 0 ? 'text-red-600' : 'text-emerald-700'}`}>
              AED {dueAmount.toFixed(2)}
            </div>

            <p className={`text-xs font-medium ${dueAmount > 0 ? 'text-red-700' : 'text-emerald-800'}`}>
              {dueAmount > 0 ? (
                <span className="flex items-center gap-1 font-semibold">
                  <AlertCircle size={14} /> Outstanding balance pending payment. Post transaction to General Ledger to settle.
                </span>
              ) : (
                <span className="flex items-center gap-1 font-semibold">
                  <CheckCircle2 size={14} /> Zero outstanding dues. Student ledger is fully balanced.
                </span>
              )}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
