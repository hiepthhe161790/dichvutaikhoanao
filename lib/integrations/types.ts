/**
 * External API Integration Module — Types
 * 
 * Tất cả interface dùng chung cho module tích hợp API ngoài.
 * Thêm provider mới = thêm record DB, không cần sửa code.
 */

// ─── Provider Config ──────────────────────────────────────────────────────────

export type AuthType =
  | 'query_param'     // ?api_key=VALUE
  | 'header_bearer'   // Authorization: Bearer VALUE
  | 'header_custom'   // X-Custom-Header: VALUE
  | 'basic';          // Authorization: Basic base64(user:pass)

export type BuyMethod = 'GET' | 'POST';

export type ItemFormat =
  | 'pipe_separated'  // "username|password|email"
  | 'json_object'     // { "username": "...", "password": "..." }
  | 'colon_separated' // "username:password"
  | 'newline';        // Mỗi dòng 1 tài khoản

export interface ProviderEndpoints {
  getProfile?: string;  // "/profile.php"
  getProducts?: string; // "/products.php"
  getProduct?: string;  // "/product.php?product={productId}"
  buyProduct?: string;  // "/buy_product"
  getOrder?: string;    // "/order.php?order={orderId}"
}

export interface BuyConfig {
  method: BuyMethod;
  productIdParam: string;       // "id"
  quantityParam: string;        // "amount"
  couponParam?: string;         // "coupon" (optional)
  extraBodyParams?: Record<string, string>; // { action: "buyProduct" }
}

export interface ResponseMap {
  /** Field xác định thành công, vd: "status" */
  successField: string;
  /** Giá trị thành công, vd: "success" */
  successValue: string;
  /** Field chứa array data, vd: "data" */
  dataField: string;
  /** Field transaction ID, vd: "trans_id" */
  transIdField?: string;
  /** Field thông báo lỗi, vd: "msg" */
  errorMsgField?: string;
  /** Format mỗi item trong data array */
  itemFormat: ItemFormat;
  /**
   * Tên các field theo thứ tự (dùng cho pipe/colon/newline format)
   * vd: ["username", "password"] → "user|pass" → { username: "user", password: "pass" }
   */
  itemFields: string[];
}

// ─── Provider Document (từ DB) ────────────────────────────────────────────────

export interface IProviderConfig {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  baseUrl: string;
  authType: AuthType;
  authParamName: string;   // Tên param/header
  authValue: string;       // API key / token
  endpoints: ProviderEndpoints;
  buyConfig: BuyConfig;
  responseMap: ResponseMap;
  requestsPerMinute: number;
  lowBalanceAlert?: number;
  status: 'active' | 'inactive' | 'testing';
  isHealthy: boolean;
  lastKnownBalance?: number;
}

// ─── Engine Results ───────────────────────────────────────────────────────────

export interface ParsedAccount {
  username: string;
  password: string;
  email?: string;
  emailPassword?: string;
  phone?: string;
  [key: string]: string | undefined; // Extra fields
}

export interface TestConnectionResult {
  ok: boolean;
  balance?: number;
  latencyMs?: number;
  error?: string;
  rawResponse?: unknown;
}

export interface BuyResult {
  success: boolean;
  accounts: ParsedAccount[];
  transId?: string;
  rawResponse?: unknown;
  error?: string;
}

export interface ExternalProduct {
  id: string;
  name: string;
  price?: number;
  stock?: number;
  category?: string;
  description?: string;
  raw?: unknown; // Raw data từ provider
}

export interface ExternalOrder {
  id: string;
  status: string;
  items?: ParsedAccount[];
  raw?: unknown;
}

// ─── Parser & Auth Interfaces (Registry Pattern) ─────────────────────────────

export interface ResponseParser {
  /**
   * Parse array raw items từ provider → ParsedAccount[]
   * @param items - Mảng raw data (string hoặc object)
   * @param fields - Tên các field theo thứ tự (dùng khi delimited format)
   */
  parse(items: unknown[], fields: string[]): ParsedAccount[];
}

export interface AuthBuilder {
  /**
   * Áp dụng authentication vào axios request config
   * @param paramName - Tên param/header
   * @param paramValue - Giá trị token/key
   * @param baseConfig - Config axios cơ bản
   */
  apply(
    paramName: string,
    paramValue: string,
    baseConfig: RequestConfig
  ): RequestConfig;
}

// ─── Internal HTTP Config ─────────────────────────────────────────────────────

export interface RequestConfig {
  url: string;
  method: 'GET' | 'POST';
  headers?: Record<string, string>;
  params?: Record<string, string>;
  data?: Record<string, unknown>;
  timeout?: number;
}

// ─── Mapping ──────────────────────────────────────────────────────────────────

export interface IProductProviderMapping {
  _id: string;
  localProductId: string;
  providerId: string;
  externalProductId: string;
  priority: number;      // 1 = cao nhất
  isActive: boolean;
  totalPurchased: number;
  lastUsedAt?: Date;
  lastError?: string;
  // Populated
  provider?: IProviderConfig;
  localProduct?: { _id: string; title: string; platform: string };
}

// ─── External Order Log ───────────────────────────────────────────────────────

export interface IExternalOrderLog {
  _id: string;
  localOrderId?: string;
  providerId: string;
  externalProductId: string;
  quantity: number;
  status: 'success' | 'failed' | 'pending';
  externalOrderId?: string;
  parsedAccounts?: ParsedAccount[];
  rawRequest: unknown;
  rawResponse: unknown;
  errorMessage?: string;
  durationMs: number;
  createdAt: Date;
  // Populated
  provider?: { name: string; slug: string };
}
