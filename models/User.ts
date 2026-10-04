import mongoose, { Schema, Document } from 'mongoose';
import { UserRole, UserStatus } from '@/types/auth';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  shopId?: string;
  savedAddresses?: any[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, default: '' },
    role: {
      type: String,
      enum: ['CUSTOMER', 'SHOP', 'TRAVELLER', 'ADMIN'],
      default: 'CUSTOMER',
      index: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'SUSPENDED'],
      default: 'ACTIVE',
      index: true,
    },
    shopId: { type: String, index: true },
    savedAddresses: { type: Array, default: [] },
  },
  { timestamps: true }
);

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
