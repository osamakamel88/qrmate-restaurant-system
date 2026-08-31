export const FALLBACK_CATEGORIES = [
  { id: 1, name_ar: 'قهوة ومشروبات ساخنة', name_en: 'Hot Coffee & Drinks', icon: 'Coffee', station_type: 'barista' },
  { id: 2, name_ar: 'مشروبات باردة وعصائر فريش', name_en: 'Cold Drinks & Fresh Juices', icon: 'CupSoda', station_type: 'barista' },
  { id: 3, name_ar: 'وجبات وإفطار شرقي', name_en: 'Breakfast & Oriental', icon: 'Utensils', station_type: 'kitchen' },
  { id: 4, name_ar: 'سندوتشات وبرجر وفاير', name_en: 'Burgers & Sandwiches', icon: 'Sandwich', station_type: 'kitchen' },
  { id: 5, name_ar: 'بيتزا وباستا إيطالية', name_en: 'Pizza & Pasta', icon: 'Pizza', station_type: 'kitchen' },
  { id: 6, name_ar: 'حلو ومولتن كيك وافل', name_en: 'Desserts & Waffles', icon: 'Cake', station_type: 'barista' },
  { id: 7, name_ar: 'شيشة ومعسل فاخر', name_en: 'Premium Shisha & Hookah', icon: 'Flame', station_type: 'barista' },
];

export const FALLBACK_ITEMS = [
  {
    id: 1,
    category_id: 1,
    name_ar: 'قهوة تركي مخصوص (سادة / مظبوط / زيادة / مانو)',
    name_en: 'Special Turkish Coffee (Single/Double)',
    description_ar: 'بن تركي فاخر محوّج بالحبهان والمستكة، يُطهى على الرمالة على نار هادئة',
    description_en: 'Premium Turkish beans with cardamom brewed over sand',
    price: 35.0,
    station_type: 'barista',
    tags: ['popular', 'chef_choice'],
    is_available: true,
    modifiers: [
      { name: 'السكر / Sugar', options: [{ label: 'سادة (بدون سكر)', price: 0 }, { label: 'مظبوط (1 معلقة)', price: 0 }, { label: 'زيادة (2 معلقة)', price: 0 }, { label: 'مانو (نص معلقة)', price: 0 }] },
      { name: 'الحجم / Size', options: [{ label: 'سنجل (فنجان)', price: 0 }, { label: 'دبل (فنجانين)', price: 20 }] }
    ]
  },
  {
    id: 2,
    category_id: 1,
    name_ar: 'إسبريسو دبل إيطالي',
    name_en: 'Double Espresso Italiano',
    description_ar: 'شوت إسبريسو غني بالكريمة من حبوب أرابيكا 100%',
    description_en: 'Rich intense double shot of 100% Arabica beans',
    price: 45.0,
    station_type: 'barista',
    tags: ['popular'],
    is_available: true,
    modifiers: []
  },
  {
    id: 3,
    category_id: 2,
    name_ar: 'عصير مانجو فريش مصري طبيعي',
    name_en: 'Fresh Egyptian Mango Juice',
    description_ar: 'مانجو زبدية / عويس طبيعي مثلج وبدون مواد حافظة',
    description_en: 'Rich, thick 100% fresh Egyptian seasonal mango',
    price: 60.0,
    station_type: 'barista',
    tags: ['popular', 'chef_choice'],
    is_available: true,
    modifiers: []
  },
  {
    id: 4,
    category_id: 2,
    name_ar: 'ليمون نعناع فريش بابلز',
    name_en: 'Fresh Lemonade with Crushed Mint',
    description_ar: 'عصير ليمون منعش مع أوراق النعناع الطازجة والثلج المجروش',
    description_en: 'Refreshing zesty lemonade blended with fresh green mint & ice',
    price: 45.0,
    station_type: 'barista',
    tags: ['popular', 'vegan'],
    is_available: true,
    modifiers: []
  },
  {
    id: 5,
    category_id: 3,
    name_ar: 'طاسة فول بالسمنة البلدي وبيض عيون',
    name_en: 'Foul Skillet with Baladi Ghee & Sunny Eggs',
    description_ar: 'فول مدمس بالسمنة البلدي الفلاحي، طحينة سمسم، بيض عيون، يقدم مع عيش بلدي ساخن ومخلل',
    description_en: 'Slow-cooked fava beans with Egyptian ghee, sesame tahini & eggs',
    price: 65.0,
    station_type: 'kitchen',
    tags: ['popular', 'chef_choice'],
    is_available: true,
    modifiers: []
  },
  {
    id: 6,
    category_id: 4,
    name_ar: 'سموك هاوس برجر بقري دبل مع بيكون وجبنة شيدر',
    name_en: 'Smokehouse Double Beef Burger with Bacon & Cheddar',
    description_ar: 'قطعتان من لحم الأنجوس المشوي (200جم)، بيف بيكون مدخن، صوص سموكي، بطاطس مقلية كرانشي',
    description_en: '200g grilled Angus patties, smoked beef bacon, melt cheddar & crisp fries',
    price: 165.0,
    station_type: 'kitchen',
    tags: ['popular', 'chef_choice'],
    is_available: true,
    modifiers: []
  },
  {
    id: 7,
    category_id: 5,
    name_ar: 'بيتزا كواترو فرماجي (أربعة أجبان إيطالية)',
    name_en: 'Quattro Formaggi Pizza (4 Cheeses)',
    description_ar: 'موزاريلا طبيعية، شيدر أحمر، ريكفورد، جبنة بارميزان مع عجينة نابولية رقيقة',
    description_en: 'Neapolitan crust, mozzarella, blue cheese, red cheddar & parmesan',
    price: 155.0,
    station_type: 'kitchen',
    tags: ['chef_choice'],
    is_available: true,
    modifiers: []
  },
  {
    id: 8,
    category_id: 6,
    name_ar: 'مولتن لافا كيك بلجيكي مع آيس كريم فانيليا',
    name_en: 'Belgian Molten Chocolate Lava Cake & Gelato',
    description_ar: 'كيك الشوكولاتة الساخنة المحشوة بشوكولاتة بلجيكية ذائبة مع بولة آيس كريم',
    description_en: 'Warm chocolate cake with decadent molten center & Madagascar vanilla gelato',
    price: 85.0,
    station_type: 'barista',
    tags: ['popular', 'chef_choice'],
    is_available: true,
    modifiers: []
  },
  {
    id: 9,
    category_id: 7,
    name_ar: 'شيشة فاخر تفاحتين نخيل / فاخر',
    name_en: 'Premium Double Apple Shisha (Al Fakher / Nakhla)',
    description_ar: 'معسل أصلي عالي الجودة مع فحم طبيعي نقي وتغيير دوري للفحم مجاناً',
    description_en: 'Classic authentic Double Apple hookah with natural coconut charcoal',
    price: 75.0,
    station_type: 'barista',
    tags: ['popular', 'chef_choice'],
    is_available: true,
    modifiers: []
  }
];

export const FALLBACK_SETTINGS = {
  venue_name_ar: 'كافيه وبسترو الأصيل',
  venue_name_en: 'El Aseel Cafe & Bistro',
  slogan_ar: 'أشهى المأكولات والمشروبات وأجواء مميزة',
  slogan_en: 'Finest Food, Specialty Coffee & Shisha',
  phone: '01018815050',
  whatsapp: '201018815050',
  wifi_ssid: 'El-Aseel-Guest',
  wifi_pass: 'welcome2026',
  currency_ar: 'ج.م',
  currency_en: 'EGP',
  tax_vat_percent: 14.0,
  service_fee_percent: 12.0,
  tax_reg_number: '345-891-204'
};
