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
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 pb-24 text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Kitchen Display System (KDS)
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {orders.length} {lang === 'ar' ? 'تيكت قيد الإعداد' : 'tickets active'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {t('kdsTitle')}
            </h2>
          </div>

          {/* Station Switcher Tabs */}
          <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
            <button
              onClick={() => setStation('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                station === 'all'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{t('stationAll')}</span>
            </button>

            <button
              onClick={() => setStation('kitchen')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                station === 'kitchen'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ChefHat className="w-4 h-4" />
              <span>{t('stationKitchen')}</span>
            </button>

            <button
              onClick={() => setStation('barista')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                station === 'barista'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Coffee className="w-4 h-4" />
              <span>{t('stationBarista')}</span>
            </button>

            <button
              onClick={fetchKdsOrders}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Orders Tickets Grid */}
        <div className="mt-6">
          {orders.length === 0 ? (
            <div className="py-24 text-center space-y-3 bg-white rounded-3xl border border-slate-200 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-extrabold text-slate-900">
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
                    className={`rounded-3xl border overflow-hidden flex flex-col justify-between shadow-sm transition-all bg-white ${
                      isReady
                        ? 'border-emerald-300 ring-2 ring-emerald-100'
                        : isUrgent
                        ? 'border-rose-300 ring-2 ring-rose-100'
                        : isWarning
                        ? 'border-amber-300 ring-2 ring-amber-100'
                        : 'border-slate-200'
                    }`}
                  >
                    {/* Ticket Header */}
                    <div className={`p-4 border-b flex items-center justify-between ${
                      isUrgent
                        ? 'bg-rose-50 border-rose-200'
                        : isWarning
                        ? 'bg-amber-50 border-amber-200'
                        : isReady
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-xl text-base font-black bg-emerald-600 text-white shadow-sm">
                          {t('table')} #{order.table_number}
                        </span>
                        <span className="text-xs font-bold font-mono text-slate-600">
                          {order.order_number}
                        </span>
                      </div>

                      {/* Elapsed Timer */}
                      <div className={`flex items-center gap-1 text-xs font-mono font-black px-2.5 py-1 rounded-xl ${
                        isUrgent
                          ? 'bg-rose-100 text-rose-800 animate-pulse'
                          : isWarning
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
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
                                ? 'bg-emerald-50/50 border-emerald-200 text-emerald-800 opacity-60'
                                : 'bg-slate-50 border-slate-200 text-slate-900 hover:border-emerald-400'
                            }`}
                          >
                            <div className="flex items-start gap-2.5 min-w-0">
                              <div className={`w-5 h-5 rounded-lg flex items-center justify-center text-xs font-black mt-0.5 border flex-shrink-0 ${
                                itemDone
                                  ? 'bg-emerald-600 border-emerald-600 text-white'
                                  : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              }`}>
                                {itemDone ? <Check className="w-3.5 h-3.5" /> : item.quantity}
                              </div>

                              <div className="min-w-0">
                                <h4 className={`text-xs sm:text-sm font-black leading-snug ${itemDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                                  {lang === 'ar' ? item.item_name_ar : item.item_name_en}
                                </h4>

                                {/* Modifiers */}
                                {item.modifiers && item.modifiers.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {item.modifiers.map((m, idx) => (
                                      <span key={idx} className="text-[10px] font-bold bg-white text-slate-700 px-1.5 py-0.5 rounded-md border border-slate-200">
                                        {m.label}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                {item.notes && (
                                  <p className="text-[11px] text-amber-700 font-tajawal mt-1 italic">
                                    ⚠️ {item.notes}
                                  </p>
                                )}
                              </div>
                            </div>

                            <span className="text-[10px] uppercase font-bold text-slate-400 flex-shrink-0">
                              {item.station_type === 'kitchen' ? '🍳' : '☕'}
                            </span>
                          </div>
                        );
                      })}

                      {order.notes && (
                        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-tajawal">
                          <strong>ملاحظات الطاولة:</strong> {order.notes}
                        </div>
                      )}
                    </div>

                    {/* Ticket Action Footer */}
                    <div className="p-4 border-t border-slate-100 bg-slate-50/60">
                      <button
                        onClick={() => handleMarkOrderReady(order.id)}
                        className={`w-full py-3 px-4 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all ${
                          isReady
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
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
