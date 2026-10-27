import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar, SearchDrawer } from '@/features/navigation';
import { HomePage, Footer } from '@/features/home';
import { CategoryPage } from '@/features/products/pages/CategoryPage';
import { ProductDetailPage } from '@/features/products/pages/ProductDetailPage';
import { CraftPage } from '@/features/craft/CraftPage';
import { JournalPage } from '@/features/journal/JournalPage';
import { AboutPage } from '@/features/about/AboutPage';
import { ProductQuickView } from '@/features/products';
import { AccountModal, LoginPage } from '@/features/auth';
import { CartDrawer } from '@/features/cart';
import { Product, CartItem, RegionOption } from '@/types';
import { REGIONS, CURRENCY_RATES, PRODUCTS } from '@/data/products';

export const App: React.FC = () => {
  // Regional & Currency State (Default INR)
  const [currentRegion] = useState<RegionOption>(REGIONS[0]);

  // Cart State
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      product: PRODUCTS[0],
      size: 'M',
      quantity: 1,
    },
  ]);

  // Auth State
  const [currentUser, setCurrentUser] = useState<{ name: string; email?: string; phone?: string } | null>(null);

  // QuickView State
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Modal Visibility States
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const activeCurrency = CURRENCY_RATES[currentRegion.currency];
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Cart Handlers
  const handleAddToCart = (product: Product, size: CartItem['size']) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (item) => item.product.id === product.id && item.size === size
      );
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, size, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateQuantity = (productId: string, size: CartItem['size'], delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId && item.size === size) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (productId: string, size: CartItem['size']) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.product.id === productId && item.size === size))
    );
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-adwika-black text-neutral-100 flex flex-col font-sans selection:bg-adwika-sand selection:text-black">
        {/* Top Navigation */}
        <Navbar
          onOpenAccountModal={() => setIsAccountModalOpen(true)}
          onOpenSearchModal={() => setIsSearchModalOpen(true)}
          onOpenCart={() => setIsCartOpen(true)}
          cartCount={cartCount}
        />

        {/* Routed Pages */}
        <main className="flex-1">
          <Routes>
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
                  subtitle="Architectural silhouettes, inverted pleating, and flowing handloom Chanderi and cotton-silks designed for daily poise."
                  heroImage="/images/aangan-kurta.jpg"
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
                  title="Handloom Shirts"
                  subtitle="Relaxed dropped-shoulder tailoring cut from Maheshwari silk and wild Bhagalpuri tussar."
                  heroImage="/images/craft-detail-collection.jpg"
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
                  title="Sarees — Arriving Winter 2026"
                  subtitle="Hand-woven pit loom silks, featherweight Chanderis, and hand-painted Srikalahasti Kalamkaris. Preview our inaugural archives."
                  heroImage="/images/hero-user.jpg"
                  currency={activeCurrency}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              }
            />
            {/* Backward-compatible legacy aliases */}
            <Route path="/women" element={<Navigate to="/kurtis" replace />} />
            <Route path="/occasionwear" element={<Navigate to="/suits" replace />} />
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
                  onLoginSuccess={(user) => setCurrentUser(user)}
                  onLogout={() => setCurrentUser(null)}
                />
              }
            />
            <Route
              path="/product/:id"
              element={
                <ProductDetailPage
                  currency={activeCurrency}
                  onAddToCart={handleAddToCart}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              }
            />
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Luxury Footer */}
        <Footer />

        {/* Interactive Modals and Drawers */}

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
          onLoginSuccess={(user) => setCurrentUser(user)}
          onLogout={() => setCurrentUser(null)}
        />

        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          items={cartItems}
          currency={activeCurrency}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onExplore={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />

        <ProductQuickView
          product={quickViewProduct}
          isOpen={Boolean(quickViewProduct)}
          onClose={() => setQuickViewProduct(null)}
          currency={activeCurrency}
          onAddToCart={handleAddToCart}
        />
      </div>
    </BrowserRouter>
  );
};

export default App;
