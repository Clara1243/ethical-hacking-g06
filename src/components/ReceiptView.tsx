import React from 'react';
import { ArrowLeft, Printer, ShieldAlert, BadgeInfo, CreditCard, ChevronRight, Check } from 'lucide-react';
import { PaymentReceipt } from '../types';

interface ReceiptViewProps {
  receiptId: number;
  receipts: PaymentReceipt[];
  currentUserEmail: string;
  onBack: () => void;
}

export const ReceiptView: React.FC<ReceiptViewProps> = ({
  receiptId,
  receipts,
  currentUserEmail,
  onBack,
}) => {
  // Direct Object Reference lookup: search receipts list directly by receiptId
  const receipt = receipts.find(r => r.id === receiptId);

  // Analyze if there is a cross-user exposure (IDOR detection)
  const isCrossOriginExposure = receipt ? receipt.buyerEmail.toLowerCase() !== currentUserEmail.toLowerCase() : false;

  return (
    <div id="receipt-detail-view" className="py-8 max-w-2xl mx-auto px-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-500 font-semibold mb-6 transition-colors group cursor-pointer"
      >
        <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      {/* Cyber Security IDOR Banner indicator */}
      {receipt && isCrossOriginExposure && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-300 text-rose-900 rounded-xl space-y-2 text-xs font-sans shadow-md animate-pulse">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
            <ShieldAlert size={18} className="text-rose-500 shrink-0" />
            <span>IDOR Leak Detected (Insecure Direct Object Reference)</span>
          </div>
          <p>
            You are logged in as <code className="bg-rose-100 px-1 py-0.5 rounded font-black font-mono">{currentUserEmail}</code>, but you are currently viewing the receipt of <strong className="underline">{receipt.buyerName}</strong> (<code className="bg-rose-100 px-1 py-0.5 rounded font-black font-mono">{receipt.buyerEmail}</code>).
          </p>
          <p className="font-semibold text-rose-700">
            This confirms that accessing sequential numeric ID params (e.g., <code>?receipt_id={receiptId}</code>) bypasses session authorization controls. Excellent educational demonstration!
          </p>
        </div>
      )}

      {!receipt ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 font-bold text-lg font-mono">
            !
          </div>
          <h3 className="text-md font-bold text-gray-800">Invoice Reference Access Denied</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            The requested sequential invoice index <code>{receiptId}</code> does not map to any active accounts in the ledger registry, or permission parameters crashed.
          </p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors cursor-pointer"
          >
            Review Catalog
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden font-sans">
          {/* Receipt header */}
          <div className="bg-slate-900 text-white p-6 md:p-8 flex justify-between items-start">
            <div className="space-y-1">
              <span className="text-[10px] font-bold tracking-widest uppercase text-indigo-400 font-mono">EduUnity Connect Invoice</span>
              <h3 className="text-xl font-bold font-sans">Receipt Ref #{receipt.id}</h3>
              <p className="text-[11px] text-slate-450 font-mono">Date: {receipt.date}</p>
            </div>
            
            <button
              onClick={() => window.print()}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors shrink-0"
              title="Print invoice"
            >
              <Printer size={16} />
            </button>
          </div>

          {/* Receipt details body */}
          <div className="p-6 md:p-8 space-y-6">
            <div className="bg-slate-50 border border-gray-150 rounded-xl p-5 space-y-4 font-sans text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Student */}
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider font-mono">Student</span>
                  <p id="receipt-student-name" className="text-xs font-bold text-slate-800">{receipt.buyerName}</p>
                </div>

                {/* Email */}
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider font-mono">Email</span>
                  <p id="receipt-student-email" className="text-xs font-bold font-mono text-slate-600">{receipt.buyerEmail}</p>
                </div>
              </div>

              <hr className="border-gray-150" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Course */}
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider font-mono">Course</span>
                  <p id="receipt-course-title" className="text-xs font-semibold text-slate-800">{receipt.courseTitle}</p>
                </div>

                {/* Instructor */}
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider font-mono">Instructor</span>
                  <p id="receipt-course-instructor" className="text-xs font-bold text-indigo-700">{receipt.instructor || 'Dr. Helen Vance'}</p>
                </div>
              </div>

              <hr className="border-gray-150" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Date */}
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider font-mono">Date</span>
                  <p id="receipt-date-string" className="text-xs font-bold font-mono text-slate-700">{receipt.date}</p>
                </div>

                {/* Payment Method */}
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider font-mono">Payment Method</span>
                  <p id="receipt-payment-method" className="text-xs font-bold font-mono text-slate-705">{receipt.paymentMethod || 'Visa •••• 4242'}</p>
                </div>
              </div>

              <hr className="border-gray-150" />

              {/* Total Paid block */}
              <div className="flex items-center justify-between pt-1">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider font-mono">Status</span>
                  <div className="flex items-center gap-1.5 text-emerald-750">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold font-mono uppercase">{receipt.status}</span>
                  </div>
                </div>

                <div className="text-right space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider font-mono">Total Paid</span>
                  <p id="receipt-total-paid" className="text-lg font-black text-slate-900 font-mono">RM{receipt.amount.toFixed(2)}</p>
                </div>
              </div>

            </div>

            <div className="pt-2 text-center">
              <p className="text-[10px] text-slate-400 leading-normal max-w-sm mx-auto font-mono">
                Thank you for practicing unity and student cooperation with EduUnity Connect. Read, participate, and build secure systems together.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
