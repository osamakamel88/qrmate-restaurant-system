import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useSocket } from '../../context/SocketContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Sparkles, 
  UtensilsCrossed, 
  ChefHat, 
  BellRing, 
  Receipt, 
  ShieldCheck, 
  Globe, 
  Wifi, 
  Layers,
  ShoppingBag,
  User,
  Lock
} from 'lucide-react';

export function Navbar({ activeTab, setActiveTab, onOpenCart }) {
  const { lang, toggleLanguage, t } = useLanguage();
  const { isConnected, lastEvent } = useSocket();
  const { totalItemsCount, tableNumber, setTableNumber } = useCart();
  const { currentUser, setIsPinModalOpen } = useAuth();

  const [pendingCallsCount, setPendingCallsCount] = React.useState(0);

  const fetchCallsCount = async () => {
    try {
      const res = await fetch(`http://${window.location.hostname}:3001/api/calls`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setPendingCallsCount(json.data.filter(c => c.status === 'pending').length);
      }
    } catch (e) {
      // ignore
    }
  };

  React.useEffect(() => {
    fetchCallsCount();
    const interval = setInterval(fetchCallsCount, 10000);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    if (lastEvent?.type === 'NEW_TABLE_CALL' || lastEvent?.type === 'CALL_STATUS_CHANGED') {
      fetchCallsCount();
    }
  }, [lastEvent]);

  const navItems = [
    { id: 'showcase', label: t('tabShowcase'), icon: Layers, badge: 'PROD' },
    { id: 'menu', label: t('tabMenu'), icon: UtensilsCrossed },
    { id: 'captain', label: t('tabCaptain'), icon: BellRing, alertCount: pendingCallsCount },
    { id: 'kds', label: t('tabKDS'), icon: ChefHat },
    { id: 'pos', label: t('tabPOS'), icon: Receipt },
    { id: 'admin', label: t('tabAdmin'), icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('showcase')}>
            <div className="w-10 h-10 rounded-xl bg-emerald-500 p-0.5 shadow-sm flex items-center justify-center flex-shrink-0">
              <div className="w-full h-full bg-emerald-600 rounded-[10px] flex items-center justify-center">
                <span className="text-xl font-black text-white">Q</span>
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-lg text-slate-900 tracking-tight">QRMate</h1>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">On-Prem</span>
              </div>
              <p className="text-xs text-slate-500 font-tajawal truncate max-w-[180px]">نظام المطاعم والكافيهات الذكي</p>
            </div>
          </div>

          {/* Center Navigation Pills */}
          <nav className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 overflow-x-auto no-scrollbar max-w-[60%] sm:max-w-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-700/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{item.label}</span>
                  {item.alertCount > 0 && (
                    <span className="bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full animate-bounce shadow-sm">
                      {item.alertCount}
                    </span>
                  )}
                  {item.badge && !isActive && !item.alertCount && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold hidden lg:inline">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            
            {/* Table Number Selector (Only visible on Menu or quick switcher) */}
            {activeTab === 'menu' && (
              <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg px-2 py-1 text-xs text-emerald-700 font-bold">
                <span>{t('table')}</span>
                <select 
                  value={tableNumber} 
                  onChange={(e) => setTableNumber(parseInt(e.target.value, 10))}
                  className="bg-transparent text-slate-900 font-extrabold focus:outline-none cursor-pointer"
                >
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n} className="bg-white text-slate-900">
                      #{n}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Cart Button (for menu mode) */}
            {activeTab === 'menu' && (
              <button
                onClick={onOpenCart}
                className="relative p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-all flex items-center justify-center"
                title={t('viewCart')}
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItemsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                    {totalItemsCount}
                  </span>
                )}
              </button>
            )}

            {/* Staff User Switcher Button */}
            <button
              onClick={() => setIsPinModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors"
              title="تبديل أو تسجيل دخول موظف (PIN Login)"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span className="max-w-[100px] truncate hidden sm:inline">
                {currentUser ? currentUser.name.split(' ')[0] : 'دخول الطاقم'}
              </span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-xs font-bold text-slate-700 border border-slate-200 transition-colors"
              title="تغيير اللغة / Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
            </button>

            {/* Connection Status Dot */}
            <div 
              className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 ring-2 ring-emerald-100 animate-pulse' : 'bg-rose-500'}`}
              title={isConnected ? 'متصل بالشبكة المحلية (Local LAN Active)' : 'غير متصل بالخادم المحلي'}
            />
          </div>

        </div>
      </div>
    </header>
  );
}
