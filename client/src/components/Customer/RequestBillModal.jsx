import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useSocket } from '../../context/SocketContext';
import { X, Receipt, Check, CreditCard, Banknote, Smartphone, Sparkles, Send } from 'lucide-react';

export function RequestBillModal({ tableNumber, onClose }) {
  const { lang, t } = useLanguage();
  const { playSound, broadcastLocalEvent } = useSocket();
  const [paymentPref, setPaymentPref] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const paymentOptions = [
    { id: 'cash', label: t('cash'), icon: Banknote, color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
    { id: 'card', label: t('card'), icon: CreditCard, color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
    { id: 'instapay', label: t('instapay'), icon: Smartphone, color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' },
    { id: 'vodafone_cash', label: t('vodafoneCash'), icon: Smartphone, color: 'text-rose-400 border-rose-500/30 bg-rose-500/10' },
  ];

  const handleSendBillRequest = async () => {
    setLoading(true);
    const callPayload = {
      id: Date.now(),
      table_number: parseInt(tableNumber, 10) || 1,
      type: 'bill',
      detail: `طريقة الدفع المطلوبة: ${paymentPref}`,
      payment_preference: paymentPref,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    // 1. Broadcast to all screens and trigger bell ring
    if (broadcastLocalEvent) {
      broadcastLocalEvent('NEW_TABLE_CALL', callPayload);
    }

    try {
      await fetch(`http://${window.location.hostname}:3001/api/calls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(callPayload)
      }).catch(() => null);

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1600);
    } catch (err) {
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1600);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-5 sm:p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-amber-400" />
              {t('requestBillTitle')} #{tableNumber}
            </h3>
            <p className="text-xs text-slate-400 font-tajawal mt-0.5">
              {lang === 'ar' ? 'حدد طريقة الدفع وسيقوم الكاشير والويتر بتجهيز الشيك' : 'Select payment method and our staff will bring the check'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto animate-bounce-short">
              <Sparkles className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-extrabold text-white">
              {t('billRequested')}
            </h4>
            <p className="text-xs text-slate-400 font-tajawal">
              {lang === 'ar' ? 'الويتر في طريقه إليك مع الفاتورة وماكينة الدفع' : 'Staff is bringing your receipt and POS terminal'}
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <label className="text-xs font-bold text-slate-300 block">
              {t('preferredPayment')}
            </label>

            <div className="space-y-2">
              {paymentOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = paymentPref === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPaymentPref(opt.id)}
                    className={`w-full p-3.5 rounded-2xl border text-right flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-2 ring-amber-500/40 shadow-lg'
                        : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl border ${opt.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs sm:text-sm font-bold">{opt.label}</span>
                    </div>

                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                      isSelected ? 'border-amber-400 bg-amber-500 text-black' : 'border-slate-600'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Submit */}
            <button
              onClick={handleSendBillRequest}
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg shadow-orange-950/60 flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? t('loading') : t('sendBillRequest')}</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
