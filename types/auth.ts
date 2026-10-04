export type UserRole = 'CUSTOMER' | 'SHOP' | 'TRAVELLER' | 'ADMIN';

export type UserStatus = 'ACTIVE' | 'SUSPENDED';

export interface UserSession {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  shopId?: string;
  isKycVerified?: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  shopId?: string;
  createdAt: Date;
  updatedAt: Date;
}
