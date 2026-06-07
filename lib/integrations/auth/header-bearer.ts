/**
 * Header Bearer Auth Builder
 * 
 * Thêm token vào header: Authorization: Bearer VALUE
 */
import type { AuthBuilder, RequestConfig } from '../types';

export const headerBearerAuth: AuthBuilder = {
  apply(paramName: string, paramValue: string, baseConfig: RequestConfig): RequestConfig {
    return {
      ...baseConfig,
      headers: {
        ...baseConfig.headers,
        'Authorization': `Bearer ${paramValue}`,
      },
    };
  },
};
