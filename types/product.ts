export type InventoryState = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'UNAVAILABLE';

export interface ProductDimensions {
  lengthCm: number;
  widthCm: number;
  heightCm: number;
}

export interface Product {
  _id: string;
  shopId: string;
  name: string;
  description: string;
  categoryId: string;
  categoryName: string;
  price: number;
  discountPrice?: number;
  stock: number;
  unit: string; // e.g. "kg", "piece", "packet", "litre"
  sku: string;
  images: string[];
  weightKg: number;
  dimensions?: ProductDimensions;
  availability: InventoryState;
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  _id: string;
  slug: string;
  name: string;
  description: string;
  iconName: string;
  isActive: boolean;
}
