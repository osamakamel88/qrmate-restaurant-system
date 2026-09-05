import React, { useState, useEffect, Component } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { SocketProvider } from './context/SocketContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Common/Navbar';
import { ToastNotification } from './components/Common/ToastNotification';
import { StaffLoginModal } from './components/Common/StaffLoginModal';
import { Footer } from './components/Common/Footer';
import { ShowcaseLanding } from './components/Showcase/ShowcaseLanding';
import { CustomerMenu } from './components/Customer/CustomerMenu';
import { CaptainScreen } from './components/Captain/CaptainScreen';
import { KitchenDisplay } from './components/KDS/KitchenDisplay';
import { PosDashboard } from './components/POS/PosDashboard';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { CartDrawer } from './components/Customer/CartDrawer';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('UI Render Error caught by ErrorBoundary:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl m-6 max-w-xl mx-auto space-y-4">
          <div className="text-amber-400 text-4xl">⚠️</div>
          <h3 className="text-lg font-bold text-white">حدث خطأ أثناء تحميل هذه الشاشة</h3>
          <p className="text-xs text-slate-400 font-tajawal">يمكنك إعادة التحديث أو العودة للشاشات الأخرى.</p>
          <button
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
            className="px-5 py-2.5 rounded-xl bg-amber-500 text-black font-bold text-xs"
          >
            إعادة تحميل الصفحة 🔄
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppContent() {
  const [activeTab, setActiveTab] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('table') || window.location.pathname.includes('/table')) {
      return 'menu';
    }
    return 'showcase';
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const { isPinModalOpen, setIsPinModalOpen } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-cairo selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Toast Notification Container */}
      <ToastNotification />

      {/* Staff PIN Login Modal */}
      <StaffLoginModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
      />

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        <ErrorBoundary>
          {activeTab === 'showcase' && (
            <ShowcaseLanding onOpenDemo={() => setActiveTab('menu')} />
          )}
          {activeTab === 'menu' && (
            <CustomerMenu onOpenCart={() => setIsCartOpen(true)} />
          )}
          {activeTab === 'captain' && (
            <CaptainScreen />
          )}
          {activeTab === 'kds' && (
            <KitchenDisplay />
          )}
          {activeTab === 'pos' && (
            <PosDashboard />
          )}
          {activeTab === 'admin' && (
            <AdminDashboard />
          )}
        </ErrorBoundary>
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Customer Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <SocketProvider>
        <AuthProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </AuthProvider>
      </SocketProvider>
    </LanguageProvider>
  );
}

