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
  const { isConnected } = useSocket();
  const { totalItemsCount, tableNumber, setTableNumber } = useCart();
  const { currentUser, setIsPinModalOpen } = useAuth();

  const navItems = [
    { id: 'showcase', label: t('tabShowcase'), icon: Layers, badge: 'PROD' },
    { id: 'menu', label: t('tabMenu'), icon: UtensilsCrossed },
    { id: 'captain', label: t('tabCaptain'), icon: BellRing },
    { id: 'kds', label: t('tabKDS'), icon: ChefHat },
    { id: 'pos', label: t('tabPOS'), icon: Receipt },
    { id: 'admin', label: t('tabAdmin'), icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('showcase')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-400 p-0.5 shadow-md flex items-center justify-center flex-shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <span className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Q</span>
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-lg text-white tracking-tight">QRMate</h1>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">On-Prem</span>
              </div>
              <p className="text-xs text-slate-400 font-tajawal truncate max-w-[180px]">نظام المطاعم والكافيهات الذكي</p>
            </div>
          </div>

          {/* Center Navigation Pills */}
          <nav className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800/80 overflow-x-auto no-scrollbar max-w-[60%] sm:max-w-none">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md shadow-orange-950/50'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{item.label}</span>
                  {item.badge && !isActive && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold hidden lg:inline">
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
              <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700 rounded-lg px-2 py-1 text-xs text-amber-400 font-bold">
                <span>{t('table')}</span>
                <select 
                  value={tableNumber} 
                  onChange={(e) => setTableNumber(parseInt(e.target.value, 10))}
                  className="bg-transparent text-white font-extrabold focus:outline-none cursor-pointer"
                >
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n} className="bg-slate-900 text-white">
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
                className="relative p-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-all flex items-center justify-center"
                title={t('viewCart')}
              >
                <ShoppingBag className="w-5 h-5" />
                {totalItemsCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-orange-600 text-white text-[10px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900 animate-pulse">
                    {totalItemsCount}
                  </span>
                )}
              </button>
            )}

            {/* Staff User Switcher Button */}
            <button
              onClick={() => setIsPinModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-amber-500/30 text-xs font-bold text-amber-300 transition-colors"
              title="تبديل أو تسجيل دخول موظف (PIN Login)"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span className="max-w-[100px] truncate hidden sm:inline">
                {currentUser ? currentUser.name.split(' ')[0] : 'دخول الطاقم'}
              </span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-xs font-bold text-slate-300 border border-slate-700/80 transition-colors"
              title="تغيير اللغة / Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
            </button>

            {/* Connection Status Dot */}
            <div 
              className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 shadow-emerald-500/50 shadow-sm animate-pulse' : 'bg-rose-500 shadow-rose-500/50'}`}
              title={isConnected ? 'متصل بالشبكة المحلية (Local LAN Active)' : 'غير متصل بالخادم المحلي'}
            />
          </div>

        </div>
      </div>
    </header>
  );
}
