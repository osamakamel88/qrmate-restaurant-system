import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { X, Lock, KeyRound, Check, ShieldCheck, User, Sparkles } from 'lucide-react';

export function StaffLoginModal({ isOpen, onClose }) {
  const { loginWithPin } = useAuth();
  const { lang } = useLanguage();

  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleKeyPress = (digit) => {
    if (pin.length < 6) {
      setPin(prev => prev + digit);
      setErrorMsg('');
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
    setErrorMsg('');
  };

  const handleSubmit = async (pinToSubmit = pin) => {
    if (!pinToSubmit) return;
    setLoading(true);
    setErrorMsg('');

    const res = await loginWithPin(pinToSubmit);
    setLoading(false);
    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.message || 'رمز PIN غير صالح');
      setPin('');
    }
  };

  // Quick preset shortcuts for demo ease
  const quickProfiles = [
    { label: 'المدير العام', pin: '1234', color: 'border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100' },
    { label: 'كابتن الصالة', pin: '2222', color: 'border-slate-300 text-slate-700 bg-slate-100 hover:bg-slate-200' },
    { label: 'شيف المطبخ', pin: '3333', color: 'border-slate-300 text-slate-700 bg-slate-100 hover:bg-slate-200' },
    { label: 'بارستا وشيشة', pin: '4444', color: 'border-slate-300 text-slate-700 bg-slate-100 hover:bg-slate-200' },
    { label: 'كاشير الفرع', pin: '5555', color: 'border-slate-300 text-slate-700 bg-slate-100 hover:bg-slate-200' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-5 sm:p-6 flex flex-col items-center text-center">
        
        {/* Top Header */}
        <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-emerald-600">
            <Lock className="w-5 h-5" />
            <span className="font-extrabold text-sm text-slate-900">تسجيل دخول طاقم العمل</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-slate-100 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PIN Circles Display */}
        <div className="my-5 space-y-2">
          <p className="text-xs text-slate-500 font-tajawal">
            أدخل كود المرور المكون من 4 أرقام (PIN)
          </p>
          <div className="flex items-center justify-center gap-3 py-2">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full border-2 transition-all ${
                  pin.length > idx
                    ? 'bg-emerald-500 border-emerald-500 scale-110 shadow-sm shadow-emerald-500/50'
                    : 'border-slate-300 bg-slate-100'
                }`}
              />
            ))}
          </div>

          {errorMsg && (
            <p className="text-xs font-bold text-rose-500 animate-pulse">
              {errorMsg}
            </p>
          )}
        </div>

        {/* Touchscreen Numpad Keypad */}
        <div className="grid grid-cols-3 gap-2.5 w-full max-w-[240px] my-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleKeyPress(digit.toString())}
              className="w-16 h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 active:bg-emerald-600 active:text-white text-slate-800 font-mono font-black text-xl flex items-center justify-center shadow-sm transition-all active:scale-95"
            >
              {digit}
            </button>
          ))}

          <button
            type="button"
            onClick={handleClear}
            className="w-16 h-14 rounded-2xl bg-slate-100/80 hover:bg-slate-200 text-slate-500 font-bold text-xs flex items-center justify-center transition-all"
          >
            مسح
          </button>

          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="w-16 h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 active:bg-emerald-600 active:text-white text-slate-800 font-mono font-black text-xl flex items-center justify-center shadow-sm transition-all active:scale-95"
          >
            0
          </button>

          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={pin.length < 4 || loading}
            className="w-16 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-30 text-white font-bold text-xs flex items-center justify-center transition-all shadow-sm"
          >
            {loading ? '...' : <Check className="w-5 h-5" />}
          </button>
        </div>

        {/* Quick Demo Staff Shortcuts */}
        <div className="w-full mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-right">
          <span className="text-[10px] text-slate-400 font-bold block text-center">أو اختر مستخدم للتجربة السريعة:</span>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {quickProfiles.map((p, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPin(p.pin);
                  handleSubmit(p.pin);
                }}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all hover:scale-105 ${p.color}`}
              >
                {p.label} ({p.pin})
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
