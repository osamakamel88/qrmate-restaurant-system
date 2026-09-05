import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Phone, MessageCircle, Globe, Heart, ShieldCheck, Zap, ExternalLink } from 'lucide-react';

export function Footer() {
  const { lang, t } = useLanguage();
  const phoneNumber = '01018815050';
  const whatsappUrl = `https://wa.me/201018815050?text=${encodeURIComponent('مرحباً، أود الاستفسار عن باقات نظام QRMate واستاندات الـ NFC لكافيهي/مطعمي.')}`;
  const recodeUrl = 'https://www.linkedin.com/in/osama-kamel-dev';
  const domainUrl = 'https://instafeed.cloud';

  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600 text-xs font-tajawal pt-12 pb-8 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Row: Brand & Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-200/80">
          
          {/* Col 1: Brand & Slogan */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-sm shadow-sm">
                Q
              </div>
              <span className="text-lg font-black text-slate-900 tracking-tight">QRMate Egypt</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                On-Premise POS & NFC
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-md">
              {lang === 'ar'
                ? 'النظام الأول لإدارة طلبات الطاولات واستاندات الـ NFC والمكعبات الخشبية في مصر. تشغيل محلي 100% بدون انقطاع أو اعتماد على الكلاود مع اشتراك وترخيص سنوي ودعم مستمر.'
                : 'Egypt\'s premier local-first NFC & QR table ordering, KDS, and POS system. 100% offline resilience with zero cloud dependency and yearly licensing.'}
            </p>
            <div className="flex items-center gap-2 pt-1 text-slate-500">
              <Globe className="w-4 h-4 text-emerald-600" />
              <span className="text-slate-600 font-mono text-xs">
                QRMate On-Premise System
              </span>
            </div>
          </div>

          {/* Col 2: Quick Links & Contact */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              {lang === 'ar' ? 'تواصل مع المبيعات والدعم' : 'Sales & Support'}
            </h4>
            <div className="space-y-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 transition-colors font-bold text-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>واتساب: {phoneNumber}</span>
              </a>
              <a
                href={`tel:${phoneNumber}`}
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors text-xs font-mono"
              >
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>هاتف: {phoneNumber}</span>
              </a>
              <p className="text-[11px] text-slate-500">القاهرة - جمهورية مصر العربية</p>
            </div>
          </div>

          {/* Col 3: Developer & Agency Credits */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              {lang === 'ar' ? 'التطوير والتصميم' : 'Development & Design'}
            </h4>
            <div className="space-y-1.5">
              <a
                href={recodeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-200 text-xs font-bold transition-all mt-1"
              >
                <span>Recode Developments</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Row: Copyright & Developer Signature */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 text-center sm:text-right">
          <div>
            © {new Date().getFullYear()} QRMate Egypt. All Rights Reserved.
          </div>

          <div className="flex items-center gap-1 text-slate-500">
            <span>Developed & Designed with</span>
            <Heart className="w-3 h-3 text-rose-500 inline fill-rose-500" />
            <span>by</span>
            <a
              href={recodeUrl}
              target="_blank"
              rel="noreferrer"
              className="text-emerald-600 hover:text-emerald-700 font-bold transition-colors"
            >
              Recode Developments
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
