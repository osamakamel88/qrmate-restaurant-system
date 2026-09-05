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
    { id: 'cash', label: t('cash'), icon: Banknote, color: 'text-emerald-700 border-emerald-200 bg-emerald-50' },
    { id: 'card', label: t('card'), icon: CreditCard, color: 'text-emerald-700 border-emerald-200 bg-emerald-50' },
    { id: 'instapay', label: t('instapay'), icon: Smartphone, color: 'text-emerald-700 border-emerald-200 bg-emerald-50' },
    { id: 'vodafone_cash', label: t('vodafoneCash'), icon: Smartphone, color: 'text-emerald-700 border-emerald-200 bg-emerald-50' },
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-5 sm:p-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-600" />
              {t('requestBillTitle')} #{tableNumber}
            </h3>
            <p className="text-xs text-slate-500 font-tajawal mt-0.5">
              {lang === 'ar' ? 'حدد طريقة الدفع وسيقوم الكاشير والويتر بتجهيز الشيك' : 'Select payment method and our staff will bring the check'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto animate-bounce-short">
              <Sparkles className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-extrabold text-slate-900">
              {t('billRequested')}
            </h4>
            <p className="text-xs text-slate-500 font-tajawal">
              {lang === 'ar' ? 'الويتر في طريقه إليك مع الفاتورة وماكينة الدفع' : 'Staff is bringing your receipt and POS terminal'}
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <label className="text-xs font-bold text-slate-700 block">
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
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-500/40 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl border ${opt.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs sm:text-sm font-bold">{opt.label}</span>
                    </div>

                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                      isSelected ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300'
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
              className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-sm shadow-emerald-700/20 flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-50 active:scale-95"
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
