import React, { useState, useEffect } from 'react';
import { Globe, ArrowLeft, ArrowRight, RotateCw, AlertTriangle, ShieldCheck } from 'lucide-react';

interface WebAddressBarProps {
  receiptId: number | null;
  onChangeReceiptId: (id: number | null) => void;
  activeTab: string;
  profileEmail: string | null;
  onChangeProfileEmail: (email: string | null) => void;
}

export const WebAddressBar: React.FC<WebAddressBarProps> = ({
  receiptId,
  onChangeReceiptId,
  activeTab,
  profileEmail,
  onChangeProfileEmail,
}) => {
  const [inputValue, setInputValue] = useState('');

  // Sync Input Value when state variables change
  useEffect(() => {
    if (receiptId !== null) {
      setInputValue(`https://eduunity-connect.io/billing/receipt?receipt_id=${receiptId}`);
    } else if (activeTab === 'profile') {
      setInputValue(`https://eduunity-connect.io/profile?email=${profileEmail || ''}`);
    } else {
      setInputValue('https://eduunity-connect.io/dashboard');
    }
  }, [receiptId, activeTab, profileEmail]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Parse receipt_id value or email parameter manually for IDOR pen-tests!
    try {
      const parsedUrl = new URL(inputValue);
      const params = new URLSearchParams(parsedUrl.search);
      
      const rIdStr = params.get('receipt_id');
      const emailStr = params.get('email');

      if (rIdStr) {
        const idNum = parseInt(rIdStr, 10);
        if (!isNaN(idNum)) {
          onChangeReceiptId(idNum);
          onChangeProfileEmail(null);
          return;
        }
      }

      if (emailStr) {
        // IDOR Profile trigger
        onChangeProfileEmail(emailStr);
        onChangeReceiptId(null);
        return;
      }

    } catch {
      // Fallback manual query parsers if they type relative inputs (like ?receipt_id=... or ?email=...)
      if (inputValue.includes('?receipt_id=')) {
        const parts = inputValue.split('?receipt_id=');
        const idNum = parseInt(parts[1], 10);
        if (!isNaN(idNum)) {
          onChangeReceiptId(idNum);
          onChangeProfileEmail(null);
          return;
        }
      }

      if (inputValue.includes('?email=')) {
        const parts = inputValue.split('?email=');
        const email = parts[1].trim();
        if (email) {
          onChangeProfileEmail(email);
          onChangeReceiptId(null);
          return;
        }
      }
    }
    
    // Reset if search yields matching failures
    onChangeReceiptId(null);
    onChangeProfileEmail(null);
  };

  const isProfileMode = activeTab === 'profile';

  return (
    <div id="web-address-bar-container" className="bg-slate-900 border-b border-slate-800 p-2 text-xs text-slate-300">
      <div id="exploit-info-banner" className="flex items-center justify-between px-3 py-1.5 mb-2 bg-amber-950/40 border border-amber-800/60 rounded text-[11px] text-amber-200">
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} className="text-amber-400 shrink-0" />
          <span>
            {isProfileMode ? (
              <span>
                <strong>Profile IDOR Lab:</strong> Tamper with the <code>?email=</code> parameter in the url bar (e.g. set to <code>helen.vance@eduunity.io</code> or <code>admin@eduunity.io</code>) to load and take over other profiles!
              </span>
            ) : (
              <span>
                <strong>Billing IDOR Lab:</strong> Simulate URL context attacks by editing the <code>receipt_id</code> (e.g. set to <code>1041</code>, <code>1042</code>, <code>1043</code>, or <code>1044</code>).
              </span>
            )}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0 bg-amber-800/20 px-2 py-0.5 rounded border border-amber-800/40 font-mono text-[10px]">
          IDOR Active
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-slate-400">
          <button 
            type="button" 
            onClick={() => { onChangeReceiptId(null); onChangeProfileEmail(null); }} 
            className="p-1 hover:bg-slate-800 rounded transition-colors" 
            title="Back to Dashboard"
          >
            <ArrowLeft size={14} />
          </button>
          <button type="button" className="p-1 text-slate-600 cursor-not-allowed">
            <ArrowRight size={14} />
          </button>
          <button type="button" className="p-1 hover:bg-slate-800 rounded transition-colors">
            <RotateCw size={14} />
          </button>
        </div>

        <div className="flex-1 flex items-center gap-2 bg-slate-950 border border-slate-800 rounded px-2.5 py-1">
          <div className="flex items-center gap-1 text-slate-400">
            {receiptId !== null || profileEmail !== null ? (
              <AlertTriangle size={14} className="text-amber-500" />
            ) : (
              <ShieldCheck size={14} className="text-emerald-500" />
            )}
            <Globe size={12} className="text-slate-500" />
          </div>
          <input
            id="simulated-address-input"
            type="text"
            className="w-full bg-transparent text-slate-200 outline-none font-mono text-[11px] placeholder-slate-600"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search or enter web address..."
          />
          <button
            type="submit"
            className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] uppercase font-bold"
          >
            Go
          </button>
        </div>
      </form>
    </div>
  );
};
