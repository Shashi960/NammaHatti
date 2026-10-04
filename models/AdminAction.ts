import mongoose, { Schema, Document } from 'mongoose';

export interface IAdminAction extends Document {
  adminId: string;
  adminEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  details?: Record<string, any>;
  ipAddress?: string;
  createdAt: Date;
}

const AdminActionSchema = new Schema<IAdminAction>(
  {
    adminId: { type: String, required: true, index: true },
    adminEmail: { type: String, required: true },
    action: { type: String, required: true, index: true },
    targetType: { type: String, required: true },
    targetId: { type: String, required: true },
    details: { type: Schema.Types.Mixed, default: {} },
    ipAddress: { type: String, default: '' },
  },
  { timestamps: true }
);

AdminActionSchema.index({ createdAt: -1 });

export const AdminActionModel =
  mongoose.models.AdminAction || mongoose.model<IAdminAction>('AdminAction', AdminActionSchema);
