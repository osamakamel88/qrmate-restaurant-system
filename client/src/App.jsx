import React, { useState, useEffect } from 'react';
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-cairo">
      
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

