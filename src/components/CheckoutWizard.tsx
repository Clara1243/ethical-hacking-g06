import React, { useState } from 'react';
import { Course, Receipt } from '../types';
import { 
  CreditCard, 
  Wallet, 
  Building2, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

interface CheckoutWizardProps {
  course: Course;
  buyerName: string;
  buyerEmail: string;
  onComplete: (receipt: Receipt) => void;
  onCancel: () => void;
}

export const CheckoutWizard: React.FC<CheckoutWizardProps> = ({
  course,
  buyerName,
  buyerEmail,
  onComplete,
  onCancel,
}) => {
  const [step, setStep] = useState<2 | 3 | 4>(2);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'ewallet' | 'banking'>('card');
  
  const originalPrice = 149.00;
  
  // State to capture the potentially tampered DOM value for the receipt
  const [tamperedAmount, setTamperedAmount] = useState<number>(originalPrice);

  // Form Details
  const [bankAccount, setBankAccount] = useState('');
  const [selectedBank, setSelectedBank] = useState('Unity Cooperative Bank');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [ewalletPin, setEwalletPin] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardCcv, setCardCcv] = useState('');
  const [cardHolder, setCardHolder] = useState(buyerName);
  const [cardExpiry, setCardExpiry] = useState('');

  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  const handleCompletePayment = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Read directly from the DOM to allow classic hidden field tampering via DevTools
    const amountInput = document.getElementById('secure-hidden-amount-input') as HTMLInputElement | null;
    const currentVal = amountInput ? parseFloat(amountInput.value) : originalPrice;
    setTamperedAmount(isNaN(currentVal) ? originalPrice : currentVal);
    
    // Simple mock validation of fields
    if (paymentMethod === 'banking' && (!bankAccount.trim() || !selectedBank)) {
      setPaymentError('Please fill in bank account number and select a valid bank.');
      return;
    }
    if (paymentMethod === 'ewallet' && (!phoneNumber.trim() || ewalletPin.length !== 6)) {
      setPaymentError('Please fill in phone number and a valid 6-digit e-wallet security PIN.');
      return;
    }
    if (paymentMethod === 'card' && (!cardNumber.trim() || cardCcv.length < 3 || !cardExpiry.includes('/'))) {
      setPaymentError('Please enter valid credit card particulars. Note expiration format must be MM/YY.');
      return;
    }

    setPaymentError(null);
    setStep(4);
  };

  const handleFinalize = () => {
    const invoiceId = Math.floor(Math.random() * 90000) + 10000;
    
    // Format payment method display text
    let methodText = 'Visa •••• 4242';
    if (paymentMethod === 'ewallet') {
      const lastDigits = phoneNumber.trim().slice(-4) || '2334';
      methodText = `E-Wallet •••• ${lastDigits}`;
    } else if (paymentMethod === 'banking') {
      methodText = selectedBank || 'Online Banking';
    } else if (paymentMethod === 'card') {
      const lastDigits = cardNumber.trim().replace(/\s+/g, '').slice(-4) || '4242';
      methodText = `Visa •••• ${lastDigits}`;
    }

    const newReceipt: Receipt = {
      id: invoiceId,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      amount: tamperedAmount,
      courseId: course.id,
      courseTitle: course.title,
      buyerName: buyerName,
      buyerEmail: buyerEmail,
      status: 'Paid',
      instructor: course.instructor || 'Dr. Sarah Chen',
      paymentMethod: methodText
    };

    onComplete(newReceipt);
  };

  return (
    <div id="checkout-wizard-box" className="bg-slate-50 border border-gray-200 rounded-2xl p-6 shadow-sm max-w-2xl mx-auto my-6 space-y-6">
      {/* Checkout Progress Header bar */}
      <div className="flex items-center justify-between border-b border-gray-150 pb-4">
        <div>
          <h2 className="text-md font-black text-slate-900">Secure Enrollment Checkout</h2>
          <p className="text-xs text-gray-400">Course Index: <span className="font-mono">{course.id}</span></p>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold">
          <span className={`px-2 py-0.5 rounded ${step === 2 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>1. Confirm</span>
          <span className="text-gray-300">→</span>
          <span className={`px-2 py-0.5 rounded ${step === 3 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>2. Pay</span>
          <span className="text-gray-300">→</span>
          <span className={`px-2 py-0.5 rounded ${step === 4 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>3. Result</span>
        </div>
      </div>

      {/* STEP 2: CONFIRMATION PAGE */}
      {step === 2 && (
        <form onSubmit={handleProceedToPayment} className="space-y-6">
          <div className="bg-white border border-gray-150 rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Selected Enrollment</span>
              <h3 className="text-sm font-extrabold text-slate-800 leading-tight">{course.title}</h3>
              <p className="text-xs text-indigo-600 font-mono">Instructor: {course.instructor}</p>
            </div>
            <div className="bg-slate-100 px-4 py-2 rounded-xl text-center shrink-0 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-gray-400 block font-mono">Course Price</span>
              <span id="wizard-visible-price" className="text-md font-black text-slate-800">${originalPrice.toFixed(2)}</span>
            </div>
          </div>

          {/* Hidden Form Representation - Vulnerable to DOM manipulation */}
          <div className="hidden">
            <input type="hidden" name="course_id" value={course.id} />
            <input type="hidden" id="secure-hidden-amount-input" name="amount" defaultValue={originalPrice.toFixed(2)} />
            <input type="hidden" name="buyer" value={buyerEmail} />
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2.5">
            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Select Payment Method</label>
            <div className="grid grid-cols-3 gap-3">
              <div 
                onClick={() => setPaymentMethod('card')}
                className={`border p-3.5 rounded-xl flex flex-col items-center gap-2 cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-indigo-600 bg-indigo-50/30 text-indigo-700 font-bold' : 'border-gray-200 bg-white hover:bg-slate-100 text-gray-500'}`}
              >
                <CreditCard size={18} />
                <span className="text-xs">Credit/Debit Card</span>
              </div>

              <div 
                onClick={() => setPaymentMethod('ewallet')}
                className={`border p-3.5 rounded-xl flex flex-col items-center gap-2 cursor-pointer transition-all ${paymentMethod === 'ewallet' ? 'border-indigo-600 bg-indigo-50/30 text-indigo-700 font-bold' : 'border-gray-200 bg-white hover:bg-slate-100 text-gray-500'}`}
              >
                <Wallet size={18} />
                <span className="text-xs">E-Wallet</span>
              </div>

              <div 
                onClick={() => setPaymentMethod('banking')}
                className={`border p-3.5 rounded-xl flex flex-col items-center gap-2 cursor-pointer transition-all ${paymentMethod === 'banking' ? 'border-indigo-600 bg-indigo-50/30 text-indigo-700 font-bold' : 'border-gray-200 bg-white hover:bg-slate-100 text-gray-500'}`}
              >
                <Building2 size={18} />
                <span className="text-xs">Online Banking</span>
              </div>
            </div>
          </div>

          {/* Bottom Action bar */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-150">
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-gray-500 hover:text-gray-800 font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft size={14} /> Back to Catalog
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              Proceed to Payment <ArrowRight size={14} />
            </button>
          </div>
        </form>
      )}

      {/* STEP 3: PAYMENT PAGE */}
      {step === 3 && (
        <form onSubmit={handleCompletePayment} className="space-y-6">
          <div className="bg-slate-150/40 p-4 rounded-xl border border-gray-200 flex justify-between items-center">
            <div>
              <span className="text-[10px] text-gray-400 font-mono font-bold block">ORDER RECAP</span>
              <span className="text-xs text-slate-800 font-bold block truncate max-w-sm">{course.title}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-gray-400 font-mono font-bold block text-right">TOTAL CHARGE</span>
              <span className="text-sm font-black text-indigo-600">${originalPrice.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Enter {paymentMethod === 'card' ? 'Credit Card Information' : paymentMethod === 'ewallet' ? 'E-Wallet Details' : 'Online Banking Particulars'}
            </h3>

            {/* ERROR DISPLAY */}
            {paymentError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-[11px] rounded-lg font-mono flex items-center gap-2">
                <ShieldAlert size={14} className="text-rose-500 shrink-0" />
                <span>{paymentError}</span>
              </div>
            )}

            {/* Bank Fields */}
            {paymentMethod === 'banking' && (
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">Select Participating Bank Institution</label>
                  <select 
                    className="w-full bg-white border border-gray-200 p-2 text-xs rounded-lg font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                  >
                    <option value="Unity Cooperative Bank">Unity Cooperative Bank</option>
                    <option value="Apex Red Team Trust Bank">Apex Red Team Trust Bank</option>
                    <option value="Hacking Lab Financial Services">Hacking Lab Financial Services</option>
                    <option value="Standard Student Savings Union">Standard Student Savings Union</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1">Bank Account Identifier Number</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 1093-4819-2045"
                    className="w-full border border-gray-250 p-2 rounded-lg text-xs font-mono font-bold"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Ewallet Fields */}
            {paymentMethod === 'ewallet' && (
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1 font-mono">LINKED TELEPHONE NUMBER</label>
                  <input 
                    type="tel" 
                    placeholder="+1 (555) 019-2834"
                    className="w-full border border-gray-250 p-2 rounded-lg text-xs"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1 font-mono">6-DIGIT SECURITY PIN</label>
                  <input 
                    type="password" 
                    maxLength={6}
                    placeholder="e.g. 123456"
                    className="w-full border border-gray-255 p-2 rounded-lg text-xs tracking-widest font-mono font-bold"
                    value={ewalletPin}
                    onChange={(e) => setEwalletPin(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Credit Card Fields */}
            {paymentMethod === 'card' && (
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1 font-mono">CARDHOLDER NAME</label>
                  <input 
                    type="text" 
                    placeholder="Jane Doe"
                    className="w-full border border-gray-255 p-2 rounded-lg text-xs"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 block mb-1 font-mono">PRIMARY CARD NUMBER</label>
                  <input 
                    type="text" 
                    placeholder="4111 2222 3333 4444"
                    className="w-full border border-gray-255 p-2 rounded-lg text-xs font-mono"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1 font-mono">EXPIRY DATE (MM/YY)</label>
                    <input 
                      type="text" 
                      placeholder="09/28"
                      className="w-full border border-gray-255 p-2 rounded-lg text-xs font-mono"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 block mb-1 font-mono">SECURITY CARD CODE (CCV)</label>
                    <input 
                      type="password" 
                      maxLength={4}
                      placeholder="123"
                      className="w-full border border-gray-255 p-2 rounded-lg text-xs font-mono"
                      value={cardCcv}
                      onChange={(e) => setCardCcv(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-100 p-3 rounded-lg flex items-center gap-2 text-slate-650 text-[11px] font-mono leading-relaxed">
            <Lock size={12} className="text-indigo-600 shrink-0" />
            <span>Encrypted Checkout: Details submitted remain on local memory.</span>
          </div>

          {/* Bottom actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-150">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-xs text-gray-500 hover:text-gray-800 font-semibold flex items-center gap-1.5 cursor-pointer font-mono"
            >
              <ArrowLeft size={14} /> Back to Step 1
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              Complete Payment & Enliven Workspace
            </button>
          </div>
        </form>
      )}

      {/* STEP 4: PAYMENT RESULT PAGE */}
      {step === 4 && (
        <div className="space-y-6 text-center py-4">
          <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 shadow-sm border border-emerald-250 animate-bounce">
            <ShieldCheck size={28} />
          </div>

          <div className="space-y-2">
            <h3 className="text-md font-extrabold text-slate-800">Enrollment Transaction Approved</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Your payment was accepted! Your student profile is officially enrolled in the syllabus.
            </p>
          </div>

          <div className="bg-white border rounded-xl p-4 text-left max-w-md mx-auto space-y-2 text-xs divide-y divide-gray-100">
            <div className="flex justify-between pb-1.5 font-bold">
              <span className="text-slate-500">Learner Name:</span>
              <span className="text-slate-800">{buyerName}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Purchased Course:</span>
              <span className="text-slate-800 font-semibold truncate max-w-xs">{course.title}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500">Method Used:</span>
              <span className="text-slate-800 uppercase font-bold text-[10px] tracking-wider font-mono">
                {paymentMethod === 'card' ? 'Credit Card' : paymentMethod === 'ewallet' ? 'E-Wallet' : 'Online Banking'}
              </span>
            </div>
            <div className="flex justify-between pt-1.5 font-black text-sm">
              <span className="text-indigo-650">Settled Amount:</span>
              <span className="text-slate-900">${tamperedAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="pt-4 flex justify-center gap-3">
            <button
              onClick={handleFinalize}
              className="px-6 py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg transition-transform transform active:scale-95 cursor-pointer"
            >
              Verify Registered Student & Access Course Materials
            </button>
          </div>
        </div>
      )}
    </div>
  );
};