import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useSocket } from '../../context/SocketContext';
import { 
  ChefHat, 
  Coffee, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  AlertTriangle,
  RefreshCw,
  Flame,
  Check
} from 'lucide-react';

export function KitchenDisplay() {
  const { lang, t } = useLanguage();
  const { lastEvent, registerRole, playSound } = useSocket();

  const [station, setStation] = useState('all'); // 'all', 'kitchen', 'barista'
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    registerRole(station === 'kitchen' ? 'kds_kitchen' : station === 'barista' ? 'kds_barista' : 'pos');
  }, [station]);

  const fetchKdsOrders = async () => {
    try {
      const url = station === 'all'
        ? `http://${window.location.hostname}:3001/api/orders`
        : `http://${window.location.hostname}:3001/api/orders?station=${station}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        // Only keep active orders (pending, preparing, ready)
        const active = (data.data || []).filter(o => o.status !== 'paid' && o.status !== 'cancelled' && o.status !== 'delivered');
        setOrders(active);
      }
    } catch (err) {
      console.error('KDS load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKdsOrders();
    const interval = setInterval(fetchKdsOrders, 7000);
    return () => clearInterval(interval);
  }, [station]);

  useEffect(() => {
    if (lastEvent) {
      if (lastEvent.type === 'NEW_ORDER' || lastEvent.type === 'ORDER_STATUS_CHANGED') {
        fetchKdsOrders();
      }
    }
  }, [lastEvent]);

  // Toggle individual item status
  const handleToggleItemStatus = async (itemId, currentStatus) => {
    const nextStatus = currentStatus === 'ready' ? 'pending' : 'ready';
    try {
      await fetch(`http://${window.location.hostname}:3001/api/orders/items/${itemId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      fetchKdsOrders();
    } catch (e) {
      console.error(e);
    }
  };

  // Mark all items & order finished
  const handleMarkOrderReady = async (orderId) => {
    try {
      await fetch(`http://${window.location.hostname}:3001/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ready' })
      });
      playSound('ready');
      fetchKdsOrders();
    } catch (e) {
      console.error(e);
    }
  };

  // Calculate elapsed minutes
  const getElapsedMins = (createdAt) => {
    const diffMs = Date.now() - new Date(createdAt).getTime();
    return Math.floor(diffMs / (1000 * 60));
  };

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 pb-24">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Kitchen Display System (KDS)
              </span>
              <span className="text-xs text-slate-400">
                {orders.length} {lang === 'ar' ? 'تيكت قيد الإعداد' : 'tickets active'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              {t('kdsTitle')}
            </h2>
          </div>

          {/* Station Switcher Tabs */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setStation('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                station === 'all'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{t('stationAll')}</span>
            </button>

            <button
              onClick={() => setStation('kitchen')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                station === 'kitchen'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ChefHat className="w-4 h-4" />
              <span>{t('stationKitchen')}</span>
            </button>

            <button
              onClick={() => setStation('barista')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                station === 'barista'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Coffee className="w-4 h-4" />
              <span>{t('stationBarista')}</span>
            </button>

            <button
              onClick={fetchKdsOrders}
              className="p-2 rounded-xl text-slate-400 hover:text-white transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Orders Tickets Grid */}
        <div className="mt-6">
          {orders.length === 0 ? (
            <div className="py-24 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-extrabold text-slate-300">
                {lang === 'ar' ? 'جميع التيكتات منجزة بالمطبخ والبار!' : 'All station tickets are clear!'}
              </h4>
              <p className="text-xs text-slate-500 font-tajawal">
                {lang === 'ar' ? 'ستظهر الطلبات الجديدة هنا فور قيام الضيوف بالطلب عبر الـ QR' : 'Incoming orders will appear here automatically'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {orders.map((order) => {
                const elapsed = getElapsedMins(order.created_at);
                const isUrgent = elapsed >= 12;
                const isWarning = elapsed >= 6 && elapsed < 12;
                const isReady = order.status === 'ready';

                return (
                  <div
                    key={order.id}
                    className={`rounded-3xl border overflow-hidden flex flex-col justify-between shadow-2xl transition-all ${
                      isReady
                        ? 'bg-slate-900/90 border-emerald-500/60 ring-2 ring-emerald-500/30'
                        : isUrgent
                        ? 'bg-slate-900/95 border-red-500/80 shadow-red-950/40 ring-1 ring-red-500/40'
                        : isWarning
                        ? 'bg-slate-900/95 border-amber-500/70 shadow-amber-950/30'
                        : 'bg-slate-900/95 border-slate-800'
                    }`}
                  >
                    {/* Ticket Header */}
                    <div className={`p-4 border-b flex items-center justify-between ${
                      isUrgent
                        ? 'bg-red-500/10 border-red-500/30'
                        : isWarning
                        ? 'bg-amber-500/10 border-amber-500/30'
                        : 'bg-slate-950/80 border-slate-800'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-xl text-base font-black bg-amber-500 text-black shadow-md">
                          {t('table')} #{order.table_number}
                        </span>
                        <span className="text-xs font-bold font-mono text-slate-300">
                          {order.order_number}
                        </span>
                      </div>

                      {/* Elapsed Timer */}
                      <div className={`flex items-center gap-1 text-xs font-mono font-black px-2.5 py-1 rounded-xl ${
                        isUrgent
                          ? 'bg-red-500 text-white animate-pulse'
                          : isWarning
                          ? 'bg-amber-500 text-black'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        <Clock className="w-3.5 h-3.5" />
                        <span>{elapsed} {t('minsAgo')}</span>
                      </div>
                    </div>

                    {/* Order Items List */}
                    <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-72">
                      {order.items && order.items.map((item) => {
                        const itemDone = item.status === 'ready';

                        return (
                          <div
                            key={item.id}
                            onClick={() => handleToggleItemStatus(item.id, item.status)}
                            className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                              itemDone
                                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300 opacity-60'
                                : 'bg-slate-950/70 border-slate-800 text-white hover:border-amber-500/50'
                            }`}
                          >
                            <div className="flex items-start gap-2.5 min-w-0">
                              <div className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs font-black mt-0.5 border flex-shrink-0 ${
                                itemDone
                                  ? 'bg-emerald-500 border-emerald-400 text-black'
                                  : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                              }`}>
                                {itemDone ? <Check className="w-3.5 h-3.5" /> : item.quantity}
                              </div>

                              <div className="min-w-0">
                                <h4 className={`text-xs sm:text-sm font-black leading-snug ${itemDone ? 'line-through' : ''}`}>
                                  {lang === 'ar' ? item.item_name_ar : item.item_name_en}
                                </h4>

                                {/* Modifiers */}
                                {item.modifiers && item.modifiers.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {item.modifiers.map((m, idx) => (
                                      <span key={idx} className="text-[10px] font-bold bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded-md border border-slate-700">
                                        {m.label}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {item.notes && (
                                  <p className="text-[11px] text-amber-400 font-tajawal mt-1 italic">
                                    ⚠️ {item.notes}
                                  </p>
                                )}
                              </div>
                            </div>

                            <span className="text-[10px] uppercase font-bold text-slate-500 flex-shrink-0">
                              {item.station_type === 'kitchen' ? '🍳' : '☕'}
                            </span>
                          </div>
                        );
                      })}

                      {order.notes && (
                        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-tajawal">
                          <strong>ملاحظات الطاولة:</strong> {order.notes}
                        </div>
                      )}
                    </div>

                    {/* Ticket Action Footer */}
                    <div className="p-4 border-t border-slate-800/80 bg-slate-950/60">
                      <button
                        onClick={() => handleMarkOrderReady(order.id)}
                        className={`w-full py-3 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                          isReady
                            ? 'bg-emerald-600/80 text-white'
                            : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/60'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{isReady ? (lang === 'ar' ? 'تم الإنجاز وإشعار العميل ✅' : 'Ready & Customer Notified') : t('markAllReady')}</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
