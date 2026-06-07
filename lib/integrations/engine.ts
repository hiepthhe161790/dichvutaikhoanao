/**
 * Generic API Engine
 * 
 * Core của module tích hợp API ngoài.
 * Đọc cấu hình từ DB, thực thi request, parse response — không biết provider là ai.
 * 
 * Mở rộng: không sửa file này, chỉ thêm parser/auth mới vào registry.
 */

import axios, { AxiosError } from 'axios';
import { getAuthBuilder } from './auth';
import { getParser } from './parsers';
import type {
  IProviderConfig,
  RequestConfig,
  BuyResult,
  TestConnectionResult,
  ExternalProduct,
  ExternalOrder,
  ParsedAccount,
} from './types';

export class GenericApiEngine {
  private readonly TIMEOUT_MS = 15_000;

  // ─── Public API ────────────────────────────────────────────────────────────

  /**
   * Test kết nối tới provider, lấy số dư nếu có endpoint getProfile.
   */
  async testConnection(provider: IProviderConfig): Promise<TestConnectionResult> {
    const start = Date.now();
    const endpoint = provider.endpoints.getProfile;

    if (!endpoint) {
      return { ok: false, error: 'Provider chưa cấu hình endpoint getProfile' };
    }

    try {
      const config = this.buildRequest(provider, 'GET', this.buildUrl(provider, endpoint));
      const response = await axios(config);
      const latencyMs = Date.now() - start;

      // Thử extract balance từ response
      const balance = this.extractBalance(response.data);

      return { ok: true, balance, latencyMs, rawResponse: response.data };
    } catch (error) {
      return {
        ok: false,
        latencyMs: Date.now() - start,
        error: this.extractErrorMessage(error),
      };
    }
  }

  /**
   * Lấy danh sách sản phẩm từ provider (để admin mapping).
   */
  async fetchProductList(provider: IProviderConfig): Promise<ExternalProduct[]> {
    const endpoint = provider.endpoints.getProducts;
    if (!endpoint) {
      throw new Error('Provider chưa cấu hình endpoint getProducts');
    }

    const config = this.buildRequest(provider, 'GET', this.buildUrl(provider, endpoint));
    const response = await axios(config);

    return this.normalizeProductList(response.data, provider);
  }

  /**
   * Lấy chi tiết 1 sản phẩm.
   */
  async fetchProductDetail(
    provider: IProviderConfig,
    externalProductId: string
  ): Promise<ExternalProduct> {
    const endpointTemplate = provider.endpoints.getProduct;
    if (!endpointTemplate) {
      throw new Error('Provider chưa cấu hình endpoint getProduct');
    }

    const url = this.buildUrl(provider, endpointTemplate, { productId: externalProductId });
    const config = this.buildRequest(provider, 'GET', url);
    const response = await axios(config);

    return { id: externalProductId, name: 'Unknown', raw: response.data };
  }

  /**
   * ★ Mua hàng từ provider.
   * Đây là method core — tất cả logic parse đều qua đây.
   */
  async buyProduct(
    provider: IProviderConfig,
    externalProductId: string,
    quantity: number,
    coupon?: string
  ): Promise<BuyResult> {
    const endpoint = provider.endpoints.buyProduct;
    if (!endpoint) {
      return { success: false, accounts: [], error: 'Provider chưa cấu hình endpoint buyProduct' };
    }

    const { buyConfig, responseMap } = provider;
    const url = this.buildUrl(provider, endpoint);

    // Build body/params cho request mua hàng
    const purchaseParams: Record<string, string> = {
      [buyConfig.productIdParam]: externalProductId,
      [buyConfig.quantityParam]: String(quantity),
      ...buyConfig.extraBodyParams,
    };
    if (coupon && buyConfig.couponParam) {
      purchaseParams[buyConfig.couponParam] = coupon;
    }

    try {
      const config = this.buildRequest(
        provider,
        buyConfig.method,
        url,
        buyConfig.method === 'POST' ? purchaseParams : undefined,
        buyConfig.method === 'GET' ? purchaseParams : undefined
      );

      console.log(`\n========== GỬI REQUEST LÊN API NGOÀI ==========`);
      console.log(JSON.stringify(config, null, 2));
      console.log(`=================================================\n`);

      const response = await axios(config);
      const raw = response.data;

      // Kiểm tra thành công theo config
      const isSuccess =
        raw?.[responseMap.successField] === responseMap.successValue ||
        raw?.[responseMap.successField] === true;

      if (!isSuccess) {
        const errMsg =
          responseMap.errorMsgField
            ? raw?.[responseMap.errorMsgField]
            : 'Mua hàng thất bại';
        return { success: false, accounts: [], error: errMsg, rawResponse: raw };
      }

      // Lấy data array
      const rawItems: unknown[] = Array.isArray(raw?.[responseMap.dataField])
        ? raw[responseMap.dataField]
        : [];

      // Parse accounts dùng đúng parser theo config
      const parser = getParser(responseMap.itemFormat);
      const accounts: ParsedAccount[] = parser.parse(rawItems, responseMap.itemFields);

      const transId = responseMap.transIdField ? raw?.[responseMap.transIdField] : undefined;

      return { success: true, accounts, transId, rawResponse: raw };
    } catch (error: any) {
      const rawErrorResponse = error.response?.data;
      return {
        success: false,
        accounts: [],
        error: this.extractErrorMessage(error),
        rawResponse: rawErrorResponse,
      };
    }
  }

  /**
   * Tra cứu trạng thái đơn hàng đã mua.
   */
  async fetchOrder(
    provider: IProviderConfig,
    externalOrderId: string
  ): Promise<ExternalOrder> {
    const endpointTemplate = provider.endpoints.getOrder;
    if (!endpointTemplate) {
      throw new Error('Provider chưa cấu hình endpoint getOrder');
    }

    const url = this.buildUrl(provider, endpointTemplate, { orderId: externalOrderId });
    const config = this.buildRequest(provider, 'GET', url);
    const response = await axios(config);

    return { id: externalOrderId, status: 'unknown', raw: response.data };
  }

  // ─── Private Helpers ───────────────────────────────────────────────────────

  /**
   * Build URL từ endpoint template.
   * Thay thế {placeholder} bằng giá trị thực.
   * VD: "/product.php?product={productId}" → "/product.php?product=3"
   */
  private buildUrl(
    provider: IProviderConfig,
    endpointTemplate: string,
    templateVars: Record<string, string> = {}
  ): string {
    let endpoint = endpointTemplate;

    // Thay thế template variables
    for (const [key, value] of Object.entries(templateVars)) {
      endpoint = endpoint.replace(`{${key}}`, encodeURIComponent(value));
    }

    // Ghép base URL
    const base = provider.baseUrl.replace(/\/$/, '');
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${base}${path}`;
  }

  /**
   * Build request config đầy đủ với auth được áp dụng.
   */
  private buildRequest(
    provider: IProviderConfig,
    method: 'GET' | 'POST',
    url: string,
    body?: Record<string, unknown>,
    extraParams?: Record<string, string>
  ): RequestConfig & { timeout: number } {
    const baseConfig: RequestConfig = {
      url,
      method,
      headers: { 'Content-Type': 'application/json' },
      params: extraParams,
      data: body,
    };

    // Giải mã API Key
    let decryptedAuthValue = provider.authValue;
    try {
      // Import động để không bị vòng lặp phụ thuộc nếu có
      const { decrypt } = require('@/lib/crypto');
      decryptedAuthValue = decrypt(provider.authValue);
    } catch (err) {
      console.warn(`[WARNING] Không thể giải mã authValue cho provider ${provider.name}. Có thể do key cũ dạng plaintext.`);
    }

    // Áp dụng authentication
    const authBuilder = getAuthBuilder(provider.authType);
    const configWithAuth = authBuilder.apply(
      provider.authParamName,
      decryptedAuthValue,
      baseConfig
    );

    return { ...configWithAuth, timeout: this.TIMEOUT_MS };
  }

  /**
   * Cố gắng extract số dư từ response profile của provider.
   * Hỗ trợ nhiều field name phổ biến.
   */
  private extractBalance(data: unknown): number | undefined {
    if (typeof data !== 'object' || data === null) return undefined;
    const obj = data as Record<string, unknown>;

    // Thử các field name phổ biến
    const balanceFields = ['balance', 'money', 'credit', 'wallet', 'so_du', 'cash'];
    for (const field of balanceFields) {
      if (obj[field] !== undefined) {
        const val = Number(obj[field]);
        if (!isNaN(val)) return val;
      }
      // Nested: { data: { balance: ... } }
      if (obj.data && typeof obj.data === 'object') {
        const nested = (obj.data as Record<string, unknown>)[field];
        if (nested !== undefined) {
          const val = Number(nested);
          if (!isNaN(val)) return val;
        }
      }
    }
    return undefined;
  }

  /**
   * Normalize danh sách sản phẩm từ nhiều format provider khác nhau.
   */
  private normalizeProductList(
    data: unknown,
    provider: IProviderConfig
  ): ExternalProduct[] {
    // Nếu là array trực tiếp
    if (Array.isArray(data)) {
      return this.mapProductArray(data);
    }

    // Nếu có wrapper { data: [...] } hoặc { products: [...] }
    if (typeof data === 'object' && data !== null) {
      const obj = data as Record<string, unknown>;
      const arr = obj.data || obj.products || obj.items || obj.result;
      if (Array.isArray(arr)) {
        return this.mapProductArray(arr);
      }

      // Nếu data là object dạng { categories: [{ products: [...] }] }
      const categories = obj.categories || obj.danh_muc;
      if (Array.isArray(categories)) {
        const products: ExternalProduct[] = [];
        for (const cat of categories) {
          const catObj = cat as Record<string, unknown>;
          const catProducts = catObj.products || catObj.san_pham || catObj.items;
          if (Array.isArray(catProducts)) {
            products.push(...this.mapProductArray(catProducts));
          }
        }
        return products;
      }
    }

    return [];
  }

  private mapProductArray(items: unknown[]): ExternalProduct[] {
    return items
      .filter((i) => typeof i === 'object' && i !== null)
      .map((i) => {
        const obj = i as Record<string, unknown>;
        return {
          id: String(obj.id || obj._id || obj.product_id || ''),
          name: String(obj.name || obj.ten || obj.title || obj.product_name || 'Unknown'),
          price: Number(obj.price || obj.gia || obj.cost || 0),
          stock: Number(obj.stock || obj.so_luong || obj.quantity || 0),
          category: String(obj.category || obj.danh_muc || ''),
          description: String(obj.description || obj.mo_ta || ''),
          raw: obj,
        };
      });
  }

  /**
   * Extract error message từ axios error hoặc generic Error.
   */
  private extractErrorMessage(error: unknown): string {
    if (error instanceof AxiosError) {
      const serverMsg =
        error.response?.data?.msg ||
        error.response?.data?.message ||
        error.response?.data?.error;
      if (serverMsg) return String(serverMsg);
      if (error.response?.status) return `HTTP ${error.response.status}: ${error.message}`;
      return error.message;
    }
    if (error instanceof Error) return error.message;
    return 'Unknown error';
  }
}

// Singleton instance dùng chung
export const apiEngine = new GenericApiEngine();
