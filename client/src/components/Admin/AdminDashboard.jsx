import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth, AVAILABLE_PERMISSIONS, PRESET_ROLES } from '../../context/AuthContext';
import { QRCodeSVG } from 'qrcode.react';
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
  X
} from 'lucide-react';

export function AdminDashboard() {
  const { lang, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('users'); // 'users', 'license', 'qr_studio', 'menu', 'venue'
  const [settings, setSettings] = useState({});
  const [licenseInfo, setLicenseInfo] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [newKey, setNewKey] = useState('');
  const [activationMsg, setActivationMsg] = useState(null);
  const [copiedHid, setCopiedHid] = useState(false);
  const [selectedPrintTable, setSelectedPrintTable] = useState(1);

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
      const [settRes, licRes, menuRes, usersRes] = await Promise.all([
        fetch(`http://${window.location.hostname}:3001/api/settings`),
        fetch(`http://${window.location.hostname}:3001/api/license/info`),
        fetch(`http://${window.location.hostname}:3001/api/menu`),
        fetch(`http://${window.location.hostname}:3001/api/users`)
      ]);
      const settData = await settRes.json();
      const licData = await licRes.json();
      const menuData = await menuRes.json();
      const usersData = await usersRes.json();

      if (settData.success) setSettings(settData.data || {});
      if (licData.success) setLicenseInfo(licData.data || null);
      if (menuData.success) {
        setMenuItems(menuData.data.items || []);
        setCategories(menuData.data.categories || []);
      }
      if (usersData.success) setUsersList(usersData.data || []);
    } catch (err) {
      console.error('Admin fetch error:', err);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

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

  const localIp = settings.localIp || window.location.hostname || '192.168.1.100';
  const tableUrl = `http://${localIp}:3001/?table=${selectedPrintTable}`;

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
              { id: 'users', label: 'الموظفين والصلاحيات (RBAC)', icon: Users },
              { id: 'license', label: t('licenseStatus'), icon: ShieldCheck },
              { id: 'qr_studio', label: t('qrStudioTitle'), icon: QrCode },
              { id: 'menu', label: t('menuManager'), icon: UtensilsCrossed },
              { id: 'venue', label: 'إعدادات الفرع والضرائب', icon: Settings },
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
                            {permObj ? permObj.labelAr.split('(')[0] : pId}
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
        {activeTab === 'license' && licenseInfo && (
          <div className="mt-6 space-y-6">
            
            {/* Status Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/30 border border-amber-500/40 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-slate-400">حالة الاشتراك والترخيص السنوي</span>
                  <div className="flex items-center gap-2 mt-1">
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      {licenseInfo.license?.clientName || 'مطعم / كافيه مرخص'}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {t('licenseActive')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-tajawal mt-1">
                    {licenseInfo.license?.message}
                  </p>
                </div>

                <div className="text-right sm:text-left">
                  <span className="text-xs text-slate-400 font-bold block">{t('daysRemaining')}</span>
                  <span className="text-3xl font-black text-amber-400 font-mono">
                    {licenseInfo.license?.daysRemaining} <span className="text-sm font-normal">يوم</span>
                  </span>
                  <p className="text-[10px] text-slate-500 font-mono">ينتهي في: {licenseInfo.license?.expiry || '2027-12-31'}</p>
                </div>
              </div>

              {/* Machine ID Box */}
              <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-[11px] text-slate-400 font-bold block">{t('hardwareId')}</span>
                  <code className="text-xs sm:text-sm text-amber-300 font-mono font-bold">
                    {licenseInfo.hardwareId}
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
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-white">
                {t('menuManager')} ({menuItems.length} صنف)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {menuItems.map((item) => (
                <div key={item.id} className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="font-bold text-white text-xs sm:text-sm truncate">
                      {lang === 'ar' ? item.name_ar : item.name_en}
                    </h4>
                    <span className="font-mono text-amber-400 text-xs font-bold block mt-0.5">
                      {item.price} {t('currency')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleToggleStock(item.id)}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                        item.is_available
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {item.is_available ? t('inStock') : t('outOfStock')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
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

    </div>
  );
}
