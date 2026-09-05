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

const SAMPLE_CAPTAIN_CALLS = [
  { id: 101, table_number: 4, type: 'water', detail: 'طلب مياه معدنية باردة إضافية', status: 'pending', created_at: new Date(Date.now() - 2 * 60000).toISOString() },
  { id: 102, table_number: 18, type: 'charcoal', detail: 'تغيير فحم الشيشة (لاونج الشيشة)', status: 'pending', created_at: new Date(Date.now() - 5 * 60000).toISOString() },
  { id: 103, table_number: 7, type: 'bill', detail: 'طلب الحساب - طريقة الدفع: فيزا / بطاقة بنكية', payment_preference: 'card', status: 'acknowledged', created_at: new Date(Date.now() - 8 * 60000).toISOString() },
  { id: 104, table_number: 22, type: 'shisha_head', detail: 'تبديل رأس تفاحتين فاخر لاونج', status: 'pending', created_at: new Date(Date.now() - 1 * 60000).toISOString() },
];

export const getTableSection = (tableNum) => {
  const n = parseInt(tableNum, 10);
  if (n >= 1 && n <= 8) return { id: 'indoor', name_ar: 'الصالة الداخلية', name_en: 'Indoor Hall', badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  if (n >= 9 && n <= 16) return { id: 'outdoor', name_ar: 'التراس والحديقة', name_en: 'Outdoor Garden', badgeBg: 'bg-sky-50 text-sky-700 border-sky-200' };
  if (n >= 17 && n <= 24) return { id: 'shisha', name_ar: 'لاونج الشيشة', name_en: 'Shisha Lounge', badgeBg: 'bg-amber-50 text-amber-800 border-amber-300' };
  if (n >= 25 && n <= 30) return { id: 'vip', name_ar: 'صالة العائلات VIP', name_en: 'VIP Lounge', badgeBg: 'bg-purple-50 text-purple-700 border-purple-200' };
  return { id: 'general', name_ar: 'صالة المطعم', name_en: 'Dining Hall', badgeBg: 'bg-slate-50 text-slate-700 border-slate-200' };
};

export function CaptainScreen() {
  const { lang, t } = useLanguage();
  const { lastEvent, registerRole, playSound } = useSocket();

  const [calls, setCalls] = useState(SAMPLE_CAPTAIN_CALLS);
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'shisha', 'indoor', 'outdoor', 'vip', 'bill'
  const [loading, setLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Register Captain role on socket
  useEffect(() => {
    registerRole('captain');
  }, []);

  const fetchData = async () => {
    try {
      const [callsRes, ordersRes] = await Promise.all([
        fetch(`http://${window.location.hostname}:3001/api/calls`).catch(() => ({ json: () => ({ success: false }) })),
        fetch(`http://${window.location.hostname}:3001/api/orders?status=pending`).catch(() => ({ json: () => ({ success: false }) }))
      ]);
      const callsJson = await callsRes.json();
      const ordersJson = await ordersRes.json();

      if (callsJson.success && callsJson.data && callsJson.data.length > 0) setCalls(callsJson.data);
      if (ordersJson.success && ordersJson.data) setOrders(ordersJson.data);
    } catch (err) {
      console.warn('Captain using real-time local sync');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  // React to socket & broadcast events
  useEffect(() => {
    if (lastEvent) {
      if (lastEvent.type === 'NEW_TABLE_CALL') {
        const newCall = lastEvent.payload;
        if (newCall) {
          setCalls(prev => {
            const exists = prev.some(c => c.id === newCall.id || (c.table_number === newCall.table_number && c.created_at === newCall.created_at));
            if (exists) return prev;
            return [newCall, ...prev];
          });
          if (soundEnabled) playSound('call');
        }
      } else if (lastEvent.type === 'NEW_ORDER' || lastEvent.type === 'ORDER_STATUS_CHANGED') {
        fetchData();
        if (soundEnabled) playSound('order');
      }
    }
  }, [lastEvent]);

  const handleAcknowledgeCall = async (callId) => {
    try {
      await fetch(`http://${window.location.hostname}:3001/api/calls/${callId}/acknowledge`, { method: 'PATCH' }).catch(() => null);
      setCalls(prev => prev.map(c => c.id === callId ? { ...c, status: 'acknowledged' } : c));
    } catch (e) {
      setCalls(prev => prev.map(c => c.id === callId ? { ...c, status: 'acknowledged' } : c));
    }
  };

  const handleResolveCall = async (callId) => {
    try {
      await fetch(`http://${window.location.hostname}:3001/api/calls/${callId}/resolve`, { method: 'PATCH' }).catch(() => null);
      setCalls(prev => prev.filter(c => c.id !== callId));
    } catch (e) {
      setCalls(prev => prev.filter(c => c.id !== callId));
    }
  };

  // Section Counts
  const countPending = (predicate) => calls.filter(c => c.status === 'pending' && predicate(c)).length;

  const totalPending = calls.filter(c => c.status === 'pending').length;
  const shishaPending = countPending(c => getTableSection(c.table_number).id === 'shisha' || ['charcoal', 'shisha_head', 'shisha_hose'].includes(c.type));
  const indoorPending = countPending(c => getTableSection(c.table_number).id === 'indoor' && !['charcoal', 'shisha_head', 'shisha_hose'].includes(c.type));
  const outdoorPending = countPending(c => getTableSection(c.table_number).id === 'outdoor' && !['charcoal', 'shisha_head', 'shisha_hose'].includes(c.type));
  const vipPending = countPending(c => getTableSection(c.table_number).id === 'vip' && !['charcoal', 'shisha_head', 'shisha_hose'].includes(c.type));
  const billPending = countPending(c => c.type === 'bill');

  const filteredCalls = calls.filter(c => {
    if (filter === 'all') return true;
    if (filter === 'shisha') return getTableSection(c.table_number).id === 'shisha' || ['charcoal', 'shisha_head', 'shisha_hose'].includes(c.type);
    if (filter === 'indoor') return getTableSection(c.table_number).id === 'indoor';
    if (filter === 'outdoor') return getTableSection(c.table_number).id === 'outdoor';
    if (filter === 'vip') return getTableSection(c.table_number).id === 'vip';
    if (filter === 'bill') return c.type === 'bill';
    return c.type === filter;
  });

  const getCallMeta = (call) => {
    const isShisha = ['charcoal', 'shisha_head', 'shisha_hose'].includes(call.type);
    if (call.type === 'bill') return { title: 'طلب الشيك / الحساب', icon: Receipt, badgeColor: 'bg-emerald-100 text-emerald-700' };
    if (call.type === 'charcoal') return { title: 'تغيير فحم الشيشة 🔥', icon: Flame, badgeColor: 'bg-amber-100 text-amber-800' };
    if (call.type === 'shisha_head') return { title: 'تبديل رأس المعسل 💨', icon: Sparkles, badgeColor: 'bg-amber-100 text-amber-800' };
    if (call.type === 'shisha_hose') return { title: 'طلب لي طبي معقم 🌿', icon: Flame, badgeColor: 'bg-amber-100 text-amber-800' };
    if (call.type === 'water') return { title: 'طلب مياه معدنية 💧', icon: Droplets, badgeColor: 'bg-sky-100 text-sky-700' };
    if (call.type === 'cutlery') return { title: 'مناديل وأدوات مائدة 🍴', icon: Utensils, badgeColor: 'bg-slate-100 text-slate-700' };
    return { title: 'استدعاء الويتر 🙋‍♂️', icon: BellRing, badgeColor: 'bg-emerald-100 text-emerald-700' };
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 pb-24 font-tajawal text-slate-900">
      <div className="max-w-6xl mx-auto">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Captain & Waiter Station
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {calls.length} {lang === 'ar' ? 'استدعاءات نشطة' : 'active calls'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {t('captainTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-tajawal">
              {t('captainSubtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => playSound('call')}
              className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
              title="تجربة رنة الجرس التنبيهية العالية"
            >
              <BellRing className="w-4 h-4 text-emerald-600 animate-bounce" />
              <span>🔔 تجربة الجرس العالي</span>
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 transition-all ${
                soundEnabled
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-white border-slate-200 text-slate-500'
              }`}
              title="تفعيل/كتم صوت التنبيهات"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>{soundEnabled ? (lang === 'ar' ? 'الصوت مفعّل' : 'Sound ON') : (lang === 'ar' ? 'مكتوم' : 'Muted')}</span>
            </button>

            <button
              onClick={fetchData}
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Section Filter Tabs with Pending Bubbles */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-4 border-b border-slate-200/80 mb-6">
          {[
            { id: 'all', label: 'الكل (All)', count: totalPending, isShisha: false },
            { id: 'shisha', label: '🔥 لاونج الشيشة', count: shishaPending, isShisha: true },
            { id: 'indoor', label: '🏛️ الصالة الداخلية', count: indoorPending, isShisha: false },
            { id: 'outdoor', label: '🌿 التراس والحديقة', count: outdoorPending, isShisha: false },
            { id: 'vip', label: '👑 صالة VIP', count: vipPending, isShisha: false },
            { id: 'bill', label: '💳 طلب الحساب', count: billPending, isShisha: false },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                filter === tab.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : tab.isShisha
                  ? 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full shadow-sm animate-pulse ${
                  filter === tab.id
                    ? 'bg-white text-emerald-800'
                    : 'bg-rose-500 text-white'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Active Calls Grid */}
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 mb-3 flex items-center gap-2">
              <BellRing className="w-5 h-5 text-emerald-600 animate-bounce" />
              <span>{t('activeCalls')} ({filteredCalls.length})</span>
            </h3>

            {filteredCalls.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-2 shadow-sm">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <p className="text-sm font-bold text-slate-700">{t('noActiveCalls')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCalls.map((call) => {
                  const isBill = call.type === 'bill';
                  const isShisha = ['charcoal', 'shisha_head', 'shisha_hose'].includes(call.type) || getTableSection(call.table_number).id === 'shisha';
                  const isAcknowledged = call.status === 'acknowledged';
                  const section = getTableSection(call.table_number);
                  const meta = getCallMeta(call);
                  const Icon = meta.icon;

                  return (
                    <div
                      key={call.id}
                      className={`p-5 rounded-3xl border transition-all flex flex-col justify-between shadow-sm bg-white ${
                        isAcknowledged
                          ? 'border-slate-200 bg-slate-50/80 text-slate-600 opacity-90'
                          : isShisha
                          ? 'border-amber-300 ring-2 ring-amber-100 bg-amber-50/20'
                          : isBill
                          ? 'border-emerald-300 ring-2 ring-emerald-100 bg-emerald-50/20'
                          : 'border-emerald-300 ring-2 ring-emerald-100 bg-emerald-50/20'
                      }`}
                    >
                      <div>
                        {/* Table badge, section chip, and time */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-xl text-sm font-black bg-emerald-600 text-white shadow-sm">
                              {t('table')} #{call.table_number}
                            </span>
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${section.badgeBg}`}>
                              {lang === 'ar' ? section.name_ar : section.name_en}
                            </span>
                          </div>

                          <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(call.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        {/* Call description */}
                        <div className="flex items-start gap-3">
                          <div className={`p-2.5 rounded-2xl ${meta.badgeColor}`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-black text-slate-900 text-sm">
                              {meta.title}
                            </h4>
                            {isBill && call.payment_preference && (
                              <p className="text-xs text-emerald-700 font-bold mt-0.5">
                                الدفع المفضل: {call.payment_preference.toUpperCase()}
                              </p>
                            )}
                            {call.detail && (
                              <p className="text-xs text-slate-600 font-tajawal mt-1 bg-slate-50 p-2 rounded-xl border border-slate-200">
                                💬 "{call.detail}"
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                        {!isAcknowledged && (
                          <button
                            onClick={() => handleAcknowledgeCall(call.id)}
                            className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
                          >
                            <UserCheck className="w-3.5 h-3.5 text-slate-600" />
                            <span>{t('acknowledge')}</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleResolveCall(call.id)}
                          className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
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
          <div className="pt-6 border-t border-slate-200">
            <h3 className="text-base font-extrabold text-slate-900 mb-3 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              <span>{t('activeOrders')} ({orders.length})</span>
            </h3>

            {orders.length === 0 ? (
              <p className="text-xs text-slate-500">لا توجد طلبات جديدة معلقة.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {orders.map(order => (
                  <div key={order.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 text-xs">
                        {t('table')} #{order.table_number} ({order.order_number})
                      </span>
                      <span className="font-mono text-emerald-700 font-black text-xs">
                        {order.total_amount} {t('currency')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-tajawal">
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
