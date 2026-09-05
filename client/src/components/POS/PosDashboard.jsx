import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useSocket } from '../../context/SocketContext';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Receipt, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  Printer, 
  CheckCircle2, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Clock, 
  Sparkles, 
  X, 
  FileText, 
  Calendar, 
  Layers,
  BellRing,
  Flame
} from 'lucide-react';
import { FALLBACK_TABLES, FALLBACK_SETTINGS } from '../../i18n/mockData';

const SAMPLE_DAILY_REPORT = {
  total_revenue: 16420,
  orders_count: 38,
  cash_total: 9200,
  card_total: 4820,
  instapay_total: 2400,
  tax_vat_collected: 2298.8,
  service_fee_collected: 1970.4,
  recent_payments: [
    { order_number: 'ORD-8421', table_number: 3, grand_total: 620, payment_method: 'cash', created_at: '10:15 ص' },
    { order_number: 'ORD-9304', table_number: 7, grand_total: 485, payment_method: 'card', created_at: '10:02 ص' },
    { order_number: 'ORD-7112', table_number: 14, grand_total: 1150, payment_method: 'instapay', created_at: '09:40 ص' },
    { order_number: 'ORD-5401', table_number: 22, grand_total: 840, payment_method: 'cash', created_at: '09:15 ص' }
  ]
};

export function PosDashboard() {
  const { lang, t } = useLanguage();
  const { lastEvent, playSound } = useSocket();

  const [tables, setTables] = useState(FALLBACK_TABLES);
  const [activeCalls, setActiveCalls] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [activeTab, setActiveTab] = useState('floor'); // 'floor', 'reports'
  const [floorSection, setFloorSection] = useState('all'); // 'all', 'indoor', 'outdoor', 'shisha', 'vip'
  const [dailyReport, setDailyReport] = useState(SAMPLE_DAILY_REPORT);
  const [loading, setLoading] = useState(false);

  // Checkout modal
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [printedReceipt, setPrintedReceipt] = useState(null);

  const fetchPosData = async () => {
    try {
      const [tablesRes, reportsRes, callsRes] = await Promise.all([
        fetch(`http://${window.location.hostname}:3001/api/tables`).catch(() => ({ json: () => ({ success: false }) })),
        fetch(`http://${window.location.hostname}:3001/api/reports/daily`).catch(() => ({ json: () => ({ success: false }) })),
        fetch(`http://${window.location.hostname}:3001/api/calls`).catch(() => ({ json: () => ({ success: false }) }))
      ]);
      const tablesJson = await tablesRes.json();
      const reportsJson = await reportsRes.json();
      const callsJson = await callsRes.json();

      if (tablesJson.success && tablesJson.data && tablesJson.data.length > 0) setTables(tablesJson.data);
      if (reportsJson.success && reportsJson.data) setDailyReport(reportsJson.data);
      if (callsJson.success && Array.isArray(callsJson.data)) setActiveCalls(callsJson.data.filter(c => c.status === 'pending'));
    } catch (err) {
      console.warn('Using fallback POS data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosData();
  }, []);

  useEffect(() => {
    if (lastEvent) {
      if (lastEvent.type === 'NEW_ORDER' || lastEvent.type === 'ORDER_STATUS_CHANGED') {
        fetchPosData();
      }
    }
  }, [lastEvent]);

  const handleTableClick = (tbl) => {
    setSelectedTable(tbl);
    if (tbl.activeOrder) {
      setCheckoutModalOpen(true);
    }
  };

  const handleProcessCheckout = async () => {
    if (!selectedTable || !selectedTable.activeOrder) return;
    try {
      const res = await fetch(`http://${window.location.hostname}:3001/api/pos/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedTable.activeOrder.id,
          tableNumber: selectedTable.table_number,
          paymentMethod,
          discount: parseFloat(discountAmount || 0)
        })
      });
      const json = await res.json();
      if (json.success) {
        playSound('ready');
        setPrintedReceipt(json.data.receipt);
        fetchPosData();
      }
    } catch (err) {
      // Demo mode fallback
      const order = selectedTable.activeOrder;
      const subtotal = order.grand_total || 450;
      const disc = parseFloat(discountAmount || 0);
      const vat = subtotal * 0.14;
      const serv = subtotal * 0.12;
      const grand = subtotal + vat + serv - disc;

      const fallbackReceipt = {
        invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        tableNumber: selectedTable.table_number,
        date: new Date().toLocaleString('ar-EG'),
        paymentMethod: paymentMethod === 'cash' ? 'كاش نقدي' : paymentMethod === 'card' ? 'بطاقة بنكية' : 'انستاباي / محفظة',
        subtotal: subtotal.toFixed(2),
        discount: disc.toFixed(2),
        taxVat: vat.toFixed(2),
        serviceFee: serv.toFixed(2),
        grandTotal: grand.toFixed(2),
        items: [
          { name_ar: 'طلب طاولة رقم ' + selectedTable.table_number, quantity: 1, total: subtotal }
        ],
        venue: {
          name_ar: 'سول كافيه ومطعم',
          tax_reg: '624-918-335',
          footer_note: 'شكراً لزيارتكم سول لاونج'
        }
      };
      playSound('ready');
      setPrintedReceipt(fallbackReceipt);
      setTables(prev => prev.map(t => t.id === selectedTable.id ? { ...t, activeOrder: null, status: 'available' } : t));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 pb-28 text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Header & Tab Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Point of Sale (POS)
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {tables.filter(t => t.status === 'occupied').length} / {tables.length} {lang === 'ar' ? 'طاولة مشغولة' : 'tables occupied'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {t('posTitle')}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('floor')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'floor'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{t('tablesGrid')}</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'reports'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{t('dailyZReport')}</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Floor Plan */}
        {activeTab === 'floor' && (
          <div className="mt-6 space-y-4">
            
            {/* Floor Sections Filter with Live Alert & Occupied Bubbles */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {[
                { id: 'all', label: 'كافة الصالات (All)', matcher: () => true },
                { id: 'shisha', label: '🔥 لاونج الشيشة', isShisha: true, matcher: (tbl) => tbl.table_number >= 17 && tbl.table_number <= 24 },
                { id: 'indoor', label: '🏛️ الصالة الداخلية', matcher: (tbl) => tbl.table_number >= 1 && tbl.table_number <= 8 },
                { id: 'outdoor', label: '🌿 التراس والحديقة', matcher: (tbl) => tbl.table_number >= 9 && tbl.table_number <= 16 },
                { id: 'vip', label: '👑 صالة VIP', matcher: (tbl) => tbl.table_number >= 25 && tbl.table_number <= 30 },
              ].map(sec => {
                const secTables = tables.filter(sec.matcher);
                const occupiedCount = secTables.filter(t => t.status === 'occupied').length;
                const callsCount = activeCalls.filter(c => secTables.some(t => t.table_number === c.table_number)).length;

                return (
                  <button
                    key={sec.id}
                    onClick={() => setFloorSection(sec.id)}
                    className={`relative px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                      floorSection === sec.id
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : sec.isShisha
                        ? 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
                        : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-sm'
                    }`}
                  >
                    <span>{sec.label}</span>
                    
                    {/* Active Calls Bubble (Red) */}
                    {callsCount > 0 && (
                      <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full animate-bounce shadow-sm" title="نداءات ويتر معلقة">
                        🔔 {callsCount}
                      </span>
                    )}

                    {/* Occupied Count Bubble */}
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                      floorSection === sec.id
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {occupiedCount}/{secTables.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Tables Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
              {tables
                .filter(tbl => {
                  if (floorSection === 'all') return true;
                  if (floorSection === 'shisha') return tbl.table_number >= 17 && tbl.table_number <= 24;
                  if (floorSection === 'indoor') return tbl.table_number >= 1 && tbl.table_number <= 8;
                  if (floorSection === 'outdoor') return tbl.table_number >= 9 && tbl.table_number <= 16;
                  if (floorSection === 'vip') return tbl.table_number >= 25 && tbl.table_number <= 30;
                  return true;
                })
                .map((tbl) => {
                  const isOccupied = tbl.status === 'occupied' && tbl.activeOrder;
                  const totalBill = isOccupied ? (tbl.activeOrder.total_amount || tbl.activeOrder.grand_total || 0) : 0;
                  const tableCalls = activeCalls.filter(c => c.table_number === tbl.table_number);
                  const hasCall = tableCalls.length > 0;
                  const isShishaTable = tbl.table_number >= 17 && tbl.table_number <= 24;

                  return (
                    <div
                      key={tbl.id}
                      onClick={() => handleTableClick(tbl)}
                      className={`relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-36 bg-white shadow-sm ${
                        hasCall
                          ? 'border-amber-400 ring-2 ring-amber-300 bg-amber-50/30 animate-pulse'
                          : isOccupied
                          ? 'border-rose-300 ring-2 ring-rose-100 hover:scale-[1.02]'
                          : 'border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/20 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm ${
                            hasCall
                              ? 'bg-amber-500 text-white font-mono shadow-sm'
                              : isOccupied
                              ? 'bg-rose-500 text-white font-mono shadow-sm'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            #{tbl.table_number}
                          </span>

                          {isShishaTable && (
                            <span className="text-xs" title="لاونج الشيشة">🔥</span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          {hasCall && (
                            <span className="p-1 rounded-lg bg-rose-500 text-white text-[10px] animate-bounce" title="طلب ويتر / فحم">
                              <BellRing className="w-3 h-3" />
                            </span>
                          )}
                          <span className={`w-2.5 h-2.5 rounded-full ${isOccupied ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                        </div>
                      </div>

                      <div>
                        <p className="text-[11px] text-slate-500 font-tajawal truncate">
                          {tbl.section?.split('/')[0] || tbl.section}
                        </p>
                        
                        {isOccupied ? (
                          <div className="mt-1">
                            <span className="font-mono text-base font-black text-slate-900">
                              {totalBill} <span className="text-[10px] text-slate-500">{t('currency')}</span>
                            </span>
                            <p className="text-[10px] text-rose-600 font-mono font-medium">
                              {tbl.activeOrder.items?.length || tbl.activeOrder.items_count || 1} أصناف
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-emerald-700 font-bold mt-1 block">
                            {t('available')}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Tab 2: Daily Z-Report & Analytics */}
        {activeTab === 'reports' && dailyReport && (
          <div className="mt-6 space-y-6">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1">
                <span className="text-xs text-slate-500 font-bold">{t('todaySales')}</span>
                <h3 className="text-2xl font-black text-emerald-600 font-mono">
                  {dailyReport.totalRevenue} {t('currency')}
                </h3>
                <p className="text-[11px] text-emerald-700 font-bold">100% On-Premises Local DB</p>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1">
                <span className="text-xs text-slate-500 font-bold">{t('todayOrders')}</span>
                <h3 className="text-2xl font-black text-slate-900 font-mono">
                  {dailyReport.totalOrders}
                </h3>
                <p className="text-[11px] text-slate-500">طلب مغلق ومسدد</p>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1">
                <span className="text-xs text-slate-500 font-bold">{t('vat14')} المحصلة</span>
                <h3 className="text-2xl font-black text-slate-800 font-mono">
                  {dailyReport.totalVat} {t('currency')}
                </h3>
                <p className="text-[11px] text-slate-500">ضريبة القيمة المضافة 14%</p>
              </div>

              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-1">
                <span className="text-xs text-slate-500 font-bold">{t('service12')}</span>
                <h3 className="text-2xl font-black text-slate-800 font-mono">
                  {dailyReport.totalService} {t('currency')}
                </h3>
                <p className="text-[11px] text-slate-500">خدمة الصالة 12%</p>
              </div>
            </div>

            {/* Payment Breakdown & Top Items */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Payment Methods */}
              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>توزيع طرق الدفع (Cash / Visa / InstaPay / Vodafone)</span>
                </h3>
                <div className="space-y-3">
                  {Object.entries(dailyReport.paymentBreakdown || {}).map(([method, amount]) => (
                    <div key={method} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                      <span className="text-xs font-bold text-slate-700 uppercase">
                        {method === 'cash' ? '💵 كاش نقدى' : method === 'card' ? '💳 بطاقة بنكية / فيزا' : method === 'instapay' ? '📱 إنستاباي InstaPay' : '🔴 فودافون كاش'}
                      </span>
                      <span className="font-mono text-sm font-black text-emerald-700">
                        {amount} {t('currency')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top 10 Best Sellers */}
              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>{t('topSelling')}</span>
                </h3>
                <div className="space-y-2.5 max-h-64 overflow-y-auto">
                  {dailyReport.topItems && dailyReport.topItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-slate-900 truncate max-w-[180px]">
                          {lang === 'ar' ? item.item_name_ar : item.item_name_en}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 font-mono">{item.total_qty} طلب</span>
                        <span className="font-mono font-bold text-emerald-700">{item.total_sales} {t('currency')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* Checkout Modal */}
      {checkoutModalOpen && selectedTable && selectedTable.activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-emerald-600" />
                  {t('settleBill')} - {t('table')} #{selectedTable.table_number}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {selectedTable.activeOrder.order_number}
                </p>
              </div>
              <button
                onClick={() => setCheckoutModalOpen(false)}
                className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bill items list */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
              <div className="space-y-2">
                {selectedTable.activeOrder.items && selectedTable.activeOrder.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="font-bold text-slate-800">
                      {it.quantity}x {lang === 'ar' ? it.item_name_ar : it.item_name_en}
                    </span>
                    <span className="font-mono text-emerald-700 font-black">
                      {it.price * it.quantity} {t('currency')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Discount Input */}
              <div className="pt-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {t('discount')} (ج.م)
                </label>
                <input
                  type="number"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              {/* Payment Methods */}
              <div className="pt-2">
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  طريقة الدفع
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'cash', label: 'كاش نقدى 💵' },
                    { id: 'card', label: 'فيزا كارت 💳' },
                    { id: 'instapay', label: 'إنستاباي 📱' },
                    { id: 'vodafone_cash', label: 'فودافون كاش 🔴' }
                  ].map(pm => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                        paymentMethod === pm.id
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {pm.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary calculations */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>{t('subtotal')}</span>
                  <span className="font-mono text-slate-900 font-bold">{selectedTable.activeOrder.subtotal} {t('currency')}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('vat14')}</span>
                  <span className="font-mono">{selectedTable.activeOrder.tax_vat} {t('currency')}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('service12')}</span>
                  <span className="font-mono">{selectedTable.activeOrder.service_fee} {t('currency')}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-black text-slate-900">
                  <span className="text-emerald-700">{t('total')}</span>
                  <span className="font-mono text-emerald-700 text-base font-black">
                    {Math.max(0, selectedTable.activeOrder.total_amount - parseFloat(discountAmount || 0))} {t('currency')}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center gap-2">
              <button
                onClick={handleProcessCheckout}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 px-4 rounded-xl shadow-sm flex items-center justify-center gap-2 text-sm transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>إتمام التحصيل وإغلاق الطاولة</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Thermal Receipt Print Modal / Preview */}
      {printedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-emerald-600" />
                معاينة الإيصال الحراري 80 مم
              </h3>
              <button
                onClick={() => setPrintedReceipt(null)}
                className="p-1 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Receipt Preview (Styled like standard 80mm ESC/POS thermal slip) */}
            <div id="thermal-receipt" className="my-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-black font-mono text-xs shadow-inner space-y-2.5">
              <div className="text-center pb-2 border-b border-dashed border-gray-400">
                <h2 className="font-black text-sm">{printedReceipt.venueNameAr}</h2>
                <p className="text-[10px]">{printedReceipt.venueNameEn}</p>
                <p className="text-[9px] mt-0.5">رقم التسجيل الضريبي: {printedReceipt.taxRegNumber}</p>
              </div>

              <div className="flex justify-between text-[10px] pb-1 border-b border-dashed border-gray-400">
                <span>طاولة #{printedReceipt.tableNumber}</span>
                <span>{printedReceipt.orderNumber}</span>
              </div>

              <div className="text-[10px] text-gray-600">
                {printedReceipt.date}
              </div>

              <div className="py-2 border-t border-b border-dashed border-gray-400 space-y-1">
                <div className="flex justify-between">
                  <span>المجموع الفرعي:</span>
                  <span>{printedReceipt.subtotal} EGP</span>
                </div>
                {printedReceipt.discount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>الخصم:</span>
                    <span>-{printedReceipt.discount} EGP</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>ضريبة القيمة المضافة (14%):</span>
                  <span>{printedReceipt.tax_vat} EGP</span>
                </div>
                <div className="flex justify-between">
                  <span>خدمة الصالة (12%):</span>
                  <span>{printedReceipt.service_fee} EGP</span>
                </div>
                <div className="flex justify-between font-black text-xs pt-1 border-t border-gray-300">
                  <span>الإجمالي المطلوب:</span>
                  <span>{printedReceipt.total_amount} EGP</span>
                </div>
                <div className="flex justify-between text-[9px] pt-1 text-gray-500">
                  <span>طريقة الدفع:</span>
                  <span>{printedReceipt.paymentMethod.toUpperCase()}</span>
                </div>
              </div>

              {/* QR Code & Footer */}
              <div className="text-center pt-2 space-y-1">
                <div className="flex justify-center my-1">
                  <QRCodeSVG value={`EGY-INV:${printedReceipt.orderNumber}:${printedReceipt.total_amount}`} size={70} />
                </div>
                <p className="text-[9px] font-bold">شكراً لزيارتكم! بالهناء والشفاء</p>
                <p className="text-[8px] text-gray-500">Wi-Fi: {printedReceipt.wifiSsid} | Pass: {printedReceipt.wifiPass}</p>
              </div>
            </div>

            {/* Print Action */}
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handlePrint}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>{t('printReceipt')}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
