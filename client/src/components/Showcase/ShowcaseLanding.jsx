import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Sparkles, 
  Smartphone, 
  ShieldCheck, 
  WifiOff, 
  ChefHat, 
  BellRing, 
  Receipt, 
  CheckCircle2, 
  MessageCircle, 
  Phone, 
  Zap, 
  TrendingUp, 
  Users, 
  Store 
} from 'lucide-react';

export function ShowcaseLanding({ onOpenDemo }) {
  const { lang, t } = useLanguage();

  const products = [
    {
      id: 'stand-black-acrylic-l',
      image: '/images/stands/stand_black_acrylic_l.jpg',
      titleAr: 'ستاند أكريليك أسود ملكي L-Stand فاخر بنظام التاتش الذكي',
      titleEn: 'Royal Black Acrylic L-Stand with Instant NFC Tap & QR',
      descAr: 'استاند أكريليك أسود لامع عالي الجودة مع طباعة UV متينة وشريحة NFC مدمجة فائقة الاستجابة + كود QR عالي التباين، بتصميم قائم وثابت لا يشغل مساحة على الطاولة.',
      descEn: 'Premium glossy black acrylic L-stand featuring instant NFC tap and high-contrast QR code. Heavy weighted base, smudge & liquid resistant.',
      badge: 'الأكثر فخامة والأعلى مبيعاً ⭐',
      material: 'أكريليك أسود فاخر / Glossy Black Acrylic',
      specs: [
        'شريحة NFC مخفية مدمجة للتمرير السريع بالهاتف',
        'طباعة كود QR فائق الدقة لا يبهت مع الوقت',
        'مقاوم للماء والزيوت وسهل التعقيم الفوري',
        'قاعدة L ثابتة متينة لا تسقط بسهولة'
      ]
    },
    {
      id: 'stand-wood-nfc',
      image: '/images/stands/stand_wood_nfc.jpg',
      titleAr: 'بطاقة ومكعب خشب زان طبيعي محفور بالليزر مع NFC',
      titleEn: 'Natural Laser-Engraved Beech Wood NFC + QR Plaque & Cube',
      descAr: 'خشب زان طبيعي معالج محفور عليه بدقة الليزر شعار المطعم/الكافيه، رقم الطاولة، وكود الـ QR، مع شريحة NFC ذكية داخلية مدمجة ومقاومة للتلف.',
      descEn: 'Hand-crafted natural beech wood with precision laser etching. Embedded waterproof NFC chip, ideal for upscale bistros and specialty coffee shops.',
      badge: 'لمسة طبيعية دافئة وأنيقة 🌿',
      material: 'خشب طبيعي معالج / Natural Beech Wood',
      specs: [
        'حفر ليزر عميق وشديد الدقة لا يمحى',
        'شريحة NFC مدمجة معزولة ومقاومة للسوائل',
        'يعطي طابعاً راقياً لديكور الكافيه والطاولات',
        'متاح ككارت طاولة أو مكعب خشبي ثلاثي الأبعاد'
      ]
    },
    {
      id: 'stand-acrylic-tent',
      image: '/images/stands/stand_acrylic_tent.webp',
      titleAr: 'ستاند أكريليك خيمة مزدوج الوجه (Double-Sided Tent Card)',
      titleEn: 'White Dual-Sided Crystal Acrylic Tent Stand',
      descAr: 'ستاند أكريليك أبيض ناصع بتصميم الخيمة المائل، يعرض كود الـ QR وشعار المكان بوضوح من كلا الاتجاهين لتسهيل المسح على رواد الطاولة.',
      descEn: 'Dual-sided angled white acrylic tent stand displaying high-visibility QR code and branding from both sides of the table.',
      badge: 'عملي وسهل الرؤية من أي زاوية ✨',
      material: 'أكريليك أبيض ناصع / Pure White Acrylic',
      specs: [
        'رؤية مزدوجة من اتجاهين (Double-Sided Visibility)',
        'خفيف الوزن وسهل الترتيب والتنظيف',
        'طباعة UV نقية عالية التباين للمسح السريع',
        'مثالي لكافيهات الإفطار والبرانش والمقاهي الحيوية'
      ]
    }
  ];

  const businessBenefits = [
    {
      icon: TrendingUp,
      color: 'from-amber-500 to-orange-600',
      titleAr: 'زيادة معدل دوران الطاولات بنسبة 35%',
      titleEn: '35% Faster Table Turnover',
      descAr: 'الزبون يتصفح المنيو ويطلب فور جلوسه دون انتظار وصول الويتر، مما يقلل وقت الطلب من 12 دقيقة إلى أقل من دقيقتين ويزيد استيعاب الزبائن في ساعات الذروة.'
    },
    {
      icon: Users,
      color: 'from-blue-500 to-indigo-600',
      titleAr: 'توفير تكاليف العمالة وتخفيف الضغط',
      titleEn: 'Reduce Labor Costs & Staff Stress',
      descAr: 'بدلاً من حاجة الكابتن للجري بين الطاولات لحمل المنيو وتسجيل الورق، يتفرغ فريق الصالة للترحيب بالزبائن وتقديم الخدمة الراقية، مع استلام الأوردرات رقمياً.'
    },
    {
      icon: ChefHat,
      color: 'from-emerald-500 to-teal-600',
      titleAr: 'القضاء تماماً على أخطاء الطلبات والتذاكر الضائعة',
      titleEn: 'Zero Order Mistakes & Lost Tickets',
      descAr: 'توجيه ذكي وفوري: أطباق الطعام تصل فوراً لشاشة المطبخ KDS، والمشروبات والشيشة لشاشة البار KDS مع كافة التخصيصات (سكر مظبوط، بدون بصل، درجة التسوية).'
    },
    {
      icon: WifiOff,
      color: 'from-purple-500 to-pink-600',
      titleAr: 'تشغيل محلي 100% بدون انقطاع الإنترنت',
      titleEn: '100% On-Premise Offline Resilience',
      descAr: 'النظام يعمل محلياً داخل شبكة المكان. حتى لو انقطع الإنترنت الخارجي بالكامل، تستمر الطلبات والشاشات والكاشير في العمل بكفاءة تامة بدون توقف ثانية واحدة.'
    },
    {
      icon: BellRing,
      color: 'from-rose-500 to-red-600',
      titleAr: 'تنبيهات صوتية فورية لكابتن الصالة والزبون',
      titleEn: 'Instant Audio Alerts & Live Tracking',
      descAr: 'تنبيه نغمي فوري عند إرسال طلب جديد أو عند طلب الحساب أو استدعاء الويتر. العميل يرى تقدم طلبه خطوة بخطوة حتى وصوله للطاولة ساخناً.'
    },
    {
      icon: Receipt,
      color: 'from-yellow-500 to-amber-600',
      titleAr: 'إدارة شاملة للمنيو والأسعار والكاشير POS',
      titleEn: 'Complete POS, Menu & Z-Reports',
      descAr: 'تعديل الأسعار وإضافة الأصناف والعروض بضغطة زر دون الحاجة لإعادة طباعة منيو ورقي مكلف. نظام كاشير متكامل وحساب ضريبة وسيرفيس وتقارير الإغلاق اليومي.'
    }
  ];

  const workflowSteps = [
    {
      step: '01',
      titleAr: 'الزبون يمرر الهاتف (NFC) أو يمسح الـ QR',
      titleEn: 'Guest Taps NFC or Scans QR',
      descAr: 'بلمسة واحدة من ظهر الهاتف أو بفتح الكاميرا، يفتح المنيو التفاعلي الخاص برقم طاولته تلقائياً دون الحاجة لتنزيل أي تطبيق.'
    },
    {
      step: '02',
      titleAr: 'اختيار الأطباق وتخصيص الملاحظات',
      titleEn: 'Browse & Customize Items',
      descAr: 'عرض الصور والأسعار والتفاصيل باللغتين مع تحديد خيارات السكر، الحجم، الصوصات والإضافات بمرونة تامة، ثم الضغط على "تأكيد الطلب".'
    },
    {
      step: '03',
      titleAr: 'توزيع الأوردر فورياً على المطبخ والبار',
      titleEn: 'Instant Dispatch to KDS Stations',
      descAr: 'يصدر جرس تنبيه مميز. المطبخ يستلم تذاكر الطعام والبارستا يستلم المشروبات مع مؤقت زمني دقيق لكل أوردر.'
    },
    {
      step: '04',
      titleAr: 'إنهاء التجهيز وإشعار الويتر والعميل ✅',
      titleEn: 'Order Ready Notification & Serving',
      descAr: 'عند ضغط الشيف أو البارستا على "جاهز"، يُخطر الكابتن برقم الطاولة لاستلام الطلب وتقديمه فوراً للعميل مع تحديث حالة شاشة العميل.'
    }
  ];

  const whatsappPhone = '201018815050';
  const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent('مرحباً، أود الاستفسار عن نظام QRMate واستاندات الـ NFC والمكعبات الخشبية لكافيهي/مطعمي ومعاينة النظام.')}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-28 font-tajawal">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 border-b border-slate-200/80 bg-white">
        
        <div className="max-w-5xl mx-auto text-center space-y-6 relative">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs sm:text-sm font-extrabold shadow-sm animate-pulse-subtle">
            <Zap className="w-4 h-4 text-emerald-600" />
            <span>نظام إدارة طلبات الطاولات واستاندات NFC + QR الذكية في مصر</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 leading-tight">
            حوّل طاولات كافيهك ومطعمك إلى <br className="hidden sm:inline" />
            <span className="text-emerald-600">
              نظام ذكي متكامل بلمسة هاتف واحدة
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            الحل الأمثل للمطاعم والكافيهات والبسترو في السوق المصري: استاندات ومكعبات خشبية وأكريليك محفورة بالليزر مع شريحة NFC وكود QR، مربوطة بنظام محلي 100% بدون انقطاع يدير الصالة، شاشات المطبخ والبار، والكاشير بسلاسة فائقة.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-sm shadow-emerald-700/20 transition-transform active:scale-95"
            >
              <MessageCircle className="w-5 h-5" />
              <span>طلب معاينة واستشارة مجانية (واتساب)</span>
            </a>

            <button
              onClick={onOpenDemo}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200 font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-sm transition-all"
            >
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <span>تجربة النظام الحي التفاعلي (Live Demo)</span>
            </button>
          </div>

          {/* Value Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-10 text-center max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <WifiOff className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <h4 className="font-extrabold text-xs text-slate-900">تشغيل محلي 100%</h4>
              <p className="text-[11px] text-slate-500">يعمل بدون إنترنت محلياً</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <Smartphone className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <h4 className="font-extrabold text-xs text-slate-900">تمرير NFC + كود QR</h4>
              <p className="text-[11px] text-slate-500">بدون تنزيل أي تطبيق</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <ChefHat className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <h4 className="font-extrabold text-xs text-slate-900">فصل المطبخ والبار KDS</h4>
              <p className="text-[11px] text-slate-500">توجيه ذكي وفوري للأصناف</p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <ShieldCheck className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              <h4 className="font-extrabold text-xs text-slate-900">ترخيص سنوي ودعم كامل</h4>
              <p className="text-[11px] text-slate-500">صيانة وتحديثات مستمرة</p>
            </div>
          </div>

        </div>
      </section>

      {/* Physical Hardware & Table Stands Showcase */}
      <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center space-y-3 mb-14">
          <span className="text-xs font-black text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
            استاندات ومكعبات الطاولات الفاخرة | Hardware Line
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900">
            تشكيلة استاندات ومكعبات NFC + QR المصنعة خصيصاً لكافيهك
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            نحن لا نوفر البرنامج فحسب، بل نصنع ونطبع لك استاندات ومكعبات الطاولات بأعلى معايير الجودة، محفورة بالليزر ومزودة بشرائح NFC مدمجة مع شعار واسم مكانك ورقم كل طاولة.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((prod) => (
            <div
              key={prod.id}
              className="rounded-3xl bg-white border border-slate-200/90 p-6 flex flex-col justify-between shadow-sm hover:border-emerald-300 hover:shadow-md transition-all hover:scale-[1.01] group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {prod.badge}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">{prod.material}</span>
                </div>

                {/* Real Product Image */}
                <div className="h-64 rounded-2xl bg-slate-50 border border-slate-200/80 overflow-hidden relative mb-5 flex items-center justify-center p-2">
                  <img
                    src={prod.image}
                    alt={prod.titleAr}
                    className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute bottom-3 right-3 px-3 py-1 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200 text-[10px] font-bold text-slate-700 flex items-center gap-1.5 shadow-sm">
                    <Smartphone className="w-3 h-3 text-emerald-600" />
                    <span>NFC Tap + QR Scan</span>
                  </div>
                </div>

                <h3 className="font-black text-slate-900 text-lg mb-2 leading-snug">
                  {lang === 'ar' ? prod.titleAr : prod.titleEn}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-5">
                  {lang === 'ar' ? prod.descAr : prod.descEn}
                </p>

                {/* Specs List */}
                <div className="space-y-2 mb-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60">
                  {prod.specs.map((spec, sIdx) => (
                    <div key={sIdx} className="flex items-start gap-2 text-xs text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{spec}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 font-bold text-xs flex items-center justify-center gap-2 border border-slate-200 hover:border-emerald-200 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>طلب عينات وتصاميم مخصصة لمكانك</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Comprehensive Business Benefits Section */}
      <section className="py-20 px-4 sm:px-6 max-w-6xl mx-auto border-t border-slate-200/80">
        <div className="text-center space-y-3 mb-14">
          <span className="text-xs font-black text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
            القيمة المضافة والأثر المالي | Business Value & ROI
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900">
            لماذا يُعد هذا النظام استثماراً ضرورياً لأي كافيه ومطعم؟
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            تصميم هندسي متكامل يحل مشاكل التشغيل اليومية في المطاعم ويرفع الأرباح عبر أتمتة دورة الطلب من الطاولة حتى الكاشير.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businessBenefits.map((benefit, bIdx) => {
            const Icon = benefit.icon;
            return (
              <div
                key={bIdx}
                className="p-7 rounded-3xl bg-white border border-slate-200/80 hover:border-emerald-200 transition-all hover:shadow-sm flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shadow-sm">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                    {lang === 'ar' ? benefit.titleAr : benefit.titleEn}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {lang === 'ar' ? benefit.descAr : benefit.descEn}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works (4-Step Seamless Workflow) */}
      <section className="py-20 px-4 sm:px-6 max-w-5xl mx-auto border-t border-slate-200/80">
        <div className="text-center space-y-3 mb-14">
          <span className="text-xs font-black text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
            دورة التشغيل السلسة | Seamless Workflow
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900">
            كيف تسير تجربة الطلب داخل المكان خطوة بخطوة؟
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {workflowSteps.map((step, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-white border border-slate-200/80 relative flex flex-col justify-between shadow-sm"
            >
              <div className="space-y-3">
                <span className="text-3xl font-black font-mono text-emerald-600 block">
                  {step.step}
                </span>
                <h4 className="text-sm font-black text-slate-900 leading-snug">
                  {lang === 'ar' ? step.titleAr : step.titleEn}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {lang === 'ar' ? step.descAr : step.descEn}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Egyptian Support & Direct Contact CTA */}
      <section className="py-14 px-4 sm:px-8 max-w-4xl mx-auto text-center bg-white rounded-3xl border border-slate-200 shadow-sm mt-6">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
          <Store className="w-6 h-6" />
        </div>
        <h3 className="text-xl sm:text-3xl font-black text-slate-900 mb-3">
          جاهز لتطوير تجربة رواد كافيهك وزيادة أرباحك التشغيلية؟
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto mb-8 leading-relaxed">
          فريقنا جاهز لزيارتك، معاينة الطاولات، تجهيز عينات الاستاندات بشعار كافيهك، وتثبيت وتدريب طاقم العمل على النظام بالكامل في نفس اليوم.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm flex items-center justify-center gap-2.5 transition-all shadow-sm shadow-emerald-700/20 active:scale-95"
          >
            <MessageCircle className="w-5 h-5" />
            <span>تواصل مباشرة عبر واتساب: 01018815050</span>
          </a>

          <a
            href="tel:+201018815050"
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-sm flex items-center justify-center gap-2.5 border border-slate-200 transition-colors"
          >
            <Phone className="w-5 h-5 text-emerald-600" />
            <span>اتصال هاتفي مباشر</span>
          </a>
        </div>
      </section>

    </div>
  );
}
