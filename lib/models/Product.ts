import mongoose, { Schema, Document } from 'mongoose';

export type Platform = 'tiktok' | 'shopee' | 'lazada' | 'gmail' | 'hotmail';

export interface IProduct extends Document {
  id: string;
  platform: Platform;
  category: string;
  title: string;
  description: string;
  quantity: number;
  price: number;
  status: 'available' | 'soldout';
}

const ProductSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  platform: { type: String, required: true, enum: ['tiktok', 'shopee', 'lazada', 'gmail', 'hotmail'] },
  category: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  status: { type: String, required: true, enum: ['available', 'soldout'] },
});

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);
