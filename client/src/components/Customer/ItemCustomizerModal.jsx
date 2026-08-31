import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { X, Plus, Minus, Check, Sparkles } from 'lucide-react';

export function ItemCustomizerModal({ item, onClose }) {
  const { lang, t } = useLanguage();
  const { addToCart } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [selectedModifiers, setSelectedModifiers] = useState(() => {
    // Select first option for each modifier by default
    const initial = [];
    if (item.modifiers && Array.isArray(item.modifiers)) {
      item.modifiers.forEach(group => {
        if (group.options && group.options.length > 0) {
          initial.push({
            groupName: group.name,
            label: group.options[0].label,
            price: group.options[0].price || 0
          });
        }
      });
    }
    return initial;
  });
  const [itemNotes, setItemNotes] = useState('');

  if (!item) return null;

  const handleSelectModifier = (groupName, option) => {
    setSelectedModifiers(prev => {
      const filtered = prev.filter(m => m.groupName !== groupName);
      return [...filtered, {
        groupName,
        label: option.label,
        price: option.price || 0
      }];
    });
  };

  const extraModifiersPrice = selectedModifiers.reduce((sum, m) => sum + (m.price || 0), 0);
  const unitPrice = item.price + extraModifiersPrice;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    addToCart(item, selectedModifiers, quantity, itemNotes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-start justify-between relative bg-slate-950/50">
          <div className="pr-2">
            <h3 className="text-lg sm:text-xl font-black text-white">
              {lang === 'ar' ? item.name_ar : item.name_en}
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 font-tajawal mt-1 leading-relaxed">
              {lang === 'ar' ? item.description_ar : item.description_en}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modifiers List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {item.modifiers && item.modifiers.map((group, gIdx) => {
            const currentSelected = selectedModifiers.find(m => m.groupName === group.name);
            return (
              <div key={gIdx} className="space-y-2.5">
                <h4 className="text-xs sm:text-sm font-bold text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  {group.name}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {group.options.map((opt, oIdx) => {
                    const isSelected = currentSelected && currentSelected.label === opt.label;
                    return (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() => handleSelectModifier(group.name, opt)}
                        className={`p-3 rounded-xl border text-xs sm:text-sm font-semibold transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-950/40 ring-1 ring-amber-500/50'
                            : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                            isSelected ? 'border-amber-400 bg-amber-500 text-black' : 'border-slate-600'
                          }`}>
                            {isSelected && <Check className="w-3 h-3" />}
                          </div>
                          <span>{opt.label}</span>
                        </div>
                        {opt.price > 0 && (
                          <span className="text-amber-400 text-xs font-bold font-mono">
                            +{opt.price} {t('currency')}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Notes input */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-bold text-slate-300 block">
              {t('notes')} (اختياري)
            </label>
            <input
              type="text"
              value={itemNotes}
              onChange={(e) => setItemNotes(e.target.value)}
              placeholder="مثال: بدون سكر، ساخن جداً، زيادة صوص..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-3">
          
          {/* Quantity Controls */}
          <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700">
            <button
              onClick={() => setQuantity(q => Math.max(1, q - 1))}
              className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-extrabold text-white text-sm">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(q => q + 1)}
              className="p-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart CTA */}
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold py-3 px-4 rounded-xl shadow-lg shadow-orange-950/60 flex items-center justify-between text-xs sm:text-sm transition-all"
          >
            <span>{t('addToCart')}</span>
            <span className="font-mono text-amber-200 text-sm sm:text-base">
              {totalPrice} {t('currency')}
            </span>
          </button>

        </div>

      </div>
    </div>
  );
}
