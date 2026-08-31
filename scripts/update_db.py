import json

db_template = """import initSqlJs from 'sql.js';
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
      venue_name_ar TEXT DEFAULT 'سول كافيه ومطعم | Soul Restaurant & Lounge',
      venue_name_en TEXT DEFAULT 'Soul Restaurant & Lounge',
      slogan_ar TEXT DEFAULT 'Cloud 5 Mall, Sheikh Zayed - تجربة طعام استثنائية وأجواء مميزة',
      slogan_en TEXT DEFAULT 'Cloud 5 Mall, Sheikh Zayed - Exceptional Dining & Lounge Experience',
      phone TEXT DEFAULT '01018815050',
      whatsapp TEXT DEFAULT '201018815050',
      address_ar TEXT DEFAULT 'مول كلوود 5، مدخل الشيخ زايد، الجيزة',
      address_en TEXT DEFAULT 'Cloud 5 Mall, Sheikh Zayed, Giza, Egypt',
      currency_ar TEXT DEFAULT 'ج.م',
      currency_en TEXT DEFAULT 'EGP',
      tax_vat_percent REAL DEFAULT 14.0,
      service_fee_percent REAL DEFAULT 12.0,
      wifi_ssid TEXT DEFAULT 'Soul-Guest-WiFi',
      wifi_pass TEXT DEFAULT 'soul2026',
      tax_reg_number TEXT DEFAULT '592-108-443',
      license_key TEXT DEFAULT 'DEMO-SOUL-EGYPT-2026',
      admin_pin TEXT DEFAULT '1234'
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      pin TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'captain',
      permissions_json TEXT DEFAULT '[]',
      phone TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name_ar TEXT NOT NULL,
      name_en TEXT NOT NULL,
      icon TEXT DEFAULT 'Utensils',
      station_type TEXT DEFAULT 'kitchen',
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
      station_type TEXT DEFAULT 'kitchen',
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
      station_type TEXT DEFAULT 'kitchen',
      modifiers_selected_json TEXT DEFAULT '[]',
      notes TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS table_calls (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      table_number INTEGER NOT NULL,
      call_type TEXT NOT NULL,
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
    seedSoulMenuData();
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
      name: 'أسامة كامل (المدير العام)',
      username: 'osama_admin',
      pin: '1234',
      role: 'admin',
      phone: '01018815050',
      permissions: ['all', 'menu_edit', 'kds_kitchen', 'kds_barista', 'captain_alerts', 'pos_checkout', 'apply_discounts', 'reports_z', 'users_manage', 'license_manage']
    },
    {
      name: 'محمود كمال (كابتن الصالة)',
      username: 'captain',
      pin: '2222',
      role: 'captain',
      phone: '01018815050',
      permissions: ['captain_alerts', 'table_calls', 'view_orders', 'call_waiter_manage']
    },
    {
      name: 'شيف مصطفى (رئيس المطبخ)',
      username: 'chef',
      pin: '3333',
      role: 'chef',
      phone: '01018815050',
      permissions: ['kds_kitchen', 'mark_items_ready', 'view_recipes']
    },
    {
      name: 'كريم سعيد (مسؤول البار والشيشة)',
      username: 'barista',
      pin: '4444',
      role: 'barista',
      phone: '01018815050',
      permissions: ['kds_barista', 'mark_items_ready', 'shisha_manage']
    },
    {
      name: 'أحمد سعيد (كاشير رئيسي)',
      username: 'cashier',
      pin: '5555',
      role: 'cashier',
      phone: '01018815050',
      permissions: ['pos_checkout', 'apply_discounts', 'print_bills', 'reports_z']
    }
  ];

  users.forEach(u => {
    db.run(`
      INSERT INTO users (name, username, pin, role, permissions_json, phone, is_active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `, [
      u.name,
      u.username,
      u.pin,
      u.role,
      JSON.stringify(u.permissions),
      u.phone
    ]);
  });
}

function seedTablesData() {
  const sections = [
    { name: 'الصالة الداخلية / Indoor', count: 10, start: 1 },
    { name: 'الحديقة الخارجية / Outdoor Terrace', count: 10, start: 11 },
    { name: 'لاونج الشيشة / Soul Lounge', count: 6, start: 21 },
    { name: 'قسم الـ VIP / Family Corner', count: 4, start: 27 },
  ];

  sections.forEach(sec => {
    for (let i = 0; i < sec.count; i++) {
      const num = sec.start + i;
      const token = `tbl_${num}_${Math.random().toString(36).substring(2, 9)}`;
      db.run("INSERT INTO tables (table_number, section, capacity, qr_token, status) VALUES (?, ?, ?, ?, 'available')", [
        num, sec.name, (num > 26 ? 6 : 4), token
      ]);
    }
  });
}

function seedSoulMenuData() {
  console.log('🌟 Seeding Soul Restaurant & Lounge (Cloud 5 Mall, Sheikh Zayed) Menu...');
  try {
    const seedPath = path.join(__dirname, '..', '..', 'soul_seed_data.json');
    const raw = fs.readFileSync(seedPath, 'utf8');
    const { categories, items, settings } = JSON.parse(raw);

    if (settings) {
      db.run(`
        UPDATE settings SET
          venue_name_ar = ?, venue_name_en = ?, slogan_ar = ?, slogan_en = ?,
          phone = ?, whatsapp = ?, address_ar = ?, address_en = ?,
          currency_ar = ?, currency_en = ?, tax_vat_percent = ?, service_fee_percent = ?,
          wifi_ssid = ?, wifi_pass = ?, tax_reg_number = ?
        WHERE id = 1
      `, [
        settings.venue_name_ar, settings.venue_name_en, settings.slogan_ar, settings.slogan_en,
        settings.phone, settings.whatsapp, settings.address_ar, settings.address_en,
        settings.currency_ar, settings.currency_en, settings.tax_vat_percent, settings.service_fee_percent,
        settings.wifi_ssid, settings.wifi_pass, settings.tax_reg_number
      ]);
    }

    categories.forEach(cat => {
      db.run("INSERT INTO categories (id, name_ar, name_en, icon, station_type, sort_order) VALUES (?, ?, ?, ?, ?, ?)", [
        cat.id, cat.name_ar, cat.name_en, cat.icon, cat.station_type, cat.sort_order
      ]);
    });

    items.forEach(it => {
      db.run(`
        INSERT INTO items (category_id, name_ar, name_en, description_ar, description_en, price, station_type, tags_json, modifiers_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        it.category_id, it.name_ar, it.name_en, it.description_ar, it.description_en,
        it.price, it.station_type, JSON.stringify(it.tags || []), JSON.stringify(it.modifiers || [])
      ]);
    });

    console.log(`✅ Successfully seeded ${categories.length} Soul Categories and ${items.length} Authentic Dishes into SQLite!`);
  } catch (e) {
    console.error('Seeding error:', e);
  }
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
"""

with open("server/db/database.js", "w", encoding="utf-8") as f:
    f.write(db_template)

print("Updated server/db/database.js successfully")
