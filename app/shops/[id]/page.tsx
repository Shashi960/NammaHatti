'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Shop } from '@/types/shop';
import { Product } from '@/types/product';
import { Badge } from '@/components/ui/Badge';
import { GoogleMap, MapMarker } from '@/components/maps/GoogleMap';
import {
  Star,
  MapPin,
  Clock,
  Phone,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  Check,
  MessageSquare,
} from 'lucide-react';

export default function ShopDetailPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const { addItem } = useCart();
  const [shop, setShop] = useState<Shop | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [addedItem, setAddedItem] = useState<string | null>(null);

  // Review submission state
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    async function loadShop() {
      try {
        setLoading(true);
        const res = await fetch(`/api/shops/${params.id}`);
        const data = await res.json();
        if (data.shop) {
          setShop(data.shop);
          setProducts(data.products || []);
        }

        // Fetch reviews
        const revRes = await fetch(`/api/reviews?targetId=${params.id}&targetType=SHOP`);
        const revData = await revRes.json();
        if (revData.reviews) {
          setReviews(revData.reviews);
        }
      } catch (err) {
        console.error('Failed to load shop:', err);
      } finally {
        setLoading(false);
      }
    }

    loadShop();
  }, [params.id]);

  const handleAddToCart = (product: Product) => {
    if (product.availability === 'OUT_OF_STOCK') return;

    addItem({
      productId: product._id,
      shopId: shop!._id,
      shopName: shop!.businessName,
      name: product.name,
      price: product.discountPrice || product.price,
      unit: product.unit,
      weightKg: product.weightKg,
      imageUrl: product.images[0],
    });

    setAddedItem(product._id);
    setTimeout(() => setAddedItem(null), 1500);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to submit a review');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: `review-shop-${params.id}`,
          targetType: 'SHOP',
          targetId: params.id,
          rating,
          comment: reviewComment,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setReviews([data.review, ...reviews]);
        setReviewComment('');
      }
    } catch (err) {
      console.error('Failed to post review:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading || !shop) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-500">
        Loading merchant profile...
      </div>
    );
  }

  const markers: MapMarker[] = [
    {
      id: shop._id,
      latitude: shop.location.latitude,
      longitude: shop.location.longitude,
      title: shop.businessName,
      label: '🏪 SHOP',
      color: 'brand',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Back button */}
      <Link href="/shops" className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Shops Directory</span>
      </Link>

      {/* Shop Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                {shop.category}
              </span>
              {shop.verificationStatus === 'VERIFIED' && (
                <Badge type="verified-shop" />
              )}
              {shop.minOrderAmount > 0 && (
                <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium">
                  Min. Order: ₹{shop.minOrderAmount}
                </span>
              )}
            </div>

            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {shop.businessName}
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed">{shop.description}</p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
              <div className="flex items-center space-x-1 text-amber-600 font-semibold">
                <Star className="h-4 w-4 fill-current" />
                <span>{shop.rating.toFixed(1)}</span>
                <span className="text-slate-400 font-normal">({shop.reviewCount} customer reviews)</span>
              </div>
              <span>·</span>
              <div className="flex items-center space-x-1">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>Operating Hours: {shop.openingTime} - {shop.closingTime}</span>
              </div>
              <span>·</span>
              <div className="flex items-center space-x-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400" />
                <span>{shop.address}, {shop.location.city}</span>
              </div>
            </div>
          </div>

          {/* Shop Location Map Thumbnail */}
          <div className="w-full md:w-72 overflow-hidden rounded-xl border border-slate-200 shadow-sm shrink-0">
            <div className="p-2 bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-700 flex items-center justify-between">
              <span>Merchant Location</span>
              <span className="text-brand-600">{shop.location.city}</span>
            </div>
            <GoogleMap
              center={{ lat: shop.location.latitude, lng: shop.location.longitude }}
              markers={markers}
              interactive={false}
              height="160px"
            />
          </div>
        </div>
      </div>

      {/* Products Catalog */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Products & Inventory</h2>
            <p className="text-xs text-slate-500">Live verified stock available for pickup & pooling</p>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {products.length} Products Listed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {products.map((prod) => (
            <div
              key={prod._id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-all"
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

                <div className="text-[11px] text-slate-500">
                  Weight: {prod.weightKg} kg · SKU: {prod.sku}
                </div>
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
                  className={`flex items-center space-x-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm transition-all ${
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

        {products.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
            <ShoppingBag className="mx-auto h-8 w-8 text-slate-400 mb-2" />
            <p className="font-semibold text-slate-800">No products uploaded yet by merchant</p>
          </div>
        )}
      </div>

      {/* Customer Reviews Section */}
      <div className="space-y-6 pt-6 border-t border-slate-200">
        <h3 className="text-xl font-bold text-slate-900">Customer Ratings & Reviews</h3>

        {/* Submit review */}
        {user && (
          <form onSubmit={handleReviewSubmit} className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-3 max-w-xl">
            <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">Leave a Review</h4>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-600">Rating:</span>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-amber-500 hover:scale-110 transition-transform"
                  >
                    <Star className={`h-4 w-4 ${star <= rating ? 'fill-current' : 'text-slate-300'}`} />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Share your experience with this shop..."
              rows={2}
              className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-brand-500 focus:outline-none"
            />

            <button
              type="submit"
              disabled={submittingReview}
              className="rounded-lg bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow hover:bg-brand-700 transition-colors"
            >
              {submittingReview ? 'Posting...' : 'Submit Review'}
            </button>
          </form>
        )}

        <div className="space-y-3">
          {reviews.map((rev) => (
            <div key={rev._id} className="rounded-lg border border-slate-200 bg-white p-3.5 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-900">{rev.authorName}</span>
                <span className="text-amber-500 font-bold">★ {rev.rating}/5</span>
              </div>
              <p className="text-xs text-slate-600">{rev.comment || 'Verified purchase'}</p>
            </div>
          ))}

          {reviews.length === 0 && (
            <p className="text-xs text-slate-400">No reviews yet. Be the first to review this business!</p>
          )}
        </div>
      </div>
    </div>
  );
}
