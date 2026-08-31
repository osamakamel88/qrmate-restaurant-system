const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

const raw = fs.readFileSync(path.join(__dirname, '..', 'soul_seed_data.json'), 'utf8');
const { categories, items, settings } = JSON.parse(raw);

const DB_PATH = path.join(__dirname, '..', 'server', 'data', 'restaurant.sqlite');

async function main() {
  const SQL = await initSqlJs();
  const db = new SQL.Database();

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY,
      venue_name_ar TEXT, venue_name_en TEXT, slogan_ar TEXT, slogan_en TEXT,
      phone TEXT, whatsapp TEXT, address_ar TEXT, address_en TEXT,
      currency_ar TEXT, currency_en TEXT, tax_vat_percent REAL, service_fee_percent REAL,
      wifi_ssid TEXT, wifi_pass TEXT, tax_reg_number TEXT,
      license_key TEXT DEFAULT 'DEMO-SOUL-EGYPT-2026', local_ip TEXT DEFAULT '192.168.1.100'
    );
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, username TEXT UNIQUE NOT NULL,
      pin TEXT NOT NULL, role TEXT NOT NULL, permissions TEXT NOT NULL, phone TEXT,
      is_active INTEGER DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT, name_ar TEXT NOT NULL, name_en TEXT NOT NULL,
      icon TEXT DEFAULT 'Utensils', station_type TEXT DEFAULT 'kitchen', sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT, category_id INTEGER, name_ar TEXT NOT NULL, name_en TEXT NOT NULL,
      description_ar TEXT, description_en TEXT, price REAL NOT NULL, image_url TEXT,
      station_type TEXT DEFAULT 'kitchen', tags TEXT DEFAULT '[]', is_available INTEGER DEFAULT 1,
      modifiers TEXT DEFAULT '[]', sort_order INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS tables (
      id INTEGER PRIMARY KEY AUTOINCREMENT, table_number INTEGER UNIQUE NOT NULL, name_ar TEXT,
      name_en TEXT, capacity INTEGER DEFAULT 4, status TEXT DEFAULT 'available',
      current_order_id INTEGER, call_waiter_status TEXT DEFAULT 'none', bill_requested INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT, order_number TEXT UNIQUE NOT NULL, table_number INTEGER NOT NULL,
      status TEXT DEFAULT 'pending', total_amount REAL DEFAULT 0.0, subtotal REAL DEFAULT 0.0,
      tax_amount REAL DEFAULT 0.0, service_amount REAL DEFAULT 0.0, discount_amount REAL DEFAULT 0.0,
      payment_method TEXT DEFAULT 'cash', payment_status TEXT DEFAULT 'unpaid', notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT, order_id INTEGER NOT NULL, item_id INTEGER NOT NULL,
      name_ar TEXT NOT NULL, name_en TEXT NOT NULL, price REAL NOT NULL, quantity INTEGER NOT NULL,
      modifiers TEXT DEFAULT '[]', station_type TEXT DEFAULT 'kitchen', status TEXT DEFAULT 'pending',
      notes TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS table_calls (
      id INTEGER PRIMARY KEY AUTOINCREMENT, table_number INTEGER NOT NULL, call_type TEXT NOT NULL,
      status TEXT DEFAULT 'pending', created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Insert settings
  db.run(`
    INSERT INTO settings (
      id, venue_name_ar, venue_name_en, slogan_ar, slogan_en, phone, whatsapp,
      address_ar, address_en, currency_ar, currency_en, tax_vat_percent, service_fee_percent,
      wifi_ssid, wifi_pass, tax_reg_number
    ) VALUES (
      1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `, [
    settings.venue_name_ar, settings.venue_name_en, settings.slogan_ar, settings.slogan_en,
    settings.phone, settings.whatsapp, settings.address_ar, settings.address_en,
    settings.currency_ar, settings.currency_en, settings.tax_vat_percent, settings.service_fee_percent,
    settings.wifi_ssid, settings.wifi_pass, settings.tax_reg_number
  ]);

  // Insert Staff
  const defaultStaff = [
    { name: 'أسامة كامل (المدير العام)', username: 'osama_admin', pin: '1234', role: 'admin', perms: JSON.stringify(['all']), phone: '01018815050' },
    { name: 'كابتن محمود (كابتن صالة)', username: 'capt_mahmoud', pin: '2222', role: 'captain', perms: JSON.stringify(['captain_alerts', 'kds_kitchen', 'kds_barista']), phone: '01018815050' },
    { name: 'شيف مصطفى (رئيس المطبخ)', username: 'chef_mostafa', pin: '3333', role: 'chef', perms: JSON.stringify(['kds_kitchen']), phone: '01018815050' },
    { name: 'بارستا كريم (مسؤول المشروبات والشيشة)', username: 'barista_kareem', pin: '4444', role: 'barista', perms: JSON.stringify(['kds_barista']), phone: '01018815050' },
    { name: 'أحمد سعيد (كاشير رئيسي)', username: 'cashier_ahmed', pin: '5555', role: 'cashier', perms: JSON.stringify(['pos_checkout', 'apply_discounts', 'reports_z']), phone: '01018815050' }
  ];

  defaultStaff.forEach(u => {
    db.run('INSERT INTO users (name, username, pin, role, permissions, phone) VALUES (?, ?, ?, ?, ?, ?)',
      [u.name, u.username, u.pin, u.role, u.perms, u.phone]);
  });

  // Insert categories
  categories.forEach(c => {
    db.run('INSERT INTO categories (id, name_ar, name_en, icon, station_type, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
      [c.id, c.name_ar, c.name_en, c.icon, c.station_type, c.sort_order]);
  });

  // Insert items
  items.forEach(it => {
    db.run(`
      INSERT INTO items (category_id, name_ar, name_en, description_ar, description_en, price, station_type, tags, modifiers)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      it.category_id, it.name_ar, it.name_en, it.description_ar, it.description_en,
      it.price, it.station_type, JSON.stringify(it.tags || []), JSON.stringify(it.modifiers || [])
    ]);
  });

  // Insert tables
  for (let i = 1; i <= 30; i++) {
    db.run('INSERT INTO tables (table_number, name_ar, name_en, capacity) VALUES (?, ?, ?, ?)',
      [i, `طاولة #${i}`, `Table #${i}`, i <= 4 ? 2 : (i <= 20 ? 4 : 8)]);
  }

  // Save SQLite binary
  const buffer = Buffer.from(db.export());
  fs.writeFileSync(DB_PATH, buffer);
  console.log(`✅ SQLite Database updated at ${DB_PATH} with Soul Restaurant menu!`);

  // Write mockData.js for client
  const mockDataCode = `// Soul Restaurant Menu Data for Static / Vercel Fallback
export const FALLBACK_CATEGORIES = ${JSON.stringify(categories, null, 2)};

export const FALLBACK_ITEMS = ${JSON.stringify(items.map((it, idx) => ({ id: idx + 1, ...it, is_available: true })), null, 2)};

export const FALLBACK_SETTINGS = ${JSON.stringify(settings, null, 2)};
`;

  fs.writeFileSync(path.join(__dirname, '..', 'client', 'src', 'i18n', 'mockData.js'), mockDataCode, 'utf8');
  console.log('✅ Updated client/src/i18n/mockData.js with Soul Restaurant Menu!');
}

main().catch(console.error);
