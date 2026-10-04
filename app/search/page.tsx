'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLocation } from '@/context/LocationContext';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types/product';
import { Badge } from '@/components/ui/Badge';
import { Search, Filter, ShoppingBag, Plus, Check, MapPin, Store } from 'lucide-react';

function ProductSearchContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialQuery = searchParams.get('q') || '';

  const { currentLocation } = useLocation();
  const { addItem } = useCart();

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [availability, setAvailability] = useState('all');
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedItem, setAddedItem] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Load categories
        const catRes = await fetch('/api/categories');
        const catData = await catRes.json();
        if (catData.categories) setCategories(catData.categories);

        // Fetch products
        let url = `/api/products?lat=${currentLocation.latitude}&lng=${currentLocation.longitude}&radius=35`;
        if (query) url += `&search=${encodeURIComponent(query)}`;
        if (category !== 'all') url += `&categoryId=${encodeURIComponent(category)}`;
        if (availability !== 'all') url += `&availability=${encodeURIComponent(availability)}`;

        const prodRes = await fetch(url);
        const prodData = await prodRes.json();
        if (prodData.products) setProducts(prodData.products);
      } catch (err) {
        console.error('Failed to search products:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [currentLocation, query, category, availability]);

  const handleAddToCart = (product: any) => {
    if (product.availability === 'OUT_OF_STOCK') return;

    addItem({
      productId: product._id,
      shopId: product.shopId,
      shopName: product.shop?.businessName || 'Local Shop',
      name: product.name,
      price: product.discountPrice || product.price,
      unit: product.unit,
      weightKg: product.weightKg,
      imageUrl: product.images?.[0],
    });

    setAddedItem(product._id);
    setTimeout(() => setAddedItem(null), 1500);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Local Product Catalog
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Search physical products available in shops near <span className="font-semibold text-slate-800">{currentLocation.city}</span>
        </p>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Search Input */}
        <div className="sm:col-span-6 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products by name, description, SKU..."
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>

        {/* Category Select */}
        <div className="sm:col-span-3">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs font-medium text-slate-700 focus:border-brand-500 focus:outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Availability Select */}
        <div className="sm:col-span-3">
          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 px-3 text-xs font-medium text-slate-700 focus:border-brand-500 focus:outline-none"
          >
            <option value="all">All Stock Statuses</option>
            <option value="IN_STOCK">In Stock Only</option>
            <option value="LOW_STOCK">Low Stock</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Found {products.length} products</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((prod) => (
            <div
              key={prod._id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-brand-400 hover:shadow-md transition-all"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-400">{prod.categoryName}</span>
                  <Badge
                    type={
                      prod.availability === 'IN_STOCK'
                        ? 'in-stock'
                        : prod.availability === 'LOW_STOCK'
                        ? 'low-stock'
                        : 'out-of-stock'
                    }
                  />
                </div>

                <Link href={`/products/${prod._id}`}>
                  <h3 className="font-bold text-sm text-slate-900 hover:text-brand-600 transition-colors line-clamp-1">
                    {prod.name}
                  </h3>
                </Link>

                <p className="text-xs text-slate-500 line-clamp-2">{prod.description}</p>

                {/* Shop details */}
                {prod.shop && (
                  <div className="rounded-lg bg-slate-50 p-2 text-[11px] text-slate-600 border border-slate-100 flex items-center justify-between">
                    <Link href={`/shops/${prod.shop._id}`} className="font-semibold text-slate-800 hover:text-brand-600 truncate">
                      {prod.shop.businessName}
                    </Link>
                    {prod.distanceKm !== null && (
                      <span className="text-slate-400 shrink-0 ml-1">
                        {prod.distanceKm.toFixed(1)} km
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-base font-bold text-slate-900">
                    ₹{prod.discountPrice || prod.price}
                    {prod.discountPrice && (
                      <span className="ml-1 text-xs text-slate-400 line-through">₹{prod.price}</span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500">per {prod.unit}</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleAddToCart(prod)}
                  disabled={prod.availability === 'OUT_OF_STOCK'}
                  className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm transition-all ${
                    addedItem === prod._id
                      ? 'bg-emerald-600 text-white'
                      : prod.availability === 'OUT_OF_STOCK'
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-brand-600 text-white hover:bg-brand-700'
                  }`}
                >
                  {addedItem === prod._id ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Added!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && !loading && (
          <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
            <ShoppingBag className="mx-auto h-8 w-8 text-slate-400 mb-2" />
            <p className="font-semibold text-slate-800">No products found</p>
            <p className="text-xs text-slate-400 mt-1">Try relaxing filters or searching for different keywords</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProductSearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-500">Loading product catalogue...</div>}>
      <ProductSearchContent />
    </Suspense>
  );
}
