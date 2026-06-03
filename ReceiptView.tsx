import React from 'react';
import { Users, BookOpen, CreditCard, ShieldAlert, BadgeInfo, ArrowRight } from 'lucide-react';
import { PaymentReceipt, UserProfile } from '../types';

interface AdminPanelProps {
  receipts: PaymentReceipt[];
  users: Record<string, UserProfile>;
  coursesCount: number;
  onViewReceipt: (id: number) => void;
  mode: 'dashboard' | 'ledger';
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  receipts,
  users,
  coursesCount,
  onViewReceipt,
  mode,
}) => {
  // Stats calculate
  const totalUsersInDb = Object.keys(users).length;
  const totalEnrollments = receipts.length;
  const totalRevenue = receipts.reduce((sum, r) => sum + (r.status === 'Paid' ? r.amount : 0), 0);

  if (mode === 'dashboard') {
    return (
      <div id="admin-dashboard-container" className="py-8 max-w-7xl mx-auto px-4 space-y-8">
        {/* Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200 pb-4">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">System Performance & Metrics Dashboard</h2>
            <p className="text-xs text-slate-500 font-mono mt-1">
              Main portal analytics, transaction summaries, and connected academic engagement volumes.
            </p>
          </div>
          <div className="mt-2 md:mt-0 flex items-center gap-1.5 px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold rounded-full font-mono">
            <ShieldAlert size={14} />
            System Privilege Status
          </div>
        </div>

        {/* Metrics Blocks */}
        <div id="admin-stats-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-indigo-55 text-indigo-600 rounded-xl">
              <Users size={20} />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Active Users</span>
              <span className="text-lg font-black text-gray-900 font-mono">{totalUsersInDb}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <BookOpen size={20} />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Syllabus Courses</span>
              <span className="text-lg font-black text-gray-900 font-mono">{coursesCount}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <CreditCard size={20} />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Purchase Counts</span>
              <span className="text-lg font-black text-gray-900 font-mono">{totalEnrollments}</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
              <span className="font-extrabold text-teal-700 font-mono text-sm">$</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider">Registered Income</span>
              <span className="text-lg font-black text-gray-900 font-mono">${totalRevenue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Security Lab Notice */}
        <div className="bg-indigo-900 text-white p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800 shadow-md">
          <div className="space-y-1">
            <span className="text-[9px] font-mono font-bold text-indigo-300 uppercase tracking-widest">Platform Security Administration</span>
            <h3 className="text-sm font-bold">EduUnity Cyber Range & Pen-Testing Playground</h3>
            <p className="text-xs text-indigo-200 max-w-xl">
              This special EduUnity Connect build was deliberately crafted with severe real-world security vulnerabilities to demonstrate core software engineering pitfalls. Access pages via the custom navigation bar to execute IDOR, XSS and file upload bypass tests.
            </p>
          </div>
          <div className="px-4 py-2 bg-indigo-950 border border-indigo-700/55 rounded-xl font-mono text-center shrink-0">
            <span className="text-[9px] text-indigo-300 block">LAB STATE</span>
            <span className="text-xs font-bold text-emerald-400">● LIVE RUNNING</span>
          </div>
        </div>
      </div>
    );
  }

  // GLOBAL BILLING LEDGER VIEW
  return (
    <div id="admin-ledger-container" className="py-8 max-w-7xl mx-auto px-4 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Global Billing Ledger & Invoices</h2>
          <p className="text-xs text-gray-500 font-mono mt-1">List of all system transactions, buyer associations, and invoice credentials.</p>
        </div>
        <div className="mt-2 md:mt-0 text-[10px] font-mono text-amber-600 bg-amber-50 px-2.5 py-1 border border-amber-200 rounded-full font-bold">
          IDOR Vulnerable: Direct Receipt Query Parameter active
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="overflow-x-auto">
          <table id="tbl-admin-ledger" className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 text-slate-400 font-mono font-bold uppercase text-[9px] tracking-wider">
                <th className="py-2.5 px-2">Receipt ID</th>
                <th className="py-2.5 px-2">Client name</th>
                <th className="py-2.5 px-2">Course Module Ordered</th>
                <th className="py-2.5 px-2">Paid Cost</th>
                <th className="py-2.5 px-2">Status</th>
                <th className="py-2.5 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-mono">
              {receipts.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-2 font-bold text-indigo-650">#{rec.id}</td>
                  <td className="py-3 px-2 font-sans">
                    <span className="font-bold text-slate-800 block text-[11px]">{rec.buyerName}</span>
                    <span className="text-[9px] text-gray-400 font-mono block">{rec.buyerEmail}</span>
                  </td>
                  <td className="py-3 px-2 max-w-xs truncate font-sans text-slate-700" title={rec.courseTitle}>
                    {rec.courseTitle}
                  </td>
                  <td className="py-3 px-2 font-bold text-slate-900">${rec.amount.toFixed(2)}</td>
                  <td className="py-3 px-2 font-sans">
                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full ${
                      rec.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {rec.status}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <button
                      onClick={() => onViewReceipt(rec.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 hover:text-indigo-600 rounded-lg font-bold text-[10px] transition-colors cursor-pointer"
                    >
                      Inspect Receipt
                      <ArrowRight size={10} />
                    </button>
                  </td>
                </tr>
              ))}
              {receipts.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 font-sans">No financial logs recorded.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
