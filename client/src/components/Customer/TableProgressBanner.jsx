import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useSocket } from '../../context/SocketContext';
import { Clock, ChefHat, CheckCircle2, Sparkles, Utensils, AlertCircle } from 'lucide-react';

export function TableProgressBanner({ tableNumber }) {
  const { lang, t } = useLanguage();
  const { lastEvent } = useSocket();
  const [activeOrder, setActiveOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTableOrder = async () => {
    try {
      const res = await fetch(`http://${window.location.hostname}:3001/api/orders/table/${tableNumber}`);
      const json = await res.json();
      if (json.success) {
        setActiveOrder(json.data);
      }
    } catch (err) {
      console.warn('Error fetching table order:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTableOrder();
  }, [tableNumber]);

  // Listen to socket order status updates
  useEffect(() => {
    if (lastEvent) {
      if (
        (lastEvent.type === 'NEW_ORDER' && lastEvent.payload.table_number === tableNumber) ||
        (lastEvent.type === 'ORDER_STATUS_CHANGED' && lastEvent.payload.table_number === tableNumber) ||
        (lastEvent.type === 'TABLE_ORDER_STATUS') ||
        (lastEvent.type === 'CLIENT_ORDER_READY' && lastEvent.payload.tableNumber === tableNumber)
      ) {
        fetchTableOrder();
      }
    }
  }, [lastEvent, tableNumber]);

  if (loading || !activeOrder) return null;

  const status = activeOrder.status; // 'pending', 'preparing', 'ready', 'delivered'
  const isPending = status === 'pending';
  const isPreparing = status === 'preparing';
  const isReady = status === 'ready';
  const isDelivered = status === 'delivered';

  const totalCount = activeOrder.items ? activeOrder.items.reduce((sum, it) => sum + it.quantity, 0) : 0;
  const finishedCount = activeOrder.items ? activeOrder.items.filter(it => it.status === 'ready').reduce((sum, it) => sum + it.quantity, 0) : 0;

  return (
    <div className="mb-6 rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm p-4 sm:p-5 relative">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center flex-shrink-0">
            {isReady ? <Sparkles className="w-5 h-5 text-emerald-600 animate-spin" /> : <ChefHat className="w-5 h-5 animate-pulse" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                {t('tableOrderProgress')} #{activeOrder.table_number}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {activeOrder.order_number}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-tajawal">
              {t('orderCounting')}: <strong className="text-emerald-700">{finishedCount} / {totalCount}</strong> {lang === 'ar' ? 'صنف جاهز' : 'items ready'}
            </p>
          </div>
        </div>

        {/* Current status pill */}
        <div className={`px-3 py-1.5 rounded-xl text-xs font-bold self-start sm:self-auto flex items-center gap-1.5 ${
          isReady
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 animate-pulse'
            : isPreparing
            ? 'bg-amber-50 text-amber-700 border border-amber-200'
            : isDelivered
            ? 'bg-slate-100 text-slate-700 border border-slate-200'
            : 'bg-slate-50 text-slate-600 border border-slate-200'
        }`}>
          {isReady ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{t('stageReady')}</span>
            </>
          ) : isPreparing ? (
            <>
              <Clock className="w-4 h-4 text-amber-600 animate-spin" />
              <span>{t('stagePreparing')}</span>
            </>
          ) : isDelivered ? (
            <>
              <Utensils className="w-4 h-4 text-slate-600" />
              <span>{t('stageDelivered')}</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 text-slate-600" />
              <span>{t('stageReceived')}</span>
            </>
          )}
        </div>
      </div>

      {/* 4-Step Progress Tracker */}
      <div className="mt-4 pt-1">
        <div className="grid grid-cols-4 gap-2 text-center">
          
          {/* Step 1: Received */}
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              isPending || isPreparing || isReady || isDelivered
                ? 'bg-emerald-600 text-white font-extrabold shadow-sm'
                : 'bg-slate-100 text-slate-400'
            }`}>
              1
            </div>
            <span className="text-[11px] font-bold mt-1.5 text-slate-700 truncate max-w-full">
              {t('stageReceived')}
            </span>
          </div>

          {/* Step 2: Preparing */}
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              isPreparing || isReady || isDelivered
                ? 'bg-emerald-600 text-white font-extrabold shadow-sm animate-pulse'
                : 'bg-slate-100 text-slate-400'
            }`}>
              2
            </div>
            <span className="text-[11px] font-bold mt-1.5 text-slate-700 truncate max-w-full">
              {t('stagePreparing')}
            </span>
          </div>

          {/* Step 3: Ready & Coming */}
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              isReady || isDelivered
                ? 'bg-emerald-600 text-white font-extrabold shadow-sm ring-2 ring-emerald-200'
                : 'bg-slate-100 text-slate-400'
            }`}>
              {isReady ? '✅' : '3'}
            </div>
            <span className={`text-[11px] font-bold mt-1.5 truncate max-w-full ${isReady ? 'text-emerald-700 font-extrabold' : 'text-slate-700'}`}>
              {lang === 'ar' ? 'جاهز وفي الطريق' : 'Ready & Coming'}
            </span>
          </div>

          {/* Step 4: Delivered */}
          <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              isDelivered
                ? 'bg-emerald-600 text-white font-extrabold shadow-sm'
                : 'bg-slate-100 text-slate-400'
            }`}>
              4
            </div>
            <span className="text-[11px] font-bold mt-1.5 text-slate-700 truncate max-w-full">
              {t('stageDelivered')}
            </span>
          </div>

        </div>

        {/* Special Banner when Finished ✅ */}
        {isReady && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-emerald-800 text-xs sm:text-sm font-bold font-tajawal animate-bounce-short">
            <Sparkles className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{t('orderComingNotification')}</span>
          </div>
        )}
      </div>

    </div>
  );
}
