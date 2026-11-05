'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useLocation } from '@/context/LocationContext';
import { Product } from '@/types/product';
import { Shop } from '@/types/shop';
import {
  ArrowLeft,
  ShoppingBag,
  Plus,
  Minus,
  Check,
  Store,
  MapPin,
  ShieldCheck,
  Scale,
  Package,
  Star,
  Zap,
  Tag,
  Truck,
  CheckCircle,
  Share2,
} from 'lucide-react';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { addItem } = useCart();
  const { currentLocation } = useLocation();
  const [product, setProduct] = useState<(Product & { shop?: Shop }) | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${params.id}`);
        const data = await res.json();
        if (data.product) {
          setProduct(data.product);
        }
      } catch (err) {
        console.error('Failed to load product:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [params.id]);

  const handleAddToCart = () => {
    if (!product || product.availability === 'OUT_OF_STOCK') return;

    addItem(
      {
        productId: product._id,
        shopId: product.shopId,
        shopName: product.shop?.businessName || 'Local Shop',
        name: product.name,
        price: product.discountPrice || product.price,
        unit: product.unit,
        weightKg: product.weightKg,
        imageUrl: product.images?.[0] || '/placeholder-product.svg',
      },
      quantity
    );

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/cart');
  };

  if (loading || !product) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-500">
        <div className="flex flex-col items-center space-y-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2874f0] border-t-transparent" />
          <p className="text-xs">Loading product details...</p>
        </div>
      </div>
    );
  }

  const originalPrice = Math.round(product.price * 1.35);
  const effectivePrice = product.discountPrice || product.price;
  const discountPercent = Math.round(((originalPrice - effectivePrice) / originalPrice) * 100);
  const images = product.images && product.images.length > 0 ? product.images : ['/placeholder-product.svg'];

  return (
    <div className="min-h-screen bg-[#f1f2f4] pb-24 md:pb-12">
      
      {/* Mobile Top Navigation Bar */}
      <div className="bg-white border-b border-slate-200 px-3 py-2 flex items-center justify-between md:hidden sticky top-[57px] z-20">
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-1 text-slate-700 text-xs font-semibold"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: product.name, url: window.location.href });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Product link copied to clipboard!');
              }
            }}
            className="p-1.5 text-slate-600 hover:text-slate-900"
          >
            <Share2 className="h-4 w-4" />
          </button>
          <Link href="/cart" className="p-1.5 text-slate-600 hover:text-[#2874f0]">
            <ShoppingBag className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-6">
        
        {/* Breadcrumbs (Desktop) */}
        <div className="hidden md:flex items-center space-x-2 text-xs text-slate-500 mb-4">
          <Link href="/" className="hover:text-[#2874f0]">Home</Link>
          <span>/</span>
          <Link href="/search" className="hover:text-[#2874f0]">Products</Link>
          <span>/</span>
          <Link href={`/shops/${product.shopId}`} className="hover:text-[#2874f0]">
            {product.shop?.businessName || 'Shop'}
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-medium truncate max-w-xs">{product.name}</span>
        </div>

        {/* Main Product Container */}
        <div className="bg-white rounded-md border border-slate-200/80 shadow-sm p-3 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left Column: Image Gallery (5 cols on desktop) */}
          <div className="md:col-span-5 flex flex-col items-center">
            {/* Main Hero Photo */}
            <div className="h-64 sm:h-96 w-full rounded border border-slate-100 flex items-center justify-center p-4 relative overflow-hidden bg-slate-50">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="h-full w-full object-contain"
              />
              <span className="absolute top-2 left-2 bg-[#388e3c] text-white text-xs font-bold px-2 py-0.5 rounded">
                {discountPercent}% OFF
              </span>
            </div>

            {/* Thumbnail Row */}
            {images.length > 1 && (
              <div className="flex space-x-2 mt-3 overflow-x-auto no-scrollbar w-full justify-center">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`h-14 w-14 rounded border p-1 shrink-0 ${
                      selectedImage === idx ? 'border-[#2874f0] ring-1 ring-[#2874f0]' : 'border-slate-200'
                    }`}
                  >
                    <img src={img} alt="" className="h-full w-full object-contain" />
                  </button>
                ))}
              </div>
            )}

            {/* Desktop Action Buttons (Side by Side Rounded Pills) */}
            <div className="hidden md:grid grid-cols-2 gap-3 w-full mt-6">
              <button
                onClick={handleAddToCart}
                disabled={product.availability === 'OUT_OF_STOCK'}
                className="bg-[#0f766e] hover:bg-teal-800 text-white font-bold py-3.5 px-5 rounded-full shadow-md transition-all active:scale-95 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>{added ? '✓ IN CART' : 'ADD TO CART'}</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={product.availability === 'OUT_OF_STOCK'}
                className="bg-[#e11d48] hover:bg-rose-700 text-white font-bold py-3.5 px-5 rounded-full shadow-md transition-all active:scale-95 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <Zap className="h-4 w-4 fill-white" />
                <span>BUY NOW</span>
              </button>
            </div>
          </div>

          {/* Right Column: Product Info & Buy Box (7 cols on desktop) */}
          <div className="md:col-span-7 space-y-4">
            
            {/* Merchant Badge & Product Title */}
            <div>
              <Link
                href={`/shops/${product.shopId}`}
                className="text-xs font-bold text-[#0f766e] hover:underline uppercase tracking-wider flex items-center space-x-1"
              >
                <Store className="h-3.5 w-3.5" />
                <span>Sold by {product.shop?.businessName || 'Local Shop'}</span>
              </Link>
              <h1 className="text-lg sm:text-2xl font-bold text-slate-900 mt-1 leading-snug">
                {product.name}
              </h1>
            </div>

            {/* Rating & Review Badge */}
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1 bg-[#059669] text-white text-xs font-bold px-2 py-0.5 rounded">
                <span>4.3</span>
                <Star className="h-3 w-3 fill-white" />
              </span>
              <span className="text-xs font-semibold text-slate-500">128 Ratings & 24 Reviews</span>
              {product.shop?.verificationStatus === 'VERIFIED' && (
                <span className="bg-teal-50 text-[#0f766e] border border-teal-200 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center space-x-1">
                  <CheckCircle className="h-3 w-3 fill-[#0f766e] text-white" />
                  <span>Verified Merchant</span>
                </span>
              )}
            </div>

            {/* Pricing Block */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-baseline space-x-3">
              <span className="text-2xl sm:text-3xl font-black text-slate-900">
                ₹{effectivePrice}
              </span>
              <span className="text-sm sm:text-base text-slate-400 line-through">
                ₹{originalPrice}
              </span>
              <span className="text-sm font-bold text-[#059669]">
                {discountPercent}% off
              </span>
            </div>

            {/* Quantity Stepper */}
            <div className="flex items-center space-x-3 pt-1">
              <span className="text-xs font-semibold text-slate-600">Quantity:</span>
              <div className="flex items-center border border-slate-200 rounded-full overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 text-slate-600 hover:bg-slate-100"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="px-3.5 py-1 text-xs font-bold text-slate-900 border-x border-slate-200">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1 text-slate-600 hover:bg-slate-100"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Route Pooling Perks Box */}
            <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-3 space-y-2">
              <p className="text-xs font-bold text-slate-900 flex items-center space-x-1">
                <Tag className="h-3.5 w-3.5 text-[#0f766e]" />
                <span>Special Route-Pool Benefits</span>
              </p>
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex items-start space-x-2">
                  <Zap className="h-3.5 w-3.5 text-[#ea580c] shrink-0 mt-0.5" />
                  <span>
                    <strong>Route Pooled Delivery:</strong> Save up to 50% on transit fees when delivered by commuters heading your way.
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#059669] shrink-0 mt-0.5" />
                  <span>
                    <strong>Confidential 6-Digit OTP:</strong> Package handoff is securely verified directly by you.
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Location Check */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center space-x-2 text-xs">
                <Truck className="h-4 w-4 text-[#0f766e]" />
                <span className="text-slate-600">
                  Deliver to: <strong className="text-slate-900">{currentLocation.city || 'Your Area'}</strong> {currentLocation.postalCode ? `(${currentLocation.postalCode})` : ''}
                </span>
              </div>
              <p className="text-[11px] text-[#059669] font-semibold mt-1">
                ✓ Available for Standard Route Delivery
              </p>
            </div>

            {/* Product Specifications Table */}
            <div className="pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Product Details
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">CATEGORY</span>
                  <span className="font-semibold text-slate-800">{product.categoryName || 'General'}</span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">WEIGHT / UNIT</span>
                  <span className="font-semibold text-slate-800">{product.weightKg || 0.5} kg / {product.unit || 'piece'}</span>
                </div>
                {product.sku && (
                  <div className="p-2.5 bg-slate-50 rounded-lg col-span-2">
                    <span className="text-slate-400 block text-[10px]">MERCHANT SKU</span>
                    <span className="font-mono text-slate-800">{product.sku}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Product Description */}
            <div className="pt-2 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Description
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                {product.description || 'Authentic product sourced directly from verified local merchant inventory.'}
              </p>
            </div>

            {/* Shop Merchant Card */}
            {product.shop && (
              <div className="pt-2 border-t border-slate-100">
                <div className="bg-teal-50/60 border border-teal-100 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{product.shop.businessName}</h4>
                    <p className="text-[11px] text-slate-500">{product.shop.address || product.shop.location?.formattedAddress}</p>
                  </div>
                  <Link
                    href={`/shops/${product.shop._id}`}
                    className="bg-[#0f766e] text-white text-xs font-bold px-4 py-2 rounded-full shadow-sm hover:bg-teal-800 transition-colors"
                  >
                    View Store
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Action Bar (Dual Rounded Pill Buttons) */}
      <div className="md:hidden fixed bottom-[52px] left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 flex items-center gap-2 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
        <button
          onClick={handleAddToCart}
          disabled={product.availability === 'OUT_OF_STOCK'}
          className="flex-1 bg-[#0f766e] hover:bg-teal-800 text-white font-bold py-2.5 px-3 text-xs rounded-full flex items-center justify-center space-x-1.5 shadow-sm active:scale-95 disabled:opacity-50"
        >
          <ShoppingBag className="h-4 w-4" />
          <span>{added ? '✓ IN CART' : 'ADD TO CART'}</span>
        </button>

        <button
          onClick={handleBuyNow}
          disabled={product.availability === 'OUT_OF_STOCK'}
          className="flex-1 bg-[#e11d48] hover:bg-rose-700 text-white font-bold py-2.5 px-3 text-xs rounded-full flex items-center justify-center space-x-1.5 shadow-sm active:scale-95 disabled:opacity-50"
        >
          <Zap className="h-4 w-4 fill-white" />
          <span>BUY NOW</span>
        </button>
      </div>

    </div>
  );
}
