import React, { useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useLanguage } from '../../context/LanguageContext';
import { Bell, CheckCircle2, AlertTriangle, X, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export function ToastNotification() {
  const { activeNotification, clearNotification } = useSocket();
  const { lang } = useLanguage();

  useEffect(() => {
    if (activeNotification) {
      // Trigger confetti if order is ready
      if (activeNotification.isOrderReady) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.2 },
            colors: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899']
          });
        } catch (e) {}
      }

      const timer = setTimeout(() => {
        clearNotification();
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [activeNotification]);

  if (!activeNotification) return null;

  const isSuccess = activeNotification.type === 'success';
  const isWarning = activeNotification.type === 'warning';

  return (
    <div className="fixed top-20 right-4 left-4 sm:left-auto sm:right-6 z-50 max-w-md animate-bounce-short">
      <div className={`p-4 rounded-2xl border shadow-xl backdrop-blur-lg flex items-start gap-3.5 ${
        isSuccess
          ? 'bg-white border-emerald-300 text-slate-900 shadow-emerald-500/10'
          : isWarning
          ? 'bg-white border-amber-300 text-slate-900 shadow-amber-500/10'
          : 'bg-white border-slate-200 text-slate-900 shadow-slate-500/10'
      }`}>
        <div className={`p-2 rounded-xl flex-shrink-0 ${
          isSuccess ? 'bg-emerald-50 text-emerald-600' : isWarning ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'
        }`}>
          {isSuccess ? <CheckCircle2 className="w-5 h-5 animate-pulse" /> : isWarning ? <AlertTriangle className="w-5 h-5 animate-bounce" /> : <Bell className="w-5 h-5" />}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-1.5">
            {lang === 'ar' ? activeNotification.title : (activeNotification.titleEn || activeNotification.title)}
            {isSuccess && <Sparkles className="w-4 h-4 text-emerald-500 inline" />}
          </h4>
          <p className="text-xs sm:text-sm mt-0.5 text-slate-600 leading-relaxed font-tajawal">
            {activeNotification.desc}
          </p>
        </div>

        <button
          onClick={clearNotification}
          className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
