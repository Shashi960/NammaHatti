import mongoose, { Schema, Document } from 'mongoose';
import { InventoryState } from '@/types/product';

export interface IProduct extends Document {
  shopId: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName: string;
  price: number;
  discountPrice?: number;
  stock: number;
  unit: string;
  sku: string;
  images: string[];
  weightKg: number;
  dimensions?: {
    lengthCm: number;
    widthCm: number;
    heightCm: number;
  };
  availability: InventoryState;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    shopId: { type: String, required: true, index: true },
    name: { type: String, required: true, index: 'text' },
    description: { type: String, default: '' },
    categoryId: { type: String, required: true, index: true },
    categoryName: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    stock: { type: Number, required: true, default: 0 },
    unit: { type: String, default: 'piece' },
    sku: { type: String, default: '', index: true },
    images: { type: [String], default: [] },
    weightKg: { type: Number, default: 0.5 },
    dimensions: {
      lengthCm: { type: Number, default: 10 },
      widthCm: { type: Number, default: 10 },
      heightCm: { type: Number, default: 10 },
    },
    availability: {
      type: String,
      enum: ['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'UNAVAILABLE'],
      default: 'IN_STOCK',
      index: true,
    },
  },
  { timestamps: true }
);

ProductSchema.index({ shopId: 1, availability: 1 });
ProductSchema.index({ name: 'text', description: 'text', sku: 'text' });

export const ProductModel = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
