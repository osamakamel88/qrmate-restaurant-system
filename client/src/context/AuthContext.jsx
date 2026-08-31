import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AVAILABLE_PERMISSIONS = [
  { id: 'all', labelAr: 'صلاحيات المدير الكاملة (Full Admin)', labelEn: 'Full Admin Access' },
  { id: 'kds_kitchen', labelAr: 'شاشة المطبخ وتجهيز الوجبات (Kitchen KDS)', labelEn: 'Kitchen KDS Display' },
  { id: 'kds_barista', labelAr: 'شاشة البار والمشروبات والشيشة (Barista KDS)', labelEn: 'Barista & Shisha KDS' },
  { id: 'captain_alerts', labelAr: 'شاشة الكابتن واستدعاءات الويتر (Captain Alerts)', labelEn: 'Captain & Waiter Alerts' },
  { id: 'pos_checkout', labelAr: 'محاسبة الطاولات وإغلاق الشيك (POS Checkout)', labelEn: 'POS Billing & Checkout' },
  { id: 'apply_discounts', labelAr: 'تطبيق الخصومات على الفاتورة (Discounts)', labelEn: 'Apply Custom Discounts' },
  { id: 'reports_z', labelAr: 'التقارير المالية واليومية (Daily Z-Reports)', labelEn: 'Financial Reports' },
  { id: 'menu_edit', labelAr: 'تعديل أصناف وأسعار المنيو (Menu Editor)', labelEn: 'Menu & Pricing Editor' },
  { id: 'users_manage', labelAr: 'إدارة الموظفين والصلاحيات (Users & RBAC)', labelEn: 'Staff & Roles Management' },
  { id: 'license_manage', labelAr: 'إدارة التراخيص والـ QR (License & QR Studio)', labelEn: 'License & QR Studio' },
];

export const PRESET_ROLES = {
  admin: {
    nameAr: 'مدير عام / General Manager',
    permissions: ['all', 'menu_edit', 'kds_kitchen', 'kds_barista', 'captain_alerts', 'pos_checkout', 'apply_discounts', 'reports_z', 'users_manage', 'license_manage']
  },
  captain: {
    nameAr: 'كابتن صالة / Head Captain',
    permissions: ['captain_alerts', 'table_calls', 'view_orders', 'pos_checkout']
  },
  chef: {
    nameAr: 'شيف مطبخ / Kitchen Chef',
    permissions: ['kds_kitchen', 'mark_items_ready']
  },
  barista: {
    nameAr: 'بارستا ومسؤول شيشة / Barista',
    permissions: ['kds_barista', 'mark_items_ready']
  },
  cashier: {
    nameAr: 'كاشير ومحاسب / Cashier',
    permissions: ['pos_checkout', 'apply_discounts', 'print_receipts', 'reports_z']
  },
  custom: {
    nameAr: 'مخصص / Custom Role',
    permissions: []
  }
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('qrmate_user');
      return saved ? JSON.parse(saved) : {
        id: 1,
        name: 'المدير العام (أحمد محمود)',
        role: 'admin',
        permissions: ['all']
      };
    } catch {
      return null;
    }
  });

  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('qrmate_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('qrmate_user');
    }
  }, [currentUser]);

  const loginWithPin = async (pin, username = null) => {
    try {
      const res = await fetch(`http://${window.location.hostname}:3001/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin, username })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        setIsPinModalOpen(false);
        return { success: true, user: data.user };
      } else {
        return { success: false, message: data.message };
      }
    } catch (err) {
      return { success: false, message: 'تعذر الاتصال بالسيرفر' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const hasPermission = (permissionKey) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin' || currentUser.permissions?.includes('all')) return true;
    return currentUser.permissions?.includes(permissionKey);
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      setCurrentUser,
      loginWithPin,
      logout,
      hasPermission,
      isPinModalOpen,
      setIsPinModalOpen
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
