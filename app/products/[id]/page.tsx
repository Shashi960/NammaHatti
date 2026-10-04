'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Badge } from '@/components/ui/Badge';
import { Product } from '@/types/product';
import { Shop } from '@/types/shop';
import { ArrowLeft, ShoppingBag, Plus, Check, Store, MapPin, ShieldCheck, Scale, Package } from 'lucide-react';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const { addItem } = useCart();
  const [product, setProduct] = useState<(Product & { shop?: Shop }) | null>(null);
  const [quantity, setQuantity] = useState(1);
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
        imageUrl: product.images?.[0],
      },
      quantity
    );

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading || !product) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-500">
        Loading product information...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <Link href="/search" className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-600 hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Product Catalog</span>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        {/* Left Column: Image placeholder / thumbnail */}
        <div className="md:col-span-5 flex flex-col items-center justify-center rounded-xl bg-slate-50 border border-slate-200 p-8 text-slate-400">
          <ShoppingBag className="h-24 w-24 text-slate-300 mb-2" />
          <span className="text-xs font-medium text-slate-400">Authentic Physical Stock</span>
        </div>

        {/* Right Column: Product Specs & Purchase */}
        <div className="md:col-span-7 space-y-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-brand-700 uppercase tracking-wider">
                {product.categoryName}
              </span>
              <Badge
                type={
                  product.availability === 'IN_STOCK'
                    ? 'in-stock'
                    : product.availability === 'LOW_STOCK'
                    ? 'low-stock'
                    : 'out-of-stock'
                }
              />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {product.name}
            </h1>

            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-black text-slate-900">
                ₹{product.discountPrice || product.price}
              </span>
              {product.discountPrice && (
                <span className="text-base text-slate-400 line-through">₹{product.price}</span>
              )}
              <span className="text-xs text-slate-500 font-medium">per {product.unit}</span>
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">{product.description}</p>

          {/* Specifications */}
          <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3.5 text-xs text-slate-700 border border-slate-200">
            <div className="flex items-center space-x-2">
              <Scale className="h-4 w-4 text-slate-400" />
              <span>Weight: <strong className="text-slate-900">{product.weightKg} kg</strong></span>
            </div>
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-slate-400" />
              <span>SKU: <strong className="text-slate-900">{product.sku}</strong></span>
            </div>
          </div>

          {/* Shop Card */}
          {product.shop && (
            <div className="rounded-xl border border-brand-200 bg-brand-50/50 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-brand-900">Sold by Verified Merchant</span>
                {product.shop.verificationStatus === 'VERIFIED' && (
                  <Badge type="verified-shop" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{product.shop.businessName}</h4>
                  <p className="text-xs text-slate-500">{product.shop.address}</p>
                </div>
                <Link
                  href={`/shops/${product.shop._id}`}
                  className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-brand-700 border border-brand-300 hover:bg-brand-50 shadow-sm"
                >
                  View Shop
                </Link>
              </div>
            </div>
          )}

          {/* Quantity & Add to Cart */}
          <div className="flex items-center space-x-4 pt-3 border-t border-slate-100">
            <div className="flex items-center rounded-lg border border-slate-300 bg-white">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-l-lg"
              >
                -
              </button>
              <span className="px-4 text-sm font-semibold text-slate-900">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-r-lg"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={product.availability === 'OUT_OF_STOCK'}
              className={`flex-1 flex items-center justify-center space-x-2 rounded-lg py-3 text-sm font-semibold shadow-md transition-all ${
                added
                  ? 'bg-emerald-600 text-white'
                  : product.availability === 'OUT_OF_STOCK'
                  ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  : 'bg-brand-600 text-white hover:bg-brand-700'
              }`}
            >
              {added ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Added {quantity} to Cart!</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Add to Cart (₹{(product.discountPrice || product.price) * quantity})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
