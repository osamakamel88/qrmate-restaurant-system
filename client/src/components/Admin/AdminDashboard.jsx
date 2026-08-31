import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth, AVAILABLE_PERMISSIONS, PRESET_ROLES } from '../../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
import { 
  FALLBACK_CATEGORIES, 
  FALLBACK_ITEMS, 
  FALLBACK_SETTINGS, 
  FALLBACK_TABLES, 
  FALLBACK_USERS, 
  FALLBACK_LICENSE 
} from '../../i18n/mockData';
import { 
  ShieldCheck, 
  Key, 
  Copy, 
  Check, 
  Printer, 
  QrCode, 
  UtensilsCrossed, 
  Settings, 
  Save, 
  Sparkles, 
  Smartphone,
  Users,
  UserPlus,
  Trash2,
  Edit3,
  Lock,
  CheckSquare,
  Square,
  X,
  Plus,
  Search,
  Coffee,
  ChefHat,
  AlertCircle,
  LayoutGrid,
  MapPin,
  RefreshCw
} from 'lucide-react';

export function AdminDashboard() {
  const { lang, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('menu'); // 'menu', 'tables_map', 'users', 'license', 'qr_studio', 'venue'
  const [settings, setSettings] = useState(FALLBACK_SETTINGS);
  const [licenseInfo, setLicenseInfo] = useState(FALLBACK_LICENSE);
  const [menuItems, setMenuItems] = useState(FALLBACK_ITEMS);
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [usersList, setUsersList] = useState(FALLBACK_USERS);
  const [tablesList, setTablesList] = useState(FALLBACK_TABLES);
  const [newKey, setNewKey] = useState('');
  const [activationMsg, setActivationMsg] = useState(null);
  const [copiedHid, setCopiedHid] = useState(false);
  const [selectedPrintTable, setSelectedPrintTable] = useState(1);

  // Tables Map State
  const [selectedTableSectionFilter, setSelectedTableSectionFilter] = useState('all');
  const [tableModalOpen, setTableModalOpen] = useState(false);
  const [editingTableId, setEditingTableId] = useState(null);
  const [tableNumberInput, setTableNumberInput] = useState('');
  const [tableSectionInput, setTableSectionInput] = useState('الصالة الداخلية / Indoor Hall');
  const [tableCapacityInput, setTableCapacityInput] = useState(4);
  const [isGeneratingTables, setIsGeneratingTables] = useState(false);

  // Menu Search, Filter & Quick Price State
  const [selectedCatFilter, setSelectedCatFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickPrices, setQuickPrices] = useState({});

  // Item Create / Edit Modal State
  const [itemModalOpen, setItemModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [itemNameAr, setItemNameAr] = useState('');
  const [itemNameEn, setItemNameEn] = useState('');
  const [itemDescAr, setItemDescAr] = useState('');
  const [itemDescEn, setItemDescEn] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemCatId, setItemCatId] = useState(1);
  const [itemStation, setItemStation] = useState('kitchen');
  const [itemTags, setItemTags] = useState([]);
  const [itemAvailable, setItemAvailable] = useState(true);

  // Category Create / Edit Modal State
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCatId, setEditingCatId] = useState(null);
  const [catNameAr, setCatNameAr] = useState('');
  const [catNameEn, setCatNameEn] = useState('');
  const [catStation, setCatStation] = useState('kitchen');

  // User management modal state
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [userName, setUserName] = useState('');
  const [userUsername, setUserUsername] = useState('');
  const [userPin, setUserPin] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userRole, setUserRole] = useState('captain');
  const [userPermissions, setUserPermissions] = useState(PRESET_ROLES.captain.permissions);

  // Vendor license generation helper state
  const [vendorClientName, setVendorClientName] = useState('كافيه النيل الأزرق');
  const [vendorDays, setVendorDays] = useState(365);
  const [issuedVendorKey, setIssuedVendorKey] = useState('');

  const fetchAdminData = async () => {
    try {
      const [settRes, licRes, menuRes, usersRes, tablesRes] = await Promise.all([
        fetch(`http://${window.location.hostname}:3001/api/settings`).catch(() => ({ json: () => ({ success: false }) })),
        fetch(`http://${window.location.hostname}:3001/api/license/info`).catch(() => ({ json: () => ({ success: false }) })),
        fetch(`http://${window.location.hostname}:3001/api/menu`).catch(() => ({ json: () => ({ success: false }) })),
        fetch(`http://${window.location.hostname}:3001/api/users`).catch(() => ({ json: () => ({ success: false }) })),
        fetch(`http://${window.location.hostname}:3001/api/tables`).catch(() => ({ json: () => ({ success: false }) }))
      ]);
      const settData = await settRes.json();
      const licData = await licRes.json();
      const menuData = await menuRes.json();
      const usersData = await usersRes.json();
      const tablesData = await tablesRes.json();

      if (settData.success && settData.data) setSettings(settData.data);
      if (licData.success && licData.data) setLicenseInfo(licData.data);
      if (menuData.success && menuData.data) {
        if (menuData.data.items && menuData.data.items.length > 0) setMenuItems(menuData.data.items);
        if (menuData.data.categories && menuData.data.categories.length > 0) setCategories(menuData.data.categories);
      }
      if (usersData.success && usersData.data && usersData.data.length > 0) setUsersList(usersData.data);
      if (tablesData.success && tablesData.data && tablesData.data.length > 0) setTablesList(tablesData.data);
    } catch (err) {
      console.warn('Admin fetch using fallback data');
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // ----------------------------------------------------
  // MENU ITEMS HANDLERS
  // ----------------------------------------------------
  const handleOpenAddItem = () => {
    setEditingItemId(null);
    setItemNameAr('');
    setItemNameEn('');
    setItemDescAr('');
    setItemDescEn('');
    setItemPrice('');
    setItemCatId(categories[0]?.id || 1);
    setItemStation('kitchen');
    setItemTags([]);
    setItemAvailable(true);
    setItemModalOpen(true);
  };

  const handleOpenEditItem = (item) => {
    setEditingItemId(item.id);
    setItemNameAr(item.name_ar || '');
    setItemNameEn(item.name_en || '');
    setItemDescAr(item.description_ar || '');
    setItemDescEn(item.description_en || '');
    setItemPrice(item.price || '');
    setItemCatId(item.category_id || categories[0]?.id || 1);
    setItemStation(item.station_type || 'kitchen');
    setItemTags(item.tags || []);
    setItemAvailable(item.is_available !== false);
    setItemModalOpen(true);
  };

  const handleToggleItemTag = (tag) => {
    setItemTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    const payload = {
      name_ar: itemNameAr,
      name_en: itemNameEn,
      description_ar: itemDescAr,
      description_en: itemDescEn,
      price: parseFloat(itemPrice),
      category_id: parseInt(itemCatId),
      station_type: itemStation,
      tags: itemTags,
      is_available: itemAvailable
    };

    try {
      const url = editingItemId
        ? `http://${window.location.hostname}:3001/api/menu/items/${editingItemId}`
        : `http://${window.location.hostname}:3001/api/menu/items`;
      const method = editingItemId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setItemModalOpen(false);
        fetchAdminData();
      } else {
        alert(data.message || 'حدث خطأ في حفظ الصنف');
      }
    } catch (err) {
      if (editingItemId) {
        setMenuItems(prev => prev.map(it => it.id === editingItemId ? { ...it, ...payload } : it));
      } else {
        const newItem = { id: Date.now(), ...payload };
        setMenuItems(prev => [newItem, ...prev]);
      }
      setItemModalOpen(false);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا الصنف نهائياً من المنيو؟')) return;
    try {
      const res = await fetch(`http://${window.location.hostname}:3001/api/menu/items/${itemId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMenuItems(prev => prev.filter(it => it.id !== itemId));
      }
    } catch (err) {
      setMenuItems(prev => prev.filter(it => it.id !== itemId));
    }
  };

  const handleQuickPriceChange = async (itemId, newPrice) => {
    if (!newPrice || isNaN(parseFloat(newPrice))) return;
    try {
      await fetch(`http://${window.location.hostname}:3001/api/menu/items/${itemId}/price`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: parseFloat(newPrice) })
      });
      setMenuItems(prev => prev.map(it => it.id === itemId ? { ...it, price: parseFloat(newPrice) } : it));
      setQuickPrices(prev => ({ ...prev, [itemId]: undefined }));
    } catch (err) {
      setMenuItems(prev => prev.map(it => it.id === itemId ? { ...it, price: parseFloat(newPrice) } : it));
    }
  };

  // ----------------------------------------------------
  // CATEGORIES HANDLERS
  // ----------------------------------------------------
  const handleOpenAddCategory = () => {
    setEditingCatId(null);
    setCatNameAr('');
    setCatNameEn('');
    setCatStation('kitchen');
    setCatModalOpen(true);
  };

  const handleOpenEditCategory = (cat) => {
    setEditingCatId(cat.id);
    setCatNameAr(cat.name_ar || '');
    setCatNameEn(cat.name_en || '');
    setCatStation(cat.station_type || 'kitchen');
    setCatModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    const payload = {
      name_ar: catNameAr,
      name_en: catNameEn,
      station_type: catStation,
      icon: 'Utensils',
      sort_order: categories.length + 1
    };

    try {
      const url = editingCatId
        ? `http://${window.location.hostname}:3001/api/menu/categories/${editingCatId}`
        : `http://${window.location.hostname}:3001/api/menu/categories`;
      const method = editingCatId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setCatModalOpen(false);
        fetchAdminData();
      }
    } catch (err) {
      if (editingCatId) {
        setCategories(prev => prev.map(c => c.id === editingCatId ? { ...c, ...payload } : c));
      } else {
        const newCat = { id: Date.now(), ...payload };
        setCategories(prev => [...prev, newCat]);
      }
      setCatModalOpen(false);
    }
  };

  const handleDeleteCategory = async (catId) => {
    if (!window.confirm('تحذير: سيتم حذف هذا القسم وكافة الأصناف التابعة له من المنيو! هل أنت متأكد؟')) return;
    try {
      await fetch(`http://${window.location.hostname}:3001/api/menu/categories/${catId}`, { method: 'DELETE' });
      setCategories(prev => prev.filter(c => c.id !== catId));
      setMenuItems(prev => prev.filter(it => it.category_id !== catId));
    } catch (err) {
      setCategories(prev => prev.filter(c => c.id !== catId));
      setMenuItems(prev => prev.filter(it => it.category_id !== catId));
    }
  };

  // ----------------------------------------------------
  // TABLES & FLOOR PLAN HANDLERS
  // ----------------------------------------------------
  const handleOpenAddTable = () => {
    setEditingTableId(null);
    const nextNum = tablesList.length > 0 ? Math.max(...tablesList.map(t => t.table_number || 0)) + 1 : 1;
    setTableNumberInput(nextNum);
    setTableSectionInput('الصالة الداخلية / Indoor Hall');
    setTableCapacityInput(4);
    setTableModalOpen(true);
  };

  const handleOpenEditTable = (tbl) => {
    setEditingTableId(tbl.id);
    setTableNumberInput(tbl.table_number);
    setTableSectionInput(tbl.section || 'الصالة الداخلية / Indoor Hall');
    setTableCapacityInput(tbl.capacity || 4);
    setTableModalOpen(true);
  };

  const handleSaveTable = async (e) => {
    e.preventDefault();
    const payload = {
      table_number: parseInt(tableNumberInput),
      section: tableSectionInput,
      capacity: parseInt(tableCapacityInput) || 4
    };

    try {
      const url = editingTableId
        ? `http://${window.location.hostname}:3001/api/tables/${editingTableId}`
        : `http://${window.location.hostname}:3001/api/tables`;
      const method = editingTableId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setTableModalOpen(false);
        fetchAdminData();
      }
    } catch (err) {
      if (editingTableId) {
        setTablesList(prev => prev.map(t => t.id === editingTableId ? { ...t, ...payload } : t));
      } else {
        const newTbl = { id: Date.now(), ...payload, status: 'available' };
        setTablesList(prev => [...prev, newTbl]);
      }
      setTableModalOpen(false);
    }
  };

  const handleDeleteTable = async (tableId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الطاولة من الخريطة؟')) return;
    try {
      await fetch(`http://${window.location.hostname}:3001/api/tables/${tableId}`, { method: 'DELETE' });
      setTablesList(prev => prev.filter(t => t.id !== tableId));
    } catch (err) {
      setTablesList(prev => prev.filter(t => t.id !== tableId));
    }
  };

  const handleAutoGenerateFloorPlan = async (count = 30) => {
    if (!window.confirm(`هل أنت متأكد من توليد وتوزيع ${count} طاولة تلقائياً عبر 4 أقسام رئيسية؟`)) return;
    setIsGeneratingTables(true);
    try {
      const res = await fetch(`http://${window.location.hostname}:3001/api/tables/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count })
      });
      const data = await res.json();
      if (data.success) {
        fetchAdminData();
      }
    } catch (err) {
      // Offline fallback generation
      const sections = [
        'الصالة الداخلية / Indoor Hall',
        'التراس والحديقة / Outdoor Garden',
        'لاونج الشيشة / Shisha Lounge',
        'صالة العائلات VIP / VIP Lounge'
      ];
      const newTbls = [];
      for (let i = 1; i <= count; i++) {
        let sIdx = 0;
        if (i > 24) sIdx = 3;
        else if (i > 16) sIdx = 2;
        else if (i > 8) sIdx = 1;
        newTbls.push({
          id: i,
          table_number: i,
          section: sections[sIdx],
          capacity: i % 4 === 0 ? 8 : (i % 2 === 0 ? 4 : 2),
          status: 'available'
        });
      }
      setTablesList(newTbls);
    } finally {
      setIsGeneratingTables(false);
    }
  };

  const handleRolePresetChange = (roleKey) => {
    setUserRole(roleKey);
    if (PRESET_ROLES[roleKey]) {
      setUserPermissions(PRESET_ROLES[roleKey].permissions);
    }
  };

  const handleTogglePermission = (permId) => {
    setUserPermissions(prev => {
      if (prev.includes(permId)) {
        return prev.filter(p => p !== permId);
      } else {
        return [...prev, permId];
      }
    });
  };

  const handleOpenAddUser = () => {
    setEditingUserId(null);
    setUserName('');
    setUserUsername('');
    setUserPin('');
    setUserPhone('');
    setUserRole('captain');
    setUserPermissions(PRESET_ROLES.captain.permissions);
    setUserModalOpen(true);
  };

  const handleOpenEditUser = (user) => {
    setEditingUserId(user.id);
    setUserName(user.name);
    setUserUsername(user.username);
    setUserPin(user.pin);
    setUserPhone(user.phone || '');
    setUserRole(user.role);
    setUserPermissions(user.permissions || []);
    setUserModalOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!userName || !userPin) return;

    try {
      if (editingUserId) {
        await fetch(`http://${window.location.hostname}:3001/api/users/${editingUserId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: userName,
            pin: userPin,
            role: userRole,
            permissions: userPermissions,
            phone: userPhone
          })
        });
      } else {
        await fetch(`http://${window.location.hostname}:3001/api/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: userName,
            username: userUsername || `user_${Date.now().toString().slice(-4)}`,
            pin: userPin,
            role: userRole,
            permissions: userPermissions,
            phone: userPhone
          })
        });
      }
      setUserModalOpen(false);
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الموظف؟')) return;
    try {
      await fetch(`http://${window.location.hostname}:3001/api/users/${userId}`, { method: 'DELETE' });
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleActivateKey = async () => {
    if (!newKey.trim()) return;
    try {
      const res = await fetch(`http://${window.location.hostname}:3001/api/license/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ license_key: newKey.trim() })
      });
      const data = await res.json();
      setActivationMsg(data);
      if (data.success) {
        fetchAdminData();
        setNewKey('');
      }
    } catch (err) {
      setActivationMsg({ success: false, message: 'خطأ في الاتصال بالسيرفر' });
    }
  };

  const handleSaveVenueSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://${window.location.hostname}:3001/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) {
        alert('تم حفظ إعدادات المطعم والضرائب بنجاح!');
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleStock = async (itemId) => {
    try {
      const res = await fetch(`http://${window.location.hostname}:3001/api/menu/items/${itemId}/toggle-stock`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success) {
        setMenuItems(prev => prev.map(it => it.id === itemId ? { ...it, is_available: data.is_available } : it));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const copyMachineId = () => {
    if (licenseInfo?.hardwareId) {
      navigator.clipboard.writeText(licenseInfo.hardwareId);
      setCopiedHid(true);
      setTimeout(() => setCopiedHid(false), 2000);
    }
  };

  const handleIssueVendorKey = async () => {
    try {
      const res = await fetch(`http://${window.location.hostname}:3001/api/license/issue-vendor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: vendorClientName,
          hardwareId: licenseInfo?.hardwareId || 'ANY',
          daysValid: parseInt(vendorDays, 10),
          maxTables: 50,
          adminKey: 'EGY_SUPER_ADMIN_2026'
        })
      });
      const data = await res.json();
      if (data.success) {
        setIssuedVendorKey(data.licenseKey);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const localIp = settings?.localIp || window.location.hostname || '192.168.1.100';
  const tableUrl = `http://${localIp}:3001/?table=${selectedPrintTable}`;

  const filteredItems = (menuItems || []).filter(item => {
    const matchesCat = selectedCatFilter === 'all' || item.category_id === parseInt(selectedCatFilter, 10);
    const matchesSearch = !searchQuery || 
      (item.name_ar && item.name_ar.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.name_en && item.name_en.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.description_ar && item.description_ar.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 p-4 sm:p-6 pb-28">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Back-Office Control & License Studio
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              {t('adminTitle')}
            </h2>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 overflow-x-auto no-scrollbar">
            {[
              { id: 'menu', label: t('menuManager'), icon: UtensilsCrossed },
              { id: 'tables_map', label: 'خريطة وإدارة الطاولات (Floor Plan)', icon: LayoutGrid },
              { id: 'users', label: 'الموظفين والصلاحيات (RBAC)', icon: Users },
              { id: 'qr_studio', label: t('qrStudioTitle'), icon: QrCode },
              { id: 'venue', label: 'إعدادات الفرع والضرائب', icon: Settings },
              { id: 'license', label: t('licenseStatus'), icon: ShieldCheck },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB: Tables & Floor Plan Studio */}
        {activeTab === 'tables_map' && (
          <div className="mt-6 space-y-6 animate-fadeIn">
            
            {/* Top Toolbar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900/90 p-4 sm:p-5 rounded-3xl border border-slate-800 shadow-xl">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-amber-400" />
                  <span>خريطة واستوديو توزيع الطاولات (Live Floor Plan)</span>
                </h3>
                <p className="text-xs text-slate-400 font-tajawal mt-0.5">
                  إدارة وتوزيع طاولات الصالة الداخلية، التراس، لاونج الشيشة، وقسم العائلات والـ VIP مع متابعة حالة كل طاولة لحظياً.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  disabled={isGeneratingTables}
                  onClick={() => handleAutoGenerateFloorPlan(30)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingTables ? 'animate-spin' : ''}`} />
                  <span>⚡ توليد خريطة 30 طاولة تلقائياً</span>
                </button>

                <button
                  onClick={handleOpenAddTable}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-orange-950/60 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ إضافة طاولة جديدة</span>
                </button>
              </div>
            </div>

            {/* Section Filter Pills & Stats */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              
              {/* Section Filters */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full scrollbar-none">
                {[
                  { id: 'all', label: `الكل (${tablesList.length})` },
                  { id: 'الصالة الداخلية', label: 'الصالة الداخلية' },
                  { id: 'التراس والحديقة', label: 'التراس والحديقة' },
                  { id: 'لاونج الشيشة', label: 'لاونج الشيشة' },
                  { id: 'VIP', label: 'قسم VIP العائلات' },
                ].map(sec => (
                  <button
                    key={sec.id}
                    onClick={() => setSelectedTableSectionFilter(sec.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      selectedTableSectionFilter === sec.id
                        ? 'bg-amber-500 text-black font-black shadow-md shadow-amber-950'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {sec.label}
                  </button>
                ))}
              </div>

              {/* Quick Status Stats */}
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>{tablesList.filter(t => t.status === 'available').length} متاحة</span>
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                  <span>{tablesList.filter(t => t.status === 'occupied').length} مشغولة</span>
                </span>
              </div>

            </div>

            {/* Tables Floor Plan Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
              {tablesList
                .filter(tbl => selectedTableSectionFilter === 'all' || (tbl.section && tbl.section.includes(selectedTableSectionFilter)))
                .map((tbl) => {
                  const isOccupied = tbl.status === 'occupied';

                  return (
                    <div
                      key={tbl.id || tbl.table_number}
                      className={`p-4 rounded-3xl border transition-all flex flex-col justify-between relative group shadow-lg ${
                        isOccupied
                          ? 'bg-gradient-to-b from-rose-950/40 to-slate-900 border-rose-800/60 ring-1 ring-rose-500/30'
                          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Top Badges & Actions */}
                      <div className="flex items-center justify-between mb-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${isOccupied ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'}`} />
                        
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setSelectedPrintTable(tbl.table_number);
                              setActiveTab('qr_studio');
                            }}
                            className="p-1 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-black text-slate-400 transition-colors"
                            title="طباعة QR وNFC للطاولة"
                          >
                            <QrCode className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleOpenEditTable(tbl)}
                            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            title="تعديل بيانات الطاولة"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDeleteTable(tbl.id)}
                            className="p-1 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors"
                            title="حذف الطاولة"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Center Table Info */}
                      <div className="text-center py-2 space-y-1">
                        <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto shadow-inner">
                          <span className="font-mono text-xl font-black text-amber-400">
                            #{tbl.table_number}
                          </span>
                        </div>
                        <h4 className="font-black text-xs text-white">طاولة #{tbl.table_number}</h4>
                        <span className="text-[10px] text-slate-400 block font-tajawal truncate max-w-[120px] mx-auto">
                          {tbl.section ? tbl.section.split('/')[0].trim() : 'الصالة'}
                        </span>
                      </div>

                      {/* Bottom Capacity & Status */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 font-mono flex items-center gap-1">
                          👥 {tbl.capacity || 4} كراسي
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isOccupied ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                        }`}>
                          {isOccupied ? 'مشغولة' : 'جاهزة'}
                        </span>
                      </div>

                    </div>
                  );
                })}
            </div>

            {tablesList.length === 0 && (
              <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-3">
                <LayoutGrid className="w-10 h-10 text-slate-500 mx-auto" />
                <h4 className="font-bold text-sm text-slate-300">لا توجد طاولات مسجلة بعد</h4>
                <p className="text-xs text-slate-500">اضغط على زر التوليد التلقائي لإنشاء وتوزيع خريطة الطاولات فوراً</p>
                <button
                  onClick={() => handleAutoGenerateFloorPlan(30)}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 text-black font-black text-xs"
                >
                  ⚡ توليد خريطة 30 طاولة الآن
                </button>
              </div>
            )}

          </div>
        )}

        {/* TAB 0: Staff & Role-Based Access Control (RBAC) */}
        {activeTab === 'users' && (
          <div className="mt-6 space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-400" />
                  <span>طاقم العمل والصلاحيات المخصصة (Staff & Privileges)</span>
                </h3>
                <p className="text-xs text-slate-400 font-tajawal mt-0.5">
                  إضافة وتعديل حسابات المديرين، الكباتن، شيفات المطبخ، البارستا، والكاشير مع تحديد صلاحيات مسبقة أو مخصصة.
                </p>
              </div>

              <button
                onClick={handleOpenAddUser}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-orange-950/40 transition-all self-start sm:self-auto"
              >
                <UserPlus className="w-4 h-4" />
                <span>إضافة موظف جديد</span>
              </button>
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {usersList.map((user) => {
                const roleColors = {
                  admin: 'bg-amber-500/20 border-amber-500/40 text-amber-400',
                  captain: 'bg-blue-500/20 border-blue-500/40 text-blue-400',
                  chef: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400',
                  barista: 'bg-purple-500/20 border-purple-500/40 text-purple-400',
                  cashier: 'bg-teal-500/20 border-teal-500/40 text-teal-400',
                  custom: 'bg-slate-800 border-slate-700 text-slate-300'
                };

                return (
                  <div
                    key={user.id}
                    className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between shadow-xl space-y-4 hover:border-slate-700 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black border uppercase ${roleColors[user.role] || roleColors.custom}`}>
                          {PRESET_ROLES[user.role]?.nameAr || user.role}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditUser(user)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            title="تعديل الصلاحيات"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {user.id !== 1 && (
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-red-400 transition-colors"
                              title="حذف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="mt-3">
                        <h4 className="font-black text-white text-base">
                          {user.name}
                        </h4>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          @{user.username} {user.phone && `| 📞 ${user.phone}`}
                        </p>
                      </div>

                      <div className="mt-3 p-2.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                          <span className="text-slate-400">كود PIN:</span>
                          <span className="font-mono font-black text-amber-300 tracking-widest">{user.pin}</span>
                        </div>

                        <span className="text-[11px] font-bold text-slate-400">
                          {user.permissions?.includes('all') ? 'كل الصلاحيات ⭐' : `${user.permissions?.length || 0} صلاحيات`}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-800/80">
                      {user.permissions && user.permissions.map((pId, idx) => {
                        const permObj = AVAILABLE_PERMISSIONS.find(ap => ap.id === pId);
                        return (
                          <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {permObj?.labelAr ? permObj.labelAr.split('(')[0] : String(pId)}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* TAB 1: Yearly License & Cryptographic Key Management */}
        {activeTab === 'license' && (
          <div className="mt-6 space-y-6">
            
            {/* Status Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border border-amber-500/40 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-slate-400">حالة الاشتراك والترخيص السنوي</span>
                  <div className="flex items-center gap-2 mt-1">
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      {licenseInfo?.license?.clientName || licenseInfo?.client_name || 'سول كافيه ومطعم (Soul Lounge)'}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {t('licenseActive')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-tajawal mt-1">
                    {licenseInfo?.license?.message || 'ترخيص محلي كامل ساري لمدة عام مع كافة مميزات السوبر أدمن والربط الشبكي'}
                  </p>
                </div>

                <div className="text-right sm:text-left">
                  <span className="text-xs text-slate-400 font-bold block">{t('daysRemaining')}</span>
                  <span className="text-3xl font-black text-amber-400 font-mono">
                    {licenseInfo?.license?.daysRemaining || licenseInfo?.days_remaining || 365} <span className="text-sm font-normal">يوم</span>
                  </span>
                  <p className="text-[10px] text-slate-500 font-mono">ينتهي في: {licenseInfo?.license?.expiry || licenseInfo?.expires_at || '2027-08-31'}</p>
                </div>
              </div>

              {/* Machine ID Box */}
              <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-[11px] text-slate-400 font-bold block">{t('hardwareId')}</span>
                  <code className="text-xs sm:text-sm text-amber-300 font-mono font-bold">
                    {licenseInfo?.hardwareId || licenseInfo?.hardware_id || 'EGY-NODE-SRV-9082-MAC'}
                  </code>
                </div>

                <button
                  onClick={copyMachineId}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors self-start sm:self-auto"
                >
                  {copiedHid ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-amber-400" />}
                  <span>{copiedHid ? 'تم النسخ' : 'نسخ كود الجهاز'}</span>
                </button>
              </div>
            </div>

            {/* Activate New License Key Form */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-400" />
                <span>{t('activateKey')}</span>
              </h3>
              <p className="text-xs text-slate-400 font-tajawal">
                عند شراء تجديد الاشتراك السنوي، ستحصل على مفتاح ترخيص مشفر محلياً. الصقه هنا لتمديد الصلاحية لمدة عام إضافي.
              </p>

              <textarea
                rows={3}
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder={t('enterKeyPlaceholder')}
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-amber-300 font-mono placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
              />

              {activationMsg && (
                <div className={`p-3 rounded-xl text-xs font-bold ${
                  activationMsg.success ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}>
                  {activationMsg.message}
                </div>
              )}

              <button
                onClick={handleActivateKey}
                className="bg-amber-500 hover:bg-amber-400 text-black font-black py-3 px-6 rounded-xl text-xs transition-all shadow-md"
              >
                {t('activateBtn')}
              </button>
            </div>

            {/* Vendor License Generation Studio */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold text-slate-300">أداة إصدار التراخيص السنوية (لفريق الدعم والموزعين)</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={vendorClientName}
                  onChange={(e) => setVendorClientName(e.target.value)}
                  placeholder="اسم المطعم / الفرع"
                  className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                />
                <input
                  type="number"
                  value={vendorDays}
                  onChange={(e) => setVendorDays(e.target.value)}
                  placeholder="عدد الأيام (365)"
                  className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono"
                />
                <button
                  onClick={handleIssueVendorKey}
                  className="bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 font-bold rounded-xl text-xs py-2.5"
                >
                  توليد مفتاح ترخيص فوري 🔑
                </button>
              </div>

              {issuedVendorKey && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 block font-bold">مفتاح الترخيص السنوي المولد:</span>
                  <code className="text-xs text-emerald-400 font-mono break-all block">{issuedVendorKey}</code>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: QR & NFC Studio */}
        {activeTab === 'qr_studio' && (
          <div className="mt-6 space-y-6">
            
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-amber-400" />
                    <span>{t('qrStudioTitle')}</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-tajawal mt-0.5">
                    اختر رقم الطاولة لمعاينة وطباعة كارت الطاولة أو كتابة الرابط داخل شريحة الـ NFC.
                  </p>
                </div>

                {/* Table Picker */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400">{t('table')}:</span>
                  <select
                    value={selectedPrintTable}
                    onChange={(e) => setSelectedPrintTable(parseInt(e.target.value, 10))}
                    className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-amber-400 font-black text-sm"
                  >
                    {Array.from({ length: 30 }, (_, i) => i + 1).map(n => (
                      <option key={n} value={n}>طاولة #{n}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Table Stand Preview Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                
                {/* Visual Printable Card (Tent Card / Acrylic Stand layout) */}
                <div className="p-6 rounded-3xl bg-gradient-to-b from-slate-950 to-slate-900 border-2 border-amber-500/50 shadow-2xl flex flex-col items-center text-center space-y-4 max-w-sm mx-auto w-full">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase">QRMate Smart In-House</span>
                    <h2 className="text-xl font-black text-white">
                      {lang === 'ar' ? (settings.venue_name_ar || 'كافيه وبسترو الأصيل') : (settings.venue_name_en || 'El Aseel Cafe')}
                    </h2>
                  </div>

                  {/* Table Badge */}
                  <div className="w-16 h-16 rounded-2xl bg-amber-500 text-black flex flex-col items-center justify-center font-black shadow-lg shadow-amber-500/30">
                    <span className="text-[10px] uppercase font-bold leading-tight">TABLE</span>
                    <span className="text-2xl font-mono leading-tight">{selectedPrintTable}</span>
                  </div>

                  {/* High Precision QR Code */}
                  <div className="p-3 bg-white rounded-2xl shadow-xl">
                    <QRCodeSVG
                      value={tableUrl}
                      size={140}
                      level="H"
                      includeMargin={false}
                    />
                  </div>

                  {/* Instructions */}
                  <div className="space-y-1">
                    <p className="text-xs font-black text-white flex items-center justify-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-amber-400" />
                      <span>قرب هاتفك (NFC) أو امسح الكود (QR) للطلب</span>
                    </p>
                    <p className="text-[10px] text-slate-400 font-tajawal">
                      تصفح القائمة واطلب لطاولتك فوراً بدون انتظار الويتر
                    </p>
                  </div>

                  {/* Wi-Fi Details */}
                  <div className="pt-2 border-t border-slate-800 w-full text-[10px] text-slate-400">
                    Wi-Fi: <strong className="text-white">{settings.wifi_ssid}</strong> | Pass: <strong className="text-white">{settings.wifi_pass}</strong>
                  </div>
                </div>

                {/* Info & NFC Writing Details */}
                <div className="space-y-4 flex flex-col justify-center">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <h4 className="text-xs font-bold text-amber-400">رابط الشريحة الذكية (NFC Tag Payload):</h4>
                    <code className="text-xs font-mono text-slate-300 break-all block p-2 bg-slate-900 rounded-xl border border-slate-800">
                      {tableUrl}
                    </code>
                    <p className="text-[11px] text-slate-400 font-tajawal">
                      💡 يمكنك نسخ هذا الرابط وبرمجته في كروت ومكعبات الـ NFC عبر أي تطبيق مثل <strong>NFC Tools</strong> على هاتفك خلال ثانية واحدة.
                    </p>
                  </div>

                  <button
                    onClick={() => window.print()}
                    className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                  >
                    <Printer className="w-4 h-4" />
                    <span>طباعة استيكر وكارت طاولة #{selectedPrintTable}</span>
                  </button>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* TAB 3: Menu & Price Editor */}
        {activeTab === 'menu' && (
          <div className="mt-6 space-y-6 animate-fadeIn">
            
            {/* Top Toolbar: Action Buttons & Search */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/90 p-4 rounded-3xl border border-slate-800">
              
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن صنف أو طبق أو مكونات..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-2.5 pr-10 pl-4 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleOpenAddCategory}
                  className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4 text-amber-400" />
                  <span>+ إضافة قسم جديد</span>
                </button>

                <button
                  onClick={handleOpenAddItem}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-950/60 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ إضافة صنف / طبق جديد</span>
                </button>
              </div>

            </div>

            {/* Category Filter Pills */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400">الأقسام المتاحة:</span>
                <span className="text-[11px] font-mono text-slate-500">
                  {filteredItems.length} من أصل {menuItems.length} صنف
                </span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                <button
                  onClick={() => setSelectedCatFilter('all')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCatFilter === 'all'
                      ? 'bg-amber-500 text-black font-black'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  الكل ({menuItems.length})
                </button>

                {categories.map(cat => (
                  <div key={cat.id} className="relative group flex-shrink-0">
                    <button
                      onClick={() => setSelectedCatFilter(cat.id.toString())}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        selectedCatFilter === cat.id.toString()
                          ? 'bg-amber-500 text-black font-black'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      <span>{lang === 'ar' ? cat.name_ar : cat.name_en}</span>
                      <span className="text-[10px] opacity-75 font-mono">
                        ({menuItems.filter(it => it.category_id === cat.id).length})
                      </span>
                    </button>

                    {/* Quick Edit/Delete Category */}
                    <div className="hidden group-hover:flex items-center gap-1 absolute -top-3 left-1 bg-slate-950 border border-slate-700 rounded-lg p-0.5 shadow-lg z-10">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpenEditCategory(cat); }}
                        className="p-1 text-slate-400 hover:text-amber-400"
                        title="تعديل اسم القسم"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDeleteCategory(cat.id); }}
                        className="p-1 text-slate-400 hover:text-rose-400"
                        title="حذف القسم"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => {
                const catObj = categories.find(c => c.id === item.category_id);
                const currentQuickPrice = quickPrices[item.id] !== undefined ? quickPrices[item.id] : item.price;
                const isPriceDirty = quickPrices[item.id] !== undefined && quickPrices[item.id] !== item.price;

                return (
                  <div
                    key={item.id}
                    className={`rounded-3xl bg-slate-900/90 border p-5 flex flex-col justify-between transition-all ${
                      item.is_available ? 'border-slate-800 hover:border-slate-700' : 'border-rose-900/30 opacity-75 bg-slate-950/60'
                    }`}
                  >
                    <div>
                      {/* Card Top: Badges & Actions */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                            {catObj ? (lang === 'ar' ? catObj.name_ar : catObj.name_en) : 'عام'}
                          </span>

                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            item.station_type === 'kitchen'
                              ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {item.station_type === 'kitchen' ? <ChefHat className="w-3 h-3" /> : <Coffee className="w-3 h-3" />}
                            <span>{item.station_type === 'kitchen' ? 'المطبخ' : 'البار / الشيشة'}</span>
                          </span>

                          {item.tags?.includes('popular') && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              ⭐ الأكثر طلباً
                            </span>
                          )}
                          {item.tags?.includes('spicy') && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                              🔥 حار
                            </span>
                          )}
                        </div>

                        {/* Edit / Delete Buttons */}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEditItem(item)}
                            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition-colors"
                            title="تعديل بيانات الصنف"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors"
                            title="حذف الصنف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Title & Descriptions */}
                      <h4 className="text-sm font-black text-white leading-snug mb-1">
                        {item.name_ar}
                      </h4>
                      {item.name_en && (
                        <p className="text-xs text-slate-400 font-mono mb-2">
                          {item.name_en}
                        </p>
                      )}
                      {item.description_ar && (
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-4">
                          {item.description_ar}
                        </p>
                      )}
                    </div>

                    {/* Card Bottom: Quick Price Editor & Availability Toggle */}
                    <div className="pt-4 border-t border-slate-800/80 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        
                        {/* Quick Price Input */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-400">السعر:</span>
                          <div className="relative flex items-center">
                            <input
                              type="number"
                              step="0.5"
                              value={currentQuickPrice}
                              onChange={(e) => setQuickPrices({ ...quickPrices, [item.id]: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleQuickPriceChange(item.id, currentQuickPrice);
                              }}
                              className="w-20 bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl py-1 px-2 text-xs font-mono font-bold text-amber-400 focus:outline-none"
                            />
                            <span className="text-[11px] text-slate-400 font-bold mr-1.5">ج.م</span>

                            {isPriceDirty && (
                              <button
                                onClick={() => handleQuickPriceChange(item.id, currentQuickPrice)}
                                className="mr-1 p-1 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 transition-colors"
                                title="حفظ السعر الجديد"
                              >
                                <Check className="w-3 h-3 stroke-[3]" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Stock Toggle Button */}
                        <button
                          onClick={() => handleToggleStock(item.id)}
                          className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                            item.is_available
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {item.is_available ? 'متاح للطلب ✅' : 'نفذ من المخزن ❌'}
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-16 bg-slate-900/40 rounded-3xl border border-slate-800 space-y-3">
                <AlertCircle className="w-10 h-10 text-slate-500 mx-auto" />
                <h4 className="font-bold text-sm text-slate-300">لا توجد أصناف مطابقة للبحث أو الفلتر</h4>
                <p className="text-xs text-slate-500">يمكنك الضغط على "+ إضافة صنف جديد" لإضافة أول طبق في هذا القسم</p>
                <button
                  onClick={handleOpenAddItem}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-black font-bold text-xs"
                >
                  + إضافة صنف الآن
                </button>
              </div>
            )}

          </div>
        )}

        {/* TAB 4: Venue Profile & Taxes */}
        {activeTab === 'venue' && (
          <div className="mt-6">
            <form onSubmit={handleSaveVenueSettings} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 max-w-2xl">
              <h3 className="text-base font-black text-white mb-4">
                بيانات الكافيه والمطعم والضرائب المصرية
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">اسم المطعم (بالعربية)</label>
                  <input
                    type="text"
                    value={settings.venue_name_ar || ''}
                    onChange={(e) => setSettings({ ...settings, venue_name_ar: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">اسم المطعم (English)</label>
                  <input
                    type="text"
                    value={settings.venue_name_en || ''}
                    onChange={(e) => setSettings({ ...settings, venue_name_en: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">ضريبة القيمة المضافة VAT (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={settings.tax_vat_percent || 14}
                    onChange={(e) => setSettings({ ...settings, tax_vat_percent: parseFloat(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">خدمة الصالة Service Charge (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={settings.service_fee_percent || 12}
                    onChange={(e) => setSettings({ ...settings, service_fee_percent: parseFloat(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">شبكة الواي فاي (Wi-Fi SSID)</label>
                  <input
                    type="text"
                    value={settings.wifi_ssid || ''}
                    onChange={(e) => setSettings({ ...settings, wifi_ssid: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">باسورد الواي فاي (Wi-Fi Pass)</label>
                  <input
                    type="text"
                    value={settings.wifi_pass || ''}
                    onChange={(e) => setSettings({ ...settings, wifi_pass: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-300 block mb-1">رقم التسجيل الضريبي المصري</label>
                  <input
                    type="text"
                    value={settings.tax_reg_number || ''}
                    onChange={(e) => setSettings({ ...settings, tax_reg_number: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-4 bg-amber-500 hover:bg-amber-400 text-black font-black py-3 px-6 rounded-xl text-xs flex items-center gap-2 transition-all shadow-md"
              >
                <Save className="w-4 h-4" />
                <span>حفظ التعديلات</span>
              </button>
            </form>
          </div>
        )}

      </div>

      {/* Add / Edit User Modal */}
      {userModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            
            <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-white text-base">
                  {editingUserId ? 'تعديل بيانات وصلاحيات الموظف' : 'إضافة موظف جديد وتعيين الصلاحيات'}
                </h3>
              </div>
              <button
                onClick={() => setUserModalOpen(false)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">اسم الموظف الثلاثي *</label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="مثال: أحمد محمد عبد العال"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">اسم المستخدم (Username) *</label>
                  <input
                    type="text"
                    required
                    disabled={Boolean(editingUserId)}
                    value={userUsername}
                    onChange={(e) => setUserUsername(e.target.value)}
                    placeholder="مثال: ahmed_capt"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono focus:border-amber-500 focus:outline-none disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">كود الدخول السريع PIN (4 أرقام) *</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={userPin}
                    onChange={(e) => setUserPin(e.target.value)}
                    placeholder="مثال: 7788"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-amber-400 font-mono font-black focus:border-amber-500 focus:outline-none tracking-widest"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">رقم الهاتف (اختياري)</label>
                  <input
                    type="text"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    placeholder="010XXXXXXXX"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Preset Roles */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-xs font-bold text-amber-400 block">
                  1. اختيار قالب الدور الوظيفي السريع (Preset Role):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(PRESET_ROLES).map(([rKey, rObj]) => {
                    const isSelected = userRole === rKey;
                    return (
                      <button
                        key={rKey}
                        type="button"
                        onClick={() => handleRolePresetChange(rKey)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-right ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 ring-1 ring-amber-500/50'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        {rObj.nameAr}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Granular Permissions */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="text-xs font-bold text-amber-400 block">
                  2. تخصيص وتعديل الصلاحيات الفردية (Granular Permissions):
                </label>
                
                <div className="space-y-1.5 bg-slate-950 p-3 rounded-2xl border border-slate-800 max-h-56 overflow-y-auto">
                  {AVAILABLE_PERMISSIONS.map((perm) => {
                    const isChecked = userPermissions.includes('all') || userPermissions.includes(perm.id);
                    return (
                      <div
                        key={perm.id}
                        onClick={() => handleTogglePermission(perm.id)}
                        className={`p-2 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                          isChecked ? 'bg-amber-500/10 text-amber-300' : 'text-slate-400 hover:bg-slate-900'
                        }`}
                      >
                        <span className="text-xs font-bold">{perm.labelAr}</span>
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-600" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-black py-3 px-4 rounded-xl text-xs sm:text-sm shadow-lg transition-all"
                >
                  {editingUserId ? 'تحديث بيانات وصلاحيات الموظف' : 'حفظ وإضافة الموظف الآن'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: ADD / EDIT MENU ITEM */}
      {/* ==================================================== */}
      {itemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            
            <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-white text-base">
                  {editingItemId ? 'تعديل بيانات وسعر الصنف' : 'إضافة صنف / طبق جديد للمنيو'}
                </h3>
              </div>
              <button
                onClick={() => setItemModalOpen(false)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">اسم الصنف بالعربية *</label>
                  <input
                    type="text"
                    required
                    value={itemNameAr}
                    onChange={(e) => setItemNameAr(e.target.value)}
                    placeholder="مثال: سماش برجر أوريجينال"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">اسم الصنف بالإنجليزية (English) *</label>
                  <input
                    type="text"
                    required
                    value={itemNameEn}
                    onChange={(e) => setItemNameEn(e.target.value)}
                    placeholder="e.g. Original Smash Burger"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">السعر (ج.م / EGP) *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={itemPrice}
                    onChange={(e) => setItemPrice(e.target.value)}
                    placeholder="مثال: 310"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-amber-400 font-mono font-bold focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">القسم التابع له *</label>
                  <select
                    value={itemCatId}
                    onChange={(e) => setItemCatId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name_ar} ({cat.name_en})</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-300 block mb-1">محطة التجهيز وتوجيه الأوردر (KDS Station) *</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setItemStation('kitchen')}
                      className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                        itemStation === 'kitchen'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500 shadow-md'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      <ChefHat className="w-4 h-4 text-blue-400" />
                      <span>شاشة المطبخ (Kitchen KDS)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setItemStation('barista')}
                      className={`p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all ${
                        itemStation === 'barista'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-md'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      <Coffee className="w-4 h-4 text-emerald-400" />
                      <span>شاشة البار والشيشة (Barista KDS)</span>
                    </button>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-300 block mb-1">وصف الصنف والمكونات (بالعربية)</label>
                  <textarea
                    rows={2}
                    value={itemDescAr}
                    onChange={(e) => setItemDescAr(e.target.value)}
                    placeholder="مثال: قطعة برجر بقري 6 أونصة مع مشروم متبل، بصل مكرمل، وجبنة مونتيري جاك"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-300 block mb-1">وصف الصنف (English Description)</label>
                  <textarea
                    rows={2}
                    value={itemDescEn}
                    onChange={(e) => setItemDescEn(e.target.value)}
                    placeholder="e.g. 6 oz beef patty, caramelized onion, Monterey Jack cheese with fries"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>

                {/* Tags */}
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-slate-300 block">علامات الصنف (Tags):</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'popular', label: '⭐ الأكثر طلباً (Popular)' },
                      { id: 'chef_choice', label: '👨‍🍳 اختيار الشيف' },
                      { id: 'spicy', label: '🔥 حار (Spicy)' },
                      { id: 'vegetarian', label: '🌿 نباتي (Vegetarian)' }
                    ].map(tag => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => handleToggleItemTag(tag.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          itemTags.includes(tag.id)
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                            : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                      >
                        {tag.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setItemModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-black text-xs flex items-center gap-1.5 shadow-lg"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ الصنف في المنيو</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: ADD / EDIT CATEGORY */}
      {/* ==================================================== */}
      {catModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            
            <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <h3 className="font-black text-white text-base">
                {editingCatId ? 'تعديل بيانات القسم' : 'إضافة قسم جديد في المنيو'}
              </h3>
              <button onClick={() => setCatModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">اسم القسم بالعربية *</label>
                <input
                  type="text"
                  required
                  value={catNameAr}
                  onChange={(e) => setCatNameAr(e.target.value)}
                  placeholder="مثال: البرجر وسندوتشات فاخرة"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">اسم القسم بالإنجليزية (English) *</label>
                <input
                  type="text"
                  required
                  value={catNameEn}
                  onChange={(e) => setCatNameEn(e.target.value)}
                  placeholder="e.g. Burgers & Sandwiches"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">محطة التجهيز الافتراضية *</label>
                <select
                  value={catStation}
                  onChange={(e) => setCatStation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="kitchen">المطبخ (Kitchen)</option>
                  <option value="barista">البار / المشروبات والشيشة (Barista)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCatModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs"
                >
                  حفظ القسم
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: ADD / EDIT TABLE */}
      {/* ==================================================== */}
      {tableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            
            <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <h3 className="font-black text-white text-base flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-amber-400" />
                <span>{editingTableId ? 'تعديل بيانات الطاولة' : 'إضافة طاولة جديدة للخريطة'}</span>
              </h3>
              <button onClick={() => setTableModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTable} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">رقم الطاولة (Table Number) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={tableNumberInput}
                  onChange={(e) => setTableNumberInput(e.target.value)}
                  placeholder="مثال: 12"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-amber-400 font-mono font-bold focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">قسم / صالة الطاولة *</label>
                <select
                  value={tableSectionInput}
                  onChange={(e) => setTableSectionInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="الصالة الداخلية / Indoor Hall">الصالة الداخلية / Indoor Hall</option>
                  <option value="التراس والحديقة / Outdoor Garden">التراس والحديقة / Outdoor Garden</option>
                  <option value="لاونج الشيشة / Shisha Lounge">لاونج الشيشة / Shisha Lounge</option>
                  <option value="صالة العائلات VIP / VIP Lounge">صالة العائلات VIP / VIP Lounge</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">عدد الكراسي / السعة (Capacity) *</label>
                <select
                  value={tableCapacityInput}
                  onChange={(e) => setTableCapacityInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value={2}>كرسيين (2 Seats - فردين)</option>
                  <option value={4}>4 كراسي (4 Seats - طاولة قياسية)</option>
                  <option value={6}>6 كراسي (6 Seats - طاولة متوسطة)</option>
                  <option value={8}>8 كراسي (8 Seats - عائلات ومجموعات)</option>
                  <option value={12}>12 كرسي (12 Seats - حفلات وVIP)</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTableModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs shadow-lg"
                >
                  حفظ الطاولة
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
