import mongoose, { Schema, Document } from 'mongoose';
import type { AuthType, BuyMethod, ItemFormat } from '@/lib/integrations/types';

export interface IProvider extends Document {
  name: string;
  slug: string;
  description?: string;
  baseUrl: string;

  // Authentication
  authType: AuthType;
  authParamName: string;  // Tên param/header chứa API key
  authValue: string;      // Giá trị API key/token

  // Endpoints (chỉ điền cái provider có)
  endpoints: {
    getProfile?: string;
    getProducts?: string;
    getProduct?: string;
    buyProduct?: string;
    getOrder?: string;
  };

  // Config khi mua hàng
  buyConfig: {
    method: BuyMethod;
    productIdParam: string;
    quantityParam: string;
    couponParam?: string;
    extraBodyParams?: Record<string, string>;
  };

  // Cách parse response
  responseMap: {
    successField: string;
    successValue: string;
    dataField: string;
    transIdField?: string;
    errorMsgField?: string;
    itemFormat: ItemFormat;
    itemFields: string[];
  };

  // Giới hạn & cảnh báo
  requestsPerMinute: number;
  lowBalanceAlert?: number;

  // Trạng thái
  status: 'active' | 'inactive' | 'testing';
  isHealthy: boolean;
  lastHealthCheck?: Date;
  lastError?: string;
  lastKnownBalance?: number;

  // Thống kê
  totalOrdersPlaced: number;
  totalSuccessOrders: number;

  createdAt: Date;
  updatedAt: Date;
}

const EndpointsSchema = new Schema(
  {
    getProfile:  { type: String },
    getProducts: { type: String },
    getProduct:  { type: String },
    buyProduct:  { type: String },
    getOrder:    { type: String },
  },
  { _id: false }
);

const BuyConfigSchema = new Schema(
  {
    method:           { type: String, enum: ['GET', 'POST'], default: 'POST' },
    productIdParam:   { type: String, default: 'id' },
    quantityParam:    { type: String, default: 'amount' },
    couponParam:      { type: String },
    extraBodyParams:  { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const ResponseMapSchema = new Schema(
  {
    successField:  { type: String, default: 'status' },
    successValue:  { type: String, default: 'success' },
    dataField:     { type: String, default: 'data' },
    transIdField:  { type: String },
    errorMsgField: { type: String },
    itemFormat: {
      type: String,
      enum: ['pipe_separated', 'json_object', 'colon_separated', 'newline'],
      default: 'pipe_separated',
    },
    itemFields: [{ type: String }],
  },
  { _id: false }
);

const ProviderSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true, index: true },
    slug: { type: String, required: true, unique: true, index: true, lowercase: true },
    description: { type: String },
    baseUrl: { type: String, required: true },

    authType: {
      type: String,
      required: true,
      enum: ['query_param', 'header_bearer', 'header_custom', 'basic'],
      default: 'query_param',
    },
    authParamName: { type: String, required: true, default: 'api_key' },
    authValue:     { type: String, required: true },

    endpoints:   { type: EndpointsSchema, default: {} },
    buyConfig:   { type: BuyConfigSchema, default: {} },
    responseMap: { type: ResponseMapSchema, default: {} },

    requestsPerMinute: { type: Number, default: 60 },
    lowBalanceAlert:   { type: Number },

    status: {
      type: String,
      enum: ['active', 'inactive', 'testing'],
      default: 'testing',
      index: true,
    },
    isHealthy:        { type: Boolean, default: true },
    lastHealthCheck:  { type: Date },
    lastError:        { type: String },
    lastKnownBalance: { type: Number },

    totalOrdersPlaced:  { type: Number, default: 0 },
    totalSuccessOrders: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.Provider ||
  mongoose.model<IProvider>('Provider', ProviderSchema);
