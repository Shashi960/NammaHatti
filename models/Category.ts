import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  slug: string;
  name: string;
  description: string;
  iconName: string;
  isActive: boolean;
}

const CategorySchema = new Schema<ICategory>(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    iconName: { type: String, default: 'ShoppingBag' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const CategoryModel = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);
