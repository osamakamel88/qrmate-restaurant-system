import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useSocket } from '../../context/SocketContext';
import { TableProgressBanner } from './TableProgressBanner';
import { ItemCustomizerModal } from './ItemCustomizerModal';
import { CallWaiterModal } from './CallWaiterModal';
import { RequestBillModal } from './RequestBillModal';
import { FALLBACK_CATEGORIES, FALLBACK_ITEMS, FALLBACK_SETTINGS } from '../../i18n/mockData';
import { 
  Coffee, 
  CupSoda, 
  Utensils, 
  Sandwich, 
  Pizza, 
  Cake, 
  Flame, 
  Search, 
  Plus, 
  BellRing, 
  Receipt, 
  Wifi, 
  Sparkles, 
  Info,
  Layers
} from 'lucide-react';

const iconMap = {
  Coffee: Coffee,
  CupSoda: CupSoda,
  Utensils: Utensils,
  Sandwich: Sandwich,
  Pizza: Pizza,
  Cake: Cake,
  Flame: Flame,
};

export function CustomerMenu({ onOpenCart }) {
  const { lang, t } = useLanguage();
  const { tableNumber, setTableNumber, addToCart } = useCart();
  const { lastEvent } = useSocket();

  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [settings, setSettings] = useState({});
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedItemForCustomize, setSelectedItemForCustomize] = useState(null);
  const [showCallWaiterModal, setShowCallWaiterModal] = useState(false);
  const [showRequestBillModal, setShowRequestBillModal] = useState(false);

  const fetchMenuData = async () => {
    try {
      const [menuRes, settingsRes] = await Promise.all([
        fetch(`http://${window.location.hostname}:3001/api/menu`),
        fetch(`http://${window.location.hostname}:3001/api/settings`)
      ]);
      const menuData = await menuRes.json();
      const settingsData = await settingsRes.json();

      if (menuData.success) {
        setCategories(menuData.data.categories || []);
        setItems(menuData.data.items || []);
        if (!activeCategory && menuData.data.categories?.length > 0) {
          setActiveCategory(menuData.data.categories[0].id);
        }
      } else {
        setCategories(FALLBACK_CATEGORIES);
        setItems(FALLBACK_ITEMS);
        setActiveCategory(FALLBACK_CATEGORIES[0].id);
      }

      if (settingsData.success) {
        setSettings(settingsData.data || {});
      } else {
        setSettings(FALLBACK_SETTINGS);
      }
    } catch (err) {
      console.warn('Backend offline / Static Vercel mode. Using demo menu catalogue.');
      setCategories(FALLBACK_CATEGORIES);
      setItems(FALLBACK_ITEMS);
      setActiveCategory(FALLBACK_CATEGORIES[0].id);
      setSettings(FALLBACK_SETTINGS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuData();
  }, []);

  useEffect(() => {
    if (lastEvent && lastEvent.type === 'MENU_UPDATED') {
      fetchMenuData();
    }
  }, [lastEvent]);

  const filteredItems = items.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category_id === activeCategory;
    const matchesSearch = !searchQuery || 
      item.name_ar.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description_ar && item.description_ar.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.description_en && item.description_en.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      
      {/* Venue Hero Banner */}
      <div className="relative bg-white border-b border-slate-200/80 pt-6 pb-8 px-4 sm:px-6 shadow-sm">
        <div className="max-w-4xl mx-auto">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Venue Profile */}
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {lang === 'ar' ? 'القائمة الرقمية الذكية' : 'Smart Digital Menu'}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                  {settings.wifi_ssid || 'El-Aseel-Guest'}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1.5 tracking-tight">
                {lang === 'ar' ? (settings.venue_name_ar || 'كافيه وبسترو الأصيل') : (settings.venue_name_en || 'El Aseel Cafe & Bistro')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-tajawal mt-0.5">
                {lang === 'ar' ? settings.slogan_ar : settings.slogan_en}
              </p>
            </div>

            {/* Table Badge & Quick Actions */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              
              {/* Call Waiter */}
              <button
                onClick={() => setShowCallWaiterModal(true)}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <BellRing className="w-4 h-4 text-amber-500 animate-pulse" />
                <span>{t('callWaiter')}</span>
              </button>

              {/* Request Bill */}
              <button
                onClick={() => setShowRequestBillModal(true)}
                className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span>{t('requestBill')}</span>
              </button>

            </div>

          </div>

          {/* Search bar */}
          <div className="mt-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pr-10 pl-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white shadow-sm transition-all"
            />
          </div>

        </div>
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-6 pt-5">
        
        {/* Table Live Order Progress */}
        <TableProgressBanner tableNumber={tableNumber} />

        {/* Category Navigation Pills */}
        <div className="sticky top-16 z-30 bg-slate-50/95 backdrop-blur-md py-3 mb-4 -mx-3 px-3 sm:-mx-6 sm:px-6 overflow-x-auto no-scrollbar flex items-center gap-2 border-b border-slate-200/60">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeCategory === 'all'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-700/20 font-extrabold'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{t('all')}</span>
          </button>

          {categories.map((cat) => {
            const IconComponent = iconMap[cat.icon] || Coffee;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-700/20 font-extrabold'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <IconComponent className="w-3.5 h-3.5" />
                <span>{lang === 'ar' ? cat.name_ar : cat.name_en}</span>
              </button>
            );
          })}
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 font-bold text-sm">
            {t('loading')}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 text-center space-y-2">
            <p className="text-slate-600 font-bold text-sm">لا توجد نتائج مطابقة للبحث</p>
            <p className="text-xs text-slate-400">جرب البحث بكلمات أخرى أو اختر قسماً مختلفاً</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            {filteredItems.map((item) => {
              const hasModifiers = item.modifiers && item.modifiers.length > 0;
              const isOutOfStock = !item.is_available;

              return (
                <div
                  key={item.id}
                  onClick={() => !isOutOfStock && setSelectedItemForCustomize(item)}
                  className={`group rounded-2xl bg-white border border-slate-200/80 p-4 transition-all flex flex-col justify-between hover:border-emerald-300 hover:shadow-md cursor-pointer ${
                    isOutOfStock ? 'opacity-50 pointer-events-none' : ''
                  }`}
                >
                  <div>
                    {/* Top tags */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex flex-wrap gap-1">
                        {item.tags && item.tags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200"
                          >
                            {tag === 'popular' ? t('popular') : tag === 'chef_choice' ? t('chefChoice') : tag === 'spicy' ? t('spicy') : tag === 'vegan' ? t('vegan') : tag}
                          </span>
                        ))}
                      </div>

                      <span className="font-mono text-xs text-slate-400 uppercase font-bold">
                        {item.station_type === 'kitchen' ? '🍳 Kitchen' : '☕ Barista'}
                      </span>
                    </div>

                    <h3 className="font-black text-slate-900 text-base leading-snug group-hover:text-emerald-700 transition-colors">
                      {lang === 'ar' ? item.name_ar : item.name_en}
                    </h3>
                    <p className="text-xs text-slate-500 font-tajawal mt-1 line-clamp-2 leading-relaxed">
                      {lang === 'ar' ? item.description_ar : item.description_en}
                    </p>
                  </div>

                  {/* Price & Order Action */}
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                    <div className="font-mono font-black text-emerald-700 text-base">
                      {item.price} <span className="text-xs font-normal text-slate-500">{t('currency')}</span>
                    </div>

                    {isOutOfStock ? (
                      <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg border border-rose-200">
                        {t('outOfStock')}
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedItemForCustomize(item);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-emerald-700/20 transition-transform active:scale-95 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{hasModifiers ? (lang === 'ar' ? 'تخصيص وإضافة' : 'Customize') : (lang === 'ar' ? 'اختيار وإضافة +' : 'Select & Add')}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Item Customizer Modal */}
      {selectedItemForCustomize && (
        <ItemCustomizerModal
          item={selectedItemForCustomize}
          onClose={() => setSelectedItemForCustomize(null)}
        />
      )}

      {/* Call Waiter Modal */}
      {showCallWaiterModal && (
        <CallWaiterModal
          tableNumber={tableNumber}
          onClose={() => setShowCallWaiterModal(false)}
        />
      )}

      {/* Request Bill Modal */}
      {showRequestBillModal && (
        <RequestBillModal
          tableNumber={tableNumber}
          onClose={() => setShowRequestBillModal(false)}
        />
      )}

    </div>
  );
}
