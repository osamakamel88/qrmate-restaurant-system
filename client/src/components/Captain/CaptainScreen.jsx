import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useSocket } from '../../context/SocketContext';
import { 
  BellRing, 
  Receipt, 
  Flame, 
  Droplets, 
  Utensils, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  UserCheck,
  Volume2,
  VolumeX,
  RefreshCw,
  ShoppingBag
} from 'lucide-react';

export function CaptainScreen() {
  const { lang, t } = useLanguage();
  const { lastEvent, registerRole, playSound } = useSocket();

  const [calls, setCalls] = useState([]);
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'bill', 'charcoal', 'waiter'
  const [loading, setLoading] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Register Captain role on socket
  useEffect(() => {
    registerRole('captain');
  }, []);

  const fetchData = async () => {
    try {
      const [callsRes, ordersRes] = await Promise.all([
        fetch(`http://${window.location.hostname}:3001/api/calls`),
        fetch(`http://${window.location.hostname}:3001/api/orders?status=pending`)
      ]);
      const callsJson = await callsRes.json();
      const ordersJson = await ordersRes.json();

      if (callsJson.success) setCalls(callsJson.data || []);
      if (ordersJson.success) setOrders(ordersJson.data || []);
    } catch (err) {
      console.error('Captain data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  // React to socket events
  useEffect(() => {
    if (lastEvent) {
      if (lastEvent.type === 'NEW_TABLE_CALL' || lastEvent.type === 'NEW_ORDER' || lastEvent.type === 'ORDER_STATUS_CHANGED') {
        fetchData();
        if (soundEnabled) playSound('call');
      }
    }
  }, [lastEvent]);

  const handleAcknowledgeCall = async (callId) => {
    try {
      await fetch(`http://${window.location.hostname}:3001/api/calls/${callId}/acknowledge`, { method: 'PATCH' });
      setCalls(prev => prev.map(c => c.id === callId ? { ...c, status: 'acknowledged' } : c));
    } catch (e) {
      console.error(e);
    }
  };

  const handleResolveCall = async (callId) => {
    try {
      await fetch(`http://${window.location.hostname}:3001/api/calls/${callId}/resolve`, { method: 'PATCH' });
      setCalls(prev => prev.filter(c => c.id !== callId));
    } catch (e) {
      console.error(e);
    }
  };

  const filteredCalls = calls.filter(c => {
    if (filter === 'all') return true;
    return c.type === filter;
  });

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 pb-24">
      <div className="max-w-6xl mx-auto">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Captain / Waiter Station
              </span>
              <span className="text-xs text-slate-400">
                {calls.length} {lang === 'ar' ? 'استدعاءات نشطة' : 'active calls'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              {t('captainTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-tajawal">
              {t('captainSubtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-all ${
                soundEnabled
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-slate-800 border-slate-700 text-slate-500'
              }`}
              title="تفعيل/كتم صوت التنبيهات"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>{soundEnabled ? (lang === 'ar' ? 'الصوت مفعّل' : 'Sound ON') : (lang === 'ar' ? 'مكتوم' : 'Muted')}</span>
            </button>

            <button
              onClick={fetchData}
              className="p-2.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-4 border-b border-slate-800/50 mb-6">
          {[
            { id: 'all', label: t('all') },
            { id: 'waiter', label: t('callWaiter') },
            { id: 'bill', label: t('requestBill') },
            { id: 'charcoal', label: t('askCharcoal') },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filter === tab.id
                  ? 'bg-amber-500 text-black font-black shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Active Calls Grid */}
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-white mb-3 flex items-center gap-2">
              <BellRing className="w-5 h-5 text-amber-400 animate-bounce" />
              <span>{t('activeCalls')} ({filteredCalls.length})</span>
            </h3>

            {filteredCalls.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <p className="text-sm font-bold text-slate-300">{t('noActiveCalls')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCalls.map((call) => {
                  const isBill = call.type === 'bill';
                  const isCharcoal = call.type === 'charcoal';
                  const isWater = call.type === 'water';
                  const isAcknowledged = call.status === 'acknowledged';

                  return (
                    <div
                      key={call.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between shadow-lg ${
                        isAcknowledged
                          ? 'bg-slate-900/90 border-slate-700'
                          : isBill
                          ? 'bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border-emerald-500/60 ring-1 ring-emerald-500/30'
                          : isCharcoal
                          ? 'bg-gradient-to-br from-red-950/40 via-slate-900 to-slate-900 border-red-500/60 ring-1 ring-red-500/30'
                          : 'bg-gradient-to-br from-amber-950/40 via-slate-900 to-slate-900 border-amber-500/60 ring-1 ring-amber-500/30'
                      }`}
                    >
                      <div>
                        {/* Table badge and time */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="px-3 py-1 rounded-xl text-sm font-black bg-amber-500 text-black shadow-md shadow-amber-500/30">
                            {t('table')} #{call.table_number}
                          </span>

                          <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(call.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {/* Call description */}
                        <div className="flex items-start gap-2.5">
                          <div className={`p-2 rounded-xl text-white ${
                            isBill ? 'bg-emerald-600' : isCharcoal ? 'bg-red-600' : 'bg-amber-600'
                          }`}>
                            {isBill ? <Receipt className="w-5 h-5" /> : isCharcoal ? <Flame className="w-5 h-5" /> : isWater ? <Droplets className="w-5 h-5" /> : <BellRing className="w-5 h-5" />}
                          </div>
                          <div>
                            <h4 className="font-black text-white text-sm">
                              {isBill ? 'طلب الشيك / الحساب' : isCharcoal ? 'تغيير فحم الشيشة 🔥' : isWater ? 'طلب ماء إضافي' : 'استدعاء الويتر'}
                            </h4>
                            {isBill && call.payment_preference && (
                              <p className="text-xs text-emerald-400 font-bold mt-0.5">
                                الدفع المفضل: {call.payment_preference.toUpperCase()}
                              </p>
                            )}
                            {call.detail && (
                              <p className="text-xs text-slate-300 font-tajawal mt-1 bg-slate-950/60 p-1.5 rounded-lg border border-slate-800">
                                💬 "{call.detail}"
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2">
                        {!isAcknowledged && (
                          <button
                            onClick={() => handleAcknowledgeCall(call.id)}
                            className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700"
                          >
                            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                            <span>{t('acknowledge')}</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleResolveCall(call.id)}
                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-950/40"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{t('resolve')}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Incoming Orders Feed */}
          <div className="pt-6 border-t border-slate-800">
            <h3 className="text-base font-extrabold text-white mb-3 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <span>{t('activeOrders')} ({orders.length})</span>
            </h3>

            {orders.length === 0 ? (
              <p className="text-xs text-slate-500">لا توجد طلبات جديدة معلقة.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {orders.map(order => (
                  <div key={order.id} className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-white text-xs">
                        {t('table')} #{order.table_number} ({order.order_number})
                      </span>
                      <span className="font-mono text-amber-400 font-bold text-xs">
                        {order.total_amount} {t('currency')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-tajawal">
                      {order.itemCount || order.items?.length || 1} أصناف قيد التحضير
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
