import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Navbar, SearchDrawer } from '@/features/navigation';
import { HomePage, Footer } from '@/features/home';
import { CategoryPage } from '@/features/products/pages/CategoryPage';
import { ProductDetailPage } from '@/features/products/pages/ProductDetailPage';
import { CraftPage } from '@/features/craft/CraftPage';
import { JournalPage } from '@/features/journal/JournalPage';
import { AboutPage } from '@/features/about/AboutPage';
import { ProductQuickView } from '@/features/products';
import { AccountModal, LoginPage } from '@/features/auth';
import type { AuthUser } from '@/features/auth';
import { CartDrawer, CartPage } from '@/features/cart';
import { MyOrdersPage } from '@/features/orders';
import { AdminRoutes, GlobalToastContainer } from '@/features/admin';
import { UnsubscribePage } from '@/features/stock-notifications';
import { Product, RegionOption } from '@/types';
import { REGIONS, CURRENCY_RATES } from '@/data/products';
import { getCurrentUser, clearAuthSession, isLoggedIn } from '@/config/auth.config';
import { useCartStore } from '@/stores';

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const isCartPage = location.pathname === '/cart' || location.pathname === '/bag';

  // Regional & Currency State (Default INR)
  const [currentRegion] = useState<RegionOption>(REGIONS[0]);

  // Auth State — hydrate from sessionStorage on mount
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getCurrentUser());

  // Cart Store Integration
  const isCartOpen = useCartStore((state) => state.isOpen);
  const closeCart = useCartStore((state) => state.closeCart);
  const cartCount = useCartStore((state) =>
    state.cart?.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) ?? 0
  );
  const fetchCart = useCartStore((state) => state.fetchCart);
  const resetCart = useCartStore((state) => state.resetCart);

  // Automatically route to /cart when an item is added anywhere in the app
  React.useEffect(() => {
    if (isCartOpen && location.pathname !== '/cart' && location.pathname !== '/bag') {
      closeCart();
      navigate('/cart');
    }
  }, [isCartOpen, location.pathname, closeCart, navigate]);

  // Synchronize cart on initial mount if authenticated
  React.useEffect(() => {
    if (isLoggedIn()) {
      fetchCart();
    }
  }, [fetchCart]);

  // Listen for unauthorized 401 events globally to clear user & cart state
  React.useEffect(() => {
    const handleUnauthorized = () => {
      setCurrentUser(null);
      resetCart();
    };
    window.addEventListener('adwika:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('adwika:unauthorized', handleUnauthorized);
    };
  }, [resetCart]);

  // Listen for prompt to open account modal (e.g. when guest clicks Add To Bag)
  React.useEffect(() => {
    const handleOpenAccount = () => {
      setIsAccountModalOpen(true);
    };
    window.addEventListener('adwika:open-account-modal', handleOpenAccount);
    return () => {
      window.removeEventListener('adwika:open-account-modal', handleOpenAccount);
    };
  }, []);

  const handleLogout = () => {
    clearAuthSession();
    setCurrentUser(null);
    resetCart();
  };

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    fetchCart();
  };

  // QuickView State
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Modal Visibility States
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const activeCurrency = CURRENCY_RATES[currentRegion.currency];

  return (
    <div className="min-h-screen bg-adwika-black text-neutral-100 flex flex-col font-sans selection:bg-adwika-sand selection:text-black">
      {/* Top Navigation - shown on storefront */}
      {!isAdmin && !isCartPage && (
        <Navbar
          onOpenAccountModal={() => setIsAccountModalOpen(true)}
          onOpenSearchModal={() => setIsSearchModalOpen(true)}
          onOpenCart={() => navigate('/cart')}
          cartCount={cartCount}
          isLoggedIn={Boolean(currentUser)}
        />
      )}

      {/* Main Routed Content */}
      <main className="flex-1">
        <Routes>
          {/* Admin Routes — protected, requires login */}
          <Route
            path="/admin/*"
            element={isLoggedIn() ? <AdminRoutes /> : <Navigate to="/" replace />}
          />

          {/* Storefront Routes */}
          <Route
            path="/"
            element={
              <HomePage
                currency={activeCurrency}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            }
          />
          {/* Main Category Routes */}
          <Route
            path="/kurtis"
            element={
              <CategoryPage
                category="KURTIS"
                title="Kurtis & Tunics"
                subtitle="Exquisite long tunics, hand-block printed chanderis, and raw silk silhouettes."
                heroImage="/images/women-editorial.jpg"
                currency={activeCurrency}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            }
          />
          <Route
            path="/suits"
            element={
              <CategoryPage
                category="SUITS"
                title="Suits & Anarkalis"
                subtitle="Celebratory heirlooms featuring tone-on-tone Kashmiri needlework, hammered silks, gossamer dupattas, and zari velvet shararas."
                heroImage="/images/occasionwear-collection.jpg"
                currency={activeCurrency}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            }
          />
          <Route
            path="/coords"
            element={
              <CategoryPage
                category="CO-ORDS"
                title="Co-ord Sets"
                subtitle="Contemporary two-piece coordinated sets crafted in pure mulberry silk, chanderi, and textured drapes."
                heroImage="/images/gulab-set.jpg"
                currency={activeCurrency}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            }
          />
          <Route
            path="/shirts"
            element={
              <CategoryPage
                category="SHIRTS"
                title="Shirts"
                subtitle="Hand-loomed cotton and silk statement shirts tailored for relaxed luxury and effortless style."
                heroImage="/images/aangan-kurta.jpg"
                currency={activeCurrency}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            }
          />
          <Route
            path="/sarees"
            element={
              <CategoryPage
                category="SAREES"
                title="Sarees (Coming Soon)"
                subtitle="Handwoven heirlooms in tissue silk, Banarasi zari, and pure organza drapes."
                heroImage="/images/editorial-detail.jpg"
                currency={activeCurrency}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            }
          />
          <Route
            path="/category/:slug"
            element={
              <CategoryPage
                currency={activeCurrency}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            }
          />
          <Route
            path="/craft"
            element={
              <CraftPage
                currency={activeCurrency}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            }
          />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route
            path="/login"
            element={
              <LoginPage
                currentUser={currentUser}
                onLoginSuccess={handleLoginSuccess}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            path="/product/:id"
            element={
              <ProductDetailPage
                currency={activeCurrency}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            }
          />
          <Route
            path="/cart"
            element={
              <CartPage
                currency={activeCurrency}
                onOpenAccountModal={() => setIsAccountModalOpen(true)}
              />
            }
          />
          <Route path="/bag" element={<Navigate to="/cart" replace />} />
          <Route
            path="/orders"
            element={
              <MyOrdersPage
                currency={activeCurrency}
                onOpenAccountModal={() => setIsAccountModalOpen(true)}
              />
            }
          />
          <Route path="/my-orders" element={<Navigate to="/orders" replace />} />
          <Route path="/unsubscribe" element={<UnsubscribePage />} />
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Luxury Footer - shown on storefront */}
      {!isAdmin && !isCartPage && <Footer />}

      {/* Storefront Interactive Modals and Drawers */}
      {!isAdmin && (
        <>
          <SearchDrawer
            isOpen={isSearchModalOpen}
            onClose={() => setIsSearchModalOpen(false)}
            currency={activeCurrency}
            onSelectProduct={(p) => setQuickViewProduct(p)}
          />

          <AccountModal
            isOpen={isAccountModalOpen}
            onClose={() => setIsAccountModalOpen(false)}
            currentUser={currentUser}
            onLoginSuccess={handleLoginSuccess}
            onLogout={handleLogout}
          />

          {!isCartPage && (
            <CartDrawer
              isOpen={isCartOpen}
              onClose={closeCart}
              currency={activeCurrency}
              onOpenAccountModal={() => setIsAccountModalOpen(true)}
              onExplore={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          <ProductQuickView
            product={quickViewProduct}
            isOpen={Boolean(quickViewProduct)}
            onClose={() => setQuickViewProduct(null)}
            currency={activeCurrency}
          />
        </>
      )}
      {/* Global Toast Container for App-wide notifications (e.g. 401 Unauthorized, No Internet) */}
      <GlobalToastContainer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
