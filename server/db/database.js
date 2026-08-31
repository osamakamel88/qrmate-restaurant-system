import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '..', 'data', 'restaurant.sqlite');

let db = null;
let SQL = null;

// Helper to save DB to disk file
export function persistDB() {
  if (!db) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  } catch (err) {
    console.error('Error persisting database to disk:', err);
  }
}

export async function initDatabase() {
  SQL = await initSqlJs();
  
  if (fs.existsSync(DB_PATH)) {
    try {
      const fileBuffer = fs.readFileSync(DB_PATH);
      db = new SQL.Database(fileBuffer);
      console.log('📦 Loaded existing SQLite database from disk.');
    } catch (err) {
      console.warn('⚠️ Could not load database file, creating a fresh one:', err.message);
      db = new SQL.Database();
    }
  } else {
    console.log('🆕 Initializing fresh SQLite database...');
    db = new SQL.Database();
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY,
      venue_name_ar TEXT DEFAULT 'كافيه وبسترو الأصيل',
      venue_name_en TEXT DEFAULT 'El Aseel Cafe & Bistro',
      slogan_ar TEXT DEFAULT 'أشهى المأكولات والمشروبات وأجواء مميزة',
      slogan_en TEXT DEFAULT 'Finest Food, Specialty Coffee & Shisha',
      phone TEXT DEFAULT '01018815050',
      whatsapp TEXT DEFAULT '201018815050',
      address_ar TEXT DEFAULT 'المعادي - شارع 9، القاهرة',
      address_en TEXT DEFAULT 'Road 9, Maadi, Cairo',
      currency_ar TEXT DEFAULT 'ج.م',
      currency_en TEXT DEFAULT 'EGP',
      tax_vat_percent REAL DEFAULT 14.0,
      service_fee_percent REAL DEFAULT 12.0,
      wifi_ssid TEXT DEFAULT 'El-Aseel-Guest',
      wifi_pass TEXT DEFAULT 'welcome2026',
      tax_reg_number TEXT DEFAULT '345-891-204',
      license_key TEXT DEFAULT 'DEMO-EVALUATION-2026-KEY',
      admin_pin TEXT DEFAULT '1234'
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      pin TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'captain', -- 'admin', 'manager', 'captain', 'chef', 'barista', 'cashier', 'custom'
      permissions_json TEXT DEFAULT '[]',
      phone TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name_ar TEXT NOT NULL,
      name_en TEXT NOT NULL,
      icon TEXT DEFAULT 'Coffee',
      station_type TEXT DEFAULT 'barista',
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      name_ar TEXT NOT NULL,
      name_en TEXT NOT NULL,
      description_ar TEXT,
      description_en TEXT,
      price REAL NOT NULL,
      image_url TEXT,
      station_type TEXT DEFAULT 'barista',
      is_available INTEGER DEFAULT 1,
      tags_json TEXT DEFAULT '[]',
      modifiers_json TEXT DEFAULT '[]',
      FOREIGN KEY (category_id) REFERENCES categories (id)
    );

    CREATE TABLE IF NOT EXISTS tables (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_number INTEGER UNIQUE NOT NULL,
      section TEXT DEFAULT 'الصالة الرئيسية / Main Hall',
      capacity INTEGER DEFAULT 4,
      qr_token TEXT NOT NULL,
      status TEXT DEFAULT 'available'
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      table_id INTEGER,
      table_number INTEGER,
      guest_name TEXT DEFAULT 'ضيوف الطاولة',
      status TEXT DEFAULT 'pending',
      subtotal REAL DEFAULT 0,
      tax_vat REAL DEFAULT 0,
      service_fee REAL DEFAULT 0,
      discount REAL DEFAULT 0,
      total_amount REAL DEFAULT 0,
      payment_method TEXT DEFAULT 'unpaid',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      item_id INTEGER,
      item_name_ar TEXT NOT NULL,
      item_name_en TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      station_type TEXT DEFAULT 'barista',
      modifiers_selected_json TEXT DEFAULT '[]',
      notes TEXT,
      status TEXT DEFAULT 'pending',
      FOREIGN KEY (order_id) REFERENCES orders (id)
    );

    CREATE TABLE IF NOT EXISTS table_calls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_id INTEGER,
      table_number INTEGER NOT NULL,
      type TEXT NOT NULL,
      detail TEXT,
      payment_preference TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Ensure default settings exist
  const res = db.exec("SELECT COUNT(*) as count FROM settings");
  if (res.length === 0 || res[0].values[0][0] === 0) {
    db.run("INSERT INTO settings (id) VALUES (1)");
    seedEgyptianMenuData();
  }

  // Ensure default staff users exist
  const usersRes = db.exec("SELECT COUNT(*) FROM users");
  if (usersRes.length === 0 || usersRes[0].values[0][0] === 0) {
    seedDefaultUsers();
  }

  // Ensure tables exist
  const tablesRes = db.exec("SELECT COUNT(*) FROM tables");
  if (tablesRes.length === 0 || tablesRes[0].values[0][0] === 0) {
    seedTablesData();
  }

  persistDB();
  return db;
}

function seedDefaultUsers() {
  console.log('👥 Seeding Default Staff Users & Roles...');
  const users = [
    {
      name: 'أحمد محمود (المدير العام)',
      username: 'admin',
      pin: '1234',
      role: 'admin',
      phone: '01011112222',
      permissions: ['all', 'menu_edit', 'kds_kitchen', 'kds_barista', 'captain_alerts', 'pos_checkout', 'apply_discounts', 'reports_z', 'users_manage', 'license_manage']
    },
    {
      name: 'محمود كمال (كابتن الصالة)',
      username: 'captain',
      pin: '2222',
      role: 'captain',
      phone: '01022223333',
      permissions: ['captain_alerts', 'table_calls', 'view_orders', 'call_waiter_manage']
    },
    {
      name: 'شيف حسن (رئيس المطبخ)',
      username: 'chef',
      pin: '3333',
      role: 'chef',
      phone: '01033334444',
      permissions: ['kds_kitchen', 'mark_items_ready', 'view_recipes']
    },
    {
      name: 'كريم سعيد (مسؤول البار والشيشة)',
      username: 'barista',
      pin: '4444',
      role: 'barista',
      phone: '01044445555',
      permissions: ['kds_barista', 'mark_items_ready', 'shisha_manage']
    },
    {
      name: 'سارة إبراهيم (كاشير الفرع)',
      username: 'cashier',
      pin: '5555',
      role: 'cashier',
      phone: '01055556666',
      permissions: ['pos_checkout', 'apply_discounts', 'print_receipts', 'reports_z', 'table_billing']
    }
  ];

  users.forEach(u => {
    db.run(`
      INSERT INTO users (name, username, pin, role, permissions_json, phone, is_active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `, [u.name, u.username, u.pin, u.role, JSON.stringify(u.permissions), u.phone]);
  });
}

function seedTablesData() {
  const sections = [
    { name: 'الصالة الداخلية / Indoor', count: 8, start: 1 },
    { name: 'الحديقة الخارجية / Outdoor Garden', count: 6, start: 9 },
    { name: 'منطقة الشيشة / Shisha Lounge', count: 6, start: 15 },
    { name: 'قسم العائلات / Family VIP', count: 4, start: 21 },
  ];

  sections.forEach(sec => {
    for (let i = 0; i < sec.count; i++) {
      const num = sec.start + i;
      const token = `tbl_${num}_${Math.random().toString(36).substring(2, 9)}`;
      db.run("INSERT INTO tables (table_number, section, capacity, qr_token, status) VALUES (?, ?, ?, ?, 'available')", [
        num, sec.name, (num > 20 ? 6 : 4), token
      ]);
    }
  });
}

function seedEgyptianMenuData() {
  console.log('🇪🇬 Seeding Egyptian Cafe & Bistro Menu Items...');

  const categories = [
    { name_ar: 'قهوة ومشروبات ساخنة', name_en: 'Hot Coffee & Drinks', icon: 'Coffee', station_type: 'barista', sort_order: 1 },
    { name_ar: 'مشروبات باردة وعصائر فريش', name_en: 'Cold Drinks & Fresh Juices', icon: 'CupSoda', station_type: 'barista', sort_order: 2 },
    { name_ar: 'وجبات وإفطار شرقي', name_en: 'Breakfast & Oriental', icon: 'Utensils', station_type: 'kitchen', sort_order: 3 },
    { name_ar: 'سندوتشات وبرجر وفاير', name_en: 'Burgers & Sandwiches', icon: 'Sandwich', station_type: 'kitchen', sort_order: 4 },
    { name_ar: 'بيتزا وباستا إيطالية', name_en: 'Pizza & Pasta', icon: 'Pizza', station_type: 'kitchen', sort_order: 5 },
    { name_ar: 'حلو ومولتن كيك وافل', name_en: 'Desserts & Waffles', icon: 'Cake', station_type: 'barista', sort_order: 6 },
    { name_ar: 'شيشة ومعسل فاخر', name_en: 'Premium Shisha & Hookah', icon: 'Flame', station_type: 'barista', sort_order: 7 },
  ];

  categories.forEach(cat => {
    db.run("INSERT INTO categories (name_ar, name_en, icon, station_type, sort_order) VALUES (?, ?, ?, ?, ?)", [
      cat.name_ar, cat.name_en, cat.icon, cat.station_type, cat.sort_order
    ]);
  });

  const catRows = queryAll("SELECT id, name_en FROM categories");
  const catMap = {};
  catRows.forEach(r => { catMap[r.name_en] = r.id; });

  const items = [
    {
      cat: 'Hot Coffee & Drinks',
      name_ar: 'قهوة تركي مخصوص (سادة / مظبوط / زيادة / مانو)',
      name_en: 'Special Turkish Coffee (Single/Double)',
      desc_ar: 'بن تركي فاخر محوّج بالحبهان والمستكة، يُطهى على الرمالة على نار هادئة',
      desc_en: 'Premium Turkish beans with cardamom brewed over sand',
      price: 35.0,
      station: 'barista',
      tags: ['popular', 'chef_choice'],
      modifiers: [
        { name: 'السكر / Sugar', options: [{ label: 'سادة (بدون سكر)', price: 0 }, { label: 'مظبوط (1 معلقة)', price: 0 }, { label: 'زيادة (2 معلقة)', price: 0 }, { label: 'مانو (نص معلقة)', price: 0 }, { label: 'سريوسي (3 معالق)', price: 0 }] },
        { name: 'الحجم / Size', options: [{ label: 'سنجل (فنجان)', price: 0 }, { label: 'دبل (فنجانين)', price: 20 }] },
        { name: 'النوع / Blend', options: [{ label: 'محوج فاخر', price: 0 }, { label: 'سادة عادي', price: 0 }, { label: 'فرنساوي بالحليب', price: 15 }] }
      ]
    },
    {
      cat: 'Hot Coffee & Drinks',
      name_ar: 'إسبريسو دبل إيطالي',
      name_en: 'Double Espresso Italiano',
      desc_ar: 'شوت إسبريسو غني بالكريمة من حبوب أرابيكا 100%',
      desc_en: 'Rich intense double shot of 100% Arabica beans',
      price: 45.0,
      station: 'barista',
      tags: ['popular'],
      modifiers: [
        { name: 'شوت إضافي / Extra Shot', options: [{ label: 'بدون إضافة', price: 0 }, { label: 'شوت إضافي (+1 Shot)', price: 20 }] }
      ]
    },
    {
      cat: 'Hot Coffee & Drinks',
      name_ar: 'شاي كرك بالحليب والزعفران',
      name_en: 'Karak Tea with Saffron & Cardamom',
      desc_ar: 'شاي مغلي بالحليب المبخر والزعفران الأصلي والهيل',
      desc_en: 'Slow-simmered black tea with evaporated milk & saffron',
      price: 40.0,
      station: 'barista',
      tags: ['popular'],
      modifiers: [
        { name: 'السكر / Sugar', options: [{ label: 'مظبوط', price: 0 }, { label: 'زيادة', price: 0 }, { label: 'سادة', price: 0 }] }
      ]
    },
    {
      cat: 'Hot Coffee & Drinks',
      name_ar: 'سحلب مصري بالمكسرات والقرفة',
      name_en: 'Egyptian Sahlab with Pistachio & Cinnamon',
      desc_ar: 'سحلب غني بالحليب والمستكة مزين بالفستق والزبيب وجوز الهند',
      desc_en: 'Creamy warm orchid flour pudding topped with mixed roasted nuts',
      price: 55.0,
      station: 'barista',
      tags: ['popular'],
      modifiers: [
        { name: 'الإضافات / Toppings', options: [{ label: 'مكسرات عادية', price: 0 }, { label: 'مكسرات مضاعفة (Extra Nuts)', price: 20 }, { label: 'إضافة عسل طبيعي', price: 15 }] }
      ]
    },
    {
      cat: 'Cold Drinks & Fresh Juices',
      name_ar: 'عصير مانجو فريش مصري طبيعي',
      name_en: 'Fresh Egyptian Mango Juice',
      desc_ar: 'مانجو زبدية / عويس طبيعي مثلج وبدون مواد حافظة',
      desc_en: 'Rich, thick 100% fresh Egyptian seasonal mango',
      price: 60.0,
      station: 'barista',
      tags: ['popular', 'chef_choice'],
      modifiers: [
        { name: 'الحجم / Size', options: [{ label: 'عادي (Regular)', price: 0 }, { label: 'كبير (Large)', price: 25 }] }
      ]
    },
    {
      cat: 'Cold Drinks & Fresh Juices',
      name_ar: 'ليمون نعناع فريش بابلز',
      name_en: 'Fresh Lemonade with Crushed Mint',
      desc_ar: 'عصير ليمون منعش مع أوراق النعناع الطازجة والثلج المجروش',
      desc_en: 'Refreshing zesty lemonade blended with fresh green mint & ice',
      price: 45.0,
      station: 'barista',
      tags: ['popular', 'vegan'],
      modifiers: [
        { name: 'إضافة صودا / Soda Splash', options: [{ label: 'طبيعي مع ماء', price: 0 }, { label: 'إضافة سبرايت / صودا', price: 15 }] }
      ]
    },
    {
      cat: 'Cold Drinks & Fresh Juices',
      name_ar: 'موهيتو توت أزرق وباشن فروت',
      name_en: 'Blueberry Passion Fruit Mojito',
      desc_ar: 'موهيتو منعش بشراب التوت الأزرق، باشون فروت، ليمون ونعناع',
      desc_en: 'Fizzy signature craft mojito with wild berries and mint',
      price: 65.0,
      station: 'barista',
      tags: ['chef_choice'],
      modifiers: []
    },
    {
      cat: 'Cold Drinks & Fresh Juices',
      name_ar: 'آيس كراميل ماكياتو',
      name_en: 'Iced Caramel Macchiato',
      desc_ar: 'إسبريسو مثلج مع حليب بارد وشراب الفانيليا وصوص الكراميل المركز',
      desc_en: 'Cold espresso poured over milk, vanilla syrup and caramel drizzle',
      price: 70.0,
      station: 'barista',
      tags: ['popular'],
      modifiers: [
        { name: 'نوع الحليب / Milk Type', options: [{ label: 'حليب كامل الدسم', price: 0 }, { label: 'حليب خالي الدسم', price: 0 }, { label: 'حليب شوفان (Oat Milk)', price: 25 }] }
      ]
    },
    {
      cat: 'Breakfast & Oriental',
      name_ar: 'طاسة فول بالسمنة البلدي وبيض عيون',
      name_en: 'Foul Skillet with Baladi Ghee & Sunny Eggs',
      desc_ar: 'فول مدمس بالسمنة البلدي الفلاحي، طحينة سمسم، بيض عيون، يقدم مع عيش بلدي ساخن ومخلل',
      desc_en: 'Slow-cooked fava beans with Egyptian ghee, sesame tahini & eggs',
      price: 65.0,
      station: 'kitchen',
      tags: ['popular', 'chef_choice'],
      modifiers: [
        { name: 'إضافات / Extras', options: [{ label: 'بدون إضافات', price: 0 }, { label: 'جبنة قريش بالطماطم والزعتر', price: 25 }, { label: 'طعمية محشية كيري (قطعتين)', price: 20 }] }
      ]
    },
    {
      cat: 'Breakfast & Oriental',
      name_ar: 'طاسة سجق إسكندراني بدبس الرمان',
      name_en: 'Alexandrian Oriental Sausage with Pomegranate',
      desc_ar: 'سجق بلدي بالتوابل الشرقية، فلفل ألوان، بصل، ودبس الرمان اللذيذ',
      desc_en: 'Local spiced oriental beef sausage with peppers & pomegranate molasses',
      price: 110.0,
      station: 'kitchen',
      tags: ['popular', 'spicy'],
      modifiers: [
        { name: 'درجة السبايسي / Spice Level', options: [{ label: 'عادي / Mild', price: 0 }, { label: 'حار سبايسي / Spicy 🌶️', price: 0 }] }
      ]
    },
    {
      cat: 'Burgers & Sandwiches',
      name_ar: 'سموك هاوس برجر بقري دبل مع بيكون وجبنة شيدر',
      name_en: 'Smokehouse Double Beef Burger with Bacon & Cheddar',
      desc_ar: 'قطعتان من لحم الأنجوس المشوي (200جم)، بيف بيكون مدخن، صوص سموكي، بطاطس مقلية كرانشي',
      desc_en: '200g grilled Angus patties, smoked beef bacon, melt cheddar & crisp fries',
      price: 165.0,
      station: 'kitchen',
      tags: ['popular', 'chef_choice'],
      modifiers: [
        { name: 'إضافات الجبن / Cheese Add-ons', options: [{ label: 'شيدر إضافي', price: 25 }, { label: 'مشروم صوص', price: 30 }, { label: 'بدون إضافات', price: 0 }] },
        { name: 'درجة التسوية / Doneness', options: [{ label: 'ويل دن (Well Done)', price: 0 }, { label: 'ميديام ويل (Medium Well)', price: 0 }] }
      ]
    },
    {
      cat: 'Burgers & Sandwiches',
      name_ar: 'ساندوتش كرسبي تشيكن رانش سوبريم',
      name_en: 'Crispy Chicken Ranch Supreme Sandwich',
      desc_ar: 'صدر دجاج مقرمش ذهبي مع خس كابوتشا، صوص الرانش الغني، خيار مخلل، وبطاطس',
      desc_en: 'Crispy golden fried chicken breast, cool ranch, crisp lettuce & fries',
      price: 135.0,
      station: 'kitchen',
      tags: ['popular'],
      modifiers: [
        { name: 'الحرارة / Heat', options: [{ label: 'عادي (Regular)', price: 0 }, { label: 'سبايسي حار (Spicy)', price: 0 }] }
      ]
    },
    {
      cat: 'Pizza & Pasta',
      name_ar: 'بيتزا كواترو فرماجي (أربعة أجبان إيطالية)',
      name_en: 'Quattro Formaggi Pizza (4 Cheeses)',
      desc_ar: 'موزاريلا طبيعية، شيدر أحمر، ريكفورد، جبنة بارميزان مع عجينة نابولية رقيقة',
      desc_en: 'Neapolitan crust, mozzarella, blue cheese, red cheddar & parmesan',
      price: 155.0,
      station: 'kitchen',
      tags: ['chef_choice'],
      modifiers: [
        { name: 'الحجم / Size', options: [{ label: 'وسط (Medium 28cm)', price: 0 }, { label: 'كبير (Large 34cm)', price: 40 }] },
        { name: 'إضافة أطراف محشية / Stuffed Crust', options: [{ label: 'عجينة عادية', price: 0 }, { label: 'أطراف محشية جبنة كيري', price: 35 }] }
      ]
    },
    {
      cat: 'Pizza & Pasta',
      name_ar: 'باستا ألفريدو دجاج ومشروم فريش',
      name_en: 'Fettuccine Alfredo Chicken & Fresh Mushroom',
      desc_ar: 'مكرونة فوتشيني غارقة في الكريمة اللباني مع صدور الدجاج والمشروم والبارميزان',
      desc_en: 'Fettuccine in velvety rich parmesan cream with grilled chicken & mushrooms',
      price: 140.0,
      station: 'kitchen',
      tags: ['popular'],
      modifiers: [
        { name: 'إكسترا جبنة / Extra Cheese', options: [{ label: 'عادي', price: 0 }, { label: 'إكسترا بارميزان مبشور', price: 25 }] }
      ]
    },
    {
      cat: 'Desserts & Waffles',
      name_ar: 'مولتن لافا كيك بلجيكي مع آيس كريم فانيليا',
      name_en: 'Belgian Molten Chocolate Lava Cake & Gelato',
      desc_ar: 'كيك الشوكولاتة الساخنة المحشوة بشوكولاتة بلجيكية ذائبة مع بولة آيس كريم',
      desc_en: 'Warm chocolate cake with decadent molten center & Madagascar vanilla gelato',
      price: 85.0,
      station: 'barista',
      tags: ['popular', 'chef_choice'],
      modifiers: [
        { name: 'صوص إضافي / Extra Sauce', options: [{ label: 'شوكولاتة نوتيلا', price: 0 }, { label: 'لوتس زبدة البسكوت', price: 20 }, { label: 'صوص بيستاشيو فستق', price: 30 }] }
      ]
    },
    {
      cat: 'Desserts & Waffles',
      name_ar: 'وافل بلجيكي مكس فواكه ونوتيلا',
      name_en: 'Belgian Mix Fruits & Nutella Waffle',
      desc_ar: 'وافل كرانشي مقرمش مع شرائح الفراولة والموز، صوص نوتيلا غني، وبولة آيس كريم',
      desc_en: 'Crisp waffle loaded with strawberries, banana, Nutella & gelato scoop',
      price: 95.0,
      station: 'barista',
      tags: ['popular'],
      modifiers: []
    },
    {
      cat: 'Premium Shisha & Hookah',
      name_ar: 'شيشة فاخر تفاحتين نخيل / فاخر',
      name_en: 'Premium Double Apple Shisha (Al Fakher / Nakhla)',
      desc_ar: 'معسل أصلي عالي الجودة مع فحم طبيعي نقي وتغيير دوري للفحم مجاناً',
      desc_en: 'Classic authentic Double Apple hookah with natural coconut charcoal',
      price: 75.0,
      station: 'barista',
      tags: ['popular', 'chef_choice'],
      modifiers: [
        { name: 'النوع / Brand', options: [{ label: 'الفاخر إماراتي', price: 0 }, { label: 'نخلة مصري كلاسيك', price: 0 }, { label: 'سبيشال بليند (نعناع خفيف)', price: 10 }] },
        { name: 'خرطوم سيليكون / Hose', options: [{ label: 'خرطوم صحي معقم مغلف', price: 0 }, { label: 'خرطوم ثلج آيس (Ice Hose)', price: 25 }] }
      ]
    },
    {
      cat: 'Premium Shisha & Hookah',
      name_ar: 'شيشة بلوبيري آيس / عنب ونعناع',
      name_en: 'Blueberry Ice / Grape Mint Shisha',
      desc_ar: 'نكهة منعشة بنكهة التوت البارد أو العنب والنعناع المنعش',
      desc_en: 'Cool refreshing mix of sweet blueberries or grape mint blend',
      price: 80.0,
      station: 'barista',
      tags: ['popular'],
      modifiers: [
        { name: 'النكهة / Flavor', options: [{ label: 'بلوبيري آيس (Blueberry Ice)', price: 0 }, { label: 'عنب نعناع (Grape Mint)', price: 0 }, { label: 'بطيخ نعناع (Watermelon Mint)', price: 0 }, { label: 'ليمون نعناع (Lemon Mint)', price: 0 }] }
      ]
    }
  ];

  items.forEach(item => {
    const catId = catMap[item.cat];
    if (catId) {
      db.run(`
        INSERT INTO items (category_id, name_ar, name_en, description_ar, description_en, price, station_type, tags_json, modifiers_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        catId,
        item.name_ar,
        item.name_en,
        item.desc_ar,
        item.desc_en,
        item.price,
        item.station,
        JSON.stringify(item.tags || []),
        JSON.stringify(item.modifiers || [])
      ]);
    }
  });

  console.log('✅ Seeding complete!');
}

export function queryAll(sql, params = []) {
  if (!db) return [];
  const stmt = db.prepare(sql);
  if (params.length > 0) {
    stmt.bind(params);
  }
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

export function queryOne(sql, params = []) {
  const rows = queryAll(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

export function runQuery(sql, params = []) {
  if (!db) return { changes: 0, lastInsertRowid: 0 };
  db.run(sql, params);
  const info = db.exec("SELECT last_insert_rowid() as id, changes() as changes");
  const lastId = info.length > 0 ? info[0].values[0][0] : 0;
  const changes = info.length > 0 ? info[0].values[0][1] : 0;
  persistDB();
  return { lastInsertRowid: lastId, changes };
}

export { db };
