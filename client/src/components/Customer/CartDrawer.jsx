import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useCart } from '../../context/CartContext';
import { useSocket } from '../../context/SocketContext';
import { X, Trash2, Plus, Minus, Send, ShoppingBag, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export function CartDrawer({ isOpen, onClose }) {
  const { lang, t } = useLanguage();
  const { cart, updateQuantity, removeFromCart, clearCart, totalItemsCount, subtotal, taxVat, serviceFee, grandTotal, tableNumber, guestNotes, setGuestNotes } = useCart();
  const { playSound } = useSocket();
  const [loading, setLoading] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null);

  if (!isOpen) return null;

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    setLoading(true);

    const orderPayload = {
      table_number: tableNumber,
      guest_name: `طاولة ${tableNumber}`,
      notes: guestNotes,
      items: cart.map(item => ({
        id: item.id,
        name: lang === 'ar' ? item.name_ar : item.name_en,
        name_ar: item.name_ar,
        name_en: item.name_en,
        price: item.price,
        quantity: item.quantity,
        station_type: item.station_type || 'barista',
        modifiers: item.selectedModifiers || [],
        notes: item.itemNotes || ''
      }))
    };

    let orderData = null;
    try {
      const res = await fetch(`http://${window.location.hostname}:3001/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });
      const data = await res.json();
      if (data.success) {
        orderData = data.data;
      }
    } catch (err) {
      // Fallback for static Vercel demo mode
      orderData = {
        id: Date.now(),
        order_number: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        table_number: tableNumber,
        grand_total: grandTotal,
        status: 'pending'
      };
    }

    if (orderData) {
      playSound('ready');
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      setSuccessOrder(orderData);
      clearCart();
      setTimeout(() => {
        setSuccessOrder(null);
        onClose();
      }, 2500);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm animate-fadeIn flex justify-end">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-white text-base">
                {t('viewCart')} ({totalItemsCount})
              </h3>
              <p className="text-xs text-amber-400 font-bold">
                {t('table')} #{tableNumber}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success State */}
        {successOrder ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/40 flex items-center justify-center animate-bounce-short">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-xl font-black text-white">
              {t('orderSentSuccess')}
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 font-tajawal max-w-xs">
              {lang === 'ar' ? `رقم الطلب: ${successOrder.order_number}. يمكنك متابعة حالة الطلب مباشرة من الشاشة!` : `Order #${successOrder.order_number}. Track real-time progress right on your table screen!`}
            </p>
          </div>
        ) : cart.length === 0 ? (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-slate-800/80 text-slate-500 flex items-center justify-center">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-300">
              {t('emptyCart')}
            </h4>
            <p className="text-xs text-slate-500 max-w-xs font-tajawal">
              {t('emptyCartDesc')}
            </p>
          </div>
        ) : (
          /* Items List */
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.map((item) => (
              <div
                key={item.cartItemId}
                className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-start justify-between gap-3 shadow-sm"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-extrabold text-white text-sm truncate">
                    {lang === 'ar' ? item.name_ar : item.name_en}
                  </h4>
                  
                  {/* Modifiers badge chips */}
                  {item.selectedModifiers && item.selectedModifiers.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.selectedModifiers.map((m, idx) => (
                        <span key={idx} className="text-[10px] bg-slate-800 text-amber-300 px-1.5 py-0.5 rounded-md border border-slate-700">
                          {m.label} {m.price > 0 && `(+${m.price})`}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Notes */}
                  {item.itemNotes && (
                    <p className="text-[11px] text-slate-400 font-tajawal mt-1 italic">
                      📝 {item.itemNotes}
                    </p>
                  )}

                  <div className="font-mono text-amber-400 font-bold text-xs mt-1.5">
                    {item.unitPrice * item.quantity} {t('currency')}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800 flex-shrink-0">
                  <button
                    onClick={() => updateQuantity(item.cartItemId, -1)}
                    className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center font-extrabold text-white text-xs">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.cartItemId, 1)}
                    className="p-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {/* General notes input */}
            <div className="pt-2">
              <label className="text-xs font-bold text-slate-300 block mb-1">
                {t('notes')} للمطبخ / البار
              </label>
              <textarea
                rows={2}
                value={guestNotes}
                onChange={(e) => setGuestNotes(e.target.value)}
                placeholder="أي طلب خاص بالطاولة..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        )}

        {/* Footer Totals & CTA */}
        {cart.length > 0 && !successOrder && (
          <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950 space-y-3">
            <div className="space-y-1.5 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>{t('subtotal')}</span>
                <span className="font-mono text-white font-bold">{subtotal} {t('currency')}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('vat14')}</span>
                <span className="font-mono">{taxVat} {t('currency')}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('service12')}</span>
                <span className="font-mono">{serviceFee} {t('currency')}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-800 text-sm font-black text-white">
                <span className="text-amber-400">{t('total')}</span>
                <span className="font-mono text-amber-400 text-base">{grandTotal} {t('currency')}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-black py-3.5 px-4 rounded-xl shadow-lg shadow-orange-950/60 flex items-center justify-center gap-2 text-sm transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? t('loading') : t('orderNow')}</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
