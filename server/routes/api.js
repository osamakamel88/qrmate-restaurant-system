import express from 'express';
import os from 'os';
import { queryAll, queryOne, runQuery } from '../db/database.js';
import { getMachineFingerprint, verifyLicenseKey, generateLicenseKey } from '../services/licenseService.js';
import { broadcastNewOrder, broadcastOrderStatus, broadcastTableCall, broadcastMenuUpdate, broadcastEvent } from '../services/websocketService.js';

const router = express.Router();

function getLocalNetworkIp() {
  const interfaces = os.networkInterfaces();
  for (const devName in interfaces) {
    const iface = interfaces[devName];
    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (alias.family === 'IPv4' && !alias.internal && alias.address !== '127.0.0.1') {
        return alias.address;
      }
    }
  }
  return 'localhost';
}

// ----------------------------------------------------
// 0. STAFF AUTHENTICATION & USER MANAGEMENT (RBAC)
// ----------------------------------------------------

router.post('/auth/login', (req, res) => {
  try {
    const { pin, username } = req.body;
    if (!pin) {
      return res.status(400).json({ success: false, message: 'يرجى إدخال كود الدخول PIN' });
    }

    let user = null;
    if (username) {
      user = queryOne("SELECT * FROM users WHERE username = ? AND pin = ? AND is_active = 1", [username, pin]);
    } else {
      user = queryOne("SELECT * FROM users WHERE pin = ? AND is_active = 1", [pin]);
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'كود PIN غير صحيح أو المستخدم غير مفعّل' });
    }

    const permissions = user.permissions_json ? JSON.parse(user.permissions_json) : [];

    res.json({
      success: true,
      message: `مرحباً بك ${user.name}`,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
        permissions,
        phone: user.phone
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/users', (req, res) => {
  try {
    const users = queryAll("SELECT id, name, username, pin, role, permissions_json, phone, is_active, created_at FROM users ORDER BY id ASC");
    const parsed = users.map(u => ({
      ...u,
      permissions: u.permissions_json ? JSON.parse(u.permissions_json) : [],
      is_active: Boolean(u.is_active)
    }));
    res.json({ success: true, data: parsed });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/users', (req, res) => {
  try {
    const { name, username, pin, role = 'captain', permissions = [], phone = '' } = req.body;
    if (!name || !username || !pin) {
      return res.status(400).json({ success: false, message: 'الاسم واسم المستخدم وPIN حقول إجبارية' });
    }

    const existing = queryOne("SELECT id FROM users WHERE username = ?", [username]);
    if (existing) {
      return res.status(400).json({ success: false, message: 'اسم المستخدم مسجل مسبقاً' });
    }

    const result = runQuery(`
      INSERT INTO users (name, username, pin, role, permissions_json, phone, is_active)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `, [name, username, pin, role, JSON.stringify(permissions), phone]);

    res.json({ success: true, message: 'تم إضافة المستخدم بنجاح', id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name, pin, role, permissions, phone, is_active } = req.body;

    runQuery(`
      UPDATE users SET
        name = COALESCE(?, name),
        pin = COALESCE(?, pin),
        role = COALESCE(?, role),
        permissions_json = COALESCE(?, permissions_json),
        phone = COALESCE(?, phone),
        is_active = COALESCE(?, is_active)
      WHERE id = ?
    `, [
      name, pin, role,
      permissions ? JSON.stringify(permissions) : null,
      phone,
      is_active !== undefined ? (is_active ? 1 : 0) : null,
      id
    ]);

    res.json({ success: true, message: 'تم تحديث بيانات وصلاحيات المستخدم بنجاح' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    runQuery("DELETE FROM users WHERE id = ?", [id]);
    res.json({ success: true, message: 'تم حذف المستخدم' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 1. SETTINGS & LICENSING & SYSTEM INFO
// ----------------------------------------------------

router.get('/settings', (req, res) => {
  try {
    const settings = queryOne("SELECT * FROM settings WHERE id = 1") || {};
    const licenseInfo = verifyLicenseKey(settings.license_key);
    const localIp = getLocalNetworkIp();

    res.json({
      success: true,
      data: {
        ...settings,
        license: licenseInfo,
        localIp,
        serverPort: process.env.PORT || 3001
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/settings', (req, res) => {
  try {
    const {
      venue_name_ar, venue_name_en, slogan_ar, slogan_en, phone, whatsapp,
      address_ar, address_en, currency_ar, currency_en,
      tax_vat_percent, service_fee_percent, wifi_ssid, wifi_pass, tax_reg_number
    } = req.body;

    runQuery(`
      UPDATE settings SET
        venue_name_ar = ?, venue_name_en = ?, slogan_ar = ?, slogan_en = ?,
        phone = ?, whatsapp = ?, address_ar = ?, address_en = ?,
        currency_ar = ?, currency_en = ?, tax_vat_percent = ?, service_fee_percent = ?,
        wifi_ssid = ?, wifi_pass = ?, tax_reg_number = ?
      WHERE id = 1
    `, [
      venue_name_ar, venue_name_en, slogan_ar, slogan_en, phone, whatsapp,
      address_ar, address_en, currency_ar, currency_en,
      tax_vat_percent, service_fee_percent, wifi_ssid, wifi_pass, tax_reg_number
    ]);

    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/license/info', (req, res) => {
  try {
    const settings = queryOne("SELECT license_key FROM settings WHERE id = 1");
    const licenseKey = settings ? settings.license_key : '';
    const licenseInfo = verifyLicenseKey(licenseKey);

    res.json({
      success: true,
      data: {
        hardwareId: getMachineFingerprint(),
        license: licenseInfo,
        supportContact: {
          phone: '+20 101 881 5050',
          whatsapp: 'https://wa.me/201018815050',
          email: 'support@instafeed.cloud',
          website: 'https://instafeed.cloud',
          developer: 'Recode Developments (Osama Kamel)',
          distributor: 'QRMate Egypt - Smart Inhouse NFC & QR Solutions'
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/license/activate', (req, res) => {
  try {
    const { license_key } = req.body;
    if (!license_key) {
      return res.status(400).json({ success: false, message: 'مفتاح الترخيص مطلوب.' });
    }

    const verification = verifyLicenseKey(license_key);
    if (!verification.isValid) {
      return res.status(400).json({ success: false, message: verification.message });
    }

    runQuery("UPDATE settings SET license_key = ? WHERE id = 1", [license_key]);

    res.json({
      success: true,
      message: 'تم تفعيل الترخيص السنوي بنجاح!',
      data: verification
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/license/issue-vendor', (req, res) => {
  try {
    const { clientName, hardwareId, daysValid = 365, maxTables = 50, adminKey } = req.body;
    if (adminKey !== 'EGY_SUPER_ADMIN_2026') {
      return res.status(403).json({ success: false, message: 'غير مصرح لك بإصدار التراخيص.' });
    }
    const key = generateLicenseKey(clientName, hardwareId, daysValid, maxTables);
    res.json({ success: true, licenseKey: key, hardwareId, validDays: daysValid });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 2. MENU & CATEGORIES
// ----------------------------------------------------

router.get('/menu', (req, res) => {
  try {
    const categories = queryAll("SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order ASC, id ASC");
    const items = queryAll("SELECT * FROM items ORDER BY id ASC");

    const parsedItems = items.map(it => ({
      ...it,
      tags: it.tags_json ? JSON.parse(it.tags_json) : [],
      modifiers: it.modifiers_json ? JSON.parse(it.modifiers_json) : [],
      is_available: Boolean(it.is_available)
    }));

    const fullMenu = categories.map(cat => ({
      ...cat,
      items: parsedItems.filter(it => it.category_id === cat.id)
    }));

    res.json({
      success: true,
      data: {
        categories,
        items: parsedItems,
        fullMenu
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/menu/items', (req, res) => {
  try {
    const { category_id, name_ar, name_en, description_ar, description_en, price, station_type = 'barista', image_url = '', tags = [], modifiers = [] } = req.body;

    const result = runQuery(`
      INSERT INTO items (category_id, name_ar, name_en, description_ar, description_en, price, station_type, image_url, tags_json, modifiers_json, is_available)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `, [
      category_id, name_ar, name_en, description_ar || '', description_en || '',
      parseFloat(price), station_type, image_url, JSON.stringify(tags), JSON.stringify(modifiers)
    ]);

    broadcastMenuUpdate();
    res.json({ success: true, message: 'Item created', id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/menu/items/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { category_id, name_ar, name_en, description_ar, description_en, price, station_type, image_url, tags, modifiers, is_available } = req.body;

    runQuery(`
      UPDATE items SET
        category_id = COALESCE(?, category_id),
        name_ar = COALESCE(?, name_ar),
        name_en = COALESCE(?, name_en),
        description_ar = COALESCE(?, description_ar),
        description_en = COALESCE(?, description_en),
        price = COALESCE(?, price),
        station_type = COALESCE(?, station_type),
        image_url = COALESCE(?, image_url),
        tags_json = COALESCE(?, tags_json),
        modifiers_json = COALESCE(?, modifiers_json),
        is_available = COALESCE(?, is_available)
      WHERE id = ?
    `, [
      category_id, name_ar, name_en, description_ar, description_en,
      price ? parseFloat(price) : null, station_type, image_url,
      tags ? JSON.stringify(tags) : null, modifiers ? JSON.stringify(modifiers) : null,
      is_available !== undefined ? (is_available ? 1 : 0) : null,
      id
    ]);

    broadcastMenuUpdate();
    res.json({ success: true, message: 'Item updated' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/menu/items/:id/toggle-stock', (req, res) => {
  try {
    const { id } = req.params;
    const item = queryOne("SELECT is_available FROM items WHERE id = ?", [id]);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    const newStatus = item.is_available ? 0 : 1;
    runQuery("UPDATE items SET is_available = ? WHERE id = ?", [newStatus, id]);

    broadcastMenuUpdate();
    res.json({ success: true, is_available: Boolean(newStatus) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/menu/items/:id/price', (req, res) => {
  try {
    const { id } = req.params;
    const { price } = req.body;
    if (price === undefined || isNaN(parseFloat(price))) {
      return res.status(400).json({ success: false, message: 'السعر غير صالح' });
    }
    runQuery("UPDATE items SET price = ? WHERE id = ?", [parseFloat(price), id]);
    broadcastMenuUpdate();
    res.json({ success: true, message: 'تم تحديث السعر بنجاح', price: parseFloat(price) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/menu/items/:id', (req, res) => {
  try {
    const { id } = req.params;
    runQuery("DELETE FROM items WHERE id = ?", [id]);
    broadcastMenuUpdate();
    res.json({ success: true, message: 'تم حذف الصنف بنجاح' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Categories Management
router.post('/menu/categories', (req, res) => {
  try {
    const { name_ar, name_en, icon = 'Utensils', station_type = 'kitchen', sort_order = 0 } = req.body;
    if (!name_ar || !name_en) {
      return res.status(400).json({ success: false, message: 'اسم القسم بالعربية والإنجليزية مطلوب' });
    }
    const result = runQuery(`
      INSERT INTO categories (name_ar, name_en, icon, station_type, sort_order, is_active)
      VALUES (?, ?, ?, ?, ?, 1)
    `, [name_ar, name_en, icon, station_type, parseInt(sort_order) || 0]);

    broadcastMenuUpdate();
    res.json({ success: true, message: 'تم إضافة القسم بنجاح', id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/menu/categories/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { name_ar, name_en, icon, station_type, sort_order } = req.body;
    runQuery(`
      UPDATE categories SET
        name_ar = COALESCE(?, name_ar),
        name_en = COALESCE(?, name_en),
        icon = COALESCE(?, icon),
        station_type = COALESCE(?, station_type),
        sort_order = COALESCE(?, sort_order)
      WHERE id = ?
    `, [name_ar, name_en, icon, station_type, sort_order, id]);

    broadcastMenuUpdate();
    res.json({ success: true, message: 'تم تحديث القسم بنجاح' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/menu/categories/:id', (req, res) => {
  try {
    const { id } = req.params;
    // Also delete items in this category
    runQuery("DELETE FROM items WHERE category_id = ?", [id]);
    runQuery("DELETE FROM categories WHERE id = ?", [id]);
    broadcastMenuUpdate();
    res.json({ success: true, message: 'تم حذف القسم والأصناف التابعة له' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 3. TABLES & QR CODE INFO
// ----------------------------------------------------

router.get('/tables', (req, res) => {
  try {
    const tables = queryAll("SELECT * FROM tables ORDER BY table_number ASC");
    const openOrders = queryAll("SELECT * FROM orders WHERE status NOT IN ('paid', 'cancelled')");

    const enrichedTables = tables.map(tbl => {
      const activeOrder = openOrders.find(o => o.table_number === tbl.table_number);
      return {
        ...tbl,
        activeOrder: activeOrder || null,
        status: activeOrder ? 'occupied' : 'available'
      };
    });

    res.json({ success: true, data: enrichedTables });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/tables', (req, res) => {
  try {
    const { table_number, section = 'الصالة الرئيسية / Main', capacity = 4 } = req.body;
    const token = `tbl_${table_number}_${Math.random().toString(36).substring(2, 9)}`;
    
    runQuery("INSERT INTO tables (table_number, section, capacity, qr_token, status) VALUES (?, ?, ?, ?, 'available')", [
      table_number, section, capacity, token
    ]);

    broadcastEvent({ type: 'TABLES_UPDATED' });
    res.json({ success: true, message: 'Table added successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/tables/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { table_number, section, capacity } = req.body;
    runQuery(`
      UPDATE tables SET
        table_number = COALESCE(?, table_number),
        section = COALESCE(?, section),
        capacity = COALESCE(?, capacity)
      WHERE id = ?
    `, [table_number, section, capacity, id]);

    broadcastEvent({ type: 'TABLES_UPDATED' });
    res.json({ success: true, message: 'تم تحديث بيانات الطاولة بنجاح' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/tables/:id', (req, res) => {
  try {
    const { id } = req.params;
    runQuery("DELETE FROM tables WHERE id = ?", [id]);
    broadcastEvent({ type: 'TABLES_UPDATED' });
    res.json({ success: true, message: 'تم حذف الطاولة' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/tables/generate', (req, res) => {
  try {
    const { count = 30 } = req.body;
    const sections = [
      'الصالة الداخلية / Indoor Hall',
      'التراس والحديقة / Outdoor Garden',
      'لاونج الشيشة / Shisha Lounge',
      'صالة العائلات VIP / VIP Lounge'
    ];

    runQuery("DELETE FROM tables");

    for (let i = 1; i <= count; i++) {
      let secIdx = 0;
      if (i > 24) secIdx = 3;
      else if (i > 16) secIdx = 2;
      else if (i > 8) secIdx = 1;

      const section = sections[secIdx];
      const capacity = i % 4 === 0 ? 8 : (i % 2 === 0 ? 4 : 2);
      const token = `tbl_${i}_${Math.random().toString(36).substring(2, 9)}`;

      runQuery("INSERT INTO tables (table_number, section, capacity, qr_token, status) VALUES (?, ?, ?, ?, 'available')", [
        i, section, capacity, token
      ]);
    }

    broadcastEvent({ type: 'TABLES_UPDATED' });
    res.json({ success: true, message: `تم توليد وتوزيع ${count} طاولة على أقسام المطعم بنجاح` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 4. ORDERS & KITCHEN / BARISTA / CAPTAIN DISPATCH
// ----------------------------------------------------

router.get('/orders', (req, res) => {
  try {
    const { station, status, table } = req.query;
    let sql = "SELECT * FROM orders";
    const conditions = [];
    const params = [];

    if (status) {
      conditions.push("status = ?");
      params.push(status);
    }
    if (table) {
      conditions.push("table_number = ?");
      params.push(parseInt(table, 10));
    }

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }
    sql += " ORDER BY created_at DESC";

    const orders = queryAll(sql, params);
    const orderIds = orders.map(o => o.id);

    let items = [];
    if (orderIds.length > 0) {
      let itemsSql = `SELECT * FROM order_items WHERE order_id IN (${orderIds.map(() => '?').join(',')})`;
      const itemParams = [...orderIds];
      if (station && (station === 'kitchen' || station === 'barista' || station === 'shisha')) {
        itemsSql += " AND station_type = ?";
        itemParams.push(station);
      }
      items = queryAll(itemsSql, itemParams);
    }

    const enrichedOrders = orders.map(order => {
      const orderItems = items.filter(it => it.order_id === order.id).map(it => ({
        ...it,
        modifiers: it.modifiers_selected_json ? JSON.parse(it.modifiers_selected_json) : []
      }));
      return {
        ...order,
        items: orderItems,
        itemCount: orderItems.reduce((acc, curr) => acc + curr.quantity, 0)
      };
    }).filter(o => !station || o.items.length > 0);

    res.json({ success: true, data: enrichedOrders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/orders/table/:tableNumber', (req, res) => {
  try {
    const tableNumber = parseInt(req.params.tableNumber, 10);
    const activeOrder = queryOne("SELECT * FROM orders WHERE table_number = ? AND status NOT IN ('paid', 'cancelled') ORDER BY created_at DESC LIMIT 1", [tableNumber]);

    if (!activeOrder) {
      return res.json({ success: true, data: null });
    }

    const items = queryAll("SELECT * FROM order_items WHERE order_id = ?", [activeOrder.id]).map(it => ({
      ...it,
      modifiers: it.modifiers_selected_json ? JSON.parse(it.modifiers_selected_json) : []
    }));

    const finishedItemsCount = items.filter(it => it.status === 'ready').length;
    const totalItemsCount = items.length;

    res.json({
      success: true,
      data: {
        ...activeOrder,
        items,
        progress: {
          totalItems: totalItemsCount,
          finishedItems: finishedItemsCount,
          isAllFinished: totalItemsCount > 0 && finishedItemsCount === totalItemsCount
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/orders', (req, res) => {
  try {
    const { table_number, guest_name = 'ضيوف الطاولة', items = [], notes = '' } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'السلة فارغة. يرجى اختيار أصناف.' });
    }

    const settings = queryOne("SELECT * FROM settings WHERE id = 1") || {};
    const taxRateVat = settings.tax_vat_percent || 14.0;
    const serviceFeeRate = settings.service_fee_percent || 12.0;

    let subtotal = 0;
    items.forEach(it => {
      let itemPrice = it.price || 0;
      if (it.modifiers && Array.isArray(it.modifiers)) {
        it.modifiers.forEach(m => {
          if (m.price) itemPrice += m.price;
        });
      }
      subtotal += itemPrice * (it.quantity || 1);
    });

    const tax_vat = Math.round((subtotal * (taxRateVat / 100)) * 100) / 100;
    const service_fee = Math.round((subtotal * (serviceFeeRate / 100)) * 100) / 100;
    const total_amount = Math.round((subtotal + tax_vat + service_fee) * 100) / 100;

    const orderNumber = `EGY-${Date.now().toString().slice(-6)}`;

    const orderRes = runQuery(`
      INSERT INTO orders (order_number, table_number, guest_name, status, subtotal, tax_vat, service_fee, discount, total_amount, payment_method, notes)
      VALUES (?, ?, ?, 'pending', ?, ?, ?, 0, ?, 'unpaid', ?)
    `, [
      orderNumber, table_number ? parseInt(table_number, 10) : 0, guest_name,
      subtotal, tax_vat, service_fee, total_amount, notes
    ]);

    const orderId = orderRes.lastInsertRowid;

    const insertedItems = [];
    items.forEach(it => {
      let unitPrice = it.price;
      if (it.modifiers && Array.isArray(it.modifiers)) {
        it.modifiers.forEach(m => { if (m.price) unitPrice += m.price; });
      }

      const itemRes = runQuery(`
        INSERT INTO order_items (order_id, item_id, item_name_ar, item_name_en, price, quantity, station_type, modifiers_selected_json, notes, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')
      `, [
        orderId, it.id || 0, it.name_ar || it.name, it.name_en || it.name,
        unitPrice, it.quantity || 1, it.station_type || 'barista',
        JSON.stringify(it.modifiers || []), it.notes || ''
      ]);

      insertedItems.push({
        id: itemRes.lastInsertRowid,
        order_id: orderId,
        item_name_ar: it.name_ar || it.name,
        item_name_en: it.name_en || it.name,
        price: unitPrice,
        quantity: it.quantity || 1,
        station_type: it.station_type || 'barista',
        modifiers: it.modifiers || [],
        notes: it.notes || '',
        status: 'pending'
      });
    });

    if (table_number) {
      runQuery("UPDATE tables SET status = 'occupied' WHERE table_number = ?", [table_number]);
    }

    const completeOrder = {
      id: orderId,
      order_number: orderNumber,
      table_number: table_number ? parseInt(table_number, 10) : 0,
      guest_name,
      status: 'pending',
      subtotal,
      tax_vat,
      service_fee,
      total_amount,
      notes,
      items: insertedItems,
      created_at: new Date().toISOString()
    };

    broadcastNewOrder(completeOrder);

    res.json({
      success: true,
      message: 'تم إرسال الطلب بنجاح إلى المطبخ والبار!',
      messageEn: 'Order placed successfully to Kitchen & Barista!',
      data: completeOrder
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/orders/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    runQuery("UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?", [status, id]);
    
    if (status === 'ready' || status === 'delivered') {
      runQuery("UPDATE order_items SET status = 'ready' WHERE order_id = ?", [id]);
    }

    const order = queryOne("SELECT * FROM orders WHERE id = ?", [id]);
    const items = queryAll("SELECT * FROM order_items WHERE order_id = ?", [id]);
    
    const enriched = { ...order, items };
    broadcastOrderStatus(enriched);

    if (status === 'ready') {
      broadcastEvent('CLIENT_ORDER_READY', {
        orderId: order.id,
        tableNumber: order.table_number,
        messageAr: 'طلبك جاهز تماماً وهو في الطريق إلى طاولتك الآن! بالهناء والشفاء 🍽️',
        messageEn: 'Your order is ready and on its way to your table now! Enjoy your meal 🍽️'
      }, null, order.table_number);
    }

    res.json({ success: true, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/orders/items/:itemId/status', (req, res) => {
  try {
    const { itemId } = req.params;
    const { status } = req.body;

    runQuery("UPDATE order_items SET status = ? WHERE id = ?", [status, itemId]);

    const item = queryOne("SELECT * FROM order_items WHERE id = ?", [itemId]);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    const order = queryOne("SELECT * FROM orders WHERE id = ?", [item.order_id]);
    const allItems = queryAll("SELECT * FROM order_items WHERE order_id = ?", [item.order_id]);

    const isAllReady = allItems.every(it => it.status === 'ready');
    if (isAllReady && order.status !== 'ready' && order.status !== 'delivered' && order.status !== 'paid') {
      runQuery("UPDATE orders SET status = 'ready', updated_at = CURRENT_TIMESTAMP WHERE id = ?", [order.id]);
      order.status = 'ready';

      broadcastEvent('CLIENT_ORDER_READY', {
        orderId: order.id,
        tableNumber: order.table_number,
        messageAr: 'طلبك جاهز تماماً وهو في الطريق إلى طاولتك الآن! ✅',
        messageEn: 'Your order is ready and on its way to your table! ✅'
      }, null, order.table_number);
    }

    const enriched = { ...order, items: allItems };
    broadcastOrderStatus(enriched);

    res.json({ success: true, data: { item, order: enriched, isAllReady } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 5. TABLE ASSISTANCE & CALLS
// ----------------------------------------------------

router.post('/calls', (req, res) => {
  try {
    const { table_number, type, detail = '', payment_preference = 'cash' } = req.body;

    const result = runQuery(`
      INSERT INTO table_calls (table_number, type, detail, payment_preference, status)
      VALUES (?, ?, ?, ?, 'pending')
    `, [parseInt(table_number, 10), type, detail, payment_preference]);

    const callPayload = {
      id: result.lastInsertRowid,
      table_number: parseInt(table_number, 10),
      type,
      detail,
      payment_preference,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    broadcastTableCall(callPayload);

    res.json({
      success: true,
      message: type === 'bill' ? 'تم إرسال طلب الحساب للكابتن والكاشير بنجاح' : 'تم استدعاء الويتر، سيصل إلى طاولتك فوراً',
      data: callPayload
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/calls', (req, res) => {
  try {
    const calls = queryAll("SELECT * FROM table_calls WHERE status != 'resolved' ORDER BY created_at DESC");
    res.json({ success: true, data: calls });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/calls/:id/acknowledge', (req, res) => {
  try {
    const { id } = req.params;
    runQuery("UPDATE table_calls SET status = 'acknowledged' WHERE id = ?", [id]);
    broadcastEvent('TABLE_CALL_ACKNOWLEDGED', { id: parseInt(id, 10) });
    res.json({ success: true, message: 'Call acknowledged' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.patch('/calls/:id/resolve', (req, res) => {
  try {
    const { id } = req.params;
    runQuery("UPDATE table_calls SET status = 'resolved' WHERE id = ?", [id]);
    broadcastEvent('TABLE_CALL_RESOLVED', { id: parseInt(id, 10) });
    res.json({ success: true, message: 'Call resolved' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// 6. POS CHECKOUT & DAILY Z-REPORTS
// ----------------------------------------------------

router.post('/pos/checkout', (req, res) => {
  try {
    const { orderId, tableNumber, paymentMethod = 'cash', discount = 0 } = req.body;

    let order = null;
    if (orderId) {
      order = queryOne("SELECT * FROM orders WHERE id = ?", [orderId]);
    } else if (tableNumber) {
      order = queryOne("SELECT * FROM orders WHERE table_number = ? AND status NOT IN ('paid', 'cancelled') ORDER BY created_at DESC LIMIT 1", [tableNumber]);
    }

    if (!order) {
      return res.status(404).json({ success: false, message: 'لا يوجد طلب مفتوح لهذه الطاولة' });
    }

    const subtotal = order.subtotal;
    const discountedSubtotal = Math.max(0, subtotal - parseFloat(discount || 0));
    const settings = queryOne("SELECT * FROM settings WHERE id = 1") || {};
    const tax_vat = Math.round((discountedSubtotal * ((settings.tax_vat_percent || 14) / 100)) * 100) / 100;
    const service_fee = Math.round((discountedSubtotal * ((settings.service_fee_percent || 12) / 100)) * 100) / 100;
    const total_amount = Math.round((discountedSubtotal + tax_vat + service_fee) * 100) / 100;

    runQuery(`
      UPDATE orders SET
        status = 'paid',
        payment_method = ?,
        discount = ?,
        tax_vat = ?,
        service_fee = ?,
        total_amount = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [paymentMethod, parseFloat(discount || 0), tax_vat, service_fee, total_amount, order.id]);

    if (order.table_number) {
      runQuery("UPDATE tables SET status = 'available' WHERE table_number = ?", [order.table_number]);
      runQuery("UPDATE table_calls SET status = 'resolved' WHERE table_number = ?", [order.table_number]);
    }

    const updatedOrder = queryOne("SELECT * FROM orders WHERE id = ?", [order.id]);
    const items = queryAll("SELECT * FROM order_items WHERE order_id = ?", [order.id]);

    broadcastOrderStatus({ ...updatedOrder, items });

    res.json({
      success: true,
      message: 'تم إغلاق الحساب وطباعة الفاتورة بنجاح',
      data: {
        order: updatedOrder,
        items,
        receipt: {
          venueNameAr: settings.venue_name_ar,
          venueNameEn: settings.venue_name_en,
          taxRegNumber: settings.tax_reg_number,
          orderNumber: updatedOrder.order_number,
          tableNumber: updatedOrder.table_number,
          paymentMethod,
          subtotal,
          discount: parseFloat(discount || 0),
          tax_vat,
          service_fee,
          total_amount,
          date: new Date().toLocaleString('ar-EG'),
          wifiSsid: settings.wifi_ssid,
          wifiPass: settings.wifi_pass
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/reports/daily', (req, res) => {
  try {
    const paidOrders = queryAll("SELECT * FROM orders WHERE status = 'paid' ORDER BY updated_at DESC");
    
    let totalRevenue = 0;
    let totalVat = 0;
    let totalService = 0;
    let paymentBreakdown = { cash: 0, card: 0, instapay: 0, vodafone_cash: 0 };

    paidOrders.forEach(o => {
      totalRevenue += o.total_amount || 0;
      totalVat += o.tax_vat || 0;
      totalService += o.service_fee || 0;
      const method = o.payment_method || 'cash';
      paymentBreakdown[method] = (paymentBreakdown[method] || 0) + (o.total_amount || 0);
    });

    const topItems = queryAll(`
      SELECT item_name_ar, item_name_en, SUM(quantity) as total_qty, SUM(price * quantity) as total_sales
      FROM order_items
      GROUP BY item_name_ar
      ORDER BY total_qty DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        totalOrders: paidOrders.length,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalVat: Math.round(totalVat * 100) / 100,
        totalService: Math.round(totalService * 100) / 100,
        paymentBreakdown,
        topItems,
        recentTransactions: paidOrders.slice(0, 15)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
