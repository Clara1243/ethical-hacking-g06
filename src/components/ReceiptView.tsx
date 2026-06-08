import React from 'react';
import { ArrowLeft, Printer } from 'lucide-react';
import { PaymentReceipt } from '../types';

interface ReceiptViewProps {
  receiptId: number;
  receipts: PaymentReceipt[];
  currentUserEmail: string;
  onBack: () => void;
}

export const ReceiptView: React.FC<ReceiptViewProps> = ({ receiptId, receipts, onBack }) => {
  const receipt = receipts.find(r => r.id === receiptId);

  return (
    <div id="receipt-detail-view" className="py-8 max-w-2xl mx-auto px-4">
      <button onClick={onBack} className="flex items-center gap-2 text-indigo-600 hover:text-indigo-500 font-semibold mb-6 transition-colors group cursor-pointer">
        <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" /> Back
      </button>

      {!receipt ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 font-bold text-lg font-mono">!</div>
          <h3 className="text-md font-bold text-gray-800">Invoice Reference Access Denied</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">The requested invoice index does not map to any active accounts.</p>
          <button onClick={onBack} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors cursor-pointer">Return</button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden font-sans">
          <div className="bg-slate-900 text-white p-6 md:p-8 flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-bold tracking-widest uppercase text-indigo-400 font-mono">EduUnity Connect Invoice</span>
              <h3 className="text-xl font-bold font-sans">Receipt Ref #{receipt.id}</h3>
              <p className="text-[11px] text-slate-450 font-mono">Date: {receipt.date}</p>
            </div>
            <button onClick={() => window.print()} className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors shrink-0" title="Print invoice"><Printer size={16} /></button>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            <div className="bg-slate-50 border border-gray-150 rounded-xl p-5 space-y-4 font-sans text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-0.5"><span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider font-mono">Student</span><p className="text-xs font-bold text-slate-800">{receipt.buyerName}</p></div>
                <div className="space-y-0.5"><span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider font-mono">Email</span><p className="text-xs font-bold font-mono text-slate-600">{receipt.buyerEmail}</p></div>
              </div>
              <hr className="border-gray-150" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-0.5"><span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider font-mono">Course</span><p className="text-xs font-semibold text-slate-800">{receipt.courseTitle}</p></div>
                <div className="space-y-0.5"><span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider font-mono">Instructor</span><p className="text-xs font-bold text-indigo-700">{receipt.instructor || 'Dr. Helen Vance'}</p></div>
              </div>
              <hr className="border-gray-150" />
              <div className="flex items-center justify-between pt-1">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider font-mono">Status</span>
                  <div className="flex items-center gap-1.5 text-emerald-750"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /><span className="text-xs font-bold font-mono uppercase">{receipt.status}</span></div>
                </div>
                <div className="text-right space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider font-mono">Total Paid</span>
                  <p className="text-lg font-black text-slate-900 font-mono">RM{receipt.amount.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};