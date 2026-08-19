import React from 'react';
import { 
  X, UserCheck, BookOpen, Clock, ShieldCheck, Mail, Phone, 
  DollarSign, Sparkles, CreditCard, Tag, Calendar, BadgeCheck
} from 'lucide-react';

export default function StudentProfileDrawer({ student, onClose, onSettleDue }) {
  if (!student) return null;

  const dueAmount = parseFloat(student.due_amount || 0);

  return (
    <div className="fixed top-0 right-0 h-full w-[460px] max-w-full z-50 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl p-6 overflow-y-auto flex flex-col justify-between transition-all">
      <div>
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-extrabold text-lg shadow-md">
              {student.name ? student.name.charAt(0) : 'S'}
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                {student.name}
              </h3>
              <div className="text-xs text-slate-500 font-mono">
                ID: {student.id} • {student.standard || 'Grade 10'}
              </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
            title="Close Drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Program & Status Badges */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
            <BookOpen size={13} /> {student.program === 'Both' ? 'Tuition & Daycare' : (student.program || 'Tuition & Daycare')}
          </span>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5 ${dueAmount > 0 ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
            <BadgeCheck size={13} /> {dueAmount > 0 ? 'Payment Pending' : 'Clear Ledger'}
          </span>
        </div>

        {/* Key Summary Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="text-[0.7rem] uppercase font-bold text-slate-500 mb-1 flex items-center gap-1">
              <DollarSign size={12} /> Outstanding Balance
            </div>
            <div className={`text-base font-extrabold font-mono ${dueAmount > 0 ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>
              AED {dueAmount.toFixed(2)}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="text-[0.7rem] uppercase font-bold text-slate-500 mb-1 flex items-center gap-1">
              <Tag size={12} /> RFID Tag Code
            </div>
            <div className="text-sm font-extrabold font-mono text-slate-800 dark:text-slate-200">
              TAG-{String(student.id).substring(0, 8).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Section 1: Parent & Contact Info */}
        <div className="mb-6">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <UserCheck size={14} /> Parent & Contact Particulars
          </h4>
          <div className="space-y-2.5 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm">
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
              <span className="text-slate-500 text-xs flex items-center gap-1.5"><Phone size={13} /> Parent Phone</span>
              <span className="font-semibold">{student.parent_phone || '+971 50 123 4567'}</span>
            </div>
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
              <span className="text-slate-500 text-xs flex items-center gap-1.5"><Mail size={13} /> Email Address</span>
              <span className="font-semibold">{student.parent_email || 'parent@uaeerp.ae'}</span>
            </div>
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
              <span className="text-slate-500 text-xs flex items-center gap-1.5"><Calendar size={13} /> Date of Birth</span>
              <span className="font-semibold">{student.dob || '2012-05-14'}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Billing & Program Details */}
        <div className="mb-6">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <CreditCard size={14} /> Academic & Daycare Billing Profile
          </h4>
          <div className="space-y-2.5 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-sm">
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
              <span className="text-slate-500 text-xs">Tuition Monthly Fee</span>
              <span className="font-mono font-bold">AED 1,200.00</span>
            </div>
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
              <span className="text-slate-500 text-xs">Daycare Rate</span>
              <span className="font-mono font-bold">AED 35.00 / hr</span>
            </div>
            <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
              <span className="text-slate-500 text-xs">General Ledger Status</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">Synchronized</span>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer Action Footer */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex gap-3 mt-4">
        {dueAmount > 0 && onSettleDue && (
          <button 
            onClick={() => { onSettleDue(student.id); onClose(); }}
            className="flex-1 py-2.5 px-4 bg-black text-white dark:bg-white dark:text-black font-bold rounded-xl text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-md"
          >
            <DollarSign size={16} /> Settle AED {dueAmount.toFixed(2)}
          </button>
        )}
        <button 
          onClick={onClose}
          className="flex-1 py-2.5 px-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center"
        >
          Close Drawer
        </button>
      </div>
    </div>
  );
}
