// ============================================================================
// BRAVOMART - STOREFRONT HOMEPAGE
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Store, ArrowRight, Search, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';

// Backend API URL configured via environment variables with localhost fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Standard SVG Data URI fallback image for broken or missing images
const FALLBACK_IMAGE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%23EFF1EC"/><text x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%237A828A" font-family="sans-serif" font-size="14">Image unavailable</text></svg>';

// Sector icons mapping for landing page category shortcuts
const CATEGORY_ICON_HINT = {
  all: '🌐', 
  local_food: '🌾', 
  groceries: '🛒', 
  real_estate: '🏠',
  heavy_machinery: '🚜', 
  electronics: '📱', 
  international: '✈️', 
  fashion: '👕',
};

// Static fallback sectors for rendering sector buttons if DB categories are empty
const FALLBACK_CATEGORIES = [
  { id: 'local_food', name: 'Local Food & Produce' },
  { id: 'groceries', name: 'Supermarket Groceries' },
  { id: 'real_estate', name: 'Real Estate & Properties' },
  { id: 'heavy_machinery', name: 'Heavy Machinery & Tools' },
  { id: 'electronics', name: 'Consumer Electronics' },
  { id: 'fashion', name: 'Fashion & Apparel' },
];

const STEPS = [
  { n: '1', title: 'Search & compare', body: 'Find the same item across nearby vendors, ranked by price, rating, and distance.' },
  { n: '2', title: 'Check the trust score', body: 'Every listing carries an AI-generated report on the vendor before you pay.' },
  { n: '3', title: 'Buy with escrow', body: 'Your payment is held for 7 days until you confirm the exact item arrived.' },
];

// Helper calculation to estimate distance dynamically
const calculateGpsDistanceKm = (lat, lng) => {
  if (!lat || !lng) return 2.5;
  return Math.round((Math.abs(lat) % 10 + Math.abs(lng) % 10) * 10) / 10;
};

export default function Home({ activeVendor, onVendorLogout, cartCount = 0 }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Local state management for dynamically fetched backend database entities
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productError, setProductError] = useState(null);

  /**
   * Fetch featured items directly from backend database on initial mount
   */
  useEffect(() => {
    let isMounted = true;

    async function fetchHomepageProducts() {
      try {
        setIsLoadingProducts(true);
        setProductError(null);

        // Fetch top products from backend API
        const response = await fetch(`${API_BASE_URL}/products?limit=4`);
        if (!response.ok) {
          throw new Error(`Failed to load featured products (Status ${response.status})`);
        }

        const data = await response.json();

        if (isMounted) {
          // 1. Robust extraction from API wrapper standard formats
          let rawProducts = [];
          if (Array.isArray(data)) {
            rawProducts = data;
          } else if (Array.isArray(data?.data?.items)) {
            rawProducts = data.data.items;
          } else if (Array.isArray(data?.items)) {
            rawProducts = data.items;
          } else if (Array.isArray(data?.data)) {
            rawProducts = data.data;
          }

          // Helper to format relative image paths into absolute backend server URLs
          const resolveImageUrl = (img) => {
            if (!img || typeof img !== 'string') return FALLBACK_IMAGE;
            if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:')) {
              return img;
            }
            // Strip '/api' suffix from API_BASE_URL to resolve root backend domain
            const serverBase = API_BASE_URL.replace(/\/api\/?$/, '');
            const cleanPath = img.startsWith('/') ? img : `/${img}`;
            return `${serverBase}${cleanPath}`;
          };

          // 2. Marketplace Strategy: Normalize objects and resolve image paths before rendering
          const normalizedProducts = rawProducts.map((prod) => {
            const rawImg = 
              prod.imageUrl || 
              prod.image || 
              prod.image_url ||
              (Array.isArray(prod.images) && prod.images.length > 0 ? prod.images[0] : null);

            const primaryImageUrl = resolveImageUrl(rawImg);

            const resolvedImages = Array.isArray(prod.images) && prod.images.length > 0
              ? prod.images.map(resolveImageUrl)
              : [primaryImageUrl];

            return {
              ...prod,
              imageUrl: primaryImageUrl,
              image: primaryImageUrl,
              images: resolvedImages,
              // Fallbacks for display fields
              title: prod.title || prod.name || 'Unnamed Product',
              salePrice: prod.price || prod.salePrice || 0,
              // Ensure category is a string value (extracting .name if object)
              category: typeof prod.category === 'object' 
                ? (prod.category?.name || prod.category?.slug || 'General') 
                : (prod.category || 'General'),
              // Ensure vendor/shop is a string value
              vendor: typeof prod.vendor === 'object' 
                ? (prod.vendor?.shopName || prod.vendor?.name || 'BravoMart Seller') 
                : (prod.vendor || 'BravoMart Seller'),
            };
          });

          setFeaturedProducts(normalizedProducts);
        }
      } catch (err) {
        if (isMounted) {
          console.error('[Home] Failed to load products from API:', err);
          setProductError(err.message || 'Unable to load products right now.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingProducts(false);
        }
      }
    }

    fetchHomepageProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      {/* Top Navbar Component */}
      <Navbar
        activeVendor={activeVendor}
        onVendorLogout={onVendorLogout}
        cartCount={cartCount}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Hero Section */}
      <section className="border-b border-line bg-paper-mist">
        <div className="container-page grid grid-cols-1 items-center gap-10 py-14 sm:py-20 lg:grid-cols-2">
          <div className="animate-rise-in">
            <span className="badge-moss mb-5">Now serving Lagos & 35 states</span>
            <h1 className="font-display text-4xl font-semibold leading-[1.1] tracking-tight text-ink sm:text-5xl">
              Everything you need, from vendors you can trust.
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-ink-soft">
              Garri from the stall down the road, an excavator for the site, or a plot of land —
              one marketplace, with every listing checked for trust before you buy.
            </p>

            {/* Main Search Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const q = searchQuery.trim();
                navigate(q ? `/marketplace?q=${encodeURIComponent(q)}` : '/marketplace');
              }}
              className="relative mt-8 max-w-md"
            >
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search garri, excavators, solar inverters…"
                className="input rounded-full pl-11 pr-28 py-3.5"
              />
              <button type="submit" className="btn-primary absolute right-1.5 top-1/2 -translate-y-1/2 rounded-full">
                Search
              </button>
            </form>

            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm">
              <div><span className="font-display text-xl font-semibold text-ink">7 days</span><span className="ml-1.5 text-ink-faint">escrow window</span></div>
              <div><span className="font-display text-xl font-semibold text-ink">8</span><span className="ml-1.5 text-ink-faint">market sectors</span></div>
              <div><span className="font-display text-xl font-semibold text-ink">AI</span><span className="ml-1.5 text-ink-faint">trust scoring</span></div>
            </div>
          </div>

          {/* Dynamic Featured Products Grid - Connected to Backend Database */}
          <div className="min-h-[280px]">
            {isLoadingProducts ? (
              // Loading Skeleton State
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="card flex h-48 animate-pulse flex-col items-center justify-center bg-paper-mist p-4">
                    <Loader2 size={24} className="animate-spin text-moss-600" />
                    <span className="mt-2 text-xs text-ink-faint">Loading catalog…</span>
                  </div>
                ))}
              </div>
            ) : productError ? (
              // Fallback error UI state
              <div className="card flex flex-col items-center justify-center p-8 text-center">
                <p className="text-sm font-medium text-ink-soft">{productError}</p>
                <button
                  onClick={() => navigate('/marketplace')}
                  className="btn-secondary mt-4 text-xs"
                >
                  Explore Marketplace
                </button>
              </div>
            ) : featuredProducts.length === 0 ? (
              // Empty database fallback state
              <div className="card flex flex-col items-center justify-center p-8 text-center">
                <p className="text-sm text-ink-soft">No live items found in database yet.</p>
                <button
                  onClick={() => navigate('/marketplace')}
                  className="btn-primary mt-4 text-xs"
                >
                  Browse Marketplace
                </button>
              </div>
            ) : (
              // Render Live Database Product Cards
              <div className="grid grid-cols-2 gap-3">
                {featuredProducts.map((product) => (
                  <div key={product.id || product._id} onClick={() => navigate('/marketplace')} className="cursor-pointer">
                    <ProductCard
                      product={product}
                      calculateGpsDistanceKm={calculateGpsDistanceKm}
                      onAddToCart={(e) => { e?.stopPropagation?.(); navigate('/marketplace'); }}
                      onScanScam={(e) => { e?.stopPropagation?.(); navigate('/marketplace'); }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Category Grid Section */}
      <section className="container-page py-14 sm:py-16">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="section-heading">Shop by sector</h2>
          <button type="button" onClick={() => navigate('/marketplace')} className="inline-flex items-center gap-1 text-sm font-medium text-moss-700 hover:text-moss-800 cursor-pointer">
            View all <ArrowRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {FALLBACK_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => navigate(`/marketplace?category=${cat.id}`)}
              className="card-interactive flex flex-col items-start gap-3 p-5 text-left"
            >
              <span className="text-2xl" aria-hidden="true">{CATEGORY_ICON_HINT[cat.id] || '🛒'}</span>
              <span className="text-sm font-medium text-ink">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* How it works Section */}
      <section className="border-y border-line bg-paper-mist py-14 sm:py-16">
        <div className="container-page">
          <h2 className="section-heading mb-10">How buying safely works</h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.n}>
                <span className="font-display text-3xl font-semibold text-moss-300">{step.n}</span>
                <h3 className="mt-3 text-base font-medium text-ink">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seller & Dispatcher Call-To-Action Cards */}
      <section className="container-page py-14 sm:py-16">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="card flex flex-col items-start gap-3 p-7">
            <Store size={22} className="text-moss-700" />
            <h3 className="text-lg font-medium text-ink">Sell on BravoMart</h3>
            <p className="text-sm leading-relaxed text-ink-soft">
              List your shop free for a year, reach buyers by distance, and get paid through escrow.
            </p>
            <button type="button" onClick={() => navigate('/vendor_register')} className="btn-primary mt-1">
              Register your shop
            </button>
          </div>
          <div className="card flex flex-col items-start gap-3 p-7">
            <Truck size={22} className="text-moss-700" />
            <h3 className="text-lg font-medium text-ink">Become a dispatch rider</h3>
            <p className="text-sm leading-relaxed text-ink-soft">
              Pick up delivery routes near you and get paid per completed dispatch.
            </p>
            <button type="button" onClick={() => navigate('/DispatcherPortal')} className="btn-secondary mt-1">
              Learn more
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}