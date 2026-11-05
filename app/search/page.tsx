'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLocation } from '@/context/LocationContext';
import { useCart } from '@/context/CartContext';
import { Product } from '@/types/product';
import { Badge } from '@/components/ui/Badge';
import {
  Search,
  Filter,
  ShoppingBag,
  Plus,
  Check,
  MapPin,
  Store,
  LayoutGrid,
  List,
  Star,
  Zap,
  ArrowUpDown,
  CheckCircle,
} from 'lucide-react';

function ProductSearchContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialQuery = searchParams.get('q') || '';

  const { currentLocation } = useLocation();
  const { addItem } = useCart();

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [availability, setAvailability] = useState('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'price_asc' | 'price_desc'>('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
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
        if (prodData.products) {
          let prods = prodData.products;
          if (sortBy === 'price_asc') {
            prods.sort((a: any, b: any) => a.price - b.price);
          } else if (sortBy === 'price_desc') {
            prods.sort((a: any, b: any) => b.price - a.price);
          }
          setProducts(prods);
        }
      } catch (err) {
        console.error('Failed to search products:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [currentLocation, query, category, availability, sortBy]);

  const handleAddToCart = (product: any, e: React.MouseEvent) => {
    e.preventDefault();
    if (product.availability === 'OUT_OF_STOCK') return;

    addItem({
      productId: product._id,
      shopId: product.shopId,
      shopName: product.shopName || 'Local Shop',
      name: product.name,
      price: product.price,
      unit: product.unit || 'piece',
      weightKg: product.weightKg || 0.5,
      imageUrl: product.images?.[0] || '',
    });

    setAddedItem(product._id);
    setTimeout(() => setAddedItem(null), 1500);
  };

  return (
    <div className="min-h-screen bg-[#f1f2f4]">
      
      {/* 1. Category Filter Pills (Horizontal Touch Scroller) */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-[57px] md:top-[65px] z-30">
        <div className="max-w-7xl mx-auto px-2 py-2 overflow-x-auto no-scrollbar flex items-center space-x-2">
          <button
            onClick={() => setCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-colors ${
              category === 'all'
                ? 'bg-[#0f766e] text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Products
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              onClick={() => setCategory(c.slug)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-colors ${
                category === c.slug
                  ? 'bg-[#0f766e] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-4">
        
        {/* 2. Top Sort & View Toolbar */}
        <div className="bg-white rounded-xl p-2.5 sm:p-3 mb-3 border border-slate-200/80 shadow-sm flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-semibold hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 font-semibold text-slate-800 focus:outline-none focus:border-[#0f766e]"
            >
              <option value="relevance">Relevance</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>

            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 font-semibold text-slate-800 focus:outline-none focus:border-[#0f766e]"
            >
              <option value="all">All Availability</option>
              <option value="IN_STOCK">In Stock Only</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-medium">
              <strong className="text-slate-900">{products.length}</strong> items
            </span>

            <div className="flex border border-slate-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 ${viewMode === 'grid' ? 'bg-[#0f766e] text-white' : 'bg-white text-slate-600'}`}
                title="Grid View"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 ${viewMode === 'list' ? 'bg-[#0f766e] text-white' : 'bg-white text-slate-600'}`}
                title="List View"
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 3. Product Display (Grid vs List) */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded border border-slate-200 p-3 animate-pulse h-64" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3'
                : 'space-y-2'
            }
          >
            {products.map((prod) => {
              const originalPrice = Math.round(prod.price * 1.35);
              const discountPercent = Math.round(((originalPrice - prod.price) / originalPrice) * 100);

              if (viewMode === 'list') {
                return (
                  <div
                    key={prod._id}
                    className="bg-white rounded border border-slate-200/80 p-3 hover:shadow-md transition-shadow flex gap-3 sm:gap-4 items-center justify-between"
                  >
                    <Link href={`/products/${prod._id}`} className="flex gap-3 sm:gap-4 items-center flex-1">
                      <div className="h-24 w-24 sm:h-28 sm:w-28 bg-slate-50 rounded p-1 shrink-0 flex items-center justify-center relative">
                        <img
                          src={prod.images?.[0] || '/placeholder-product.svg'}
                          alt={prod.name}
                          className="h-full w-full object-contain"
                        />
                        <span className="absolute top-1 left-1 bg-[#388e3c] text-white text-[8px] font-bold px-1 rounded">
                          {discountPercent}% off
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] text-slate-400 uppercase font-semibold truncate">
                          {prod.shopName}
                        </p>
                        <h3 className="font-semibold text-xs sm:text-sm text-[#212121] line-clamp-1 hover:text-[#0f766e]">
                          {prod.name}
                        </h3>
                        <div className="flex items-center space-x-1.5 mt-1">
                          <span className="inline-flex items-center space-x-0.5 bg-[#388e3c] text-white text-[10px] font-bold px-1.5 py-0.2 rounded">
                            <span>4.2</span>
                            <Star className="h-2 w-2 fill-white" />
                          </span>
                          <span className="text-[10px] text-slate-400">(38)</span>
                        </div>
                        <div className="mt-1 flex items-baseline space-x-1.5">
                          <span className="text-sm sm:text-base font-bold text-slate-900">₹{prod.price}</span>
                          <span className="text-xs text-slate-400 line-through">₹{originalPrice}</span>
                        </div>
                        <div className="text-[10px] text-[#0f766e] font-medium flex items-center space-x-1 mt-0.5">
                          <Zap className="h-2.5 w-2.5 fill-[#0f766e]" />
                          <span>Route Pooled Delivery</span>
                        </div>
                      </div>
                    </Link>

                    <div className="shrink-0 pl-2">
                      <button
                        onClick={(e) => handleAddToCart(prod, e)}
                        className="bg-[#0f766e] hover:bg-teal-800 text-white font-bold text-xs px-4 py-2 rounded-full shadow-sm transition-all active:scale-95 flex items-center space-x-1"
                      >
                        <ShoppingBag className="h-3.5 w-3.5" />
                        <span>{addedItem === prod._id ? '✓ In Cart' : 'Add to Cart'}</span>
                      </button>
                    </div>
                  </div>
                );
              }

              // Grid Card
              return (
                <div
                  key={prod._id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-2.5 sm:p-3 hover:shadow-md transition-shadow flex flex-col justify-between group"
                >
                  <Link href={`/products/${prod._id}`} className="block">
                    {/* Image Box */}
                    <div className="h-36 sm:h-44 w-full bg-slate-50 rounded-xl flex items-center justify-center p-2 relative overflow-hidden mb-2">
                      <img
                        src={prod.images?.[0] || '/placeholder-product.svg'}
                        alt={prod.name}
                        className="h-full w-full object-contain group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute top-1.5 left-1.5 bg-[#059669] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                        {discountPercent}% off
                      </span>
                    </div>

                    {/* Shop Name */}
                    <p className="text-[10px] text-slate-400 uppercase font-semibold truncate">
                      {prod.shopName}
                    </p>

                    {/* Product Title */}
                    <h3 className="font-semibold text-xs sm:text-sm text-slate-900 line-clamp-1 group-hover:text-[#0f766e] mt-0.5">
                      {prod.name}
                    </h3>

                    {/* Star Rating Badge */}
                    <div className="flex items-center space-x-1.5 mt-1">
                      <span className="inline-flex items-center space-x-0.5 bg-[#059669] text-white text-[10px] font-bold px-1.5 py-0.2 rounded">
                        <span>4.2</span>
                        <Star className="h-2 w-2 fill-white" />
                      </span>
                      <span className="text-[10px] text-slate-400">(38)</span>
                    </div>

                    {/* Price */}
                    <div className="mt-1 flex items-baseline space-x-1.5">
                      <span className="text-sm sm:text-base font-bold text-slate-900">₹{prod.price}</span>
                      <span className="text-[11px] text-slate-400 line-through">₹{originalPrice}</span>
                    </div>

                    {/* Route Tag */}
                    <div className="text-[10px] text-[#0f766e] font-medium flex items-center space-x-1 mt-0.5">
                      <Zap className="h-2.5 w-2.5 fill-[#0f766e]" />
                      <span>Route Delivery</span>
                    </div>
                  </Link>

                  {/* Add to Cart Button (Rounded Pill) */}
                  <button
                    onClick={(e) => handleAddToCart(prod, e)}
                    className="mt-2.5 w-full bg-[#0f766e] hover:bg-teal-800 text-white font-bold text-xs py-2 rounded-full transition-all shadow-sm active:scale-95 flex items-center justify-center space-x-1"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    <span>{addedItem === prod._id ? '✓ In Cart' : 'Add to Cart'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded border border-dashed border-slate-300 p-12 text-center text-slate-500">
            <ShoppingBag className="mx-auto h-8 w-8 text-slate-400 mb-2" />
            <p className="font-bold text-slate-800">No products found</p>
            <p className="text-xs text-slate-400 mt-1">Try switching categories or expanding your location radius</p>
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
