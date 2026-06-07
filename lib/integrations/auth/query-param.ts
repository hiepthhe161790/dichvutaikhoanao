/**
 * Query Param Auth Builder
 * 
 * Thêm API key vào query string: ?api_key=VALUE
 * Dùng cho: taikhoan295.com và các site dạng tương tự
 */
import type { AuthBuilder, RequestConfig } from '../types';

export const queryParamAuth: AuthBuilder = {
  apply(paramName: string, paramValue: string, baseConfig: RequestConfig): RequestConfig {
    return {
      ...baseConfig,
      params: {
        ...baseConfig.params,
        [paramName]: paramValue,
      },
    };
  },
};
