/**
 * Header Custom Auth Builder
 * 
 * Thêm token vào custom header: X-API-Key: VALUE (hoặc bất kỳ header nào)
 */
import type { AuthBuilder, RequestConfig } from '../types';

export const headerCustomAuth: AuthBuilder = {
  apply(paramName: string, paramValue: string, baseConfig: RequestConfig): RequestConfig {
    return {
      ...baseConfig,
      headers: {
        ...baseConfig.headers,
        [paramName]: paramValue,
      },
    };
  },
};

/**
 * Basic Auth Builder
 * 
 * Authorization: Basic base64(paramName:paramValue)
 * Dùng paramName là username, paramValue là password
 */
export const basicAuth: AuthBuilder = {
  apply(paramName: string, paramValue: string, baseConfig: RequestConfig): RequestConfig {
    const credentials = Buffer.from(`${paramName}:${paramValue}`).toString('base64');
    return {
      ...baseConfig,
      headers: {
        ...baseConfig.headers,
        'Authorization': `Basic ${credentials}`,
      },
    };
  },
};
