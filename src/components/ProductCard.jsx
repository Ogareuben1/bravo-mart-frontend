import React from 'react';
import { ShoppingCart, MapPin, Search } from 'lucide-react';
import Price from './ui/Price';
import TrustSeal from './ui/TrustSeal';
import { resolveMediaUrl } from '../services/api';

const FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%23EFF1EC"/><text x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%237A828A" font-family="sans-serif" font-size="14">Image unavailable</text></svg>';

const CATEGORY_LABELS = {
  local_food: 'Market & Farm',
  groceries: 'Supermarket',
  real_estate: 'Real Estate',
  heavy_machinery: 'Machinery',
  electronics: 'Electronics',
  international: 'Imports',
  fashion: 'Fashion',
};

export default function ProductCard({ product, calculateGpsDistanceKm, onAddToCart, onScanScam }) {
  const distance = product.coords
    ? calculateGpsDistanceKm(product.coords.lat, product.coords.lng)
    : (product.distanceKm ?? 2.1);

  const rawImage = product.image || product.imageUrl || '';
  const imageSrc = rawImage ? resolveMediaUrl(rawImage) : FALLBACK_IMAGE;

  return (
    <div className="card-interactive group flex flex-col overflow-hidden">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-paper-sunk">
        <img
          src={imageSrc}
          alt={product.title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = FALLBACK_IMAGE;
          }}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        />

        <span className="absolute top-2.5 left-2.5 badge-neutral bg-paper/90 backdrop-blur-sm">
          {CATEGORY_LABELS[product.category] || product.category}
        </span>

        {product.isFlashDrop && (
          <span className="absolute top-2.5 right-2.5 badge-gold bg-gold text-white">
            Flash drop
          </span>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onScanScam(product);
          }}
          className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-sm bg-paper/95 backdrop-blur-sm px-2 py-1 text-[11px] font-medium text-ink-soft border border-line opacity-0 transition-opacity duration-150 group-hover:opacity-100 hover:text-ink cursor-pointer"
        >
          <Search size={12} /> Scam check
        </button>
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <div className="mb-1.5 flex items-center justify-between gap-2 text-xs text-ink-faint">
          <span className="truncate font-medium text-ink-soft">{product.vendorName || product.vendor}</span>
          <span className="inline-flex shrink-0 items-center gap-0.5">
            <MapPin size={11} /> {distance} km
          </span>
        </div>

        <h3 className="mb-2 line-clamp-2 flex-1 text-sm font-medium leading-snug text-ink">
          {product.title}
        </h3>

        <div className="mb-3 flex items-center justify-between">
          <Price amount={product.salePrice} originalAmount={product.originalPrice} size="sm" />
          <TrustSeal report={product.aiScamReport} />
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          className="btn-primary btn-sm w-full"
        >
          <ShoppingCart size={14} /> Add to cart
        </button>
      </div>
    </div>
  );
}