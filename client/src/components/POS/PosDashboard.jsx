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
  Layers
} from 'lucide-react';

export function PosDashboard() {
  const { lang, t } = useLanguage();
  const { lastEvent, playSound } = useSocket();

  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [activeTab, setActiveTab] = useState('floor'); // 'floor', 'reports'
  const [dailyReport, setDailyReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // Checkout modal
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [printedReceipt, setPrintedReceipt] = useState(null);

  const fetchPosData = async () => {
    try {
      const [tablesRes, reportsRes] = await Promise.all([
        fetch(`http://${window.location.hostname}:3001/api/tables`),
        fetch(`http://${window.location.hostname}:3001/api/reports/daily`)
      ]);
      const tablesJson = await tablesRes.json();
      const reportsJson = await reportsRes.json();

      if (tablesJson.success) setTables(tablesJson.data || []);
      if (reportsJson.success) setDailyReport(reportsJson.data || null);
    } catch (err) {
      console.error('POS fetch error:', err);
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
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 pb-28">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Header & Tab Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Point of Sale (POS)
              </span>
              <span className="text-xs text-slate-400">
                {tables.filter(t => t.status === 'occupied').length} / {tables.length} {lang === 'ar' ? 'طاولة مشغولة' : 'tables occupied'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              {t('posTitle')}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('floor')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'floor'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{t('tablesGrid')}</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'reports'
                  ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{t('dailyZReport')}</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Floor Plan */}
        {activeTab === 'floor' && (
          <div className="mt-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
              {tables.map((tbl) => {
                const isOccupied = tbl.status === 'occupied' && tbl.activeOrder;
                const totalBill = isOccupied ? tbl.activeOrder.total_amount : 0;

                return (
                  <div
                    key={tbl.id}
                    onClick={() => handleTableClick(tbl)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-36 ${
                      isOccupied
                        ? 'bg-gradient-to-br from-amber-950/50 via-slate-900 to-slate-900 border-amber-500/60 shadow-lg shadow-amber-950/30 hover:scale-[1.02]'
                        : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm ${
                        isOccupied ? 'bg-amber-500 text-black font-mono shadow-md' : 'bg-slate-800 text-slate-300'
                      }`}>
                        #{tbl.table_number}
                      </span>

                      <span className={`w-2.5 h-2.5 rounded-full ${isOccupied ? 'bg-amber-500 animate-pulse' : 'bg-slate-700'}`} />
                    </div>

                    <div>
                      <p className="text-[11px] text-slate-400 font-tajawal truncate">
                        {tbl.section}
                      </p>
                      
                      {isOccupied ? (
                        <div className="mt-1">
                          <span className="font-mono text-base font-black text-amber-400">
                            {totalBill} <span className="text-[10px]">{t('currency')}</span>
                          </span>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {tbl.activeOrder.items?.length || 1} أصناف
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 font-bold mt-1 block">
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
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-bold">{t('todaySales')}</span>
                <h3 className="text-2xl font-black text-amber-400 font-mono">
                  {dailyReport.totalRevenue} {t('currency')}
                </h3>
                <p className="text-[11px] text-emerald-400 font-bold">100% On-Premises Local DB</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-bold">{t('todayOrders')}</span>
                <h3 className="text-2xl font-black text-white font-mono">
                  {dailyReport.totalOrders}
                </h3>
                <p className="text-[11px] text-slate-400">طلب مغلق ومسدد</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-bold">{t('vat14')} المحصلة</span>
                <h3 className="text-2xl font-black text-blue-400 font-mono">
                  {dailyReport.totalVat} {t('currency')}
                </h3>
                <p className="text-[11px] text-slate-400">ضريبة القيمة المضافة 14%</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-bold">{t('service12')}</span>
                <h3 className="text-2xl font-black text-purple-400 font-mono">
                  {dailyReport.totalService} {t('currency')}
                </h3>
                <p className="text-[11px] text-slate-400">خدمة الصالة 12%</p>
              </div>
            </div>

            {/* Payment Breakdown & Top Items */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Payment Methods */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span>توزيع طرق الدفع (Cash / Visa / InstaPay / Vodafone)</span>
                </h3>
                <div className="space-y-3">
                  {Object.entries(dailyReport.paymentBreakdown || {}).map(([method, amount]) => (
                    <div key={method} className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-xs font-bold text-slate-300 uppercase">
                        {method === 'cash' ? '💵 كاش نقدى' : method === 'card' ? '💳 بطاقة بنكية / فيزا' : method === 'instapay' ? '📱 إنستاباي InstaPay' : '🔴 فودافون كاش'}
                      </span>
                      <span className="font-mono text-sm font-black text-amber-400">
                        {amount} {t('currency')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top 10 Best Sellers */}
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                <h3 className="text-sm font-black text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>{t('topSelling')}</span>
                </h3>
                <div className="space-y-2.5 max-h-64 overflow-y-auto">
                  {dailyReport.topItems && dailyReport.topItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center font-bold text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-white truncate max-w-[180px]">
                          {lang === 'ar' ? item.item_name_ar : item.item_name_en}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400 font-mono">{item.total_qty} طلب</span>
                        <span className="font-mono font-bold text-amber-400">{item.total_sales} {t('currency')}</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-amber-400" />
                  {t('settleBill')} - {t('table')} #{selectedTable.table_number}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {selectedTable.activeOrder.order_number}
                </p>
              </div>
              <button
                onClick={() => setCheckoutModalOpen(false)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Bill items list */}
            <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
              <div className="space-y-2">
                {selectedTable.activeOrder.items && selectedTable.activeOrder.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs p-2 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="font-bold text-white">
                      {it.quantity}x {lang === 'ar' ? it.item_name_ar : it.item_name_en}
                    </span>
                    <span className="font-mono text-amber-400 font-bold">
                      {it.price * it.quantity} {t('currency')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Discount Input */}
              <div className="pt-2">
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  {t('discount')} (ج.م)
                </label>
                <input
                  type="number"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              {/* Payment Methods */}
              <div className="pt-2">
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
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
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {pm.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary calculations */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>{t('subtotal')}</span>
                  <span className="font-mono text-white">{selectedTable.activeOrder.subtotal} {t('currency')}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('vat14')}</span>
                  <span className="font-mono">{selectedTable.activeOrder.tax_vat} {t('currency')}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('service12')}</span>
                  <span className="font-mono">{selectedTable.activeOrder.service_fee} {t('currency')}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-800 text-sm font-black text-white">
                  <span className="text-amber-400">{t('total')}</span>
                  <span className="font-mono text-amber-400 text-base">
                    {Math.max(0, selectedTable.activeOrder.total_amount - parseFloat(discountAmount || 0))} {t('currency')}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
              <button
                onClick={handleProcessCheckout}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-950/60 flex items-center justify-center gap-2 text-sm transition-all"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-5">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                <Printer className="w-4 h-4 text-amber-400" />
                معاينة الإيصال الحراري 80 مم
              </h3>
              <button
                onClick={() => setPrintedReceipt(null)}
                className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Receipt Preview (Styled like standard 80mm ESC/POS thermal slip) */}
            <div id="thermal-receipt" className="my-4 p-4 rounded-xl bg-white text-black font-mono text-xs shadow-inner space-y-2.5">
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
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-black py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md"
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
