import React, { useState, useEffect } from 'react';
import { Table, Download, Lock, CheckCircle2 } from 'lucide-react';
import { Receipt } from '../types';

interface BillingHistoryProps {
  userId: number;
  userEmail: string;
  onViewReceipt: (id: number) => void;
}

export const BillingHistory: React.FC<BillingHistoryProps> = ({ userId, userEmail, onViewReceipt }) => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    fetch(`http://192.168.56.1:3000/api/receipts?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId.toString()
      }
    })
      .then(res => {
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        return res.json();
      })
      .then((data: Receipt[]) => {
        if (Array.isArray(data)) setReceipts(data);
      })
      .catch(err => {
        console.error('Failed to fetch billing history:', err);
        setError('Could not load billing history. Please try again later.');
      })
      .finally(() => setIsLoading(false));
  }, [userId]);

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-gray-500 font-bold font-mono">Retrieving Billing Records...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 max-w-4xl mx-auto px-4">
        <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-6 text-sm font-medium text-center">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div id="billing-history-container" className="py-8 max-w-4xl mx-auto px-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Your Checkout & Billing History</h2>
          <p className="text-xs text-slate-500 font-mono mt-1">Access secure transactional references and custom print layouts.</p>
        </div>
        <div className="mt-2 sm:mt-0 items-center flex gap-1 bg-slate-100 px-2.5 py-1 text-slate-600 rounded text-xs font-mono">
          <Lock size={12} /><span>Client Encryption Active</span>
        </div>
      </div>

      {receipts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center space-y-3">
          <div className="mx-auto w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
            <Table size={20} />
          </div>
          <p className="text-sm font-medium text-gray-650">No purchases found in your account.</p>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Browse the course catalog, choose a topic, and enroll to populate invoice histories.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-gray-150 text-slate-400 font-mono uppercase text-[9px] tracking-wider font-bold">
                  <th className="py-3.5 px-4">Invoice ID</th>
                  <th className="py-3.5 px-4">Cooperative Course Ordered</th>
                  <th className="py-3.5 px-4">Transaction Date</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150">
                {receipts.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-indigo-650">#{rec.id}</td>
                    <td className="py-4 px-4 font-semibold text-slate-800 font-sans">{rec.courseTitle}</td>
                    <td className="py-4 px-4 text-slate-500 font-mono">{rec.date}</td>
                    
                    {/* CRITICAL FIX: Cast rec.amount to Number before calling toFixed */}
                    <td className="py-4 px-4 font-mono font-bold text-slate-900">${Number(rec.amount).toFixed(2)}</td>
                    
                    <td className="py-4 px-4">
                      <div className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 text-[10px] uppercase font-bold font-sans">
                        <CheckCircle2 size={10} className="text-emerald-500" />
                        <span>{rec.status}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => onViewReceipt(rec.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] uppercase rounded-lg shadow-xs transition-transform transform active:scale-95 cursor-pointer"
                      >
                        <Download size={11} /> View Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};