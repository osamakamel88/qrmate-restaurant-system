import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Sparkles, 
  QrCode, 
  Smartphone, 
  ShieldCheck, 
  WifiOff, 
  ChefHat, 
  BellRing, 
  Receipt, 
  ArrowRight, 
  CheckCircle2, 
  MessageCircle, 
  Phone, 
  Layers, 
  Box, 
  Flame, 
  Award,
  Zap
} from 'lucide-react';

export function ShowcaseLanding({ onOpenDemo }) {
  const { lang, t } = useLanguage();

  const [selectedPlan, setSelectedPlan] = useState('pro');

  const products = [
    {
      id: 'wood-cube',
      titleAr: 'مكعبات خشبية فاخرة محفورة بالليزر + شريحة NFC',
      titleEn: 'Laser-Engraved Luxury Wood Cubes with NFC',
      descAr: 'خشب زان طبيعي معالج، محفور عليه كود الـ QR وشعار كافيهك بالليزر مع شريحة NFC داخلية مخفية غير قابلة للتلف أو المسح.',
      descEn: 'Natural beech wood, precision laser-etched QR & logo with built-in waterproof NFC chip.',
      badge: 'الأكثر طلباً للكافيهات ⭐',
      material: 'خشب طبيعي / Wood',
      features: ['شريحة NFC مدمجة', 'حفر ليزر دقيق', 'مقاوم للماء والسوائل', 'ضمان استبدال']
    },
    {
      id: 'acrylic-stand',
      titleAr: 'استاندات أكريليك كريستال فاخرة وجهين (Tent Card / L-Stand)',
      titleEn: 'Crystal Acrylic Double-Sided L-Stands',
      descAr: 'استاند أكريليك متين وشفاف بتصميم مودرن أنيق مع طباعة UV عالية الدقة وشريحة NFC فائقة السرعة.',
      descEn: 'Sleek crystal-clear acrylic with vibrant UV printing & instant-tap NFC.',
      badge: 'تصميم عصري وجذاب ✨',
      material: 'أكريليك كريستال / Acrylic',
      features: ['طباعة ألوان UV فاخرة', 'NFC مدمج للطلب بلمسة', 'قاعدة ثابتة وثقيلة', 'سهل التنظيف']
    },
    {
      id: 'metal-plate',
      titleAr: 'بلاك وميداليات معدنية محفورة (Stainless / Brass)',
      titleEn: 'Brushed Metallic Laser-Etched Plates',
      descAr: 'معدن ستانلس ستيل مطفي محفور بالليزر مخصص للطاولات الخارجية والمطاعم الفاخرة التي تبحث عن أقصى درجات الفخامة والمتانة.',
      descEn: 'Brushed metal plate with laser engraving for high-end bistros and outdoor lounges.',
      badge: 'أقصى متانة وفخامة 👑',
      material: 'ستانلس ستيل / Metal',
      features: ['معدن غير قابل للخدش', 'مقاوم للشمس والأمطار', 'NFC مدمج ومحمي', 'عمر افتراضي غير محدود']
    }
  ];

  const packages = [
    {
      id: 'starter',
      nameAr: 'باقة الكافيه البداية',
      nameEn: 'Starter Cafe Pack',
      price: '6,500',
      period: 'سنوياً / 1 Year',
      descAr: 'مثالية للكافيهات الصغيرة والمقاهي العصرية',
      includes: [
        'ترخيص البرنامج السنوي (On-Premises محلي)',
        '10 استاندات أكريليك NFC + QR مخصصة باسم الكافيه',
        'قائمة طعام رقمية تفاعلية باللغتين العربية والإنجليزية',
        'نظام طلبات الطاولات وحساب الشيك التلقائي',
        'دعم فني وتدريب طاقم العمل'
      ]
    },
    {
      id: 'pro',
      nameAr: 'باقة البرو الشاملة (المطبخ + البار + الكاشير)',
      nameEn: 'Pro Complete Suite',
      price: '12,500',
      period: 'سنوياً / 1 Year',
      popular: true,
      descAr: 'الحل المتكامل الأكثر مبيعاً للمطاعم والكافيهات الكبرى',
      includes: [
        'ترخيص سنوي شامل لكافة الشاشات بدون حدود',
        '25 مكعب خشبي فاخر محفور بالليزر مع NFC + QR',
        'شاشة الكابتن والويتر للتنبيهات الصوتية اللحظية',
        'شاشات المطبخ والبار KDS لتجهيز الأوردرات',
        'نظام الكاشير POS وطباعة الإيصال الحراري 80 مم',
        'صيانة دورية وتحديثات مجانية ودعم واتساب VIP'
      ]
    },
    {
      id: 'enterprise',
      nameAr: 'باقة الفروع واللاونج VIP',
      nameEn: 'Enterprise & Multi-Branch',
      price: '19,500',
      period: 'سنوياً / 1 Year',
      descAr: 'للمطاعم الكبرى، سلاسل الفروع، واللاونجات الضخمة',
      includes: [
        'ترخيص مفتوح لطاولات غير محدودة + ربط فروع',
        '50 استاند / مكعب مكس خشب وأكريليك ومعدن',
        'تخصيص كامل للهوية البصرية والألوان والشعار',
        'سيرفر محلي مصغر Mini-PC مهيأ ومثبت مسبقاً',
        'زيارات صيانة موقعية شهرية وخط ساخن مخصص'
      ]
    }
  ];

  const whatsappPhone = '201018815050';
  const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent('مرحباً، أود الاستفسار عن باقات نظام QRMate واستاندات الـ NFC والمكعبات الخشبية لكافيهي/مطعمي.')}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-28">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 border-b border-slate-800/80 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
        
        {/* Glow backdrop */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-6 relative">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs sm:text-sm font-extrabold shadow-inner animate-pulse-subtle">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>{t('showcaseBadge')}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
            {t('showcaseHeroTitle')}
          </h1>

          <p className="text-sm sm:text-lg text-slate-400 font-tajawal max-w-3xl mx-auto leading-relaxed">
            {t('showcaseHeroSubtitle')}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-950/60 transition-transform active:scale-95"
            >
              <MessageCircle className="w-5 h-5" />
              <span>{t('contactSalesWhatsApp')}</span>
            </a>

            <button
              onClick={onOpenDemo}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg transition-all"
            >
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>تجربة النظام الحي التفاعلي (Live Demo)</span>
            </button>
          </div>

          {/* Value Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-10 text-center max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <WifiOff className="w-6 h-6 text-amber-400 mx-auto mb-2" />
              <h4 className="font-extrabold text-xs text-white">0% انقطاع</h4>
              <p className="text-[11px] text-slate-400 font-tajawal">يعمل بدون إنترنت محلياً</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <Smartphone className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
              <h4 className="font-extrabold text-xs text-white">NFC + QR بلمسة</h4>
              <p className="text-[11px] text-slate-400 font-tajawal">بدون تنزيل أي تطبيقات</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <ChefHat className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <h4 className="font-extrabold text-xs text-white">مطبخ وبارستا KDS</h4>
              <p className="text-[11px] text-slate-400 font-tajawal">توجيه ذكي وفصل للأصناف</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <ShieldCheck className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <h4 className="font-extrabold text-xs text-white">اشتراك سنوي شامل</h4>
              <p className="text-[11px] text-slate-400 font-tajawal">صيانة ودعم فني مستمر</p>
            </div>
          </div>

        </div>
      </section>

      {/* Physical Products Showcase (Wood Cubes & Acrylic Stands) */}
      <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center space-y-2 mb-12">
          <span className="text-xs font-black text-amber-400 uppercase tracking-widest">Physical Hardware Line</span>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            {t('productsSectionTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-tajawal max-w-2xl mx-auto">
            {t('productsSectionSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((prod) => (
            <div
              key={prod.id}
              className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between shadow-xl hover:border-amber-500/50 transition-all hover:scale-[1.01]"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {prod.badge}
                  </span>
                  <span className="text-xs font-mono text-slate-400 font-bold">{prod.material}</span>
                </div>

                {/* Visual Representation Box */}
                <div className="h-44 rounded-2xl bg-gradient-to-tr from-slate-950 to-slate-900 border border-slate-800 flex flex-col items-center justify-center text-center p-4 relative overflow-hidden mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-lg mb-2">
                    {prod.id === 'wood-cube' ? <Box className="w-7 h-7 text-amber-400" /> : prod.id === 'acrylic-stand' ? <Layers className="w-7 h-7 text-emerald-400" /> : <Award className="w-7 h-7 text-blue-400" />}
                  </div>
                  <span className="text-xs font-black text-white">{lang === 'ar' ? prod.titleAr : prod.titleEn}</span>
                  <span className="text-[10px] text-amber-300 font-mono mt-1">NFC Embedded + High-Res QR</span>
                </div>

                <h3 className="font-black text-white text-base sm:text-lg mb-2">
                  {lang === 'ar' ? prod.titleAr : prod.titleEn}
                </h3>
                <p className="text-xs text-slate-400 font-tajawal leading-relaxed mb-4">
                  {lang === 'ar' ? prod.descAr : prod.descEn}
                </p>

                {/* Features */}
                <div className="space-y-1.5">
                  {prod.features.map((f, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>طلب عينات مخصصة باسم كافيهك</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Yearly Licensing & Pricing Section */}
      <section className="py-16 px-4 sm:px-6 max-w-6xl mx-auto border-t border-slate-800/80">
        <div className="text-center space-y-2 mb-12">
          <span className="text-xs font-black text-amber-400 uppercase tracking-widest">Subscription & Maintenance</span>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            {t('pricingSectionTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 font-tajawal max-w-2xl mx-auto">
            {t('pricingSectionSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {packages.map((pkg) => {
            const isPopular = pkg.popular;
            return (
              <div
                key={pkg.id}
                className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all relative ${
                  isPopular
                    ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/40 border-2 border-amber-500 shadow-2xl shadow-amber-950/50 scale-[1.02]'
                    : 'bg-slate-900/80 border border-slate-800 shadow-xl'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 right-1/2 translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-black font-black text-[11px] shadow-md uppercase tracking-wider">
                    الباقة الأكثر شعبية ⭐
                  </div>
                )}

                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white mb-1">
                    {lang === 'ar' ? pkg.nameAr : pkg.nameEn}
                  </h3>
                  <p className="text-xs text-slate-400 font-tajawal mb-5">
                    {lang === 'ar' ? pkg.descAr : pkg.nameEn}
                  </p>

                  <div className="mb-6 p-4 rounded-2xl bg-slate-950 border border-slate-800/80">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-black text-amber-400 font-mono">{pkg.price}</span>
                      <span className="text-xs text-slate-400 font-bold">{t('currency')}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-tajawal block mt-0.5">{pkg.period}</span>
                  </div>

                  <div className="space-y-2.5">
                    {pkg.includes.map((inc, iIdx) => (
                      <div key={iIdx} className="flex items-start gap-2.5 text-xs text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="leading-relaxed font-tajawal">{inc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-800">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`w-full py-3.5 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                      isPopular
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-400 hover:to-orange-500'
                        : 'bg-slate-800 hover:bg-slate-700 text-white'
                    }`}
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>اشترك الآن واستلم استانداتك</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Egyptian Support & Direct Contact */}
      <section className="py-12 px-4 sm:px-6 max-w-4xl mx-auto text-center bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl border border-slate-800 shadow-2xl mt-8">
        <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
          جاهز لتطوير تجربة رواد كافيهك وزيادة سرعة خدمة الطاولات؟
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 font-tajawal max-w-xl mx-auto mb-6">
          فريقنا المتخصص في مصر جاهز لزيارة كافيهك أو مطعمك، معاينة الطاولات، وبرمجة النظام في نفس اليوم مع ضمان وتدريب كامل.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>تواصل مباشرة عبر واتساب (+20)</span>
          </a>

          <a
            href="tel:+201018815050"
            className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 border border-slate-700 transition-colors"
          >
            <Phone className="w-4 h-4 text-amber-400" />
            <span>اتصل بالمبيعات: 01018815050</span>
          </a>
        </div>
      </section>

    </div>
  );
}
