import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useSocket } from '../../context/SocketContext';
import { X, Droplets, Flame, Sparkles, Send, BellRing, Utensils } from 'lucide-react';

export function CallWaiterModal({ tableNumber, onClose }) {
  const { lang, t } = useLanguage();
  const { playSound, broadcastLocalEvent } = useSocket();
  const [selectedType, setSelectedType] = useState('waiter');
  const [customDetail, setCustomDetail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const options = [
    { id: 'waiter', label: t('askOther'), icon: BellRing, color: 'bg-emerald-600 text-white' },
    { id: 'charcoal', label: 'تغيير فحم الشيشة 🔥', icon: Flame, color: 'bg-amber-600 text-white' },
    { id: 'shisha_head', label: 'تبديل رأس المعسل 💨', icon: Sparkles, color: 'bg-emerald-700 text-white' },
    { id: 'shisha_hose', label: 'طلب لي طبي معقم 🌿', icon: Sparkles, color: 'bg-teal-600 text-white' },
    { id: 'water', label: t('askWater'), icon: Droplets, color: 'bg-emerald-500 text-white' },
    { id: 'napkins', label: t('askNapkins'), icon: Utensils, color: 'bg-slate-700 text-white' },
  ];

  const handleSendCall = async () => {
    setLoading(true);
    const callPayload = {
      id: Date.now(),
      table_number: parseInt(tableNumber, 10) || 1,
      type: selectedType,
      detail: customDetail,
      payment_preference: 'cash',
      status: 'pending',
      created_at: new Date().toISOString()
    };

    // 1. Broadcast to all screens and play chime immediately
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
              <BellRing className="w-5 h-5 text-emerald-600" />
              {t('selectAssistanceType')} #{tableNumber}
            </h3>
            <p className="text-xs text-slate-500 font-tajawal mt-0.5">
              {lang === 'ar' ? 'سيصلك الويتر خلال لحظات' : 'A waiter will attend your table shortly'}
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
              {t('callSent')}
            </h4>
            <p className="text-xs text-slate-500 font-tajawal">
              {lang === 'ar' ? 'الويتر في طريقه إلى طاولتك الآن' : 'Our team has received your call'}
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {options.map((opt) => {
                const Icon = opt.icon;
                const isSelected = selectedType === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedType(opt.id)}
                    className={`p-3.5 rounded-2xl border text-right sm:text-center flex items-center sm:flex-col justify-start sm:justify-center gap-2.5 transition-all ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-1 ring-emerald-500/40 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${opt.color} shadow-sm flex-shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold leading-tight">{opt.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Optional note */}
            <div>
              <input
                type="text"
                value={customDetail}
                onChange={(e) => setCustomDetail(e.target.value)}
                placeholder={lang === 'ar' ? 'تفاصيل إضافية للطلب (اختياري)...' : 'Additional note for waiter (optional)...'}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white"
              />
            </div>

            {/* Action */}
            <button
              onClick={handleSendCall}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-sm shadow-emerald-700/20 flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-50 active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? t('loading') : t('sendCall')}</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
