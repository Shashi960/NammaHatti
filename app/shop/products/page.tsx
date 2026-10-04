'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Product } from '@/types/product';
import { Badge } from '@/components/ui/Badge';
import {
  Package,
  Plus,
  ArrowLeft,
  Trash2,
  Edit,
  Check,
  X,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

export default function ShopProductsManagerPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // New product form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [price, setPrice] = useState<number>(100);
  const [discountPrice, setDiscountPrice] = useState<number | undefined>(undefined);
  const [stock, setStock] = useState<number>(20);
  const [unit, setUnit] = useState('piece');
  const [weightKg, setWeightKg] = useState<number>(0.5);
  const [sku, setSku] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const catRes = await fetch('/api/categories');
      const catData = await catRes.json();
      if (catData.categories) {
        setCategories(catData.categories);
        if (catData.categories.length > 0) {
          setCategoryId(catData.categories[0].slug);
          setCategoryName(catData.categories[0].name);
        }
      }

      if (user?.shopId) {
        const prodRes = await fetch(`/api/products?shopId=${user.shopId}`);
        const prodData = await prodRes.json();
        if (prodData.products) {
          setProducts(prodData.products);
        }
      }
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          categoryId,
          categoryName,
          price: Number(price),
          discountPrice: discountPrice ? Number(discountPrice) : undefined,
          stock: Number(stock),
          unit,
          weightKg: Number(weightKg),
          sku: sku || `SKU-${Date.now().toString().slice(-6)}`,
          images: [],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to add product');
        setSubmitting(false);
        return;
      }

      setShowAddModal(false);
      setName('');
      setDescription('');
      await loadData();
    } catch (err) {
      setError('Error adding product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to remove this product?')) return;
    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' });
      setProducts(products.filter((p) => p._id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleUpdateStock = async (id: string, newStock: number) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock }),
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(products.map((p) => (p._id === id ? data.product : p)));
      }
    } catch (err) {
      console.error('Update stock error:', err);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <Link href="/shop/dashboard" className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-500 hover:text-brand-600 mb-1">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Product & Inventory Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">Manage physical stock levels, SKU items, and pricing</p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-brand-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Product List Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-800 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Product Name</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4">Stock Level</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Weight</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((p) => (
              <tr key={p._id} className="hover:bg-slate-50/60 transition-colors">
                <td className="py-3.5 px-4 font-bold text-slate-900">{p.name}</td>
                <td className="py-3.5 px-4">{p.categoryName}</td>
                <td className="py-3.5 px-4 font-semibold text-slate-800">
                  ₹{p.discountPrice || p.price}
                  {p.discountPrice && (
                    <span className="ml-1 text-[10px] text-slate-400 line-through">₹{p.price}</span>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min={0}
                      value={p.stock}
                      onChange={(e) => handleUpdateStock(p._id, Number(e.target.value))}
                      className="w-16 rounded border border-slate-300 px-2 py-1 text-xs font-medium text-slate-900 focus:border-brand-500 focus:outline-none"
                    />
                    <span className="text-[11px] text-slate-500">{p.unit}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <Badge
                    type={
                      p.availability === 'IN_STOCK'
                        ? 'in-stock'
                        : p.availability === 'LOW_STOCK'
                        ? 'low-stock'
                        : 'out-of-stock'
                    }
                  />
                </td>
                <td className="py-3.5 px-4">{p.weightKg} kg</td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => handleDeleteProduct(p._id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}

            {products.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-400 text-xs">
                  No products added yet. Click &quot;Add New Product&quot; above to add inventory.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900">Add New Product to Store</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="rounded-lg bg-rose-50 p-2 text-xs text-rose-700">{error}</div>
            )}

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 0.5 HP Submersible Water Pump"
                  className="w-full rounded border border-slate-300 p-2 text-xs focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                    const cat = categories.find((c) => c.slug === e.target.value);
                    if (cat) setCategoryName(cat.name);
                  }}
                  className="w-full rounded border border-slate-300 bg-white p-2 text-xs focus:border-brand-500 focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Product specs, usage, brand..."
                  className="w-full rounded border border-slate-300 p-2 text-xs focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full rounded border border-slate-300 p-2 text-xs focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Discount Price (₹, Optional)</label>
                  <input
                    type="number"
                    min={0}
                    value={discountPrice || ''}
                    onChange={(e) => setDiscountPrice(e.target.value ? Number(e.target.value) : undefined)}
                    className="w-full rounded border border-slate-300 p-2 text-xs focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full rounded border border-slate-300 p-2 text-xs focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Unit</label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="piece, kg, packet"
                    className="w-full rounded border border-slate-300 p-2 text-xs focus:border-brand-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    min={0.1}
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full rounded border border-slate-300 p-2 text-xs focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-brand-700 disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Add to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
